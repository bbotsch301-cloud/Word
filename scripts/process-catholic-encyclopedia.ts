import { readdirSync, readFileSync } from "fs";
import path from "path";
import type Database from "better-sqlite3";

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code)))
    .replace(/\s+/g, " ")
    .trim();
}

export async function processCatholicEncyclopedia(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS catholic_encyclopedia (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare(`INSERT OR IGNORE INTO catholic_encyclopedia (word, definition) VALUES (?, ?)`);
  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  // dirPath should point to the extracted cathen directory containing .htm files
  // Check if we need to look inside a subdirectory
  let htmDir = dirPath;
  const cathenSubdir = path.join(dirPath, "cathen");
  try {
    const subFiles = readdirSync(cathenSubdir);
    if (subFiles.some(f => f.endsWith(".htm"))) {
      htmDir = cathenSubdir;
    }
  } catch { /* cathen subdir doesn't exist, use dirPath directly */ }

  let files: string[];
  try {
    files = readdirSync(htmDir).filter(f => f.endsWith(".htm"));
  } catch {
    console.log("  No .htm files found in directory");
    return;
  }

  let batch: [string, string][] = [];
  let count = 0;
  const MAX_DEF_LENGTH = 500;

  for (const file of files) {
    try {
      const html = readFileSync(path.join(htmDir, file), "utf-8");

      // Extract title from <h1> tag
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (!h1Match) continue;

      const word = stripHtml(h1Match[1]).trim();
      if (!word || word.length > 100) continue;

      // Extract first few <p> tags for the definition
      const paragraphs: string[] = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch: RegExpExecArray | null;
      let totalLen = 0;

      while ((pMatch = pRegex.exec(html)) !== null && totalLen < MAX_DEF_LENGTH) {
        const text = stripHtml(pMatch[1]).trim();
        if (text.length < 10) continue; // Skip very short paragraphs (nav, ads)
        // Skip promotional/metadata paragraphs
        if (text.includes("Please help support") || text.includes("Nihil Obstat") || text.includes("Imprimatur")) continue;
        paragraphs.push(text);
        totalLen += text.length;
      }

      if (paragraphs.length === 0) continue;

      let definition = paragraphs.join(" ");
      if (definition.length > MAX_DEF_LENGTH) {
        definition = definition.slice(0, MAX_DEF_LENGTH) + "...";
      }

      batch.push([word.toLowerCase(), definition]);

      if (batch.length >= 500) {
        insertMany(batch);
        count += batch.length;
        batch = [];
      }
    } catch {
      // Skip files that can't be read/parsed
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_cathen_word ON catholic_encyclopedia(word);`);

  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
