import { getDatabase } from "./database";

export interface SearchFilters {
  pattern?: string;        // wildcard pattern like "*ology" or "un*able"
  originLang?: string;     // language of origin e.g. "lat" for Latin
  century?: string;        // e.g. "14th century"
  minYear?: number;
  maxYear?: number;
  pos?: string;            // part of speech
  cefrLevel?: string;      // A1, A2, B1, B2, C1, C2
}

export interface SearchResult {
  word: string;
  preview: string;
  pos?: string;
  originLang?: string;
  firstUseYear?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

function wildcardToSql(pattern: string): string {
  // Escape SQL LIKE special chars, then convert user wildcards
  return pattern
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/\*/g, "%")
    .replace(/\?/g, "_");
}

export function advancedSearch(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 50,
  sort: "alpha" | "length" | "frequency" = "alpha"
): SearchResponse {
  const db = getDatabase();
  const conditions: string[] = [];
  const params: unknown[] = [];

  // Base: search from words table
  let useFirstUse = false;
  let useEtymLinks = false;

  // Pattern filter
  if (filters.pattern) {
    const sqlPattern = wildcardToSql(filters.pattern.toLowerCase());
    conditions.push("w.word LIKE ? ESCAPE '\\'");
    params.push(sqlPattern);
  }

  // Part of speech
  if (filters.pos) {
    conditions.push("w.pos = ?");
    params.push(filters.pos);
  }

  // CEFR level
  if (filters.cefrLevel) {
    conditions.push("EXISTS (SELECT 1 FROM oxford_5000 o WHERE o.word = w.word AND o.cefr_level = ?)");
    params.push(filters.cefrLevel);
  }

  // Origin language
  if (filters.originLang) {
    useEtymLinks = true;
    conditions.push("el.parent_lang = ?");
    params.push(filters.originLang);
  }

  // Century / year range
  if (filters.century || filters.minYear || filters.maxYear) {
    useFirstUse = true;
    if (filters.century) {
      conditions.push("fu.century = ?");
      params.push(filters.century);
    }
    if (filters.minYear) {
      conditions.push("fu.year >= ?");
      params.push(filters.minYear);
    }
    if (filters.maxYear) {
      conditions.push("fu.year <= ?");
      params.push(filters.maxYear);
    }
  }

  if (conditions.length === 0) {
    return { results: [], total: 0, page, pageSize };
  }

  // Build JOIN clauses
  let joins = "";
  if (useEtymLinks) {
    joins += " JOIN etymology_links el ON el.word = w.word";
  }
  if (useFirstUse) {
    joins += " JOIN first_use fu ON fu.word = w.word";
  }

  const whereClause = conditions.join(" AND ");
  const offset = (page - 1) * pageSize;

  try {
    // Count
    const countSql = `SELECT COUNT(DISTINCT w.word) as c FROM words w${joins} WHERE ${whereClause}`;
    const total = (db.prepare(countSql).get(...params) as { c: number }).c;

    // Fetch
    const selectExtra = useFirstUse ? ", fu.year as first_use_year" : "";
    const selectLang = useEtymLinks ? ", el.parent_lang as origin_lang" : "";
    const useFreqJoin = sort === "frequency";
    const freqJoin = useFreqJoin ? " LEFT JOIN google_frequency gf ON gf.word = w.word" : "";
    const orderBy = sort === "length" ? "LENGTH(w.word), w.word" : sort === "frequency" ? "COALESCE(gf.frequency, 0) DESC, w.word" : "w.word";
    const fetchSql = `SELECT DISTINCT w.word, w.pos, SUBSTR(w.definition, 1, 120) as preview${selectExtra}${selectLang} FROM words w${joins}${freqJoin} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

    const rows = db.prepare(fetchSql).all(...params, pageSize, offset) as {
      word: string; pos?: string; preview?: string;
      first_use_year?: number; origin_lang?: string;
    }[];

    const results: SearchResult[] = rows.map(r => ({
      word: r.word,
      preview: r.preview || "",
      pos: r.pos || undefined,
      originLang: r.origin_lang || undefined,
      firstUseYear: r.first_use_year || undefined,
    }));

    return { results, total, page, pageSize };
  } catch {
    return { results: [], total: 0, page, pageSize };
  }
}

// Get available origin languages for filter dropdown
export function getOriginLanguages(): { code: string; name: string; count: number }[] {
  const db = getDatabase();
  try {
    const langMap: Record<string, string> = {
      lat: "Latin", frm: "Middle French", fro: "Old French", fra: "French",
      grc: "Ancient Greek", ell: "Greek", ang: "Old English", enm: "Middle English",
      non: "Old Norse", deu: "German", goh: "Old High German", gmh: "Middle High German",
      nld: "Dutch", dum: "Middle Dutch", ita: "Italian", spa: "Spanish",
      por: "Portuguese", ara: "Arabic", san: "Sanskrit", jpn: "Japanese",
      zho: "Chinese", hin: "Hindi", fas: "Persian", heb: "Hebrew",
      rus: "Russian", cel: "Celtic", peo: "Old Persian", tur: "Turkish",
    };
    const rows = db.prepare(
      "SELECT parent_lang, COUNT(DISTINCT word) as c FROM etymology_links GROUP BY parent_lang HAVING c > 50 ORDER BY c DESC LIMIT 30"
    ).all() as { parent_lang: string; c: number }[];
    return rows.map(r => ({
      code: r.parent_lang,
      name: langMap[r.parent_lang] || r.parent_lang,
      count: r.c,
    }));
  } catch {
    return [];
  }
}

// Get available centuries for filter dropdown
export function getFirstUseCenturies(): { century: string; count: number }[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT century, COUNT(*) as count FROM first_use WHERE century IS NOT NULL AND century != '' GROUP BY century ORDER BY MIN(year)"
    ).all() as { century: string; count: number }[];
  } catch {
    return [];
  }
}

// Get available POS values
export function getPartsOfSpeech(): { pos: string; count: number }[] {
  const db = getDatabase();
  try {
    return db.prepare(
      "SELECT pos, COUNT(*) as count FROM words WHERE pos IS NOT NULL AND pos != '' GROUP BY pos HAVING count > 100 ORDER BY count DESC"
    ).all() as { pos: string; count: number }[];
  } catch {
    return [];
  }
}

// Random interesting word
export function getRandomWord(): { word: string; definition: string; etymology: string } | undefined {
  const db = getDatabase();
  try {
    return db.prepare(`
      SELECT word, SUBSTR(definition, 1, 200) as definition, SUBSTR(etymology_text, 1, 200) as etymology
      FROM words
      WHERE etymology_text IS NOT NULL AND etymology_text != ''
        AND definition IS NOT NULL AND LENGTH(definition) > 30
        AND LENGTH(word) BETWEEN 4 AND 15
      ORDER BY RANDOM() LIMIT 1
    `).get() as { word: string; definition: string; etymology: string } | undefined;
  } catch {
    return undefined;
  }
}

// Timeline data: count words by century of first use
export function getTimelineData(): { century: string; count: number; sampleWords: string[] }[] {
  const db = getDatabase();
  try {
    const centuries = db.prepare(
      "SELECT century, COUNT(*) as count FROM first_use WHERE century IS NOT NULL AND century != '' GROUP BY century ORDER BY MIN(year)"
    ).all() as { century: string; count: number }[];

    return centuries.map(c => {
      const samples = db.prepare(
        "SELECT word FROM first_use WHERE century = ? ORDER BY RANDOM() LIMIT 8"
      ).all(c.century) as { word: string }[];
      return { ...c, sampleWords: samples.map(s => s.word) };
    });
  } catch {
    return [];
  }
}

// Language family data: count words by origin language
export function getLanguageFamilyData(): { code: string; name: string; family: string; count: number; sampleWords: string[] }[] {
  const db = getDatabase();

  const langInfo: Record<string, { name: string; family: string }> = {
    lat: { name: "Latin", family: "Italic" },
    frm: { name: "Middle French", family: "Romance" },
    fro: { name: "Old French", family: "Romance" },
    fra: { name: "French", family: "Romance" },
    ita: { name: "Italian", family: "Romance" },
    spa: { name: "Spanish", family: "Romance" },
    por: { name: "Portuguese", family: "Romance" },
    grc: { name: "Ancient Greek", family: "Hellenic" },
    ell: { name: "Modern Greek", family: "Hellenic" },
    ang: { name: "Old English", family: "Germanic" },
    enm: { name: "Middle English", family: "Germanic" },
    non: { name: "Old Norse", family: "Germanic" },
    deu: { name: "German", family: "Germanic" },
    goh: { name: "Old High German", family: "Germanic" },
    gmh: { name: "Middle High German", family: "Germanic" },
    nld: { name: "Dutch", family: "Germanic" },
    dum: { name: "Middle Dutch", family: "Germanic" },
    ara: { name: "Arabic", family: "Semitic" },
    heb: { name: "Hebrew", family: "Semitic" },
    san: { name: "Sanskrit", family: "Indo-Aryan" },
    hin: { name: "Hindi", family: "Indo-Aryan" },
    fas: { name: "Persian", family: "Iranian" },
    jpn: { name: "Japanese", family: "Japonic" },
    zho: { name: "Chinese", family: "Sino-Tibetan" },
    rus: { name: "Russian", family: "Slavic" },
    tur: { name: "Turkish", family: "Turkic" },
  };

  try {
    const rows = db.prepare(
      "SELECT parent_lang, COUNT(DISTINCT word) as count FROM etymology_links GROUP BY parent_lang HAVING count > 20 ORDER BY count DESC LIMIT 30"
    ).all() as { parent_lang: string; count: number }[];

    return rows
      .filter(r => langInfo[r.parent_lang])
      .map(r => {
        const info = langInfo[r.parent_lang];
        const samples = db.prepare(
          "SELECT DISTINCT word FROM etymology_links WHERE parent_lang = ? ORDER BY RANDOM() LIMIT 8"
        ).all(r.parent_lang) as { word: string }[];
        return {
          code: r.parent_lang,
          name: info.name,
          family: info.family,
          count: r.count,
          sampleWords: samples.map(s => s.word),
        };
      });
  } catch {
    return [];
  }
}

// Get words from a specific origin language
export function getWordsByOrigin(langCode: string, page: number = 1, pageSize: number = 50): { words: string[]; total: number } {
  const db = getDatabase();
  try {
    const offset = (page - 1) * pageSize;
    const total = (db.prepare(
      "SELECT COUNT(DISTINCT word) as c FROM etymology_links WHERE parent_lang = ?"
    ).get(langCode) as { c: number }).c;
    const rows = db.prepare(
      "SELECT DISTINCT word FROM etymology_links WHERE parent_lang = ? ORDER BY word LIMIT ? OFFSET ?"
    ).all(langCode, pageSize, offset) as { word: string }[];
    return { words: rows.map(r => r.word), total };
  } catch {
    return { words: [], total: 0 };
  }
}

// Get words first used in a specific century
export function getWordsByCentury(century: string, page: number = 1, pageSize: number = 50): { words: { word: string; year: number }[]; total: number } {
  const db = getDatabase();
  try {
    const offset = (page - 1) * pageSize;
    const total = (db.prepare(
      "SELECT COUNT(*) as c FROM first_use WHERE century = ?"
    ).get(century) as { c: number }).c;
    const rows = db.prepare(
      "SELECT word, year FROM first_use WHERE century = ? ORDER BY year, word LIMIT ? OFFSET ?"
    ).all(century, pageSize, offset) as { word: string; year: number }[];
    return { words: rows, total };
  } catch {
    return { words: [], total: 0 };
  }
}

// Etymology family tree: find words sharing same root
export function getEtymologyTree(word: string): { root: string; rootLang: string; siblings: string[] } | undefined {
  const db = getDatabase();
  try {
    // Find the deepest etymological ancestor
    const link = db.prepare(
      "SELECT parent_word, parent_lang FROM etymology_links WHERE word = ? ORDER BY rowid LIMIT 1"
    ).get(word.toLowerCase()) as { parent_word: string; parent_lang: string } | undefined;
    if (!link) return undefined;

    // Find other English words sharing that ancestor
    const siblings = db.prepare(
      "SELECT DISTINCT word FROM etymology_links WHERE parent_word = ? AND parent_lang = ? AND word != ? LIMIT 20"
    ).all(link.parent_word, link.parent_lang, word.toLowerCase()) as { word: string }[];

    if (siblings.length === 0) return undefined;

    return {
      root: link.parent_word,
      rootLang: link.parent_lang,
      siblings: siblings.map(s => s.word),
    };
  } catch {
    return undefined;
  }
}
