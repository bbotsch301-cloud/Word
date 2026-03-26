import Database from "better-sqlite3";
import path from "path";
import { existsSync } from "fs";
import { processKaikki } from "./process-kaikki";
import { processWebster } from "./process-webster";
import { processWebster1828 } from "./process-webster1828";
import { processBlacksLaw } from "./process-blacks-law";

const DB_PATH = path.join(__dirname, "..", "data", "lexica.db");
const RAW_DIR = path.join(__dirname, "..", "data", "raw");

async function main() {
  const kaikkiPath = path.join(RAW_DIR, "kaikki-english.jsonl");
  const websterPath = path.join(RAW_DIR, "webster.json");
  const webster1828Path = path.join(RAW_DIR, "webster1828.db");
  const blacksLawPath = path.join(RAW_DIR, "blacks-law-2nd.jsonl");

  if (!existsSync(kaikkiPath)) {
    console.error("Missing kaikki-english.jsonl. Run npm run db:download first.");
    process.exit(1);
  }

  // Remove existing DB
  if (existsSync(DB_PATH)) {
    const { unlinkSync } = await import("fs");
    unlinkSync(DB_PATH);
    console.log("Removed existing database.");
  }

  const db = new Database(DB_PATH);

  // Enable WAL mode for faster writes
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = OFF");

  // Create core tables
  db.exec(`
    CREATE TABLE words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      pos TEXT,
      ipa TEXT,
      definition TEXT,
      etymology_text TEXT,
      etymology_templates TEXT,
      related_words TEXT,
      examples TEXT,
      antonyms TEXT,
      hypernyms TEXT,
      hyponyms TEXT,
      coordinate_terms TEXT
    );

    CREATE TABLE webster (
      word TEXT PRIMARY KEY,
      definition TEXT,
      synonyms TEXT
    );
  `);

  console.log("Database created. Processing sources...\n");

  // Process each source
  console.log("=== Processing Kaikki.org Wiktextract ===");
  await processKaikki(db, kaikkiPath);

  if (existsSync(websterPath)) {
    console.log("\n=== Processing Webster's 1913 Dictionary ===");
    await processWebster(db, websterPath);
  } else {
    console.log("\n[skip] Webster's 1913 not found");
  }

  if (existsSync(webster1828Path)) {
    console.log("\n=== Processing Webster's 1828 Dictionary ===");
    await processWebster1828(db, webster1828Path);
  } else {
    console.log("\n[skip] Webster's 1828 not found");
  }

  if (existsSync(blacksLawPath)) {
    console.log("\n=== Processing Black's Law Dictionary 2nd Ed ===");
    await processBlacksLaw(db, blacksLawPath);
  } else {
    console.log("\n[skip] Black's Law Dictionary not found");
  }

  // Create indexes after bulk inserts
  console.log("\nCreating indexes...");
  db.exec(`
    CREATE INDEX idx_words_word ON words(word);
  `);

  // Show stats
  const wordCount = db.prepare("SELECT COUNT(*) as c FROM words").get() as { c: number };
  const websterCount = db.prepare("SELECT COUNT(*) as c FROM webster").get() as { c: number };

  console.log(`\nDone!`);
  console.log(`  Wiktionary words: ${wordCount.c.toLocaleString()}`);
  console.log(`  Webster 1913 entries: ${websterCount.c.toLocaleString()}`);

  // Check optional tables
  try {
    const w1828 = db.prepare("SELECT COUNT(*) as c FROM webster1828").get() as { c: number };
    console.log(`  Webster 1828 entries: ${w1828.c.toLocaleString()}`);
  } catch { /* table may not exist */ }

  try {
    const blacks = db.prepare("SELECT COUNT(*) as c FROM blacks_law").get() as { c: number };
    console.log(`  Black's Law entries: ${blacks.c.toLocaleString()}`);
  } catch { /* table may not exist */ }

  console.log(`  Database: ${DB_PATH}`);

  db.close();
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
