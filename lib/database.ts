import { createClient, type Client, type Row, type InValue } from "@libsql/client";

let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is not set");
    }
    client = createClient({ url, authToken });
  }
  return client;
}

// Helper: execute a query and return all rows
export async function queryAll<T = Row>(sql: string, ...args: InValue[]): Promise<T[]> {
  const result = await getClient().execute({ sql, args });
  return result.rows as unknown as T[];
}

// Helper: execute a query and return the first row
export async function queryOne<T = Row>(sql: string, ...args: InValue[]): Promise<T | undefined> {
  const result = await getClient().execute({ sql, args });
  return (result.rows[0] as unknown as T) ?? undefined;
}

// === Interfaces ===

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

export interface BouvierRow {
  term: string;
  definition: string;
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

export interface MobyRow {
  word: string;
  synonyms: string;
}

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

export interface RogetRow {
  category_num: number;
  category_name: string;
  section: string;
  words: string;
}

export interface CmuRow {
  word: string;
  variant: number;
  phonemes: string;
}

export interface EastonsRow {
  word: string;
  definition: string;
}

export interface HitchcocksRow {
  name: string;
  meaning: string;
}

export interface NavesRow {
  topic: string;
  subtopics: string;
  refs: string;
}

export interface GcideRow {
  word: string;
  pos: string | null;
  definition: string;
  etymology: string | null;
}

export interface ScowlRow {
  word: string;
  size_category: number;
  dialect: string;
  word_class: string;
}

export interface AcademicWordRow {
  word: string;
  sublist: number;
  family_head: string;
}

export interface EtymologyLinkRow {
  word: string;
  word_lang: string;
  parent_word: string;
  parent_lang: string;
  relation_type: string;
}

export interface MorphoLexRow {
  word: string;
  morphemes: string;
  prefix: string;
  root: string;
  suffix: string;
  morpheme_count: number;
}

export interface NgramRow {
  word: string;
  decade: number;
  frequency: number;
}

export interface CognateRow {
  english_word: string;
  cognate_word: string;
  cognate_lang: string;
  cognate_lang_name: string;
  shared_ancestor: string;
  ancestor_lang: string;
}

export interface BDBRow {
  strongs_id: string;
  hebrew: string;
  transliteration: string;
  definition: string;
  usage_notes: string;
}

export interface FirstUseRow {
  word: string;
  year: number | null;
  century: string;
  source: string;
}

// === Suppress helper for optional tables ===
function isOptionalTableError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("no such table");
}

// === Lookup functions ===

export async function lookupWord(word: string): Promise<WordRow | undefined> {
  try {
    return await queryOne<WordRow>(
      "SELECT * FROM words WHERE word = ? ORDER BY (CASE WHEN LENGTH(etymology_templates) > 2 THEN 1 ELSE 0 END) DESC, LENGTH(definition) DESC LIMIT 1",
      word.toLowerCase()
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupAllPOS(word: string): Promise<WordRow[]> {
  try {
    return await queryAll<WordRow>(
      "SELECT * FROM words WHERE word = ? ORDER BY LENGTH(definition) DESC",
      word.toLowerCase()
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupWebster(word: string): Promise<WebsterRow | undefined> {
  try {
    return await queryOne<WebsterRow>("SELECT * FROM webster WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupWebster1828(word: string): Promise<Webster1828Row | undefined> {
  try {
    return await queryOne<Webster1828Row>("SELECT * FROM webster1828 WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupBlacksLaw(term: string): Promise<BlacksLawRow | undefined> {
  try {
    return await queryOne<BlacksLawRow>("SELECT * FROM blacks_law WHERE term = ?", term.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function searchBlacksLaw(term: string, limit: number = 8): Promise<BlacksLawRow[]> {
  try {
    return await queryAll<BlacksLawRow>(
      "SELECT * FROM blacks_law WHERE term LIKE ? AND term != ? ORDER BY LENGTH(term) ASC LIMIT ?",
      `%${term.toLowerCase()}%`, term.toLowerCase(), limit
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupBouvier(term: string): Promise<BouvierRow | undefined> {
  try {
    return await queryOne<BouvierRow>("SELECT * FROM bouvier WHERE term = ?", term.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupStrongs(word: string, limit: number = 5): Promise<StrongsRow[]> {
  try {
    return await queryAll<StrongsRow>(`
      SELECT s.* FROM strongs s
      JOIN strongs_index si ON s.id = si.strongs_id
      WHERE si.english_word = ?
      ORDER BY s.language, s.id
      LIMIT ?
    `, word.toLowerCase(), limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupMobyThesaurus(word: string): Promise<MobyRow | undefined> {
  try {
    return await queryOne<MobyRow>("SELECT * FROM moby_thesaurus WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupWordNet(word: string, limit: number = 10): Promise<WordNetSynsetRow[]> {
  try {
    return await queryAll<WordNetSynsetRow>(`
      SELECT ws.* FROM wordnet_synsets ws
      JOIN wordnet_lemmas wl ON ws.synset_id = wl.synset_id
      WHERE wl.word = ?
      LIMIT ?
    `, word.toLowerCase(), limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getWordNetSynonyms(synsetId: string): Promise<string[]> {
  try {
    const rows = await queryAll<{ word: string }>(
      "SELECT word FROM wordnet_lemmas WHERE synset_id = ? LIMIT 20",
      synsetId
    );
    return rows.map(r => r.word);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getWordNetRelations(synsetId: string, relationType: string, limit: number = 5): Promise<WordNetSynsetRow[]> {
  try {
    return await queryAll<WordNetSynsetRow>(`
      SELECT ws.* FROM wordnet_synsets ws
      JOIN wordnet_relations wr ON ws.synset_id = wr.target_synset
      WHERE wr.source_synset = ? AND wr.relation_type = ?
      LIMIT ?
    `, synsetId, relationType, limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupRogets(word: string, limit: number = 5): Promise<RogetRow[]> {
  try {
    return await queryAll<RogetRow>(`
      SELECT r.* FROM rogets r
      JOIN rogets_index ri ON r.category_num = ri.category_num
      WHERE ri.word = ?
      LIMIT ?
    `, word.toLowerCase(), limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupPronunciation(word: string): Promise<CmuRow[]> {
  try {
    return await queryAll<CmuRow>(
      "SELECT * FROM cmu_pronunciation WHERE word = ? ORDER BY variant",
      word.toLowerCase()
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupEastons(word: string): Promise<EastonsRow | undefined> {
  try {
    return await queryOne<EastonsRow>("SELECT * FROM eastons WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupHitchcocks(word: string): Promise<HitchcocksRow | undefined> {
  try {
    return await queryOne<HitchcocksRow>("SELECT * FROM hitchcocks WHERE name = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupNaves(word: string, limit: number = 5): Promise<NavesRow[]> {
  try {
    const exact = await queryAll<NavesRow>("SELECT * FROM naves WHERE topic = ?", word.toLowerCase());
    if (exact.length > 0) return exact.slice(0, limit);
    return await queryAll<NavesRow>("SELECT * FROM naves WHERE topic LIKE ? LIMIT ?", `${word.toLowerCase()}%`, limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupGcide(word: string): Promise<GcideRow | undefined> {
  try {
    return await queryOne<GcideRow>(
      "SELECT * FROM gcide WHERE word = ? ORDER BY LENGTH(definition) DESC LIMIT 1",
      word.toLowerCase()
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupScowl(word: string): Promise<ScowlRow | undefined> {
  try {
    return await queryOne<ScowlRow>("SELECT * FROM scowl_words WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupAcademicWord(word: string): Promise<AcademicWordRow | undefined> {
  try {
    return await queryOne<AcademicWordRow>("SELECT * FROM academic_words WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupEtymologyLinks(word: string, limit: number = 10): Promise<EtymologyLinkRow[]> {
  try {
    return await queryAll<EtymologyLinkRow>(
      "SELECT * FROM etymology_links WHERE word = ? LIMIT ?",
      word.toLowerCase(), limit
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupSmiths(word: string): Promise<{ word: string; definition: string } | undefined> {
  try {
    return await queryOne<{ word: string; definition: string }>("SELECT * FROM smiths WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupIpaDict(word: string): Promise<string | undefined> {
  try {
    const row = await queryOne<{ ipa: string }>("SELECT ipa FROM ipa_dict WHERE word = ?", word.toLowerCase());
    return row?.ipa;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupCefrLevel(word: string): Promise<string | undefined> {
  try {
    const oxford = await queryOne<{ cefr_level: string }>("SELECT cefr_level FROM oxford_5000 WHERE word = ?", word.toLowerCase());
    if (oxford?.cefr_level) return oxford.cefr_level;
    const cefr = await queryOne<{ cefr_level: string }>("SELECT cefr_level FROM cefr_words WHERE word = ?", word.toLowerCase());
    return cefr?.cefr_level || undefined;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupMorphology(word: string): Promise<MorphoLexRow | undefined> {
  try {
    return await queryOne<MorphoLexRow>("SELECT * FROM morpholex WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupGoogleFrequency(word: string): Promise<number | undefined> {
  try {
    const row = await queryOne<{ rank: number }>("SELECT rank FROM google_frequency WHERE word = ?", word.toLowerCase());
    return row?.rank;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function getWordNetMeronyms(word: string, limit: number = 8): Promise<{ word: string; relation: string }[]> {
  try {
    return await queryAll<{ word: string; relation: string }>(`
      SELECT DISTINCT wl2.word, wr.relation_type as relation
      FROM wordnet_lemmas wl1
      JOIN wordnet_relations wr ON wl1.synset_id = wr.source_synset
      JOIN wordnet_lemmas wl2 ON wr.target_synset = wl2.synset_id
      WHERE wl1.word = ? AND wr.relation_type IN ('has_part', 'member_meronym', 'substance_meronym', 'part_meronym')
      AND wl2.word != ?
      LIMIT ?
    `, word.toLowerCase(), word.toLowerCase(), limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getWordNetHolonyms(word: string, limit: number = 8): Promise<{ word: string; relation: string }[]> {
  try {
    return await queryAll<{ word: string; relation: string }>(`
      SELECT DISTINCT wl2.word, wr.relation_type as relation
      FROM wordnet_lemmas wl1
      JOIN wordnet_relations wr ON wl1.synset_id = wr.source_synset
      JOIN wordnet_lemmas wl2 ON wr.target_synset = wl2.synset_id
      WHERE wl1.word = ? AND wr.relation_type IN ('part_of', 'member_holonym', 'substance_holonym', 'part_holonym')
      AND wl2.word != ?
      LIMIT ?
    `, word.toLowerCase(), word.toLowerCase(), limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getPolysemyCount(word: string): Promise<{ count: number; senses: string[] }> {
  try {
    const rows = await queryAll<{ definition: string }>(`
      SELECT ws.definition FROM wordnet_synsets ws
      JOIN wordnet_lemmas wl ON ws.synset_id = wl.synset_id
      WHERE wl.word = ?
    `, word.toLowerCase());
    return { count: rows.length, senses: rows.map(r => r.definition) };
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return { count: 0, senses: [] };
  }
}

export async function findDoublets(word: string): Promise<string[]> {
  try {
    const row = await queryOne<{ etymology_templates: string }>(
      "SELECT etymology_templates FROM words WHERE word = ? AND etymology_templates LIKE '%doublet%' LIMIT 1",
      word.toLowerCase()
    );
    if (!row) return [];
    const templates = JSON.parse(row.etymology_templates) as Record<string, unknown>[];
    const doublets: string[] = [];
    for (const t of templates) {
      if ((t.name as string) === "doublet" || (t.name as string) === "dbt") {
        const args = t.args as Record<string, string> | undefined;
        if (args) {
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
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getBorrowingChain(word: string, maxDepth: number = 6): Promise<{ word: string; language: string; type: string }[]> {
  try {
    const chain: { word: string; language: string; type: string }[] = [];
    let current = word.toLowerCase();
    const seen = new Set<string>();

    for (let i = 0; i < maxDepth; i++) {
      if (seen.has(current)) break;
      seen.add(current);
      const link = await queryOne<{ parent_word: string; parent_lang: string; relation_type: string }>(
        "SELECT parent_word, parent_lang, relation_type FROM etymology_links WHERE word = ? LIMIT 1",
        current
      );
      if (!link) break;
      chain.push({ word: link.parent_word, language: link.parent_lang, type: link.relation_type });
      current = link.parent_word;
    }
    return chain;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function findWordsByEtymologyRoot(root: string, excludeWord: string, limit: number = 10): Promise<string[]> {
  try {
    const pattern = `%"root"%${root}%`;
    const rows = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM words WHERE etymology_templates LIKE ? AND word != ? LIMIT ?",
      pattern, excludeWord.toLowerCase(), limit
    );
    return rows.map(r => r.word);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupBDB(strongsIds: string[]): Promise<BDBRow[]> {
  if (strongsIds.length === 0) return [];
  try {
    const placeholders = strongsIds.map(() => "?").join(",");
    return await queryAll<BDBRow>(
      `SELECT * FROM bdb_hebrew WHERE strongs_id IN (${placeholders})`,
      ...strongsIds
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupNgramHistory(word: string): Promise<NgramRow[]> {
  try {
    return await queryAll<NgramRow>(
      "SELECT word, decade, frequency FROM ngram_history WHERE word = ? ORDER BY decade",
      word.toLowerCase()
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupCognates(word: string, limit: number = 30): Promise<CognateRow[]> {
  try {
    return await queryAll<CognateRow>(
      "SELECT * FROM cognates WHERE english_word = ? LIMIT ?",
      word.toLowerCase(), limit
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function lookupNuttall(word: string): Promise<{ word: string; definition: string } | undefined> {
  try {
    return await queryOne<{ word: string; definition: string }>("SELECT * FROM nuttall WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupCatholicEncyclopedia(word: string): Promise<{ word: string; definition: string } | undefined> {
  try {
    return await queryOne<{ word: string; definition: string }>("SELECT * FROM catholic_encyclopedia WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupBritannica(word: string): Promise<{ word: string; definition: string } | undefined> {
  try {
    return await queryOne<{ word: string; definition: string }>("SELECT * FROM britannica WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function lookupFirstUse(word: string): Promise<FirstUseRow | undefined> {
  try {
    return await queryOne<FirstUseRow>("SELECT * FROM first_use WHERE word = ?", word.toLowerCase());
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

// === Spell Indexes ===

export async function lookupPhonemeKey(word: string): Promise<string | undefined> {
  try {
    const row = await queryOne<{ phoneme_key: string }>(
      "SELECT phoneme_key FROM cmu_pronunciation WHERE word = ? AND variant = 0",
      word.toLowerCase()
    );
    return row?.phoneme_key;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

export async function findWordsByPhonemeKey(key: string, excludeWord?: string, limit: number = 50): Promise<string[]> {
  try {
    const rows = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM cmu_pronunciation WHERE phoneme_key = ? ORDER BY word LIMIT ?",
      key, limit + 1
    );
    const words = rows.map(r => r.word);
    return (excludeWord ? words.filter(w => w !== excludeWord.toLowerCase()) : words).slice(0, limit);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function findAnagrams(word: string, limit: number = 30): Promise<string[]> {
  try {
    const w = word.toLowerCase();
    const sorted = w.split("").sort().join("");
    const rows = await queryAll<{ word: string }>(
      "SELECT word FROM word_letters WHERE sorted_letters = ? AND word != ? LIMIT ?",
      sorted, w, limit
    );
    return rows.map(r => r.word);
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return [];
  }
}

export async function getWordShortDef(word: string): Promise<string> {
  try {
    const row = await queryOne<{ definition: string }>(
      "SELECT definition FROM words WHERE word = ? AND definition IS NOT NULL LIMIT 1",
      word.toLowerCase()
    );
    if (!row) return "";
    const first = row.definition.split(/[.;\n]/)[0].trim();
    return first.length > 120 ? first.slice(0, 117) + "..." : first;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return "";
  }
}

export async function getWordEtymologyBrief(word: string): Promise<{ text: string; lang: string }> {
  try {
    const row = await queryOne<{ etymology_text: string }>(
      "SELECT etymology_text FROM words WHERE word = ? AND etymology_text IS NOT NULL AND etymology_text != '' LIMIT 1",
      word.toLowerCase()
    );
    if (!row) return { text: "", lang: "" };

    const link = await queryOne<{ parent_lang: string }>(
      "SELECT parent_lang FROM etymology_links WHERE word = ? LIMIT 1",
      word.toLowerCase()
    );

    const text = row.etymology_text.length > 150
      ? row.etymology_text.slice(0, 147) + "..."
      : row.etymology_text;
    return { text, lang: link?.parent_lang || "" };
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return { text: "", lang: "" };
  }
}

export async function getWordPos(word: string): Promise<string> {
  try {
    const row = await queryOne<{ pos: string }>(
      "SELECT pos FROM words WHERE word = ? AND pos IS NOT NULL LIMIT 1",
      word.toLowerCase()
    );
    return row?.pos || "";
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return "";
  }
}

export async function getWordFrequencyRank(word: string): Promise<number | undefined> {
  try {
    const row = await queryOne<{ rank: number }>(
      "SELECT rank FROM word_frequency WHERE word = ?",
      word.toLowerCase()
    );
    return row?.rank;
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}

// === Word of the Day ===
export async function getWordOfTheDay(): Promise<{ word: string; definition: string } | undefined> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    hash = Math.abs(hash);

    const countRow = await queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM words WHERE etymology_text IS NOT NULL AND etymology_text != '' AND definition IS NOT NULL AND definition != '' AND length(definition) > 20"
    );

    if (!countRow || countRow.c === 0) return undefined;

    const offset = hash % countRow.c;
    return await queryOne<{ word: string; definition: string }>(
      "SELECT DISTINCT word, definition FROM words WHERE etymology_text IS NOT NULL AND etymology_text != '' AND definition IS NOT NULL AND definition != '' AND length(definition) > 20 LIMIT 1 OFFSET ?",
      offset
    );
  } catch (err) {
    if (!isOptionalTableError(err)) console.error("DB lookup error:", err);
    return undefined;
  }
}
