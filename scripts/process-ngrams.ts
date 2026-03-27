import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processNgrams(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ngram_history (
      word TEXT NOT NULL,
      decade INTEGER NOT NULL,
      frequency REAL NOT NULL,
      PRIMARY KEY (word, decade)
    );
  `);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO ngram_history (word, decade, frequency)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, number, number][]) => {
    for (const row of rows) insert.run(...row);
  });

  // Aggregate year-level data into decades
  // Format: word\tyear\tmatch_count\tvolume_count
  const wordDecades = new Map<string, Map<number, number>>();

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let lineCount = 0;

  for await (const line of rl) {
    const parts = line.split("\t");
    if (parts.length < 3) continue;

    const word = parts[0].toLowerCase().trim();
    // Skip entries with POS tags (e.g., "word_NOUN"), numbers, or non-alpha
    if (!word || word.includes("_") || !/^[a-z'-]+$/.test(word)) continue;

    const year = parseInt(parts[1], 10);
    const count = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(count) || year < 1500 || year > 2020) continue;

    const decade = Math.floor(year / 10) * 10;

    let decadeMap = wordDecades.get(word);
    if (!decadeMap) {
      decadeMap = new Map();
      wordDecades.set(word, decadeMap);
    }
    decadeMap.set(decade, (decadeMap.get(decade) || 0) + count);

    lineCount++;
    if (lineCount % 5000000 === 0) {
      console.log(`  Processed ${(lineCount / 1000000).toFixed(1)}M lines...`);
    }

    // Flush periodically to keep memory bounded
    if (wordDecades.size > 500000) {
      const batch: [string, number, number][] = [];
      for (const [w, decades] of wordDecades) {
        for (const [d, f] of decades) {
          batch.push([w, d, f]);
          if (batch.length >= 10000) {
            insertMany(batch);
            batch.length = 0;
          }
        }
      }
      if (batch.length > 0) insertMany(batch);
      wordDecades.clear();
    }
  }

  // Flush remaining
  const batch: [string, number, number][] = [];
  for (const [w, decades] of wordDecades) {
    for (const [d, f] of decades) {
      batch.push([w, d, f]);
      if (batch.length >= 10000) {
        insertMany(batch);
        batch.length = 0;
      }
    }
  }
  if (batch.length > 0) insertMany(batch);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_ngram_word ON ngram_history(word);`);

  console.log(`  Total: ${lineCount.toLocaleString()} lines processed`);
}
