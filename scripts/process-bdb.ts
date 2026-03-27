import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

export async function processBDB(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bdb_hebrew (
      strongs_id TEXT PRIMARY KEY,
      hebrew TEXT,
      transliteration TEXT,
      definition TEXT,
      usage_notes TEXT
    );
  `);

  const insert = db.prepare(
    "INSERT OR IGNORE INTO bdb_hebrew (strongs_id, hebrew, transliteration, definition, usage_notes) VALUES (?, ?, ?, ?, ?)"
  );
  const insertMany = db.transaction((rows: [string, string, string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  // Look for TSV/CSV files in the directory
  const files = readdirSync(dirPath).filter(f => f.endsWith(".tsv") || f.endsWith(".csv") || f.endsWith(".txt"));

  let count = 0;
  const batch: [string, string, string, string, string][] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    let isFirst = true;

    for (const line of lines) {
      if (isFirst) { isFirst = false; continue; } // skip header
      const trimmed = line.trim();
      if (!trimmed) continue;

      const sep = trimmed.includes("\t") ? "\t" : ",";
      const parts = trimmed.split(sep);
      if (parts.length < 3) continue;

      // Try to detect column layout: Strong's ID, Hebrew, transliteration, definition
      const strongsId = parts[0]?.trim();
      if (!strongsId || !strongsId.match(/^[HG]\d+$/i)) continue;

      const hebrew = parts[1]?.trim() || "";
      const translit = parts[2]?.trim() || "";
      const definition = parts.slice(3).join(" ").trim();

      batch.push([strongsId.toUpperCase(), hebrew, translit, definition, ""]);
    }
  }

  if (batch.length > 0) {
    const BATCH_SIZE = 5000;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      insertMany(batch.slice(i, i + BATCH_SIZE));
    }
    count = batch.length;
  }

  db.exec("CREATE INDEX IF NOT EXISTS idx_bdb_strongs ON bdb_hebrew(strongs_id);");
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
