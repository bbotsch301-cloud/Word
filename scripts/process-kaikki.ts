import { createReadStream } from "fs";
import { createInterface } from "readline";
import type Database from "better-sqlite3";

function extractWords(arr: Record<string, unknown>[] | undefined, limit: number): string[] {
  if (!arr) return [];
  const words: string[] = [];
  for (const item of arr.slice(0, limit)) {
    if (item.word && typeof item.word === "string") words.push(item.word);
  }
  return words;
}

export async function processKaikki(db: Database.Database, filePath: string): Promise<void> {
  const insert = db.prepare(`
    INSERT INTO words (word, pos, ipa, definition, etymology_text, etymology_templates, related_words, examples, antonyms, hypernyms, hyponyms, coordinate_terms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows: unknown[][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  let skipped = 0;
  let batch: unknown[][] = [];
  const BATCH_SIZE = 5000;

  for await (const line of rl) {
    if (!line.trim()) continue;

    let entry: Record<string, unknown>;
    try {
      entry = JSON.parse(line);
    } catch {
      skipped++;
      continue;
    }

    if (entry.lang !== "English") {
      skipped++;
      continue;
    }

    const word = (entry.word as string || "").toLowerCase().trim();
    if (!word || !/^[a-z-]+$/i.test(word)) {
      skipped++;
      continue;
    }

    const senses = entry.senses as Record<string, unknown>[] | undefined;
    if (senses && senses.length > 0) {
      const allFormOf = senses.every((s) => {
        const tags = s.tags as string[] | undefined;
        return tags && tags.includes("form-of");
      });
      if (allFormOf) {
        skipped++;
        continue;
      }
    }

    // Extract IPA
    let ipa = "";
    const sounds = entry.sounds as Record<string, unknown>[] | undefined;
    if (sounds) {
      const ipaEntry = sounds.find((s) => s.ipa && typeof s.ipa === "string");
      if (ipaEntry) ipa = ipaEntry.ipa as string;
    }

    // Extract definitions (first 3 glosses)
    let definition = "";
    if (senses) {
      const glosses: string[] = [];
      for (const sense of senses.slice(0, 3)) {
        const g = sense.glosses as string[] | undefined;
        if (g && g.length > 0) glosses.push(g[0]);
      }
      definition = glosses.join("; ");
    }

    // Etymology
    const etymologyText = (entry.etymology_text as string) || "";
    const etymologyTemplates = entry.etymology_templates
      ? JSON.stringify(entry.etymology_templates)
      : "";

    // Related words (related + derived + synonyms)
    const relatedWords = [
      ...extractWords(entry.related as Record<string, unknown>[] | undefined, 10),
      ...extractWords(entry.derived as Record<string, unknown>[] | undefined, 10),
      ...extractWords(entry.synonyms as Record<string, unknown>[] | undefined, 5),
    ];

    // NEW: Examples from senses
    const examples: { text: string; ref?: string }[] = [];
    if (senses) {
      for (const sense of senses.slice(0, 5)) {
        const exArr = sense.examples as Record<string, unknown>[] | undefined;
        if (exArr) {
          for (const ex of exArr.slice(0, 2)) {
            const text = (ex.text as string) || "";
            const ref = (ex.ref as string) || "";
            if (text) examples.push({ text, ...(ref ? { ref } : {}) });
            if (examples.length >= 3) break;
          }
        }
        if (examples.length >= 3) break;
      }
    }

    // NEW: Antonyms
    const antonyms = extractWords(entry.antonyms as Record<string, unknown>[] | undefined, 10);

    // NEW: Hypernyms (top-level + per-sense)
    const hypernyms = extractWords(entry.hypernyms as Record<string, unknown>[] | undefined, 10);
    if (senses) {
      for (const sense of senses.slice(0, 3)) {
        const h = sense.hypernyms as Record<string, unknown>[] | undefined;
        if (h) hypernyms.push(...extractWords(h, 5));
      }
    }

    // NEW: Hyponyms
    const hyponyms = extractWords(entry.hyponyms as Record<string, unknown>[] | undefined, 10);
    if (senses) {
      for (const sense of senses.slice(0, 3)) {
        const h = sense.hyponyms as Record<string, unknown>[] | undefined;
        if (h) hyponyms.push(...extractWords(h, 5));
      }
    }

    // NEW: Coordinate terms
    const coordinateTerms = extractWords(entry.coordinate_terms as Record<string, unknown>[] | undefined, 10);

    const pos = (entry.pos as string) || "";

    batch.push([
      word,
      pos,
      ipa,
      definition,
      etymologyText,
      etymologyTemplates,
      relatedWords.length > 0 ? JSON.stringify(relatedWords) : "",
      examples.length > 0 ? JSON.stringify(examples) : "",
      antonyms.length > 0 ? JSON.stringify(antonyms) : "",
      hypernyms.length > 0 ? JSON.stringify(hypernyms) : "",
      hyponyms.length > 0 ? JSON.stringify(hyponyms) : "",
      coordinateTerms.length > 0 ? JSON.stringify(coordinateTerms) : "",
    ]);

    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      count += batch.length;
      batch = [];
      if (count % 50000 === 0) {
        console.log(`  Processed ${count.toLocaleString()} entries...`);
      }
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    count += batch.length;
  }

  console.log(`  Total: ${count.toLocaleString()} entries inserted, ${skipped.toLocaleString()} skipped`);
}
