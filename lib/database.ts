import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "lexica.db");
    try {
      db = new Database(dbPath, { readonly: true });
      db.pragma("journal_mode = WAL");
    } catch (err) {
      // Re-throw with a clearer message; db stays null so next call retries
      throw new Error(`Cannot open database at ${dbPath}: ${(err as Error).message}`);
    }
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
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

export function lookupBlacksLaw(term: string): BlacksLawRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM blacks_law WHERE term = ?").get(term.toLowerCase()) as BlacksLawRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

export function searchBlacksLaw(term: string, limit: number = 8): BlacksLawRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM blacks_law WHERE term LIKE ? AND term != ? ORDER BY LENGTH(term) ASC LIMIT ?"
    ).all(`%${term.toLowerCase()}%`, term.toLowerCase(), limit) as BlacksLawRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
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
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

export interface StrongsRow {
  id: string;
  lemma: string;
  xlit: string;
  pron: string;
  derivation: string;
  strongs_def: string;
  kjv_def: string;
  language: string;
}

export function lookupStrongs(word: string, limit: number = 5): StrongsRow[] {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT s.* FROM strongs s
      JOIN strongs_index si ON s.id = si.strongs_id
      WHERE si.english_word = ?
      ORDER BY s.language, s.id
      LIMIT ?
    `).all(word.toLowerCase(), limit) as StrongsRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Moby Thesaurus ===
export interface MobyRow {
  word: string;
  synonyms: string;
}

export function lookupMobyThesaurus(word: string): MobyRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM moby_thesaurus WHERE word = ?").get(word.toLowerCase()) as MobyRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === WordNet ===
export interface WordNetSynsetRow {
  synset_id: string;
  pos: string;
  definition: string;
  examples: string;
}

export interface WordNetRelationRow {
  source_synset: string;
  target_synset: string;
  relation_type: string;
}

export function lookupWordNet(word: string, limit: number = 10): WordNetSynsetRow[] {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT ws.* FROM wordnet_synsets ws
      JOIN wordnet_lemmas wl ON ws.synset_id = wl.synset_id
      WHERE wl.word = ?
      LIMIT ?
    `).all(word.toLowerCase(), limit) as WordNetSynsetRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

export function getWordNetSynonyms(synsetId: string): string[] {
  const db = getDatabase();
  try {
    const rows = db.prepare(
      "SELECT word FROM wordnet_lemmas WHERE synset_id = ? LIMIT 20"
    ).all(synsetId) as { word: string }[];
    return rows.map(r => r.word);
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

export function getWordNetRelations(synsetId: string, relationType: string, limit: number = 5): WordNetSynsetRow[] {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT ws.* FROM wordnet_synsets ws
      JOIN wordnet_relations wr ON ws.synset_id = wr.target_synset
      WHERE wr.source_synset = ? AND wr.relation_type = ?
      LIMIT ?
    `).all(synsetId, relationType, limit) as WordNetSynsetRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Roget's Thesaurus ===
export interface RogetRow {
  category_num: number;
  category_name: string;
  section: string;
  words: string;
}

export function lookupRogets(word: string, limit: number = 5): RogetRow[] {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT r.* FROM rogets r
      JOIN rogets_index ri ON r.category_num = ri.category_num
      WHERE ri.word = ?
      LIMIT ?
    `).all(word.toLowerCase(), limit) as RogetRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === CMU Pronouncing Dictionary ===
export interface CmuRow {
  word: string;
  variant: number;
  phonemes: string;
}

export function lookupPronunciation(word: string): CmuRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM cmu_pronunciation WHERE word = ? ORDER BY variant"
    ).all(word.toLowerCase()) as CmuRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Easton's Bible Dictionary ===
export interface EastonsRow {
  word: string;
  definition: string;
}

export function lookupEastons(word: string): EastonsRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM eastons WHERE word = ?").get(word.toLowerCase()) as EastonsRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Hitchcock's Bible Names ===
export interface HitchcocksRow {
  name: string;
  meaning: string;
}

export function lookupHitchcocks(word: string): HitchcocksRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM hitchcocks WHERE name = ?").get(word.toLowerCase()) as HitchcocksRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Nave's Topical Bible ===
export interface NavesRow {
  topic: string;
  subtopics: string;
  refs: string;
}

export function lookupNaves(word: string, limit: number = 5): NavesRow[] {
  const db = getDatabase();
  try {
    // Try exact match first, then prefix match
    const exact = db.prepare("SELECT * FROM naves WHERE topic = ?").all(word.toLowerCase()) as NavesRow[];
    if (exact.length > 0) return exact.slice(0, limit);
    return db.prepare("SELECT * FROM naves WHERE topic LIKE ? LIMIT ?").all(`${word.toLowerCase()}%`, limit) as NavesRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === GCIDE ===
export interface GcideRow {
  word: string;
  pos: string | null;
  definition: string;
  etymology: string | null;
}

export function lookupGcide(word: string): GcideRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM gcide WHERE word = ? ORDER BY LENGTH(definition) DESC LIMIT 1"
    ).get(word.toLowerCase()) as GcideRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === SCOWL ===
export interface ScowlRow {
  word: string;
  size_category: number;
  dialect: string;
  word_class: string;
}

export function lookupScowl(word: string): ScowlRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM scowl_words WHERE word = ?").get(word.toLowerCase()) as ScowlRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Academic Word List ===
export interface AcademicWordRow {
  word: string;
  sublist: number;
  family_head: string;
}

export function lookupAcademicWord(word: string): AcademicWordRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM academic_words WHERE word = ?").get(word.toLowerCase()) as AcademicWordRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Etymology-DB ===
export interface EtymologyLinkRow {
  word: string;
  word_lang: string;
  parent_word: string;
  parent_lang: string;
  relation_type: string;
}

export function lookupEtymologyLinks(word: string, limit: number = 10): EtymologyLinkRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM etymology_links WHERE word = ? LIMIT ?"
    ).all(word.toLowerCase(), limit) as EtymologyLinkRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Smith's Bible Dictionary ===
export function lookupSmiths(word: string): { word: string; definition: string } | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM smiths WHERE word = ?").get(word.toLowerCase()) as { word: string; definition: string } | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === IPA Dict ===
export function lookupIpaDict(word: string): string | undefined {
  const db = getDatabase();
  try {
    const row = db.prepare("SELECT ipa FROM ipa_dict WHERE word = ?").get(word.toLowerCase()) as { ipa: string } | undefined;
    return row?.ipa;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Oxford 5000 / CEFR ===
export function lookupCefrLevel(word: string): string | undefined {
  const db = getDatabase();
  try {
    // Try Oxford 5000 first (more curated), then CEFR dataset
    const oxford = db.prepare("SELECT cefr_level FROM oxford_5000 WHERE word = ?").get(word.toLowerCase()) as { cefr_level: string } | undefined;
    if (oxford?.cefr_level) return oxford.cefr_level;
    const cefr = db.prepare("SELECT cefr_level FROM cefr_words WHERE word = ?").get(word.toLowerCase()) as { cefr_level: string } | undefined;
    return cefr?.cefr_level || undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === MorphoLex ===
export interface MorphoLexRow {
  word: string;
  morphemes: string;
  prefix: string;
  root: string;
  suffix: string;
  morpheme_count: number;
}

export function lookupMorphology(word: string): MorphoLexRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM morpholex WHERE word = ?").get(word.toLowerCase()) as MorphoLexRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Google 10K Frequency ===
export function lookupGoogleFrequency(word: string): number | undefined {
  const db = getDatabase();
  try {
    const row = db.prepare("SELECT rank FROM google_frequency WHERE word = ?").get(word.toLowerCase()) as { rank: number } | undefined;
    return row?.rank;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === WordNet Meronyms/Holonyms ===
export function getWordNetMeronyms(word: string, limit: number = 8): { word: string; relation: string }[] {
  const db = getDatabase();
  try {
    const rows = db.prepare(`
      SELECT DISTINCT wl2.word, wr.relation_type as relation
      FROM wordnet_lemmas wl1
      JOIN wordnet_relations wr ON wl1.synset_id = wr.source_synset
      JOIN wordnet_lemmas wl2 ON wr.target_synset = wl2.synset_id
      WHERE wl1.word = ? AND wr.relation_type IN ('has_part', 'member_meronym', 'substance_meronym', 'part_meronym')
      AND wl2.word != ?
      LIMIT ?
    `).all(word.toLowerCase(), word.toLowerCase(), limit) as { word: string; relation: string }[];
    return rows;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

export function getWordNetHolonyms(word: string, limit: number = 8): { word: string; relation: string }[] {
  const db = getDatabase();
  try {
    const rows = db.prepare(`
      SELECT DISTINCT wl2.word, wr.relation_type as relation
      FROM wordnet_lemmas wl1
      JOIN wordnet_relations wr ON wl1.synset_id = wr.source_synset
      JOIN wordnet_lemmas wl2 ON wr.target_synset = wl2.synset_id
      WHERE wl1.word = ? AND wr.relation_type IN ('part_of', 'member_holonym', 'substance_holonym', 'part_holonym')
      AND wl2.word != ?
      LIMIT ?
    `).all(word.toLowerCase(), word.toLowerCase(), limit) as { word: string; relation: string }[];
    return rows;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === WordNet Polysemy Count ===
export function getPolysemyCount(word: string): { count: number; senses: string[] } {
  const db = getDatabase();
  try {
    const rows = db.prepare(`
      SELECT ws.definition FROM wordnet_synsets ws
      JOIN wordnet_lemmas wl ON ws.synset_id = wl.synset_id
      WHERE wl.word = ?
    `).all(word.toLowerCase()) as { definition: string }[];
    return { count: rows.length, senses: rows.map(r => r.definition) };
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return { count: 0, senses: [] };
  }
}

// === Doublet Search ===
export function findDoublets(word: string): string[] {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT etymology_templates FROM words WHERE word = ? AND etymology_templates LIKE '%doublet%' LIMIT 1"
    ).get(word.toLowerCase()) as { etymology_templates: string } | undefined;
    if (!row) return [];
    const templates = JSON.parse(row.etymology_templates) as Record<string, unknown>[];
    const doublets: string[] = [];
    for (const t of templates) {
      if ((t.name as string) === "doublet" || (t.name as string) === "dbt") {
        const args = t.args as Record<string, string> | undefined;
        if (args) {
          // Doublet template args are numbered: 2, 3, 4, etc.
          for (let i = 2; i <= 10; i++) {
            if (args[String(i)] && args[String(i)] !== "-") {
              doublets.push(args[String(i)]);
            }
          }
        }
      }
    }
    return doublets;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Borrowing Chain from Etymology Links ===
export function getBorrowingChain(word: string, maxDepth: number = 6): { word: string; language: string; type: string }[] {
  const db = getDatabase();
  try {
    const chain: { word: string; language: string; type: string }[] = [];
    let current = word.toLowerCase();
    const seen = new Set<string>();

    for (let i = 0; i < maxDepth; i++) {
      if (seen.has(current)) break;
      seen.add(current);
      const link = db.prepare(
        "SELECT parent_word, parent_lang, relation_type FROM etymology_links WHERE word = ? LIMIT 1"
      ).get(current) as { parent_word: string; parent_lang: string; relation_type: string } | undefined;
      if (!link) break;
      chain.push({ word: link.parent_word, language: link.parent_lang, type: link.relation_type });
      current = link.parent_word;
    }
    return chain;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Etymology Root Search ===
export function findWordsByEtymologyRoot(root: string, excludeWord: string, limit: number = 10): string[] {
  const db = getDatabase();
  try {
    const pattern = `%"root"%${root}%`;
    const rows = db.prepare(
      "SELECT DISTINCT word FROM words WHERE etymology_templates LIKE ? AND word != ? LIMIT ?"
    ).all(pattern, excludeWord.toLowerCase(), limit) as { word: string }[];
    return rows.map(r => r.word);
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === BDB Hebrew ===
export interface BDBRow {
  strongs_id: string;
  hebrew: string;
  transliteration: string;
  definition: string;
  usage_notes: string;
}

export function lookupBDB(strongsIds: string[]): BDBRow[] {
  if (strongsIds.length === 0) return [];
  const db = getDatabase();
  try {
    const placeholders = strongsIds.map(() => "?").join(",");
    return db.prepare(
      `SELECT * FROM bdb_hebrew WHERE strongs_id IN (${placeholders})`
    ).all(...strongsIds) as BDBRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Ngram History ===
export interface NgramRow {
  word: string;
  decade: number;
  frequency: number;
}

export function lookupNgramHistory(word: string): NgramRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT word, decade, frequency FROM ngram_history WHERE word = ? ORDER BY decade"
    ).all(word.toLowerCase()) as NgramRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Cognates ===
export interface CognateRow {
  english_word: string;
  cognate_word: string;
  cognate_lang: string;
  cognate_lang_name: string;
  shared_ancestor: string;
  ancestor_lang: string;
}

export function lookupCognates(word: string, limit: number = 30): CognateRow[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT * FROM cognates WHERE english_word = ? LIMIT ?"
    ).all(word.toLowerCase(), limit) as CognateRow[];
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

// === Nuttall Encyclopaedia ===
export function lookupNuttall(word: string): { word: string; definition: string } | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM nuttall WHERE word = ?").get(word.toLowerCase()) as { word: string; definition: string } | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Catholic Encyclopedia ===
export function lookupCatholicEncyclopedia(word: string): { word: string; definition: string } | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM catholic_encyclopedia WHERE word = ?").get(word.toLowerCase()) as { word: string; definition: string } | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Britannica ===
export function lookupBritannica(word: string): { word: string; definition: string } | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM britannica WHERE word = ?").get(word.toLowerCase()) as { word: string; definition: string } | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === First Use Dates ===
export interface FirstUseRow {
  word: string;
  year: number | null;
  century: string;
  source: string;
}

export function lookupFirstUse(word: string): FirstUseRow | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM first_use WHERE word = ?").get(word.toLowerCase()) as FirstUseRow | undefined;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Spell Indexes (Phoneme Key + Sorted Letters) ===
export function lookupPhonemeKey(word: string): string | undefined {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT phoneme_key FROM cmu_pronunciation WHERE word = ? AND variant = 0"
    ).get(word.toLowerCase()) as { phoneme_key: string } | undefined;
    return row?.phoneme_key;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

export function findWordsByPhonemeKey(key: string, excludeWord?: string, limit: number = 50): string[] {
  const db = getDatabase();
  try {
    const rows = db.prepare(
      "SELECT DISTINCT word FROM cmu_pronunciation WHERE phoneme_key = ? ORDER BY word LIMIT ?"
    ).all(key, limit + 1) as { word: string }[];
    const words = rows.map(r => r.word);
    return (excludeWord ? words.filter(w => w !== excludeWord.toLowerCase()) : words).slice(0, limit);
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

export function findAnagrams(word: string, limit: number = 30): string[] {
  const db = getDatabase();
  try {
    const w = word.toLowerCase();
    const sorted = w.split("").sort().join("");
    const rows = db.prepare(
      "SELECT word FROM word_letters WHERE sorted_letters = ? AND word != ? LIMIT ?"
    ).all(sorted, w, limit) as { word: string }[];
    return rows.map(r => r.word);
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return [];
  }
}

export function getWordShortDef(word: string): string {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT definition FROM words WHERE word = ? AND definition IS NOT NULL LIMIT 1"
    ).get(word.toLowerCase()) as { definition: string } | undefined;
    if (!row) return "";
    // Return first sentence/line, truncated
    const first = row.definition.split(/[.;\n]/)[0].trim();
    return first.length > 120 ? first.slice(0, 117) + "..." : first;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return "";
  }
}

export function getWordEtymologyBrief(word: string): { text: string; lang: string } {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT etymology_text FROM words WHERE word = ? AND etymology_text IS NOT NULL AND etymology_text != '' LIMIT 1"
    ).get(word.toLowerCase()) as { etymology_text: string } | undefined;
    if (!row) return { text: "", lang: "" };

    // Extract origin language from etymology links
    const link = db.prepare(
      "SELECT parent_lang FROM etymology_links WHERE word = ? LIMIT 1"
    ).get(word.toLowerCase()) as { parent_lang: string } | undefined;

    const text = row.etymology_text.length > 150
      ? row.etymology_text.slice(0, 147) + "..."
      : row.etymology_text;
    return { text, lang: link?.parent_lang || "" };
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return { text: "", lang: "" };
  }
}

export function getWordPos(word: string): string {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT pos FROM words WHERE word = ? AND pos IS NOT NULL LIMIT 1"
    ).get(word.toLowerCase()) as { pos: string } | undefined;
    return row?.pos || "";
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return "";
  }
}

export function getWordFrequencyRank(word: string): number | undefined {
  const db = getDatabase();
  try {
    const row = db.prepare(
      "SELECT rank FROM word_frequency WHERE word = ?"
    ).get(word.toLowerCase()) as { rank: number } | undefined;
    return row?.rank;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}

// === Word of the Day ===
export function getWordOfTheDay(): { word: string; definition: string } | undefined {
  const db = getDatabase();
  try {
    // Deterministic daily selection: hash the date string to pick from rich words
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    hash = Math.abs(hash);

    // Count rich words (have etymology and definition)
    const countRow = db.prepare(
      "SELECT COUNT(*) as c FROM words WHERE etymology_text IS NOT NULL AND etymology_text != '' AND definition IS NOT NULL AND definition != '' AND length(definition) > 20"
    ).get() as { c: number };

    if (countRow.c === 0) return undefined;

    const offset = hash % countRow.c;
    const row = db.prepare(
      "SELECT DISTINCT word, definition FROM words WHERE etymology_text IS NOT NULL AND etymology_text != '' AND definition IS NOT NULL AND definition != '' AND length(definition) > 20 LIMIT 1 OFFSET ?"
    ).get(offset) as { word: string; definition: string } | undefined;

    return row;
  } catch (err) {
    // Suppress "no such table" errors (optional data sources may not be loaded)
    if (process.env.NODE_ENV === "development" && !(err instanceof Error && err.message.includes("no such table"))) {
      console.error("DB lookup error:", err);
    }
    return undefined;
  }
}
