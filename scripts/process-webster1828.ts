import Database from "better-sqlite3";
import type DatabaseType from "better-sqlite3";

export async function processWebster1828(db: DatabaseType.Database, filePath: string): Promise<void> {
  const sourceDb = new Database(filePath, { readonly: true });

  // Create webster1828 table
  db.exec(`
    CREATE TABLE IF NOT EXISTS webster1828 (
      word TEXT PRIMARY KEY,
      part_of_speech TEXT,
      etymology TEXT,
      definition TEXT,
      languages TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO webster1828 (word, part_of_speech, etymology, definition, languages)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string, string, string, string][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const entries = sourceDb.prepare("SELECT * FROM dictionary").all() as {
    headword: string;
    part_of_speech: string | null;
    etymology: string | null;
    definition: string | null;
    languages: string | null;
  }[];

  let count = 0;
  let batch: [string, string, string, string, string][] = [];

  for (const entry of entries) {
    const word = (entry.headword || "").toLowerCase().trim();
    if (!word) continue;

    batch.push([
      word,
      entry.part_of_speech || "",
      entry.etymology || "",
      entry.definition || "",
      entry.languages || "[]",
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

  sourceDb.close();
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
