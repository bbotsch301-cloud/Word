import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processBritannica(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS britannica (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`INSERT OR IGNORE INTO britannica (word, definition) VALUES (?, ?)`);
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

  // Britannica 11th follows a similar ALL-CAPS headword pattern
  // Entries can be very long — we'll truncate to first ~500 chars
  const headwordPattern = /^([A-Z][A-Z\s''\-().]*),\s*(.*)/;
  const headwordOnlyPattern = /^([A-Z][A-Z\s''\-().]+)$/;
  const MAX_DEF_LENGTH = 500;

  for await (const line of rl) {
    if (!inBody) {
      if (line.includes("*** START")) inBody = true;
      continue;
    }
    if (line.includes("*** END")) break;

    const trimmed = line.trim();

    const matchInline = trimmed.match(headwordPattern);
    if (matchInline) {
      if (currentWord && currentDef) {
        const def = currentDef.trim();
        batch.push([currentWord.toLowerCase(), def.length > MAX_DEF_LENGTH ? def.slice(0, MAX_DEF_LENGTH) + "..." : def]);
        if (batch.length >= 1000) {
          insertMany(batch);
          count += batch.length;
          batch = [];
        }
      }
      currentWord = matchInline[1].trim().replace(/\s+/g, " ");
      currentDef = matchInline[2].trim();
      continue;
    }

    const matchStandalone = trimmed.match(headwordOnlyPattern);
    if (matchStandalone && trimmed.length >= 2 && trimmed.length <= 80) {
      if (currentWord && currentDef) {
        const def = currentDef.trim();
        batch.push([currentWord.toLowerCase(), def.length > MAX_DEF_LENGTH ? def.slice(0, MAX_DEF_LENGTH) + "..." : def]);
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

    if (!trimmed) continue;

    // Only keep accumulating if definition isn't already too long
    if (currentWord && currentDef.length < MAX_DEF_LENGTH + 200) {
      currentDef += (currentDef ? " " : "") + trimmed;
    }
  }

  if (currentWord && currentDef) {
    const def = currentDef.trim();
    batch.push([currentWord.toLowerCase(), def.length > MAX_DEF_LENGTH ? def.slice(0, MAX_DEF_LENGTH) + "..." : def]);
  }
  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_britannica_word ON britannica(word);`);

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
