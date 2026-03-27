import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processMoby(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS moby_thesaurus (
      word TEXT PRIMARY KEY,
      synonyms TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO moby_thesaurus (word, synonyms) VALUES (?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let count = 0;
  let batch: [string, string][] = [];
  const BATCH_SIZE = 5000;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(",");
    if (parts.length < 2) continue;

    const headword = parts[0].trim().toLowerCase();
    if (!headword) continue;

    const synonyms = parts.slice(1).map(s => s.trim()).filter(Boolean).join(",");
    batch.push([headword, synonyms]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
      if (count % 10000 === 0) {
        console.log(`  Processed ${count.toLocaleString()} entries...`);
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_moby_word ON moby_thesaurus(word);`);
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
