import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

// GCIDE uses a custom SGML-like markup. We need to strip tags and extract entries.

function stripTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\{([^}]*)\}/g, "$1")
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export async function processGcide(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS gcide (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      pos TEXT,
      definition TEXT,
      etymology TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO gcide (word, pos, definition, etymology) VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string | null, string, string | null][]) => {
    for (const row of rows) insert.run(...row);
  });

  // GCIDE files are named CIDE.A, CIDE.B, ... CIDE.Z
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let count = 0;
  let batch: [string, string | null, string, string | null][] = [];
  const BATCH_SIZE = 5000;

  for (const letter of letters) {
    const filePath = path.join(dirPath, `CIDE.${letter}`);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");

    // Split by entry markers <p><ent> or <hw>
    // GCIDE entries start with <p><ent>WORD</ent>
    const entryRegex = /<p><ent>([^<]+)<\/ent>/gi;
    const hwRegex = /<hw>([^<]+)<\/hw>/gi;
    const posRegex = /<pos>([^<]+)<\/pos>/gi;
    const defRegex = /<def>([^<]*(?:<[^/][^>]*>[^<]*)*)<\/def>/gi;
    const etymRegex = /<ety>([^<]*(?:<[^/][^>]*>[^<]*)*)<\/ety>/gi;

    // Split content into entries (each starts with <p>)
    const entries = content.split(/<p>/);

    for (const entry of entries) {
      if (!entry.trim()) continue;

      // Extract headword
      const entMatch = /<ent>([^<]+)<\/ent>/i.exec(entry);
      const hwMatch = /<hw>([^<]+)<\/hw>/i.exec(entry);
      const headword = (entMatch?.[1] || hwMatch?.[1] || "").replace(/[`'"*]/g, "").trim().toLowerCase();
      if (!headword || headword.length > 80) continue;
      if (!/^[a-z]/.test(headword)) continue;

      // Extract POS
      const posMatch = /<pos>([^<]+)<\/pos>/i.exec(entry);
      const pos = posMatch ? stripTags(posMatch[1]).replace(/\.$/, "").trim() : null;

      // Extract all definitions
      const defs: string[] = [];
      let defMatch;
      const defRe = /<def>([\s\S]*?)<\/def>/gi;
      while ((defMatch = defRe.exec(entry)) !== null) {
        const cleaned = stripTags(defMatch[1]).trim();
        if (cleaned) defs.push(cleaned);
      }
      const definition = defs.join("; ") || "";
      if (!definition) continue;

      // Extract etymology
      const etymMatch = /<ety>([\s\S]*?)<\/ety>/i.exec(entry);
      const etymology = etymMatch ? stripTags(etymMatch[1]).trim() : null;

      batch.push([headword, pos, definition, etymology]);

      if (batch.length >= BATCH_SIZE) {
        insertMany(batch);
        count += batch.length;
        batch = [];
      }
    }

    console.log(`  Processed CIDE.${letter}`);
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_gcide_word ON gcide(word);`);
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
