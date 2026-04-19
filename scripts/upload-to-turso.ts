/**
 * Upload local data/lexica.db to Turso.
 *
 * Usage:
 *   node --env-file=.env.local -r tsx/cjs scripts/upload-to-turso.ts
 *   # or via tsx
 *   tsx --env-file=.env.local scripts/upload-to-turso.ts
 *
 * Required env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 *
 * Flags:
 *   --schema-only    Create tables/indexes, skip row data
 *   --data-only      Skip schema, only insert rows (assumes schema exists)
 *   --only=<name>    Process only one table (comma-separated for multiple)
 *   --skip=<name>    Skip specific tables (comma-separated)
 *   --batch=<n>      Rows per batch insert (default 200)
 *   --reset          Drop each table on Turso before recreating
 */
import Database from "better-sqlite3";
import { createClient, type InValue } from "@libsql/client";
import path from "path";
import { existsSync } from "fs";

interface Args {
  schemaOnly: boolean;
  dataOnly: boolean;
  only: Set<string> | null;
  skip: Set<string>;
  batch: number;
  reset: boolean;
}

function parseArgs(): Args {
  const a: Args = { schemaOnly: false, dataOnly: false, only: null, skip: new Set(), batch: 200, reset: false };
  for (const raw of process.argv.slice(2)) {
    if (raw === "--schema-only") a.schemaOnly = true;
    else if (raw === "--data-only") a.dataOnly = true;
    else if (raw === "--reset") a.reset = true;
    else if (raw.startsWith("--only=")) a.only = new Set(raw.slice(7).split(",").map(s => s.trim()));
    else if (raw.startsWith("--skip=")) a.skip = new Set(raw.slice(7).split(",").map(s => s.trim()));
    else if (raw.startsWith("--batch=")) a.batch = parseInt(raw.slice(8), 10);
  }
  return a;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s - m * 60)}s`;
}

async function main() {
  const args = parseArgs();

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl) {
    console.error("Error: TURSO_DATABASE_URL is not set. Put it in .env.local and run with --env-file=.env.local");
    process.exit(1);
  }

  const dbPath = path.join(__dirname, "..", "data", "lexica.db");
  if (!existsSync(dbPath)) {
    console.error(`Error: ${dbPath} not found. Build it first with: npm run db:rebuild`);
    process.exit(1);
  }

  console.log(`Source:  ${dbPath}`);
  console.log(`Target:  ${tursoUrl}`);
  console.log(`Options: batch=${args.batch}${args.reset ? " reset" : ""}${args.schemaOnly ? " schema-only" : ""}${args.dataOnly ? " data-only" : ""}`);
  console.log("");

  const local = new Database(dbPath, { readonly: true, fileMustExist: true });
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  // Discover tables and indexes
  const tables = local.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all() as { name: string; sql: string }[];

  const indexes = local.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY name"
  ).all() as { name: string; sql: string }[];

  const selected = tables.filter(t => {
    if (args.only && !args.only.has(t.name)) return false;
    if (args.skip.has(t.name)) return false;
    return true;
  });

  console.log(`Tables discovered: ${tables.length} (${selected.length} selected)`);
  console.log(`Indexes discovered: ${indexes.length}`);
  console.log("");

  // === SCHEMA ===
  if (!args.dataOnly) {
    console.log("=== Creating schema on Turso ===");
    for (const t of selected) {
      if (args.reset) {
        try {
          await turso.execute(`DROP TABLE IF EXISTS ${t.name}`);
        } catch (e) {
          console.warn(`  warn: failed to drop ${t.name}: ${(e as Error).message}`);
        }
      }
      try {
        // Normalize CREATE TABLE to CREATE TABLE IF NOT EXISTS
        const sql = t.sql.replace(/^CREATE TABLE\s+/i, "CREATE TABLE IF NOT EXISTS ");
        await turso.execute(sql);
        console.log(`  ✓ ${t.name}`);
      } catch (e) {
        console.error(`  ✗ ${t.name}: ${(e as Error).message}`);
      }
    }
    console.log("");
  }

  // === DATA ===
  if (!args.schemaOnly) {
    console.log("=== Copying rows ===");
    const totalStart = Date.now();
    let grandTotal = 0;

    for (const t of selected) {
      const tableStart = Date.now();
      const countRow = local.prepare(`SELECT COUNT(*) AS c FROM ${t.name}`).get() as { c: number };
      const total = countRow.c;
      if (total === 0) {
        console.log(`  · ${t.name}: empty`);
        continue;
      }

      // Column list for parameterized INSERT
      const cols = (local.prepare(`PRAGMA table_info(${t.name})`).all() as { name: string }[]).map(c => c.name);
      const colList = cols.map(c => `"${c}"`).join(", ");
      const placeholders = cols.map(() => "?").join(", ");
      const insertSql = `INSERT INTO ${t.name} (${colList}) VALUES (${placeholders})`;

      const stmt = local.prepare(`SELECT ${colList} FROM ${t.name}`);
      const iter = stmt.iterate() as IterableIterator<Record<string, unknown>>;

      let sent = 0;
      let buffer: { sql: string; args: InValue[] }[] = [];

      for (const row of iter) {
        const values: InValue[] = cols.map(c => {
          const v = row[c];
          if (v === null || v === undefined) return null;
          if (Buffer.isBuffer(v)) return v;
          if (typeof v === "bigint" || typeof v === "number" || typeof v === "string") return v;
          return String(v);
        });
        buffer.push({ sql: insertSql, args: values });

        if (buffer.length >= args.batch) {
          // @libsql/client batch accepts an array of { sql, args }
          // Use "write" mode which wraps in a tx for speed + atomicity per batch.
          await turso.batch(buffer, "write");
          sent += buffer.length;
          buffer = [];
          process.stdout.write(`\r  · ${t.name}: ${fmt(sent)} / ${fmt(total)} (${((sent / total) * 100).toFixed(1)}%)`);
        }
      }

      if (buffer.length > 0) {
        await turso.batch(buffer, "write");
        sent += buffer.length;
      }

      const dur = Date.now() - tableStart;
      const rps = sent / (dur / 1000);
      process.stdout.write(`\r  ✓ ${t.name}: ${fmt(sent)} rows in ${fmtMs(dur)} (${Math.round(rps)}/s)\n`);
      grandTotal += sent;
    }

    console.log(`\nTotal: ${fmt(grandTotal)} rows in ${fmtMs(Date.now() - totalStart)}`);
    console.log("");
  }

  // === INDEXES ===
  if (!args.dataOnly) {
    console.log("=== Creating indexes ===");
    let indexCount = 0;
    for (const idx of indexes) {
      // Skip indexes on tables we didn't upload
      const match = idx.sql.match(/\s+ON\s+"?(\w+)"?/i);
      const tableName = match?.[1];
      if (tableName && args.only && !args.only.has(tableName)) continue;
      if (tableName && args.skip.has(tableName)) continue;

      try {
        const sql = idx.sql.replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, "CREATE $1INDEX IF NOT EXISTS ");
        await turso.execute(sql);
        indexCount++;
      } catch (e) {
        console.warn(`  warn: failed to create ${idx.name}: ${(e as Error).message}`);
      }
    }
    console.log(`  ✓ ${indexCount} indexes created`);
  }

  local.close();
  console.log("\nDone.");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
