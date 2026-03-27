import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

export async function processScowl(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scowl_words (
      word TEXT PRIMARY KEY,
      size_category INTEGER,
      dialect TEXT,
      word_class TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO scowl_words (word, size_category, dialect, word_class) VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, number, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  // SCOWL files are in the final/ directory
  const finalDir = path.join(dirPath, "final");
  const searchDir = existsSync(finalDir) ? finalDir : dirPath;

  const files = readdirSync(searchDir).filter(f => !f.startsWith(".") && !f.includes("README"));

  let count = 0;
  let batch: [string, number, string, string][] = [];
  const BATCH_SIZE = 10000;

  for (const file of files) {
    // Filename format: dialect-wordclass.size
    // e.g., english-words.10, american-words.35, british-words.55
    const match = file.match(/^(?:([a-z]+)-)?([a-z_-]+)\.(\d+)$/);
    if (!match) continue;

    const dialect = match[1] || "english";
    const wordClass = match[2] || "words";
    const sizeCategory = parseInt(match[3], 10);

    const filePath = path.join(searchDir, file);
    const content = readFileSync(filePath, "utf-8");
    const words = content.split("\n");

    for (const word of words) {
      const trimmed = word.trim().toLowerCase();
      if (!trimmed || trimmed.length > 60) continue;
      if (!/^[a-z]/.test(trimmed)) continue;

      batch.push([trimmed, sizeCategory, dialect, wordClass]);

      if (batch.length >= BATCH_SIZE) {
        insertMany(batch);
        count += batch.length;
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_scowl_word ON scowl_words(word);`);
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
