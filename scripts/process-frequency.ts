import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processFrequency(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS word_frequency (
      word TEXT PRIMARY KEY,
      raw_count INTEGER,
      frequency_rank INTEGER,
      zipf_frequency REAL
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO word_frequency (word, raw_count, frequency_rank, zipf_frequency)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, number, number, number][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  // Format: "word count" per line (FrequencyWords format)
  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let batch: [string, number, number, number][] = [];
  let rank = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const spaceIdx = trimmed.lastIndexOf(" ");
    if (spaceIdx === -1) continue;

    const word = trimmed.slice(0, spaceIdx).toLowerCase().trim();
    const count = parseInt(trimmed.slice(spaceIdx + 1), 10);
    if (!word || isNaN(count)) continue;

    rank++;
    const zipf = count > 0 ? Math.round(Math.log10(count) * 100) / 100 : 0;

    batch.push([word, count, rank, zipf]);

    if (batch.length >= 5000) {
      insertMany(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
  }

  console.log(`  Total: ${rank.toLocaleString()} entries inserted`);
}
