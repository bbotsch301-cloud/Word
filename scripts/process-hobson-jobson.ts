import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processHobsonJobson(db: Database.Database, filePath: string): Promise<void> {
  // Create hobson_jobson table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hobson_jobson (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO hobson_jobson (word, definition)
    VALUES (?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let batch: [string, string][] = [];
  const BATCH_SIZE = 5000;

  // Track whether we are inside the actual content (between START/END markers)
  let inContent = false;
  let currentWord = "";
  let currentDefinition: string[] = [];

  // Regex for an ALL-CAPS heading line (the entry word).
  // Matches lines that are entirely uppercase letters, spaces, commas, hyphens, or periods.
  const headingRe = /^[A-Z][A-Z\s,'\-().]+$/;

  function flushEntry() {
    if (!currentWord) return;
    const definition = currentDefinition.join(" ").trim();
    if (!definition) {
      currentWord = "";
      currentDefinition = [];
      return;
    }

    // If the heading has comma-separated variants, use the first as the primary word
    const word = currentWord.split(",")[0].trim().toLowerCase();
    if (!word) {
      currentWord = "";
      currentDefinition = [];
      return;
    }

    batch.push([word, definition]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
      if (count % 10000 === 0) {
        console.log(`  Processed ${count.toLocaleString()} entries...`);
      }
    }

    currentWord = "";
    currentDefinition = [];
  }

  for await (const line of rl) {
    // Skip until we reach the Gutenberg START marker
    if (!inContent) {
      if (line.includes("*** START")) {
        inContent = true;
      }
      continue;
    }

    // Stop at the Gutenberg END marker
    if (line.includes("*** END")) {
      break;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line is an ALL-CAPS entry heading
    if (headingRe.test(trimmed) && trimmed.length >= 2) {
      // Flush previous entry
      flushEntry();
      currentWord = trimmed;
    } else {
      // Append to current definition
      if (currentWord) {
        currentDefinition.push(trimmed);
      }
    }
  }

  // Flush the last entry
  flushEntry();

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
