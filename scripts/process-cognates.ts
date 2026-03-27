import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

// Language code to human-readable name mapping
const LANG_NAMES: Record<string, string> = {
  eng: "English", enm: "Middle English", ang: "Old English",
  fra: "French", fro: "Old French", frm: "Middle French",
  deu: "German", goh: "Old High German", gmh: "Middle High German",
  nld: "Dutch", dum: "Middle Dutch",
  isl: "Icelandic", non: "Old Norse", swe: "Swedish", dan: "Danish", nob: "Norwegian",
  spa: "Spanish", por: "Portuguese", ita: "Italian", ron: "Romanian", cat: "Catalan",
  lat: "Latin", grc: "Ancient Greek", ell: "Greek",
  san: "Sanskrit", hin: "Hindi", urd: "Urdu", ben: "Bengali",
  rus: "Russian", pol: "Polish", ces: "Czech", ukr: "Ukrainian", bul: "Bulgarian",
  ara: "Arabic", heb: "Hebrew", fas: "Persian", tur: "Turkish",
  zho: "Chinese", jpn: "Japanese", kor: "Korean",
  cel: "Celtic", gle: "Irish", cym: "Welsh", bre: "Breton",
  fin: "Finnish", hun: "Hungarian", est: "Estonian",
  "ine-pro": "Proto-Indo-European", "gem-pro": "Proto-Germanic",
  "itc-pro": "Proto-Italic", "sla-pro": "Proto-Slavic",
  "cel-pro": "Proto-Celtic",
};

function getLangName(code: string): string {
  return LANG_NAMES[code] || code;
}

export async function processCognates(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cognates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english_word TEXT NOT NULL,
      cognate_word TEXT NOT NULL,
      cognate_lang TEXT NOT NULL,
      cognate_lang_name TEXT,
      shared_ancestor TEXT,
      ancestor_lang TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO cognates (english_word, cognate_word, cognate_lang, cognate_lang_name, shared_ancestor, ancestor_lang)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string, string, string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  // Phase 1: Build a map of parent -> child words (all languages)
  // Then for each English word, find non-English siblings sharing the same parent
  const parentToChildren = new Map<string, { word: string; lang: string }[]>();
  const englishWords = new Map<string, { parent: string; parentLang: string }[]>();

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let isFirstLine = true;
  let colMap: Record<string, number> = {};
  let lineCount = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      const headers = line.split(",").map(h => h.trim().toLowerCase());
      headers.forEach((h, i) => { colMap[h] = i; });
      isFirstLine = false;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(",");

    const word = (parts[colMap["word"] ?? 0] || "").trim();
    const wordLang = (parts[colMap["word_lang"] ?? colMap["lang"] ?? 1] || "").trim();
    const parentWord = (parts[colMap["parent_word"] ?? colMap["parent"] ?? 2] || "").trim();
    const parentLang = (parts[colMap["parent_lang"] ?? 3] || "").trim();

    if (!word || !wordLang || !parentWord || !parentLang) continue;

    // Build parent -> children index
    const parentKey = `${parentWord}|${parentLang}`;
    let children = parentToChildren.get(parentKey);
    if (!children) {
      children = [];
      parentToChildren.set(parentKey, children);
    }
    children.push({ word, lang: wordLang });

    // Track English words and their parents
    if (wordLang === "eng" || wordLang === "enm" || wordLang === "ang") {
      const lowerWord = word.toLowerCase();
      let parents = englishWords.get(lowerWord);
      if (!parents) {
        parents = [];
        englishWords.set(lowerWord, parents);
      }
      parents.push({ parent: parentWord, parentLang });
    }

    lineCount++;
    if (lineCount % 500000 === 0) {
      console.log(`  Read ${lineCount.toLocaleString()} links...`);
    }
  }

  console.log(`  Building cognate pairs from ${englishWords.size.toLocaleString()} English words...`);

  // Phase 2: For each English word, find non-English siblings
  let cognateCount = 0;
  let batch: [string, string, string, string, string, string][] = [];

  for (const [engWord, parents] of englishWords) {
    const seen = new Set<string>();

    for (const { parent, parentLang } of parents) {
      const parentKey = `${parent}|${parentLang}`;
      const siblings = parentToChildren.get(parentKey);
      if (!siblings) continue;

      for (const sibling of siblings) {
        // Skip English siblings and duplicates
        if (sibling.lang === "eng" || sibling.lang === "enm" || sibling.lang === "ang") continue;
        // Skip proto-languages (reconstructed, not real cognates users want to see)
        if (sibling.lang.includes("-pro")) continue;

        const key = `${sibling.word}|${sibling.lang}`;
        if (seen.has(key)) continue;
        seen.add(key);

        batch.push([
          engWord,
          sibling.word,
          sibling.lang,
          getLangName(sibling.lang),
          parent,
          parentLang,
        ]);

        if (batch.length >= 10000) {
          insertMany(batch);
          cognateCount += batch.length;
          batch = [];
        }
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    cognateCount += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_cognates_eng ON cognates(english_word);`);

  console.log(`  Total: ${cognateCount.toLocaleString()} cognate pairs inserted`);
}
