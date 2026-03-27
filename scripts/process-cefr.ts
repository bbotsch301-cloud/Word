import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processCefr(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cefr_words (
      word TEXT PRIMARY KEY,
      cefr_level TEXT,
      pos TEXT
    );
  `);

  const insert = db.prepare("INSERT OR IGNORE INTO cefr_words (word, cefr_level, pos) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: [string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let batch: [string, string, string][] = [];
  const BATCH_SIZE = 5000;
  let isFirst = true;

  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; } // skip header
    const trimmed = line.trim();
    if (!trimmed) continue;

    // CSV format varies — try tab then comma
    const sep = trimmed.includes("\t") ? "\t" : ",";
    const parts = trimmed.split(sep);

    // Find word, level, and pos columns
    let word = "", level = "", pos = "";
    for (const part of parts) {
      const p = part.trim().replace(/^"|"$/g, "");
      if (/^[A-C][12]$/.test(p)) { level = p; }
      else if (/^(noun|verb|adj|adv|prep|conj|det|pron|interj)/i.test(p)) { pos = p; }
      else if (!word && /^[a-z]/i.test(p) && p.length > 0 && p.length < 40) { word = p.toLowerCase(); }
    }

    if (!word) continue;
    batch.push([word, level, pos]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) { insertMany(batch); count += batch.length; }
  db.exec("CREATE INDEX IF NOT EXISTS idx_cefr_word ON cefr_words(word);");
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
