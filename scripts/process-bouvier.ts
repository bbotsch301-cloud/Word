import { readFileSync, readdirSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

export async function processBouvier(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bouvier (
      term TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO bouvier (term, definition)
    VALUES (?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const files = readdirSync(dirPath)
    .filter((f) => f.startsWith("bouvier_") && f.endsWith(".txt"))
    .sort();

  const batch: [string, string][] = [];

  // Skip list: blocks that are preamble/header content, not entries
  const skipPatterns = [
    /^LAW DICTIONARY/,
    /^ADAPTED TO/,
    /^THE UNITED STATES/,
    /^WITH REFERENCES/,
    /^SIXTH EDITION/,
    /^PHILADELPHIA/,
    /^ADVERTISEMENT/,
    /^TO THE/,
    /^BY JOHN BOUVIER/,
    /^Entered according/,
    /^-+$/,
  ];

  for (const file of files) {
    let content = readFileSync(path.join(dirPath, file), "utf-8");
    content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const blocks = content.split(/\n\n+/);

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed || trimmed.length < 20) continue;

      const firstLine = trimmed.split("\n")[0].trim();

      // Skip preamble
      if (skipPatterns.some((p) => p.test(firstLine))) continue;

      // Entry pattern: starts with ALL-CAPS term followed by comma, period, or lowercase
      const termMatch = firstLine.match(/^([A-Z][A-Z '\-]+?)(?:[,.]|\s{2,}|\s+(?=[a-z(]))/);
      if (!termMatch) continue;

      const rawTerm = termMatch[1].trim();
      if (rawTerm.length < 2 || rawTerm.length > 120) continue;

      // Build definition: join all lines, collapse whitespace
      const fullText = trimmed
        .split("\n")
        .map((l) => l.trim())
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // Remove term prefix from definition
      let def = fullText;
      // Try removing "TERM, category. " or "TERM. " prefix
      const prefixMatch = def.match(new RegExp(`^${rawTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[,.]\\s*`));
      if (prefixMatch) {
        def = def.slice(prefixMatch[0].length);
      }

      if (def.length < 10) continue;

      batch.push([rawTerm.toLowerCase(), def]);
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
  }

  console.log(`  Total: ${batch.length.toLocaleString()} entries inserted`);
}

// CLI runner
if (require.main === module) {
  const BetterSqlite3 = require("better-sqlite3");
  const dbPath = path.join(process.cwd(), "data", "lexica.db");
  const db = new BetterSqlite3(dbPath);

  const rawDir = path.join(process.cwd(), "data", "raw");
  processBouvier(db, rawDir).then(() => {
    // Update dictionaries metadata
    db.prepare(`
      INSERT OR REPLACE INTO dictionaries (id, name, year, description, entry_count)
      VALUES (?, ?, ?, ?, (SELECT COUNT(*) FROM bouvier))
    `).run(
      "bouvier",
      "Bouvier's Law Dictionary",
      1856,
      "John Bouvier's comprehensive American legal dictionary, adapted to the Constitution and laws of the United States.",
    );
    console.log("Done. Updated dictionaries metadata.");
    db.close();
  });
}
