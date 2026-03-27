import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processIpaDict(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ipa_dict (
      word TEXT PRIMARY KEY,
      ipa TEXT
    );
  `);

  const insert = db.prepare("INSERT OR IGNORE INTO ipa_dict (word, ipa) VALUES (?, ?)");
  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let count = 0;
  let batch: [string, string][] = [];
  const BATCH_SIZE = 10000;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Format: word\tIPA or word\t/IPA/
    const tabIdx = trimmed.indexOf("\t");
    if (tabIdx === -1) continue;

    const word = trimmed.substring(0, tabIdx).trim().toLowerCase();
    const ipa = trimmed.substring(tabIdx + 1).trim();
    if (!word || !ipa) continue;

    batch.push([word, ipa]);
    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) { insertMany(batch); count += batch.length; }
  db.exec("CREATE INDEX IF NOT EXISTS idx_ipa_word ON ipa_dict(word);");
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
