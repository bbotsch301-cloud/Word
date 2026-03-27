import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processGoogleFreq(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_frequency (
      word TEXT PRIMARY KEY,
      rank INTEGER
    );
  `);

  const insert = db.prepare("INSERT OR IGNORE INTO google_frequency (word, rank) VALUES (?, ?)");
  const insertMany = db.transaction((rows: [string, number][]) => {
    for (const row of rows) insert.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let rank = 0;
  const batch: [string, number][] = [];

  for (const line of lines) {
    const word = line.trim().toLowerCase();
    if (!word || word.startsWith("#")) continue;
    if (!/^[a-z'-]+$/.test(word)) continue;
    rank++;
    batch.push([word, rank]);
  }

  if (batch.length > 0) insertMany(batch);
  db.exec("CREATE INDEX IF NOT EXISTS idx_google_freq_word ON google_frequency(word);");
  console.log(`  Total: ${batch.length} entries inserted`);
}
