import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processHitchcocks(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hitchcocks (
      name TEXT PRIMARY KEY,
      meaning TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO hitchcocks (name, meaning) VALUES (?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let batch: [string, string][] = [];
  let isFirst = true;
  const isCSV = filePath.endsWith(".csv");

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isFirst) {
      isFirst = false;
      // Skip CSV header
      if (isCSV && (trimmed.toLowerCase().includes("name") || trimmed.toLowerCase().includes("meaning"))) continue;
    }

    if (isCSV) {
      // CSV format: Name,Meaning
      const commaIdx = trimmed.indexOf(",");
      if (commaIdx === -1) continue;
      const name = trimmed.substring(0, commaIdx).trim().toLowerCase().replace(/^"|"$/g, "");
      const meaning = trimmed.substring(commaIdx + 1).trim().replace(/^"|"$/g, "");
      if (name && meaning) batch.push([name, meaning]);
    } else {
      // JSONL format
      try {
        const entry = JSON.parse(trimmed);
        const name = (entry.term || entry.name || entry.word || "").trim().toLowerCase();
        const meaning = (Array.isArray(entry.definitions) ? entry.definitions.join("; ") : entry.meaning || entry.definition || "").trim();
        if (name && meaning) batch.push([name, meaning]);
      } catch { continue; }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count = batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_hitchcocks_name ON hitchcocks(name);`);
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
