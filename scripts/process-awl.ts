import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processAWL(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_words (
      word TEXT PRIMARY KEY,
      sublist INTEGER,
      family_head TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO academic_words (word, sublist, family_head) VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, number, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  const batch: [string, number, string][] = [];

  // Format: { "sublist_1": { "analyse": { "subwords": ["analysed", ...] }, ... }, ... }
  for (const [key, families] of Object.entries(data)) {
    const sublistMatch = key.match(/(\d+)/);
    const sublist = sublistMatch ? parseInt(sublistMatch[1], 10) : 1;

    if (typeof families !== "object" || families === null) continue;

    for (const [headword, familyData] of Object.entries(families as Record<string, unknown>)) {
      const head = headword.toLowerCase();
      batch.push([head, sublist, head]);

      // Add subwords/family members
      if (typeof familyData === "object" && familyData !== null) {
        const fd = familyData as Record<string, unknown>;
        const subwords = fd.subwords || fd.members || fd.family || [];
        if (Array.isArray(subwords)) {
          for (const sw of subwords) {
            const w = String(sw).toLowerCase();
            if (w && w !== head) batch.push([w, sublist, head]);
          }
        }
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_awl_word ON academic_words(word);`);
  console.log(`  Total: ${batch.length} entries inserted`);
}
