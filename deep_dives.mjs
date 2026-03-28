import Database from "better-sqlite3";

const db = new Database("/home/runner/workspace/data/lexica.db", { readonly: true });

console.log("\n" + "=".repeat(80));
console.log("DEEP DIVES: SPECIFIC FASCINATING PATTERNS");
console.log("=".repeat(80));

// 1. Etymology chains showing language progression
console.log("\n" + "■".repeat(80));
console.log("DEEP DIVE 1: ETYMOLOGY CHAINS (Multi-step language progressions)");
console.log("■".repeat(80));

const chainWords = ['doctor', 'library', 'magazine', 'sandwich'];

for (const word of chainWords) {
  try {
    const row = db.prepare("SELECT word, etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
    if (row?.etymology_text) {
      console.log(`\n${word.toUpperCase()}:`);
      // Show the first ~2 sentences which capture the key etymology
      const sentences = row.etymology_text.split(/\.\s+/);
      console.log(`  ${sentences[0]}. ${sentences[1] ? sentences[1] + '.' : ''}`);
    }
  } catch (e) {
    // skip
  }
}

// 2. Words that appear in multiple etymologies (showing interconnections)
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 2: MORPHOLEX - Word Structure Analysis");
console.log("■".repeat(80));

try {
  const complexWords = db.prepare(`
    SELECT word, morphemes, prefix, root, suffix, morpheme_count
    FROM morpholex
    WHERE morpheme_count > 3
    ORDER BY RANDOM()
    LIMIT 5
  `).all();

  console.log("\nComplex words broken into morpheme components:");
  for (const w of complexWords) {
    console.log(`\n  ${w.word.toUpperCase()}`);
    console.log(`    Morpheme count: ${w.morpheme_count}`);
    if (w.morphemes) console.log(`    All: ${w.morphemes}`);
    if (w.prefix) console.log(`    Prefix: ${w.prefix}`);
    if (w.root) console.log(`    Root: ${w.root}`);
    if (w.suffix) console.log(`    Suffix: ${w.suffix}`);
  }
} catch (e) {
  console.log("  (morpholex data)");
}

// 3. Words from Strong's with interesting derivations
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 3: STRONG'S HEBREW - Biblical Word Roots");
console.log("■".repeat(80));

try {
  const strongs = db.prepare(`
    SELECT id, lemma, xlit, strongs_def, language
    FROM strongs
    WHERE derivation IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 5
  `).all();

  if (strongs.length > 0) {
    console.log("\nBiblical Hebrew/Greek roots with derivation chains:");
    for (const s of strongs) {
      console.log(`\n  Strong's ${s.id} (${s.language})`);
      console.log(`    Lemma: ${s.lemma}`);
      console.log(`    Transliteration: ${s.xlit}`);
      console.log(`    Def: ${s.strongs_def.substring(0, 100)}`);
    }
  }
} catch (e) {
  console.log("  (Strong's derivations)");
}

// 4. Thematic groupings from Roget's
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 4: ROGET'S THEMATIC CLUSTERS");
console.log("■".repeat(80));

try {
  const themes = db.prepare(`
    SELECT r.category_num, r.category_name, COUNT(ri.word) as count
    FROM rogets r
    LEFT JOIN rogets_index ri ON r.category_num = ri.category_num
    WHERE r.category_name NOT LIKE '%[%'
    GROUP BY r.category_num
    ORDER BY RANDOM()
    LIMIT 3
  `).all();

  for (const theme of themes) {
    const words = db.prepare(`
      SELECT DISTINCT ri.word
      FROM rogets_index ri
      WHERE ri.category_num = ?
      LIMIT 10
    `).all(theme.category_num);

    console.log(`\n  [${theme.category_num}] ${theme.category_name.substring(0, 100)}`);
    if (words.length > 0) {
      console.log(`      ${words.map(w => w.word).join(', ')}`);
    }
  }
} catch (e) {
  console.log("  (Roget's categories)");
}

// 5. Pronunciation patterns
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 5: PRONUNCIATION VARIANTS");
console.log("■".repeat(80));

try {
  const pronWords = ['read', 'live', 'lead', 'tear'];
  
  console.log("\nWords with multiple pronunciations (homographs):");
  for (const word of pronWords) {
    const prons = db.prepare(`
      SELECT variant, phonemes
      FROM cmu_pronunciation
      WHERE word = ?
      ORDER BY variant
    `).all(word);

    if (prons.length > 1) {
      console.log(`\n  ${word.toUpperCase()}: ${prons.length} pronunciations`);
      for (const p of prons) {
        console.log(`    Variant ${p.variant}: ${p.phonemes}`);
      }
    }
  }
} catch (e) {
  console.log("  (pronunciation data)");
}

// 6. Academic word list levels
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 6: ACADEMIC WORD LIST LEVELS");
console.log("■".repeat(80));

try {
  const acadLevels = db.prepare(`
    SELECT sublist, COUNT(*) as count
    FROM academic_words
    GROUP BY sublist
    ORDER BY sublist
  `).all();

  console.log("\nAcademic words grouped by difficulty level:");
  for (const level of acadLevels) {
    console.log(`  Sublist ${level.sublist}: ${level.count} words`);
  }

  // Sample some words from levels
  const samples = db.prepare(`
    SELECT sublist, GROUP_CONCAT(word, ', ') as words
    FROM (
      SELECT sublist, word FROM academic_words ORDER BY RANDOM() LIMIT 1
    )
    GROUP BY sublist
    ORDER BY sublist
  `).all();
} catch (e) {
  console.log("  (academic word data)");
}

// 7. Frequency tiers
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 7: WORD FREQUENCY DISTRIBUTION");
console.log("■".repeat(80));

try {
  const freqTiers = db.prepare(`
    SELECT 
      CASE 
        WHEN rank <= 100 THEN 'Top 100'
        WHEN rank <= 1000 THEN 'Top 1K'
        WHEN rank <= 5000 THEN 'Top 5K'
        ELSE '5K-10K'
      END as tier,
      COUNT(*) as count
    FROM google_frequency
    GROUP BY tier
    ORDER BY rank
  `).all();

  console.log("\nWord frequency distribution:");
  for (const tier of freqTiers) {
    console.log(`  ${tier.tier}: ${tier.count} words`);
  }
} catch (e) {
  console.log("  (frequency data)");
}

// 8. Webster 1828 words that are archaic
console.log("\n\n" + "■".repeat(80));
console.log("DEEP DIVE 8: WEBSTER 1828 ARCHAIC TERMS");
console.log("■".repeat(80));

try {
  const archaic = db.prepare(`
    SELECT word, etymology, definition
    FROM webster1828
    ORDER BY RANDOM()
    LIMIT 3
  `).all();

  console.log("\nHistoric dictionary entries (showing language evolution):");
  for (const entry of archaic) {
    console.log(`\n  ${entry.word.toUpperCase()}`);
    if (entry.etymology) console.log(`    Ety: ${entry.etymology.substring(0, 100)}`);
    console.log(`    Def: ${entry.definition.substring(0, 120)}...`);
  }
} catch (e) {
  console.log("  (Webster 1828 data)");
}

// 9. Show table schema examples
console.log("\n\n" + "■".repeat(80));
console.log("DATA STRUCTURES AVAILABLE FOR EXPLORATION");
console.log("■".repeat(80));

const tableDescriptions = [
  { name: 'words (729K)', fields: 'word, pos, definition, etymology_text, etymology_templates (JSON)' },
  { name: 'wordnet_relations (266K)', fields: 'source_synset, target_synset, relation_type' },
  { name: 'strongs (14K)', fields: 'id, lemma, xlit, derivation, strongs_def, language' },
  { name: 'rogets (132)', fields: 'category_num, category_name, words' },
  { name: 'morpholex (68K)', fields: 'word, morphemes, prefix, root, suffix, morpheme_count' },
  { name: 'webster1828 (63K)', fields: 'word, etymology, definition, part_of_speech' },
  { name: 'hobson_jobson (78)', fields: 'word, definition (Anglo-Indian loanwords)' },
  { name: 'cmu_pronunciation (125K)', fields: 'word, variant, phonemes (IPA)' }
];

console.log("\nKey tables for word exploration:");
for (const table of tableDescriptions) {
  console.log(`\n  ${table.name}`);
  console.log(`    → ${table.fields}`);
}

db.close();
