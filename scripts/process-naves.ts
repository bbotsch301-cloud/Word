import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

export async function processNaves(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS naves (
      topic TEXT PRIMARY KEY,
      subtopics TEXT,
      refs TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO naves (topic, subtopics, refs) VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((rows: [string, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  // CSV format: section,subject,entry
  // Group entries by subject
  const topicMap = new Map<string, { subtopics: string[]; refs: string[] }>();
  let isFirst = true;

  for await (const line of rl) {
    if (isFirst) {
      isFirst = false;
      // Skip header if it looks like one
      if (line.toLowerCase().includes("section") || line.toLowerCase().includes("subject")) continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Simple CSV parse (handle quoted fields)
    const parts = parseCSVLine(trimmed);
    if (parts.length < 3) continue;

    const subject = (parts[1] || "").trim().toLowerCase();
    const entry = (parts[2] || "").trim();
    if (!subject || !entry) continue;

    if (!topicMap.has(subject)) {
      topicMap.set(subject, { subtopics: [], refs: [] });
    }

    const data = topicMap.get(subject)!;
    // Check if entry looks like a scripture reference
    const refPattern = /^[A-Z0-9][a-z]*\.?\s*\d/;
    if (refPattern.test(entry) && entry.length < 50) {
      data.refs.push(entry);
    } else {
      data.subtopics.push(entry);
    }
  }

  let count = 0;
  const batch: [string, string, string][] = [];
  for (const [topic, data] of topicMap) {
    batch.push([topic, JSON.stringify(data.subtopics), JSON.stringify(data.refs)]);
  }

  if (batch.length > 0) {
    const BATCH = 5000;
    for (let i = 0; i < batch.length; i += BATCH) {
      insertMany(batch.slice(i, i + BATCH));
    }
    count = batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_naves_topic ON naves(topic);`);
  console.log(`  Total: ${count.toLocaleString()} topics inserted`);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
