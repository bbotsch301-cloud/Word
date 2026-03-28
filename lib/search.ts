import { queryAll, queryOne } from "./database";

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

export async function advancedSearch(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 50,
  sort: "alpha" | "length" | "frequency" = "alpha"
): Promise<SearchResponse> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

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
    const total = (await queryOne<{ c: number }>(countSql, ...params))!.c;

    // Fetch
    const selectExtra = useFirstUse ? ", fu.year as first_use_year" : "";
    const selectLang = useEtymLinks ? ", el.parent_lang as origin_lang" : "";
    const useFreqJoin = sort === "frequency";
    const freqJoin = useFreqJoin ? " LEFT JOIN google_frequency gf ON gf.word = w.word" : "";
    const orderBy = sort === "length" ? "LENGTH(w.word), w.word" : sort === "frequency" ? "COALESCE(gf.rank, 999999) ASC, w.word" : "w.word";
    const fetchSql = `SELECT DISTINCT w.word, w.pos, SUBSTR(w.definition, 1, 120) as preview${selectExtra}${selectLang} FROM words w${joins}${freqJoin} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

    const rows = await queryAll<{
      word: string; pos?: string; preview?: string;
      first_use_year?: number; origin_lang?: string;
    }>(fetchSql, ...params, pageSize, offset);

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
export async function getOriginLanguages(): Promise<{ code: string; name: string; count: number }[]> {
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
    const rows = await queryAll<{ parent_lang: string; c: number }>(
      "SELECT parent_lang, COUNT(DISTINCT word) as c FROM etymology_links GROUP BY parent_lang HAVING c > 50 ORDER BY c DESC LIMIT 30"
    );
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
export async function getFirstUseCenturies(): Promise<{ century: string; count: number }[]> {
  try {
    return await queryAll<{ century: string; count: number }>(
      "SELECT century, COUNT(*) as count FROM first_use WHERE century IS NOT NULL AND century != '' GROUP BY century ORDER BY MIN(year)"
    );
  } catch {
    return [];
  }
}

// Get available POS values
export async function getPartsOfSpeech(): Promise<{ pos: string; count: number }[]> {
  try {
    return await queryAll<{ pos: string; count: number }>(
      "SELECT pos, COUNT(*) as count FROM words WHERE pos IS NOT NULL AND pos != '' GROUP BY pos HAVING count > 100 ORDER BY count DESC"
    );
  } catch {
    return [];
  }
}

// Random interesting word
export async function getRandomWord(): Promise<{ word: string; definition: string; etymology: string } | undefined> {
  try {
    return await queryOne<{ word: string; definition: string; etymology: string }>(`
      SELECT word, SUBSTR(definition, 1, 200) as definition, SUBSTR(etymology_text, 1, 200) as etymology
      FROM words
      WHERE etymology_text IS NOT NULL AND etymology_text != ''
        AND definition IS NOT NULL AND LENGTH(definition) > 30
        AND LENGTH(word) BETWEEN 4 AND 15
      ORDER BY RANDOM() LIMIT 1
    `);
  } catch {
    return undefined;
  }
}

// Timeline data: count words by century of first use
export async function getTimelineData(): Promise<{ century: string; count: number; sampleWords: string[] }[]> {
  try {
    const centuries = await queryAll<{ century: string; count: number }>(
      "SELECT century, COUNT(*) as count FROM first_use WHERE century IS NOT NULL AND century != '' GROUP BY century ORDER BY MIN(year)"
    );

    const results: { century: string; count: number; sampleWords: string[] }[] = [];
    for (const c of centuries) {
      const samples = await queryAll<{ word: string }>(
        "SELECT word FROM first_use WHERE century = ? ORDER BY RANDOM() LIMIT 8",
        c.century
      );
      results.push({ ...c, sampleWords: samples.map(s => s.word) });
    }
    return results;
  } catch {
    return [];
  }
}

// Language family data: count words by origin language
export async function getLanguageFamilyData(): Promise<{ code: string; name: string; family: string; count: number; sampleWords: string[] }[]> {
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
    const rows = await queryAll<{ parent_lang: string; count: number }>(
      "SELECT parent_lang, COUNT(DISTINCT word) as count FROM etymology_links GROUP BY parent_lang HAVING count > 20 ORDER BY count DESC LIMIT 30"
    );

    const filtered = rows.filter(r => langInfo[r.parent_lang]);
    const results: { code: string; name: string; family: string; count: number; sampleWords: string[] }[] = [];
    for (const r of filtered) {
      const info = langInfo[r.parent_lang];
      const samples = await queryAll<{ word: string }>(
        "SELECT DISTINCT word FROM etymology_links WHERE parent_lang = ? ORDER BY RANDOM() LIMIT 8",
        r.parent_lang
      );
      results.push({
        code: r.parent_lang,
        name: info.name,
        family: info.family,
        count: r.count,
        sampleWords: samples.map(s => s.word),
      });
    }
    return results;
  } catch {
    return [];
  }
}

// Get words from a specific origin language
export async function getWordsByOrigin(langCode: string, page: number = 1, pageSize: number = 50): Promise<{ words: string[]; total: number }> {
  try {
    const offset = (page - 1) * pageSize;
    const total = (await queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT word) as c FROM etymology_links WHERE parent_lang = ?",
      langCode
    ))!.c;
    const rows = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM etymology_links WHERE parent_lang = ? ORDER BY word LIMIT ? OFFSET ?",
      langCode, pageSize, offset
    );
    return { words: rows.map(r => r.word), total };
  } catch {
    return { words: [], total: 0 };
  }
}

// Get words first used in a specific century
export async function getWordsByCentury(century: string, page: number = 1, pageSize: number = 50): Promise<{ words: { word: string; year: number }[]; total: number }> {
  try {
    const offset = (page - 1) * pageSize;
    const total = (await queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM first_use WHERE century = ?",
      century
    ))!.c;
    const rows = await queryAll<{ word: string; year: number }>(
      "SELECT word, year FROM first_use WHERE century = ? ORDER BY year, word LIMIT ? OFFSET ?",
      century, pageSize, offset
    );
    return { words: rows, total };
  } catch {
    return { words: [], total: 0 };
  }
}

// Etymology family tree: find words sharing same root
export async function getEtymologyTree(word: string): Promise<{ root: string; rootLang: string; siblings: string[] } | undefined> {
  try {
    // Find the deepest etymological ancestor
    const link = await queryOne<{ parent_word: string; parent_lang: string }>(
      "SELECT parent_word, parent_lang FROM etymology_links WHERE word = ? ORDER BY rowid LIMIT 1",
      word.toLowerCase()
    );
    if (!link) return undefined;

    // Find other English words sharing that ancestor
    const siblings = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM etymology_links WHERE parent_word = ? AND parent_lang = ? AND word != ? LIMIT 20",
      link.parent_word, link.parent_lang, word.toLowerCase()
    );

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
