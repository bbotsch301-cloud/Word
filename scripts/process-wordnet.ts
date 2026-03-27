import { readFileSync } from "fs";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import type Database from "better-sqlite3";

// WordNet tab-separated database format (data.noun, data.verb, etc.)
// We'll use the Open English WordNet WNDB format

interface SynsetEntry {
  synsetId: string;
  pos: string;
  definition: string;
  examples: string[];
  words: string[];
}

interface RelationEntry {
  sourceSynset: string;
  targetSynset: string;
  relationType: string;
}

export async function processWordNet(db: Database.Database, dirPath: string): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wordnet_synsets (
      synset_id TEXT PRIMARY KEY,
      pos TEXT,
      definition TEXT,
      examples TEXT
    );

    CREATE TABLE IF NOT EXISTS wordnet_lemmas (
      word TEXT NOT NULL,
      synset_id TEXT NOT NULL,
      PRIMARY KEY (word, synset_id)
    );

    CREATE TABLE IF NOT EXISTS wordnet_relations (
      source_synset TEXT NOT NULL,
      target_synset TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      PRIMARY KEY (source_synset, target_synset, relation_type)
    );
  `);

  const insertSynset = db.prepare(`
    INSERT OR IGNORE INTO wordnet_synsets (synset_id, pos, definition, examples) VALUES (?, ?, ?, ?)
  `);
  const insertLemma = db.prepare(`
    INSERT OR IGNORE INTO wordnet_lemmas (word, synset_id) VALUES (?, ?)
  `);
  const insertRelation = db.prepare(`
    INSERT OR IGNORE INTO wordnet_relations (source_synset, target_synset, relation_type) VALUES (?, ?, ?)
  `);

  // Parse WordNet data files (data.noun, data.verb, data.adj, data.adv)
  const posFiles: Record<string, string> = {
    "data.noun": "noun",
    "data.verb": "verb",
    "data.adj": "adjective",
    "data.adv": "adverb",
  };

  // Relation type mapping from WordNet pointer symbols
  const relationMap: Record<string, string> = {
    "!": "antonym",
    "@": "hypernym",
    "@i": "instance_hypernym",
    "~": "hyponym",
    "~i": "instance_hyponym",
    "#m": "member_holonym",
    "#s": "substance_holonym",
    "#p": "part_holonym",
    "%m": "member_meronym",
    "%s": "substance_meronym",
    "%p": "part_meronym",
    "=": "attribute",
    "+": "derivationally_related",
    ";c": "domain_topic",
    "-c": "member_of_domain_topic",
    ";r": "domain_region",
    "-r": "member_of_domain_region",
    ";u": "domain_usage",
    "-u": "member_of_domain_usage",
    "*": "entailment",
    ">": "cause",
    "^": "also_see",
    "$": "verb_group",
    "&": "similar_to",
    "<": "participle",
    "\\": "pertainym",
  };

  let synsetCount = 0;
  let lemmaCount = 0;
  let relationCount = 0;

  const synsetBatch: [string, string, string, string][] = [];
  const lemmaBatch: [string, string][] = [];
  const relationBatch: [string, string, string][] = [];
  const BATCH_SIZE = 5000;

  const flushSynsets = db.transaction((rows: [string, string, string, string][]) => {
    for (const row of rows) insertSynset.run(...row);
  });
  const flushLemmas = db.transaction((rows: [string, string][]) => {
    for (const row of rows) insertLemma.run(...row);
  });
  const flushRelations = db.transaction((rows: [string, string, string][]) => {
    for (const row of rows) insertRelation.run(...row);
  });

  const path = await import("path");

  for (const [filename, pos] of Object.entries(posFiles)) {
    const filePath = path.join(dirPath, filename);
    try {
      readFileSync(filePath, { encoding: "utf-8", flag: "r" });
    } catch {
      console.log(`  [skip] ${filename} not found`);
      continue;
    }

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      // Skip comment lines (start with space + number in first field)
      if (line.startsWith("  ")) continue;
      if (!line.trim()) continue;

      // WordNet data file format:
      // synset_offset lex_filenum ss_type w_cnt word lex_id [word lex_id...] p_cnt [ptr...] [frames...] | gloss
      const parts = line.split("|");
      if (parts.length < 2) continue;

      const gloss = parts.slice(1).join("|").trim();
      const header = parts[0].trim().split(/\s+/);

      if (header.length < 6) continue;

      const synsetOffset = header[0];
      const ssType = header[2]; // n, v, a, r, s
      const synsetId = `${synsetOffset}-${ssType}`;
      const wordCount = parseInt(header[3], 16); // hex encoded

      // Extract words
      const words: string[] = [];
      let idx = 4;
      for (let i = 0; i < wordCount && idx + 1 < header.length; i++) {
        const word = header[idx].replace(/_/g, " ").toLowerCase();
        words.push(word);
        idx += 2; // skip lex_id
      }

      // Extract definition and examples from gloss
      const glossParts = gloss.split(";");
      const definition = glossParts[0]?.trim() || "";
      const examples = glossParts.slice(1)
        .map(e => e.trim())
        .filter(e => e.startsWith('"') && e.endsWith('"'))
        .map(e => e.slice(1, -1));

      // Insert synset
      synsetBatch.push([synsetId, pos, definition, JSON.stringify(examples)]);

      // Insert lemmas
      for (const word of words) {
        lemmaBatch.push([word, synsetId]);
      }

      // Extract relations
      const pointerCount = parseInt(header[idx] || "0", 10);
      idx++;
      for (let i = 0; i < pointerCount && idx + 3 < header.length; i++) {
        const ptrSymbol = header[idx];
        const targetOffset = header[idx + 1];
        const targetPos = header[idx + 2];
        idx += 4; // symbol, offset, pos, source/target

        const relType = relationMap[ptrSymbol] || ptrSymbol;
        const targetId = `${targetOffset}-${targetPos}`;

        // Only store semantic relations (not lexical ones that apply to specific words)
        if (["hypernym", "hyponym", "meronym", "holonym", "entailment", "cause", "similar_to", "also_see",
             "member_holonym", "substance_holonym", "part_holonym", "member_meronym", "substance_meronym",
             "part_meronym", "instance_hypernym", "instance_hyponym", "attribute"].includes(relType)) {
          relationBatch.push([synsetId, targetId, relType]);
        }
      }

      // Flush batches
      if (synsetBatch.length >= BATCH_SIZE) {
        flushSynsets(synsetBatch.splice(0));
        synsetCount += BATCH_SIZE;
      }
      if (lemmaBatch.length >= BATCH_SIZE) {
        flushLemmas(lemmaBatch.splice(0));
        lemmaCount += BATCH_SIZE;
      }
      if (relationBatch.length >= BATCH_SIZE) {
        flushRelations(relationBatch.splice(0));
        relationCount += BATCH_SIZE;
      }
    }

    console.log(`  Processed ${filename}`);
  }

  // Flush remaining
  if (synsetBatch.length > 0) {
    flushSynsets(synsetBatch);
    synsetCount += synsetBatch.length;
  }
  if (lemmaBatch.length > 0) {
    flushLemmas(lemmaBatch);
    lemmaCount += lemmaBatch.length;
  }
  if (relationBatch.length > 0) {
    flushRelations(relationBatch);
    relationCount += relationBatch.length;
  }

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wordnet_lemmas_word ON wordnet_lemmas(word);
    CREATE INDEX IF NOT EXISTS idx_wordnet_relations_source ON wordnet_relations(source_synset);
    CREATE INDEX IF NOT EXISTS idx_wordnet_relations_target ON wordnet_relations(target_synset);
  `);

  console.log(`  Synsets: ${synsetCount.toLocaleString()}`);
  console.log(`  Lemmas: ${lemmaCount.toLocaleString()}`);
  console.log(`  Relations: ${relationCount.toLocaleString()}`);
}
