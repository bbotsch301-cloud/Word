import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processCmuDict(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cmu_pronunciation (
      word TEXT NOT NULL,
      variant INTEGER DEFAULT 0,
      phonemes TEXT NOT NULL,
      PRIMARY KEY (word, variant)
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO cmu_pronunciation (word, variant, phonemes) VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, number, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let count = 0;
  let batch: [string, number, string][] = [];
  const BATCH_SIZE = 5000;

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comment lines
    if (!trimmed || trimmed.startsWith(";;;")) continue;

    // Format: WORD  PH1 PH2 PH3  or  WORD(2)  PH1 PH2 PH3
    const spaceIdx = trimmed.indexOf("  ");
    if (spaceIdx === -1) continue;

    let wordPart = trimmed.substring(0, spaceIdx).trim();
    const phonemes = trimmed.substring(spaceIdx).trim();

    if (!wordPart || !phonemes) continue;

    // Handle variants like WORD(2), WORD(3)
    let variant = 0;
    const variantMatch = wordPart.match(/^(.+)\((\d+)\)$/);
    if (variantMatch) {
      wordPart = variantMatch[1];
      variant = parseInt(variantMatch[2], 10) - 1;
    }

    const word = wordPart.toLowerCase();
    // Skip entries with non-alpha characters (punctuation, numbers)
    if (!/^[a-z'-]+$/.test(word)) continue;

    batch.push([word, variant, phonemes]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
      if (count % 50000 === 0) {
        console.log(`  Processed ${count.toLocaleString()} entries...`);
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_cmu_word ON cmu_pronunciation(word);`);
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
