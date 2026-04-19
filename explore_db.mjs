import Database from "better-sqlite3";

const db = new Database("/home/runner/workspace/data/lexica.db", { readonly: true });

console.log("\n" + "=".repeat(80));
console.log("EXPLORING WORD ETYMOLOGY PATTERNS - MIND-BLOWING CONNECTIONS");
console.log("=".repeat(80));

// 1. ETYMOLOGY TEMPLATES - Look at structured etymology data
console.log("\n1. ETYMOLOGY TEMPLATES (Structured Data)");
console.log("-".repeat(80));

const testWords = ['salary', 'disaster', 'lunatic', 'panic', 'capital', 'calculate', 'muscle'];
for (const word of testWords) {
  const row = db.prepare("SELECT word, etymology_text, etymology_templates FROM words WHERE word = ? LIMIT 1").get(word);
  if (row) {
    console.log(`\n${word.toUpperCase()}:`);
    if (row.etymology_templates && row.etymology_templates !== '[]') {
      try {
        const templates = JSON.parse(row.etymology_templates);
        // Show key highlights
        templates.forEach(t => {
          if (t.name === 'root' || t.name === 'der' || t.name === 'inh') {
            console.log(`  - ${t.expansion || JSON.stringify(t.args)}`);
          }
        });
      } catch (e) {
        console.log("  (parsing error)");
      }
    }
  }
}

// 2. STRONG'S HEBREW/GREEK - Chain derivations
console.log("\n\n2. STRONG'S DERIVATIONS (Cross-Language Chains)");
console.log("-".repeat(80));

try {
  const hebrewSample = db.prepare(`
    SELECT DISTINCT s.id, s.lemma, s.derivation, s.strongs_def, s.language 
    FROM strongs s 
    WHERE s.language = 'Hebrew' AND s.derivation IS NOT NULL
    LIMIT 5
  `).all();

  console.log("\nHebrew Strong's entries with derivations:");
  for (const row of hebrewSample) {
    console.log(`\n  ID: ${row.id} | Lemma: ${row.lemma}`);
    console.log(`  Derivation: ${row.derivation}`);
    console.log(`  Def: ${row.strongs_def.substring(0, 100)}`);
  }
} catch (e) {
  console.log("  (strongs query error)");
}

// 3. WORDNET RELATIONS - What relation types exist?
console.log("\n\n3. WORDNET RELATION TYPES");
console.log("-".repeat(80));

try {
  const relationTypes = db.prepare(`
    SELECT DISTINCT relation_type, COUNT(*) as count 
    FROM wordnet_relations 
    GROUP BY relation_type 
    ORDER BY count DESC
  `).all();

  console.log("\nWordNet relation types:");
  for (const row of relationTypes.slice(0, 15)) {
    console.log(`  ${row.relation_type}: ${row.count} relations`);
  }
} catch (e) {
  console.log("  (wordnet_relations error)");
}

// 4. ROGET'S CATEGORIES - Surprising groupings
console.log("\n\n4. ROGET'S THESAURUS - CATEGORY EXAMPLES");
console.log("-".repeat(80));

try {
  const rogetSample = db.prepare(`
    SELECT category_num, category_name, section, words 
    FROM rogets 
    LIMIT 15
  `).all();

  console.log("\nSample Roget's categories (showing conceptual groupings):");
  for (const row of rogetSample) {
    const wordList = row.words ? row.words.split(',').slice(0, 6).join(', ') : '';
    console.log(`  [${row.category_num}] ${row.category_name}`);
    if (row.section) console.log(`      Section: ${row.section}`);
    if (wordList) console.log(`      Words: ${wordList}...`);
  }
} catch (e) {
  console.log("  (rogets error)");
}

// 5. WEBSTER 1828 - Surprising etymologies
console.log("\n\n5. WEBSTER 1828 ETYMOLOGIES (1828 DICTIONARY)");
console.log("-".repeat(80));

try {
  const websterWords = ['salary', 'disaster', 'muscle', 'calculus', 'lunatic'];
  for (const word of websterWords) {
    const row = db.prepare("SELECT word, etymology, definition FROM webster1828 WHERE word = ? LIMIT 1").get(word);
    if (row) {
      console.log(`\n${word.toUpperCase()}:`);
      if (row.etymology) console.log(`  Ety: ${row.etymology.substring(0, 160)}...`);
      console.log(`  Def: ${row.definition.substring(0, 140)}...`);
    }
  }
} catch (e) {
  console.log("  (webster1828 error)");
}

// 6. ALL TABLES INVENTORY
console.log("\n\n6. DATABASE TABLES INVENTORY");
console.log("-".repeat(80));

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log("\nAll tables in database:");
  for (const t of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get();
      console.log(`  ${t.name}: ${count.cnt} rows`);
    } catch (e) {
      console.log(`  ${t.name}: (error reading)`);
    }
  }
} catch (e) {
  console.log("  (table query error)");
}

// 7. HOBSON-JOBSON - Indian English loan words
console.log("\n\n7. HOBSON-JOBSON (Indian English Loan Words)");
console.log("-".repeat(80));

try {
  const hobsonSample = db.prepare("SELECT * FROM hobson_jobson LIMIT 5").all();
  console.log("\nHobson-Jobson entries:");
  for (const row of hobsonSample) {
    console.log(`  ${JSON.stringify(row)}`);
  }
} catch (e) {
  console.log("  (hobson_jobson not found or error)");
}

// 8. BDB HEBREW - Biblical Hebrew database
console.log("\n\n8. BDB HEBREW (Biblical Hebrew)");
console.log("-".repeat(80));

try {
  const bdbSample = db.prepare("SELECT * FROM bdb_hebrew LIMIT 5").all();
  console.log("\nBDB Hebrew entries:");
  for (const row of bdbSample) {
    console.log(`  Strongs: ${row.strongs_id} | Hebrew: ${row.hebrew} | ${row.transliteration}`);
    console.log(`  Def: ${row.definition.substring(0, 100)}`);
    if (row.usage_notes) console.log(`  Usage: ${row.usage_notes.substring(0, 100)}`);
  }
} catch (e) {
  console.log("  (bdb_hebrew not found or error)");
}

// 9. SPECIAL PATTERN HUNT: Words from a single Hebrew root
console.log("\n\n9. STRONG'S INDEX - Multiple English words from one root");
console.log("-".repeat(80));

try {
  const multiWords = db.prepare(`
    SELECT si.strongs_id, COUNT(DISTINCT si.english_word) as word_count, 
           GROUP_CONCAT(DISTINCT si.english_word, ', ') as words
    FROM strongs_index si
    GROUP BY si.strongs_id
    HAVING word_count > 5
    ORDER BY word_count DESC
    LIMIT 10
  `).all();

  console.log("\nStrong's roots with MANY English translations:");
  for (const row of multiWords) {
    console.log(`  Strongs ${row.strongs_id}: ${row.word_count} English words`);
    console.log(`    ${row.words}`);
  }
} catch (e) {
  console.log("  (strongs_index error)");
}

db.close();
