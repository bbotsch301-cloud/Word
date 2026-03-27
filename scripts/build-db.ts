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
import { processMoby } from "./process-moby";
import { processWordNet } from "./process-wordnet";
import { processRogets } from "./process-rogets";
import { processCmuDict } from "./process-cmudict";
import { processEastons } from "./process-eastons";
import { processHitchcocks } from "./process-hitchcocks";
import { processNaves } from "./process-naves";
import { processGcide } from "./process-gcide";
import { processAWL } from "./process-awl";
import { processBouvier } from "./process-bouvier";
import { processStrongs } from "./process-strongs";
import { processScowl } from "./process-scowl";
import { processSmiths } from "./process-smiths";
import { processBDB } from "./process-bdb";
import { processIpaDict } from "./process-ipadict";
import { processOxford5000 } from "./process-oxford5000";
import { processCefr } from "./process-cefr";
import { processMorphoLex } from "./process-morpholex";
import { processGoogleFreq } from "./process-google-freq";
import { processNgrams } from "./process-ngrams";
import { processCognates } from "./process-cognates";
import { processEtymologyDb } from "./process-etymology-db";

const DB_PATH = path.join(__dirname, "..", "data", "lexica.db");
const RAW_DIR = path.join(__dirname, "..", "data", "raw");

interface SourceConfig {
  name: string;
  file: string;
  processor: (db: Database.Database, path: string) => Promise<void>;
  required?: boolean;
  isDir?: boolean;
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
    // Phase 1: Thesaurus
    { name: "Moby Thesaurus", file: "moby-thesaurus.txt", processor: processMoby },
    { name: "WordNet 3.1", file: "dict", processor: processWordNet, isDir: true },
    { name: "Roget's Thesaurus (1911)", file: "rogets-thesaurus.txt", processor: processRogets },
    // Phase 2: Pronunciation
    { name: "CMU Pronouncing Dictionary", file: "cmudict.txt", processor: processCmuDict },
    // Phase 3: Biblical
    { name: "Easton's Bible Dictionary", file: "bible-dict-index.json", processor: processEastons },
    { name: "Hitchcock's Bible Names", file: "hitchcocks-names.csv", processor: processHitchcocks },
    { name: "Nave's Topical Bible", file: "naves-topical.csv", processor: processNaves },
    // Existing sources from prior setup
    { name: "Bouvier's Law Dictionary", file: "bouvier_a.txt", processor: (db, p) => processBouvier(db, path.dirname(p)), isDir: false },
    { name: "Strong's Concordance", file: "strongs-hebrew-dictionary.js", processor: (db, p) => processStrongs(db, path.dirname(p)), isDir: false },
    // Phase 3b: More Biblical
    { name: "Smith's Bible Dictionary", file: "bible-dict-index.json", processor: processSmiths },
    { name: "Brown-Driver-Briggs Hebrew", file: "bdb-hebrew", processor: processBDB, isDir: true },
    // Phase 4: Enrichment
    { name: "GCIDE", file: "gcide-0.53", processor: processGcide, isDir: true },
    { name: "Academic Word List", file: "academic-word-list.json", processor: processAWL },
    { name: "SCOWL Word Lists", file: "scowl-2020.12.07", processor: processScowl, isDir: true },
    // Phase 5: New enrichment
    { name: "IPA Dict", file: "ipa-dict-en.txt", processor: processIpaDict },
    { name: "Oxford 5000", file: "oxford-5000.json", processor: processOxford5000 },
    { name: "CEFR Word Levels", file: "cefr-words.csv", processor: processCefr },
    { name: "MorphoLex", file: "morpholex-en.xlsx", processor: processMorphoLex },
    { name: "Google 10K Frequency", file: "google-10000-english.txt", processor: processGoogleFreq },
    // Phase 6: Ngrams (process all available letter files)
    ...("abcdefghijklmnopqrstuvwxyz".split("").map(letter => ({
      name: `Google Books Ngram (${letter})`,
      file: `googlebooks-eng-all-1gram-20120701-${letter}`,
      processor: processNgrams,
    }))),
    // Phase 6: Etymology DB + Cognates
    { name: "Etymology Database", file: "etymology-db.csv", processor: processEtymologyDb },
    { name: "Cognates (from Etymology DB)", file: "etymology-db.csv", processor: processCognates },
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
    // Phase 1: Thesaurus
    { id: "moby", name: "Moby Thesaurus", year: 1996, desc: "The largest thesaurus in the English language with over 2.5 million synonyms across 30,000 root words. Public domain." },
    { id: "wordnet", name: "WordNet", year: 2024, desc: "Princeton's lexical database organizing English into synsets — groups of cognitive synonyms linked by semantic relations." },
    { id: "rogets", name: "Roget's Thesaurus", year: 1911, desc: "Peter Mark Roget's classic thesaurus organizing the English language by concepts and ideas, not alphabetically." },
    // Phase 2: Pronunciation
    { id: "cmudict", name: "CMU Pronouncing Dict", year: 2015, desc: "Carnegie Mellon University's pronunciation dictionary with phonetic transcriptions for over 134,000 English words." },
    // Phase 3: Biblical
    { id: "eastons", name: "Easton's Bible Dictionary", year: 1897, desc: "Matthew George Easton's comprehensive dictionary of biblical terms, places, names, and topics." },
    { id: "hitchcocks", name: "Hitchcock's Bible Names", year: 1869, desc: "Roswell D. Hitchcock's dictionary of Bible names with their meanings and etymologies." },
    { id: "naves", name: "Nave's Topical Bible", year: 1896, desc: "Orville J. Nave's topical index and concordance of biblical topics with scripture references." },
    // Existing
    { id: "bouvier", name: "Bouvier's Law Dictionary", year: 1856, desc: "John Bouvier's comprehensive American legal dictionary — a foundational reference for early American law." },
    { id: "strongs", name: "Strong's Concordance", year: 1890, desc: "James Strong's exhaustive concordance of the Bible with Hebrew and Greek lexicon entries." },
    { id: "smiths", name: "Smith's Bible Dictionary", year: 1863, desc: "William Smith's comprehensive dictionary of the Bible covering antiquities, biography, geography, and natural history." },
    { id: "bdb", name: "Brown-Driver-Briggs", year: 1906, desc: "The standard Hebrew and Aramaic lexicon of the Old Testament, cross-referenced with Strong's numbers." },
    // Phase 4: Enrichment
    { id: "gcide", name: "GCIDE", year: 2024, desc: "The GNU Collaborative International Dictionary of English — an expanded, community-maintained edition of Webster's 1913." },
    { id: "scowl", name: "SCOWL Word Lists", year: 2020, desc: "Spell Checker Oriented Word Lists — comprehensive English word lists with dialect and frequency classification." },
    { id: "ipadict", name: "IPA Dictionary", year: 2023, desc: "Open-source IPA pronunciation dictionary providing phonetic transcriptions for English words." },
    { id: "oxford5000", name: "Oxford 5000", year: 2020, desc: "The 5,000 most important English words for learners, tagged with CEFR proficiency levels." },
    { id: "morpholex", name: "MorphoLex", year: 2020, desc: "Morphological database decomposing 70,000 English words into their prefixes, roots, and suffixes." },
  ];

  const insertDict = db.prepare("INSERT OR REPLACE INTO dictionaries (id, name, year, description, entry_count) VALUES (?, ?, ?, ?, ?)");
  const countQueries: Record<string, string> = {
    wiktionary: "SELECT COUNT(DISTINCT word) as c FROM words",
    webster1828: "SELECT COUNT(*) as c FROM webster1828",
    webster1913: "SELECT COUNT(*) as c FROM webster",
    "blacks-law": "SELECT COUNT(*) as c FROM blacks_law",
    "hobson-jobson": "SELECT COUNT(*) as c FROM hobson_jobson",
    "vulgar-tongue": "SELECT COUNT(*) as c FROM vulgar_tongue",
    moby: "SELECT COUNT(*) as c FROM moby_thesaurus",
    wordnet: "SELECT COUNT(*) as c FROM wordnet_synsets",
    rogets: "SELECT COUNT(*) as c FROM rogets",
    cmudict: "SELECT COUNT(DISTINCT word) as c FROM cmu_pronunciation",
    eastons: "SELECT COUNT(*) as c FROM eastons",
    hitchcocks: "SELECT COUNT(*) as c FROM hitchcocks",
    naves: "SELECT COUNT(*) as c FROM naves",
    gcide: "SELECT COUNT(DISTINCT word) as c FROM gcide",
    bouvier: "SELECT COUNT(*) as c FROM bouvier",
    strongs: "SELECT COUNT(*) as c FROM strongs",
    smiths: "SELECT COUNT(*) as c FROM smiths",
    bdb: "SELECT COUNT(*) as c FROM bdb_hebrew",
    scowl: "SELECT COUNT(*) as c FROM scowl_words",
    ipadict: "SELECT COUNT(*) as c FROM ipa_dict",
    oxford5000: "SELECT COUNT(*) as c FROM oxford_5000",
    morpholex: "SELECT COUNT(*) as c FROM morpholex",
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
