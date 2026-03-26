import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processBlacksLaw(db: Database.Database, filePath: string): Promise<void> {
  // Create blacks_law table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blacks_law (
      term TEXT PRIMARY KEY,
      definition TEXT,
      related_terms TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO blacks_law (term, definition, related_terms)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string, string][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let batch: [string, string, string][] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    let entry: { title?: string; definition?: string; related?: string[] };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    const term = (entry.title || "").trim();
    if (!term) continue;

    batch.push([
      term.toLowerCase(),
      entry.definition || "",
      entry.related ? JSON.stringify(entry.related) : "[]",
    ]);

    if (batch.length >= 5000) {
      insertMany(batch);
      count += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
