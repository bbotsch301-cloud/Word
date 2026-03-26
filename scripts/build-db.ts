import Database from "better-sqlite3";
import path from "path";
import { existsSync } from "fs";
import { processKaikki } from "./process-kaikki";
import { processWebster } from "./process-webster";
import { processWebster1828 } from "./process-webster1828";
import { processBlacksLaw } from "./process-blacks-law";
import { processHobsonJobson } from "./process-hobson-jobson";
import { processVulgarTongue } from "./process-vulgar-tongue";
import { processFrequency } from "./process-frequency";

const DB_PATH = path.join(__dirname, "..", "data", "lexica.db");
const RAW_DIR = path.join(__dirname, "..", "data", "raw");

interface SourceConfig {
  name: string;
  file: string;
  processor: (db: Database.Database, path: string) => Promise<void>;
  required?: boolean;
}

async function main() {
  const kaikkiPath = path.join(RAW_DIR, "kaikki-english.jsonl");
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

  // Define all sources
  const sources: SourceConfig[] = [
    { name: "Kaikki.org Wiktextract", file: "kaikki-english.jsonl", processor: processKaikki, required: true },
    { name: "Webster's 1913", file: "webster.json", processor: processWebster },
    { name: "Webster's 1828", file: "webster1828.db", processor: processWebster1828 },
    { name: "Black's Law Dictionary 2nd Ed", file: "blacks-law-2nd.jsonl", processor: processBlacksLaw },
    { name: "Hobson-Jobson (Anglo-Indian)", file: "hobson-jobson.txt", processor: processHobsonJobson },
    { name: "1811 Vulgar Tongue", file: "vulgar-tongue.txt", processor: processVulgarTongue },
    { name: "Word Frequency", file: "wordfreq.json", processor: processFrequency },
  ];

  // Process each source
  for (const source of sources) {
    const filePath = path.join(RAW_DIR, source.file);
    if (existsSync(filePath)) {
      console.log(`=== Processing ${source.name} ===`);
      await source.processor(db, filePath);
      console.log();
    } else if (source.required) {
      console.error(`Missing required: ${source.file}`);
      process.exit(1);
    } else {
      console.log(`[skip] ${source.name} not found`);
    }
  }

  // Create dictionaries metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dictionaries (
      id TEXT PRIMARY KEY,
      name TEXT,
      year INTEGER,
      description TEXT,
      entry_count INTEGER
    );
  `);

  // Populate dictionary metadata
  const dictMeta = [
    { id: "wiktionary", name: "Wiktionary", year: 2024, desc: "Modern collaborative dictionary with etymology, pronunciation, and definitions for over 700,000 English words." },
    { id: "webster1828", name: "Webster's 1828", year: 1828, desc: "Noah Webster's American Dictionary of the English Language — the foundational American dictionary with rich historical definitions." },
    { id: "webster1913", name: "Webster's 1913", year: 1913, desc: "Webster's Revised Unabridged Dictionary — the expanded early 20th century edition." },
    { id: "blacks-law", name: "Black's Law Dictionary", year: 1910, desc: "The most widely cited legal dictionary in American jurisprudence, 2nd Edition." },
    { id: "hobson-jobson", name: "Hobson-Jobson", year: 1886, desc: "A glossary of colloquial Anglo-Indian words and phrases — the definitive reference for English words borrowed from Indian languages." },
    { id: "vulgar-tongue", name: "1811 Vulgar Tongue", year: 1811, desc: "Francis Grose's dictionary of slang, cant, and vulgar language of the Georgian era." },
  ];

  const insertDict = db.prepare("INSERT OR REPLACE INTO dictionaries (id, name, year, description, entry_count) VALUES (?, ?, ?, ?, ?)");
  const countQueries: Record<string, string> = {
    wiktionary: "SELECT COUNT(DISTINCT word) as c FROM words",
    webster1828: "SELECT COUNT(*) as c FROM webster1828",
    webster1913: "SELECT COUNT(*) as c FROM webster",
    "blacks-law": "SELECT COUNT(*) as c FROM blacks_law",
    "hobson-jobson": "SELECT COUNT(*) as c FROM hobson_jobson",
    "vulgar-tongue": "SELECT COUNT(*) as c FROM vulgar_tongue",
  };

  for (const meta of dictMeta) {
    let count = 0;
    try {
      const row = db.prepare(countQueries[meta.id]).get() as { c: number };
      count = row.c;
    } catch { /* table may not exist */ }
    insertDict.run(meta.id, meta.name, meta.year, meta.desc, count);
  }

  // Create indexes
  console.log("Creating indexes...");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
  `);

  // Show stats
  console.log("\nDone!");
  const allDicts = db.prepare("SELECT id, name, entry_count FROM dictionaries ORDER BY year").all() as { id: string; name: string; entry_count: number }[];
  for (const d of allDicts) {
    console.log(`  ${d.name}: ${d.entry_count.toLocaleString()} entries`);
  }

  try {
    const freq = db.prepare("SELECT COUNT(*) as c FROM word_frequency").get() as { c: number };
    console.log(`  Word Frequency: ${freq.c.toLocaleString()} entries`);
  } catch { /* not available */ }

  console.log(`  Database: ${DB_PATH}`);
  db.close();
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
