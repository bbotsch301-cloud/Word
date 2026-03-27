import type Database from "better-sqlite3";

// Extract first-attested dates from existing etymology_text in the words table
export async function processFirstUse(db: Database.Database, _filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS first_use (
      word TEXT PRIMARY KEY,
      year INTEGER,
      century TEXT,
      source TEXT
    );
  `);

  const insert = db.prepare(`INSERT OR IGNORE INTO first_use (word, year, century, source) VALUES (?, ?, ?, ?)`);
  const insertMany = db.transaction((rows: [string, number | null, string, string][]) => {
    for (const row of rows) insert.run(...row);
  });

  // Read all words with etymology text
  let rows: { word: string; etymology_text: string }[];
  try {
    rows = db.prepare(
      "SELECT DISTINCT word, etymology_text FROM words WHERE etymology_text IS NOT NULL AND etymology_text != ''"
    ).all() as { word: string; etymology_text: string }[];
  } catch {
    console.log("  Words table not available");
    return;
  }

  const datePatterns: { pattern: RegExp; extractor: (m: RegExpMatchArray) => { year: number | null; century: string } }[] = [
    // "First attested in 1382" or "first attested around 1300"
    {
      pattern: /first (?:attested|recorded|found|used|cited|known)[^.]*?(\d{4})/i,
      extractor: (m) => ({ year: parseInt(m[1]), century: centuryFromYear(parseInt(m[1])) }),
    },
    // "from the 14th century" or "since the 13th century"
    {
      pattern: /(?:from|since|in|of) the (\d+)(?:th|st|nd|rd) century/i,
      extractor: (m) => {
        const c = parseInt(m[1]);
        return { year: (c - 1) * 100 + 50, century: `${m[1]}th century` };
      },
    },
    // "circa 1300" or "c. 1400"
    {
      pattern: /(?:circa|c\.)\s*(\d{4})/i,
      extractor: (m) => ({ year: parseInt(m[1]), century: centuryFromYear(parseInt(m[1])) }),
    },
    // "Middle English (1300)" or "Old English (c. 700)"
    {
      pattern: /(?:Middle|Old|Anglo-Norman|Old French|Late Latin)\s+\w+.*?\((?:c\.?\s*)?(\d{3,4})\)/i,
      extractor: (m) => ({ year: parseInt(m[1]), century: centuryFromYear(parseInt(m[1])) }),
    },
    // "attested from 1382" or "recorded from 1500"
    {
      pattern: /(?:attested|recorded|documented|known) from (?:c\.?\s*)?(\d{4})/i,
      extractor: (m) => ({ year: parseInt(m[1]), century: centuryFromYear(parseInt(m[1])) }),
    },
    // "dates to 1066" or "dating from 1200"
    {
      pattern: /dat(?:es|ing)\s+(?:to|from|back to)\s+(?:c\.?\s*)?(\d{4})/i,
      extractor: (m) => ({ year: parseInt(m[1]), century: centuryFromYear(parseInt(m[1])) }),
    },
  ];

  let batch: [string, number | null, string, string][] = [];
  let count = 0;

  for (const row of rows) {
    const text = row.etymology_text;

    for (const { pattern, extractor } of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const { year, century } = extractor(match);
        if (year && year >= 500 && year <= 2025) {
          batch.push([row.word, year, century, "etymology"]);
          if (batch.length >= 5000) {
            insertMany(batch);
            count += batch.length;
            batch = [];
          }
          break; // Use first match only
        }
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_first_use_word ON first_use(word);`);

  console.log(`  Total: ${count.toLocaleString()} first-use dates extracted`);
}

function centuryFromYear(year: number): string {
  const century = Math.floor((year - 1) / 100) + 1;
  const suffix = century === 1 ? "st" : century === 2 ? "nd" : century === 3 ? "rd" : "th";
  return `${century}${suffix} century`;
}
