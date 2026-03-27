import type Database from "better-sqlite3";

export async function processMorphoLex(db: Database.Database, filePath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS morpholex (
      word TEXT PRIMARY KEY,
      morphemes TEXT,
      prefix TEXT,
      root TEXT,
      suffix TEXT,
      morpheme_count INTEGER
    );
  `);

  const insert = db.prepare(
    "INSERT OR IGNORE INTO morpholex (word, morphemes, prefix, root, suffix, morpheme_count) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertMany = db.transaction((rows: [string, string, string, string, string, number][]) => {
    for (const row of rows) insert.run(...row);
  });

  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);

  let count = 0;
  const batch: [string, string, string, string, string, number][] = [];

  for (const sheetName of workbook.SheetNames) {
    // Skip non-data sheets
    if (sheetName === "Presentation" || sheetName.startsWith("All ")) continue;

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    for (const row of rows) {
      const word = String(row["Word"] || "").toLowerCase().trim();
      if (!word || word.length > 40 || !/^[a-z]/.test(word)) continue;

      const segm = String(row["MorphoLexSegm"] || "").trim();
      if (!segm) continue;

      const nmorph = Number(row["Nmorph"] || 1);

      // Parse MorphoLexSegm: {<prefix<(root)>suffix>}
      // Examples: "{(love)}", "{<un<(believe)>able>}", "{<re<(act)>ion>}"
      const prefixes: string[] = [];
      const roots: string[] = [];
      const suffixes: string[] = [];

      // Extract prefixes: <prefix<
      const prefMatch = segm.match(/<([^<(]+)</g);
      if (prefMatch) {
        for (const m of prefMatch) {
          const p = m.replace(/^</, "").replace(/<$/, "").trim();
          if (p) prefixes.push(p);
        }
      }

      // Extract roots: (root)
      const rootMatch = segm.match(/\(([^)]+)\)/g);
      if (rootMatch) {
        for (const m of rootMatch) {
          const r = m.replace(/[()]/g, "").trim();
          if (r) roots.push(r);
        }
      }

      // Extract suffixes: >suffix>
      const suffMatch = segm.match(/>([^>)]+)>/g);
      if (suffMatch) {
        for (const m of suffMatch) {
          const s = m.replace(/^>/, "").replace(/>$/, "").trim();
          if (s) suffixes.push(s);
        }
      }

      batch.push([
        word,
        segm,
        prefixes.join("+"),
        roots.join("+"),
        suffixes.join("+"),
        nmorph,
      ]);
    }
  }

  if (batch.length > 0) {
    const BATCH_SIZE = 5000;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      insertMany(batch.slice(i, i + BATCH_SIZE));
    }
    count = batch.length;
  }

  db.exec("CREATE INDEX IF NOT EXISTS idx_morpholex_word ON morpholex(word);");
  console.log(`  Total: ${count.toLocaleString()} entries inserted`);
}
