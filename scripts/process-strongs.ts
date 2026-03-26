import { readFileSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

interface StrongsEntry {
  lemma: string;
  xlit: string;
  pron: string;
  derivation: string;
  strongs_def: string;
  kjv_def: string;
}

function loadStrongsJS(filePath: string, varName: string): Record<string, StrongsEntry> {
  let content = readFileSync(filePath, "utf-8");
  content = content.replace(/module\.exports.*/, "");
  // Use Function constructor to safely eval
  const fn = new Function(`${content}; return ${varName};`);
  return fn();
}

export async function processStrongs(db: Database.Database, rawDir: string): Promise<void> {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS strongs (
      id TEXT PRIMARY KEY,
      lemma TEXT,
      xlit TEXT,
      pron TEXT,
      derivation TEXT,
      strongs_def TEXT,
      kjv_def TEXT,
      language TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS strongs_index (
      english_word TEXT,
      strongs_id TEXT,
      PRIMARY KEY (english_word, strongs_id)
    );
  `);

  const insertEntry = db.prepare(`
    INSERT OR IGNORE INTO strongs (id, lemma, xlit, pron, derivation, strongs_def, kjv_def, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertIndex = db.prepare(`
    INSERT OR IGNORE INTO strongs_index (english_word, strongs_id)
    VALUES (?, ?)
  `);

  const insertEntries = db.transaction((rows: [string, string, string, string, string, string, string, string][]) => {
    for (const row of rows) insertEntry.run(...row);
  });

  const insertIndexRows = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insertIndex.run(...row);
  });

  // Process Hebrew
  console.log("  Processing Hebrew...");
  const hebrew = loadStrongsJS(
    path.join(rawDir, "strongs-hebrew-dictionary.js"),
    "strongsHebrewDictionary"
  );

  const hEntries: [string, string, string, string, string, string, string, string][] = [];
  const indexRows: [string, string][] = [];

  for (const [id, entry] of Object.entries(hebrew)) {
    hEntries.push([
      id,
      entry.lemma || "",
      entry.xlit || "",
      entry.pron || "",
      entry.derivation || "",
      entry.strongs_def || "",
      entry.kjv_def || "",
      "hebrew",
    ]);

    // Build reverse index from kjv_def
    const words = (entry.kjv_def || "")
      .split(/[,;]/)
      .map((w) => w.trim().toLowerCase().replace(/[^a-z ]/g, "").trim())
      .filter((w) => w.length > 2 && w.length < 40);

    for (const word of words) {
      indexRows.push([word, id]);
    }
  }

  insertEntries(hEntries);
  console.log(`  Hebrew: ${hEntries.length} entries`);

  // Process Greek
  console.log("  Processing Greek...");
  const greek = loadStrongsJS(
    path.join(rawDir, "strongs-greek-dictionary.js"),
    "strongsGreekDictionary"
  );

  const gEntries: [string, string, string, string, string, string, string, string][] = [];

  for (const [id, entry] of Object.entries(greek)) {
    gEntries.push([
      id,
      entry.lemma || "",
      entry.xlit || "",
      entry.pron || "",
      entry.derivation || "",
      entry.strongs_def || "",
      entry.kjv_def || "",
      "greek",
    ]);

    const words = (entry.kjv_def || "")
      .split(/[,;]/)
      .map((w) => w.trim().toLowerCase().replace(/[^a-z ]/g, "").trim())
      .filter((w) => w.length > 2 && w.length < 40);

    for (const word of words) {
      indexRows.push([word, id]);
    }
  }

  insertEntries(gEntries);
  console.log(`  Greek: ${gEntries.length} entries`);

  // Insert index
  insertIndexRows(indexRows);
  console.log(`  Index: ${indexRows.length} word-to-entry mappings`);

  // Create index
  db.exec("CREATE INDEX IF NOT EXISTS idx_strongs_index_word ON strongs_index(english_word)");
}

// CLI runner
if (require.main === module) {
  const BetterSqlite3 = require("better-sqlite3");
  const dbPath = path.join(process.cwd(), "data", "lexica.db");
  const db = new BetterSqlite3(dbPath);

  const rawDir = path.join(process.cwd(), "data", "raw");
  processStrongs(db, rawDir).then(() => {
    const total = (db.prepare("SELECT COUNT(*) as c FROM strongs").get() as { c: number }).c;
    db.prepare(`
      INSERT OR REPLACE INTO dictionaries (id, name, year, description, entry_count)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      "strongs",
      "Strong's Concordance",
      1890,
      "James Strong's Exhaustive Concordance mapping every KJV word to its original Hebrew or Greek root.",
      total,
    );
    console.log(`Done. ${total} total entries. Updated dictionaries metadata.`);
    db.close();
  });
}
