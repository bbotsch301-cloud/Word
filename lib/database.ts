import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "lexica.db");
    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
  }
  return db;
}

export interface WordRow {
  id: number;
  word: string;
  pos: string;
  ipa: string;
  definition: string;
  etymology_text: string;
  etymology_templates: string;
  related_words: string;
  examples: string;
  antonyms: string;
  hypernyms: string;
  hyponyms: string;
  coordinate_terms: string;
}

export interface WebsterRow {
  word: string;
  definition: string;
  synonyms: string;
}

export interface Webster1828Row {
  word: string;
  part_of_speech: string;
  etymology: string;
  definition: string;
  languages: string;
}

export interface BlacksLawRow {
  term: string;
  definition: string;
  related_terms: string;
}

export function lookupWord(word: string): WordRow | undefined {
  const db = getDatabase();
  return db.prepare(
    "SELECT * FROM words WHERE word = ? ORDER BY (CASE WHEN LENGTH(etymology_templates) > 2 THEN 1 ELSE 0 END) DESC, LENGTH(definition) DESC LIMIT 1"
  ).get(word.toLowerCase()) as WordRow | undefined;
}

export function lookupAllPOS(word: string): WordRow[] {
  const db = getDatabase();
  return db.prepare(
    "SELECT * FROM words WHERE word = ? ORDER BY LENGTH(definition) DESC"
  ).all(word.toLowerCase()) as WordRow[];
}

export function lookupWebster(word: string): WebsterRow | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM webster WHERE word = ?").get(word.toLowerCase()) as WebsterRow | undefined;
}

export function lookupWebster1828(word: string): Webster1828Row | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM webster1828 WHERE word = ?").get(word.toLowerCase()) as Webster1828Row | undefined;
  } catch {
    return undefined;
  }
}

export function lookupBlacksLaw(term: string): BlacksLawRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM blacks_law WHERE term = ?").get(term.toLowerCase()) as BlacksLawRow | undefined;
  } catch {
    return undefined;
  }
}

export function searchBlacksLaw(term: string, limit: number = 8): BlacksLawRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM blacks_law WHERE term LIKE ? AND term != ? ORDER BY LENGTH(term) ASC LIMIT ?"
    ).all(`%${term.toLowerCase()}%`, term.toLowerCase(), limit) as BlacksLawRow[];
  } catch {
    return [];
  }
}

export interface BouvierRow {
  term: string;
  definition: string;
}

export function lookupBouvier(term: string): BouvierRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM bouvier WHERE term = ?").get(term.toLowerCase()) as BouvierRow | undefined;
  } catch {
    return undefined;
  }
}
