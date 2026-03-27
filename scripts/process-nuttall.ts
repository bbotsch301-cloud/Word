import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processNuttall(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS nuttall (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`INSERT OR IGNORE INTO nuttall (word, definition) VALUES (?, ?)`);
  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let inBody = false;
  let currentWord = "";
  let currentDef = "";
  let batch: [string, string][] = [];
  let count = 0;

  // Nuttall format: ALL-CAPS headword, followed by comma and definition on same line or next lines
  // Double blank lines between entries
  // Example: "AALBORG (19), a trading town on the Liimfiord..."
  const headwordPattern = /^([A-Z][A-Z\s''\-().]*),\s*(.*)/;
  const headwordOnlyPattern = /^([A-Z][A-Z\s''\-().]+)$/;

  for await (const line of rl) {
    // Skip Gutenberg header
    if (!inBody) {
      if (line.includes("*** START")) inBody = true;
      continue;
    }
    // Stop at Gutenberg footer
    if (line.includes("*** END")) break;

    const trimmed = line.trim();

    // Check for headword with inline definition (most common pattern)
    const matchInline = trimmed.match(headwordPattern);
    if (matchInline) {
      // Save previous entry
      if (currentWord && currentDef) {
        batch.push([currentWord.toLowerCase(), currentDef.trim()]);
        if (batch.length >= 1000) {
          insertMany(batch);
          count += batch.length;
          batch = [];
        }
      }
      // Extract headword (first part before comma, cleaned)
      currentWord = matchInline[1].trim().replace(/\s+/g, " ");
      currentDef = matchInline[2].trim();
      continue;
    }

    // Check for standalone headword line (e.g., just "A" or section headers)
    const matchStandalone = trimmed.match(headwordOnlyPattern);
    if (matchStandalone && trimmed.length >= 2 && trimmed.length <= 80) {
      if (currentWord && currentDef) {
        batch.push([currentWord.toLowerCase(), currentDef.trim()]);
        if (batch.length >= 1000) {
          insertMany(batch);
          count += batch.length;
          batch = [];
        }
      }
      currentWord = matchStandalone[1].trim().replace(/\s+/g, " ");
      currentDef = "";
      continue;
    }

    // Empty line — might be between entries, but don't flush yet
    if (!trimmed) continue;

    // Continuation of current definition
    if (currentWord) {
      currentDef += (currentDef ? " " : "") + trimmed;
    }
  }

  // Flush final entry
  if (currentWord && currentDef) {
    batch.push([currentWord.toLowerCase(), currentDef.trim()]);
  }
  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_nuttall_word ON nuttall(word);`);

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
