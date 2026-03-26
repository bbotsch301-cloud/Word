import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processWebster(db: Database.Database, filePath: string): Promise<void> {
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as Record<string, unknown>[];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO webster (word, definition, synonyms)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((entries: [string, string, string][]) => {
    for (const [word, def, syns] of entries) {
      insert.run(word, def, syns);
    }
  });

  let count = 0;
  let batch: [string, string, string][] = [];

  // The ssvivian format is an array of objects with word, pos, synonyms, definitions
  if (Array.isArray(data)) {
    for (const entry of data) {
      const e = entry as Record<string, unknown>;
      const word = ((e.word as string) || "").toLowerCase().trim();
      if (!word) continue;

      const defs = e.definitions as string[] | undefined;
      const definition = defs ? defs.slice(0, 3).join("; ") : "";

      const syns = e.synonyms as string[] | undefined;
      const synonyms = syns ? JSON.stringify(syns.slice(0, 10)) : "";

      batch.push([word, definition, synonyms]);

      if (batch.length >= 5000) {
        insertMany(batch);
        count += batch.length;
        batch = [];
      }
    }
  } else {
    // Fallback: simple { word: definition } object format
    const obj = data as unknown as Record<string, string>;
    for (const [word, def] of Object.entries(obj)) {
      const w = word.toLowerCase().trim();
      if (!w) continue;
      batch.push([w, typeof def === "string" ? def : "", ""]);

      if (batch.length >= 5000) {
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

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
