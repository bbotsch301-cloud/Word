import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processVulgarTongue(db: Database.Database, filePath: string): Promise<void> {
  // Create vulgar_tongue table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vulgar_tongue (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO vulgar_tongue (word, definition)
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

  // Matches lines starting with an ALL-CAPS word followed by a period or comma,
  // e.g. "ABBESS. A bawd..." or "ADAM'S ALE, Water."
  const entryRe = /^([A-Z][A-Z\s'\-()]+?)[.,]\s*(.*)$/;

  // Matches standalone ALL-CAPS heading lines (multi-word entries that span a line)
  const headingRe = /^[A-Z][A-Z\s,'\-().]+$/;

  function flushEntry() {
    if (!currentWord) return;
    const definition = currentDefinition.join(" ").trim();
    if (!definition) {
      currentWord = "";
      currentDefinition = [];
      return;
    }

    const word = currentWord.trim().toLowerCase();
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

    // Try to match "WORD. definition..." or "WORD, definition..." pattern
    const match = entryRe.exec(trimmed);
    if (match) {
      // Flush previous entry
      flushEntry();
      currentWord = match[1].trim();
      if (match[2].trim()) {
        currentDefinition.push(match[2].trim());
      }
    } else if (headingRe.test(trimmed) && trimmed.length >= 2) {
      // Standalone ALL-CAPS line (entry heading without inline definition)
      flushEntry();
      currentWord = trimmed;
    } else {
      // Continuation of current definition
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
