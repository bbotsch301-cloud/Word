import { readFileSync } from "fs";
import type Database from "better-sqlite3";

export async function processRogets(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rogets (
      category_num INTEGER PRIMARY KEY,
      category_name TEXT,
      section TEXT,
      words TEXT
    );

    CREATE TABLE IF NOT EXISTS rogets_index (
      word TEXT NOT NULL,
      category_num INTEGER NOT NULL,
      PRIMARY KEY (word, category_num)
    );
  `);

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO rogets (category_num, category_name, section, words) VALUES (?, ?, ?, ?)
  `);
  const insertIndex = db.prepare(`
    INSERT OR IGNORE INTO rogets_index (word, category_num) VALUES (?, ?)
  `);

  const insertCategories = db.transaction((rows: [number, string, string, string][]) => {
    for (const row of rows) insertCategory.run(...row);
  });
  const insertIndexes = db.transaction((rows: [string, number][]) => {
    for (const row of rows) insertIndex.run(...row);
  });

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let inContent = false;
  let categoryCount = 0;
  let indexCount = 0;

  const categoryBatch: [number, string, string, string][] = [];
  const indexBatch: [string, number][] = [];

  let currentNum = 0;
  let currentName = "";
  let currentSection = "";
  let currentWords: string[] = [];

  // Match patterns like "#1. Existence.--" or "#1. Existence --"
  const categoryRe = /^#(\d+[a-z]?)\.\s*(.+?)[\s]*[.\-]+\s*$/;
  // Match section headers like ".N." ".V." ".Adj." ".Adv." ".Phr."
  const sectionRe = /^\s*\.(N|V|Adj|Adv|Phr|Int)\.\s*/;

  function flushCategory() {
    if (!currentNum || !currentName) return;

    const allWords = currentWords.join(" ");
    categoryBatch.push([currentNum, currentName, currentSection, allWords]);

    // Build index: extract individual words from the word lists
    const wordSet = new Set<string>();
    // Words are separated by commas, semicolons, or periods
    const wordTokens = allWords.split(/[,;&.]+/);
    for (const token of wordTokens) {
      const cleaned = token.trim().toLowerCase().replace(/[^a-z\s-]/g, "").trim();
      if (cleaned && cleaned.length > 1 && cleaned.length < 40 && !cleaned.includes("  ")) {
        // Only index single words or short phrases
        const words = cleaned.split(/\s+/);
        for (const w of words) {
          if (w.length > 1) wordSet.add(w);
        }
      }
    }

    for (const w of wordSet) {
      indexBatch.push([w, currentNum]);
    }

    currentNum = 0;
    currentName = "";
    currentSection = "";
    currentWords = [];
  }

  for (const line of lines) {
    if (!inContent) {
      if (line.includes("*** START")) {
        inContent = true;
      }
      continue;
    }
    if (line.includes("*** END")) break;

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for new category
    const catMatch = trimmed.match(categoryRe);
    if (catMatch) {
      flushCategory();
      currentNum = parseInt(catMatch[1], 10);
      currentName = catMatch[2].replace(/\.$/, "").trim();
      categoryCount++;
      continue;
    }

    // Check for section markers
    const secMatch = trimmed.match(sectionRe);
    if (secMatch) {
      currentSection = secMatch[1];
      // Rest of line after section marker has words
      const rest = trimmed.replace(sectionRe, "").trim();
      if (rest) currentWords.push(rest);
      continue;
    }

    // Accumulate words
    if (currentNum) {
      currentWords.push(trimmed);
    }
  }

  // Flush last category
  flushCategory();

  // Batch insert
  if (categoryBatch.length > 0) {
    insertCategories(categoryBatch);
  }

  // Index in batches
  const BATCH = 5000;
  for (let i = 0; i < indexBatch.length; i += BATCH) {
    insertIndexes(indexBatch.slice(i, i + BATCH));
  }
  indexCount = indexBatch.length;

  db.exec(`CREATE INDEX IF NOT EXISTS idx_rogets_index_word ON rogets_index(word);`);

  console.log(`  Categories: ${categoryCount.toLocaleString()}`);
  console.log(`  Index entries: ${indexCount.toLocaleString()}`);
}
