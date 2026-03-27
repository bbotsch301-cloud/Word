import { getDatabase } from "./database";

export interface DictionaryMeta {
  id: string;
  name: string;
  year: number;
  description: string;
  entry_count: number;
}

export interface DictionaryEntry {
  word: string;
  definition: string;
  pos?: string;
  etymology?: string;
}

export interface BrowseResult {
  entries: DictionaryEntry[];
  total: number;
  page: number;
  pageSize: number;
  letter?: string;
}

// Table and column mappings for each dictionary
const DICT_CONFIG: Record<string, { table: string; wordCol: string; defCol: string; posCol?: string; etymCol?: string }> = {
  wiktionary: { table: "words", wordCol: "word", defCol: "definition", posCol: "pos", etymCol: "etymology_text" },
  webster1828: { table: "webster1828", wordCol: "word", defCol: "definition", posCol: "part_of_speech", etymCol: "etymology" },
  webster1913: { table: "webster", wordCol: "word", defCol: "definition" },
  "blacks-law": { table: "blacks_law", wordCol: "term", defCol: "definition" },
  "hobson-jobson": { table: "hobson_jobson", wordCol: "word", defCol: "definition" },
  "vulgar-tongue": { table: "vulgar_tongue", wordCol: "word", defCol: "definition" },
  bouvier: { table: "bouvier", wordCol: "term", defCol: "definition" },
  strongs: { table: "strongs", wordCol: "lemma", defCol: "strongs_def" },
  moby: { table: "moby_thesaurus", wordCol: "word", defCol: "synonyms" },
  wordnet: { table: "wordnet_lemmas", wordCol: "word", defCol: "synset_id" },
  rogets: { table: "rogets", wordCol: "category_name", defCol: "words" },
  cmudict: { table: "cmu_pronunciation", wordCol: "word", defCol: "phonemes" },
  eastons: { table: "eastons", wordCol: "word", defCol: "definition" },
  hitchcocks: { table: "hitchcocks", wordCol: "name", defCol: "meaning" },
  naves: { table: "naves", wordCol: "topic", defCol: "subtopics" },
  gcide: { table: "gcide", wordCol: "word", defCol: "definition", posCol: "pos", etymCol: "etymology" },
  smiths: { table: "smiths", wordCol: "word", defCol: "definition" },
  scowl: { table: "scowl_words", wordCol: "word", defCol: "dialect" },
  ipadict: { table: "ipa_dict", wordCol: "word", defCol: "ipa" },
  oxford5000: { table: "oxford_5000", wordCol: "word", defCol: "cefr_level" },
  morpholex: { table: "morpholex", wordCol: "word", defCol: "morphemes" },
  nuttall: { table: "nuttall", wordCol: "word", defCol: "definition" },
  britannica: { table: "britannica", wordCol: "word", defCol: "definition" },
  "catholic-encyclopedia": { table: "catholic_encyclopedia", wordCol: "word", defCol: "definition" },
};

export function getAllDictionaries(): DictionaryMeta[] {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM dictionaries ORDER BY year").all() as DictionaryMeta[];
  } catch {
    return [];
  }
}

export function getDictionary(id: string): DictionaryMeta | undefined {
  const db = getDatabase();
  try {
    return db.prepare("SELECT * FROM dictionaries WHERE id = ?").get(id) as DictionaryMeta | undefined;
  } catch {
    return undefined;
  }
}

export function browseDictionary(
  dictId: string,
  options: { page?: number; pageSize?: number; letter?: string; query?: string } = {}
): BrowseResult {
  const db = getDatabase();
  const config = DICT_CONFIG[dictId];
  if (!config) return { entries: [], total: 0, page: 1, pageSize: 50 };

  const page = options.page || 1;
  const pageSize = options.pageSize || 50;
  const offset = (page - 1) * pageSize;

  let whereClause = "";
  const params: unknown[] = [];

  if (options.query) {
    whereClause = `WHERE ${config.wordCol} LIKE ?`;
    params.push(`%${options.query}%`);
  } else if (options.letter) {
    whereClause = `WHERE ${config.wordCol} LIKE ?`;
    params.push(`${options.letter.toLowerCase()}%`);
  }

  // For wiktionary, deduplicate by word (multiple POS entries)
  const distinct = dictId === "wiktionary" ? "DISTINCT" : "";
  const groupBy = dictId === "wiktionary" ? `GROUP BY ${config.wordCol}` : "";

  // Count total
  let countSql: string;
  if (dictId === "wiktionary") {
    countSql = `SELECT COUNT(DISTINCT ${config.wordCol}) as c FROM ${config.table} ${whereClause}`;
  } else {
    countSql = `SELECT COUNT(*) as c FROM ${config.table} ${whereClause}`;
  }
  const total = (db.prepare(countSql).get(...params) as { c: number }).c;

  // Fetch page
  const selectCols = [config.wordCol, config.defCol];
  if (config.posCol) selectCols.push(config.posCol);
  if (config.etymCol) selectCols.push(config.etymCol);

  let fetchSql: string;
  if (dictId === "wiktionary") {
    fetchSql = `SELECT ${selectCols.join(", ")} FROM ${config.table} ${whereClause} ${groupBy} ORDER BY ${config.wordCol} LIMIT ? OFFSET ?`;
  } else {
    fetchSql = `SELECT ${selectCols.join(", ")} FROM ${config.table} ${whereClause} ORDER BY ${config.wordCol} LIMIT ? OFFSET ?`;
  }

  const rows = db.prepare(fetchSql).all(...params, pageSize, offset) as Record<string, string>[];

  const entries: DictionaryEntry[] = rows.map((row) => ({
    word: row[config.wordCol] || "",
    definition: row[config.defCol] || "",
    pos: config.posCol ? row[config.posCol] : undefined,
    etymology: config.etymCol ? row[config.etymCol] : undefined,
  }));

  return { entries, total, page, pageSize, letter: options.letter };
}

export function lookupInDictionary(dictId: string, word: string): DictionaryEntry | undefined {
  const db = getDatabase();
  const config = DICT_CONFIG[dictId];
  if (!config) return undefined;

  const selectCols = [config.wordCol, config.defCol];
  if (config.posCol) selectCols.push(config.posCol);
  if (config.etymCol) selectCols.push(config.etymCol);

  const row = db.prepare(
    `SELECT ${selectCols.join(", ")} FROM ${config.table} WHERE ${config.wordCol} = ? LIMIT 1`
  ).get(word.toLowerCase()) as Record<string, string> | undefined;

  if (!row) return undefined;

  return {
    word: row[config.wordCol] || "",
    definition: row[config.defCol] || "",
    pos: config.posCol ? row[config.posCol] : undefined,
    etymology: config.etymCol ? row[config.etymCol] : undefined,
  };
}

export function getWordFrequency(word: string): { rank: number; zipf: number; label: string } | undefined {
  const db = getDatabase();
  try {
    const row = db.prepare("SELECT frequency_rank, zipf_frequency FROM word_frequency WHERE word = ?").get(word.toLowerCase()) as { frequency_rank: number; zipf_frequency: number } | undefined;
    if (!row) return undefined;

    let label: string;
    if (row.frequency_rank <= 100) label = "Extremely Common";
    else if (row.frequency_rank <= 1000) label = "Very Common";
    else if (row.frequency_rank <= 5000) label = "Common";
    else if (row.frequency_rank <= 15000) label = "Moderately Common";
    else if (row.frequency_rank <= 30000) label = "Uncommon";
    else label = "Rare";

    return { rank: row.frequency_rank, zipf: row.zipf_frequency, label };
  } catch {
    return undefined;
  }
}
