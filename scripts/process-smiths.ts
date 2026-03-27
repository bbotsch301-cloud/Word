import { readFileSync, existsSync } from "fs";
import https from "https";
import path from "path";
import type Database from "better-sqlite3";

const BIBLE_DICT_BASE = "https://raw.githubusercontent.com/neuu-org/bible-dictionary-dataset/main/data/01_parsed";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

interface BibleDictEntry {
  name: string;
  slug: string;
  definitions: { source: string; text: string }[];
  scripture_refs: { reference: string; original: string }[];
  sources: string[];
}

function fetchJson(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export async function processSmiths(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS smiths (
      word TEXT PRIMARY KEY,
      definition TEXT
    );
  `);

  const insert = db.prepare("INSERT OR IGNORE INTO smiths (word, definition) VALUES (?, ?)");
  const insertMany = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  let totalCount = 0;
  const rawDir = path.dirname(filePath);

  for (const letter of LETTERS) {
    const letterFile = path.join(rawDir, `bible-dict-${letter}.json`);
    let content: string;

    if (existsSync(letterFile)) {
      content = readFileSync(letterFile, "utf-8");
    } else {
      try {
        console.log(`  Fetching ${letter}.json...`);
        content = await fetchJson(`${BIBLE_DICT_BASE}/${letter}.json`);
        const { writeFileSync } = await import("fs");
        writeFileSync(letterFile, content);
      } catch {
        continue;
      }
    }

    let parsed: Record<string, BibleDictEntry> | BibleDictEntry[];
    try { parsed = JSON.parse(content); } catch { continue; }

    const entries: BibleDictEntry[] = Array.isArray(parsed) ? parsed : Object.values(parsed);
    const batch: [string, string][] = [];

    for (const entry of entries) {
      const word = (entry.name || "").trim().toLowerCase();
      if (!word) continue;
      const smiDefs = entry.definitions.filter(d => d.source === "SMI");
      if (smiDefs.length === 0) continue;
      batch.push([word, smiDefs.map(d => d.text).join("\n\n")]);
    }

    if (batch.length > 0) { insertMany(batch); totalCount += batch.length; }
  }

  db.exec("CREATE INDEX IF NOT EXISTS idx_smiths_word ON smiths(word);");
  console.log(`  Total: ${totalCount.toLocaleString()} entries inserted`);
}
