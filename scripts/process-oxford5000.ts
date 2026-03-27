import { readFileSync } from "fs";
import type Database from "better-sqlite3";

interface OxfordEntry {
  id: number;
  value: {
    word: string;
    type: string;
    level: string;
    href?: string;
  };
}

export async function processOxford5000(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS oxford_5000 (
      word TEXT PRIMARY KEY,
      cefr_level TEXT,
      pos TEXT
    );
  `);

  const insert = db.prepare("INSERT OR IGNORE INTO oxford_5000 (word, cefr_level, pos) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: [string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const data = JSON.parse(content) as OxfordEntry[];
  const batch: [string, string, string][] = [];

  for (const entry of data) {
    const val = entry.value || entry;
    const word = (val.word || "").trim().toLowerCase();
    const level = (val.level || "").trim().toUpperCase();
    const pos = (val.type || "").trim();
    if (word && level) batch.push([word, level, pos]);
  }

  if (batch.length > 0) insertMany(batch);
  db.exec("CREATE INDEX IF NOT EXISTS idx_oxford_word ON oxford_5000(word);");
  console.log(`  Total: ${batch.length} entries inserted`);
}
