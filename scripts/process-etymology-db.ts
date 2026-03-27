import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processEtymologyDb(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS etymology_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      word_lang TEXT NOT NULL,
      parent_word TEXT,
      parent_lang TEXT,
      relation_type TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO etymology_links (word, word_lang, parent_word, parent_lang, relation_type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string, string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let batch: [string, string, string, string, string][] = [];
  const BATCH_SIZE = 10000;
  let isFirstLine = true;
  let colMap: Record<string, number> = {};

  for await (const line of rl) {
    if (isFirstLine) {
      // Parse CSV header
      const headers = line.split(",").map(h => h.trim().toLowerCase());
      headers.forEach((h, i) => { colMap[h] = i; });
      isFirstLine = false;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Simple CSV parse (fields shouldn't contain commas in this dataset)
    const parts = trimmed.split(",");

    const wordLang = parts[colMap["word_lang"] ?? colMap["lang"] ?? 1] || "";
    // Only keep English-related entries
    if (wordLang !== "eng" && wordLang !== "enm" && wordLang !== "ang") continue;

    const word = (parts[colMap["word"] ?? 0] || "").trim().toLowerCase();
    const parentWord = (parts[colMap["parent_word"] ?? colMap["parent"] ?? 2] || "").trim();
    const parentLang = (parts[colMap["parent_lang"] ?? 3] || "").trim();
    const relationType = (parts[colMap["relation_type"] ?? colMap["type"] ?? colMap["relationship"] ?? 4] || "").trim();

    if (!word || !parentWord) continue;

    batch.push([word, wordLang, parentWord, parentLang, relationType]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
      if (count % 100000 === 0) {
        console.log(`  Processed ${count.toLocaleString()} entries...`);
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_etym_links_word ON etymology_links(word);
    CREATE INDEX IF NOT EXISTS idx_etym_links_parent ON etymology_links(parent_word);
  `);

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
