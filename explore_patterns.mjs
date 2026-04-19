import Database from "better-sqlite3";

const db = new Database("/home/runner/workspace/data/lexica.db", { readonly: true });

console.log("\n" + "=".repeat(80));
console.log("MIND-BLOWING WORD CONNECTION PATTERNS");
console.log("=".repeat(80));

// PATTERN 1: Words that etymologically mean ANIMALS
console.log("\n1. WORDS WHOSE LITERAL ETYMOLOGIES ARE ANIMALS");
console.log("-".repeat(80));
console.log("\nEXAMPLE: MUSCLE = Latin 'musculus' = literally 'little mouse'\n");

const animalEtyms = [
  ['salary', 'salt'],
  ['muscle', 'little mouse'],
  ['disaster', 'star'],
  ['lunatic', 'moon'],
  ['panic', 'Pan god'],
  ['calculate', 'pebbles']
];

console.log("Literal meanings hidden in word etymologies:");
for (const [word, meaning] of animalEtyms) {
  const row = db.prepare("SELECT word, etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
  if (row?.etymology_text) {
    console.log(`  ${word.toUpperCase()} = "${meaning}"`);
    console.log(`    ${row.etymology_text.substring(0, 180)}...`);
  }
}

// PATTERN 2: Body parts in etymology
console.log("\n\n2. WORDS DERIVED FROM BODY PARTS");
console.log("-".repeat(80));

try {
  const bodyPartWords = db.prepare(`
    SELECT DISTINCT word FROM words 
    WHERE etymology_text LIKE '%head%' OR etymology_text LIKE '%hand%' OR etymology_text LIKE '%foot%'
    OR etymology_text LIKE '%heart%' OR etymology_text LIKE '%eye%' OR etymology_text LIKE '%mouth%'
    LIMIT 15
  `).all();

  console.log("\nWords with body parts in their etymologies:");
  for (const {word} of bodyPartWords) {
    const full = db.prepare("SELECT etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
    if (full?.etymology_text) {
      console.log(`\n  ${word.toUpperCase()}:`);
      console.log(`    ${full.etymology_text.substring(0, 150)}...`);
    }
  }
} catch (e) {
  console.log("  (error)");
}

// PATTERN 3: Colors as etymologies
console.log("\n\n3. WORDS DERIVED FROM COLORS");
console.log("-".repeat(80));

try {
  const colorWords = db.prepare(`
    SELECT DISTINCT word FROM words 
    WHERE etymology_text LIKE '%red%' OR etymology_text LIKE '%black%' OR etymology_text LIKE '%white%'
    OR etymology_text LIKE '%blue%' OR etymology_text LIKE '%yellow%' OR etymology_text LIKE '%green%'
    LIMIT 12
  `).all();

  console.log("\nWords with colors in their etymologies:");
  for (const {word} of colorWords) {
    const full = db.prepare("SELECT etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
    if (full?.etymology_text) {
      console.log(`  ${word.toUpperCase()}: ${full.etymology_text.substring(0, 120)}...`);
    }
  }
} catch (e) {
  console.log("  (error)");
}

// PATTERN 4: Homonyms and unexpected synonyms via WordNet
console.log("\n\n4. SURPRISING WORDNET CONNECTIONS");
console.log("-".repeat(80));

try {
  // Find some interesting polysemous words
  const polysemy = db.prepare(`
    SELECT wl.word, COUNT(DISTINCT ws.synset_id) as meanings
    FROM wordnet_lemmas wl
    JOIN wordnet_synsets ws ON wl.synset_id = ws.synset_id
    GROUP BY wl.word
    HAVING meanings > 10
    ORDER BY meanings DESC
    LIMIT 5
  `).all();

  console.log("\nWords with MANY different meanings (polysemy):");
  for (const {word, meanings} of polysemy) {
    const synsets = db.prepare(`
      SELECT DISTINCT ws.definition
      FROM wordnet_lemmas wl
      JOIN wordnet_synsets ws ON wl.synset_id = ws.synset_id
      WHERE wl.word = ?
      LIMIT 5
    `).all(word);
    
    console.log(`\n  ${word.toUpperCase()}: ${meanings} different meanings`);
    for (const {definition} of synsets) {
      console.log(`    - ${definition.substring(0, 100)}`);
    }
  }
} catch (e) {
  console.log("  (error)");
}

// PATTERN 5: Roget's surprising category groupings
console.log("\n\n5. SURPRISING ROGET'S CATEGORIES");
console.log("-".repeat(80));

try {
  // Find categories with diverse topics
  const categories = db.prepare(`
    SELECT category_num, category_name, COUNT(DISTINCT ri.word) as word_count
    FROM rogets r
    JOIN rogets_index ri ON r.category_num = ri.category_num
    GROUP BY r.category_num
    ORDER BY word_count DESC
    LIMIT 5
  `).all();

  console.log("\nLargest Roget's categories (words grouped by concept):");
  for (const {category_num, category_name, word_count} of categories) {
    const wordSample = db.prepare(`
      SELECT DISTINCT ri.word FROM rogets_index ri
      WHERE ri.category_num = ?
      LIMIT 8
    `).all(category_num);

    console.log(`\n  [${category_num}] ${category_name.substring(0, 80)}`);
    console.log(`      ${word_count} words`);
    console.log(`      Sample: ${wordSample.map(w => w.word).join(', ')}`);
  }
} catch (e) {
  console.log("  (error)");
}

// PATTERN 6: Words from mythology
console.log("\n\n6. MYTHOLOGY IN WORD ORIGINS");
console.log("-".repeat(80));

try {
  const mythWords = db.prepare(`
    SELECT DISTINCT word FROM words 
    WHERE etymology_text LIKE '%Greek%' AND (etymology_text LIKE '%god%' OR etymology_text LIKE '%goddess%' OR etymology_text LIKE '%myth%')
    LIMIT 10
  `).all();

  console.log("\nWords from Greek mythology:");
  for (const {word} of mythWords) {
    const full = db.prepare("SELECT etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
    if (full?.etymology_text) {
      console.log(`\n  ${word.toUpperCase()}:`);
      console.log(`    ${full.etymology_text.substring(0, 180)}...`);
    }
  }
} catch (e) {
  console.log("  (error)");
}

// PATTERN 7: Indian English loan words (Hobson-Jobson)
console.log("\n\n7. HOBSON-JOBSON: ANGLO-INDIAN LOAN WORDS");
console.log("-".repeat(80));

try {
  const hobson = db.prepare(`SELECT * FROM hobson_jobson WHERE word NOT LIKE '%kindred%' AND word NOT LIKE '%john%' AND word NOT LIKE '%preface%' LIMIT 10`).all();
  
  if (hobson.length > 0) {
    console.log("\nEnglish words borrowed from India:");
    for (const entry of hobson.slice(0, 10)) {
      const defPreview = typeof entry.definition === 'string' ? entry.definition.substring(0, 120) : '';
      console.log(`  ${entry.word}: ${defPreview}...`);
    }
  } else {
    console.log("  (loading Hobson-Jobson data...)");
  }
} catch (e) {
  console.log(`  (error)`);
}

// PATTERN 8: Words where root meaning contradicts current meaning
console.log("\n\n8. WORDS WITH SURPRISING SEMANTIC DRIFT");
console.log("-".repeat(80));

const surprisingShifts = [
  ['nice', 'originally meant "foolish"'],
  ['awful', 'originally meant "full of awe"'],
  ['literally', 'often used non-literally now'],
  ['terrific', 'originally meant "causing terror"'],
  ['decimate', 'originally meant "remove 1/10"']
];

console.log("\nWords whose meanings have shifted dramatically:");
for (const [word, shift] of surprisingShifts) {
  const row = db.prepare("SELECT word, definition FROM words WHERE word = ? LIMIT 1").get(word);
  if (row) {
    console.log(`\n  ${word.toUpperCase()}: ${shift}`);
    console.log(`    Modern: ${row.definition.substring(0, 100)}...`);
  }
}

// PATTERN 9: Proto-Indo-European roots
console.log("\n\n9. PROTO-INDO-EUROPEAN ROOT CONNECTIONS");
console.log("-".repeat(80));

try {
  const pieRoots = db.prepare(`
    SELECT 
      json_extract(etymology_templates, '$[*].args."3"') as root,
      COUNT(*) as count
    FROM (
      SELECT etymology_templates FROM words WHERE etymology_templates LIKE '%ine-pro%'
    )
    GROUP BY root
    ORDER BY count DESC
    LIMIT 10
  `).all();

  console.log("\nMost common PIE roots (connecting multiple words):");
  if (pieRoots && pieRoots.length > 0) {
    for (const entry of pieRoots) {
      console.log(`  ${entry.root}: ${entry.count} English words`);
    }
  }
} catch (e) {
  console.log("  (PIE root query note: complex JSON extraction)");
}

// PATTERN 10: Frequency-Etymology correlation
console.log("\n\n10. MOST COMMON WORDS (Frequency)");
console.log("-".repeat(80));

try {
  const freqWords = db.prepare(`
    SELECT word, rank FROM google_frequency ORDER BY rank ASC LIMIT 10
  `).all();

  console.log("\nTop 10 most frequently used English words:");
  for (const {word, rank} of freqWords) {
    const ety = db.prepare("SELECT etymology_text FROM words WHERE word = ? LIMIT 1").get(word);
    if (ety?.etymology_text) {
      console.log(`\n  ${rank}. ${word.toUpperCase()}`);
      console.log(`     Ety: ${ety.etymology_text.substring(0, 120)}...`);
    }
  }
} catch (e) {
  console.log("  (error)");
}

db.close();
