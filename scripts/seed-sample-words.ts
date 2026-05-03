/**
 * Seed a handful of sample words into Turso so the site shows SOMETHING
 * while the full database rebuild + upload happens.
 *
 * Usage:
 *   npx tsx scripts/seed-sample-words.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN as env vars or in .env.local:
 *   npx tsx --env-file=.env.local scripts/seed-sample-words.ts
 */
import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  console.error("Missing TURSO_DATABASE_URL. Set it in .env.local or as env var.");
  process.exit(1);
}

const db = createClient({ url: tursoUrl, authToken: tursoToken });

const SCHEMA = `
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  pos TEXT,
  ipa TEXT,
  definition TEXT,
  etymology_text TEXT,
  etymology_templates TEXT,
  related_words TEXT,
  examples TEXT,
  antonyms TEXT,
  hypernyms TEXT,
  hyponyms TEXT,
  coordinate_terms TEXT
);

CREATE TABLE IF NOT EXISTS webster (
  word TEXT PRIMARY KEY,
  definition TEXT,
  synonyms TEXT
);

CREATE TABLE IF NOT EXISTS webster1828 (
  word TEXT PRIMARY KEY,
  part_of_speech TEXT,
  etymology TEXT,
  definition TEXT,
  languages TEXT
);

CREATE TABLE IF NOT EXISTS etymology_links (
  word TEXT NOT NULL,
  word_lang TEXT,
  parent_word TEXT,
  parent_lang TEXT,
  relation_type TEXT
);

CREATE TABLE IF NOT EXISTS ipa_dict (
  word TEXT PRIMARY KEY,
  ipa TEXT
);

CREATE TABLE IF NOT EXISTS first_use (
  word TEXT PRIMARY KEY,
  year INTEGER,
  century TEXT,
  source TEXT
);

CREATE TABLE IF NOT EXISTS morpholex (
  word TEXT PRIMARY KEY,
  morphemes TEXT,
  prefix TEXT,
  root TEXT,
  suffix TEXT,
  morpheme_count INTEGER
);

CREATE TABLE IF NOT EXISTS cognates (
  english_word TEXT NOT NULL,
  cognate_word TEXT,
  cognate_lang TEXT,
  cognate_lang_name TEXT,
  shared_ancestor TEXT,
  ancestor_lang TEXT
);

CREATE TABLE IF NOT EXISTS word_frequency (
  word TEXT PRIMARY KEY,
  rank INTEGER
);

CREATE TABLE IF NOT EXISTS google_frequency (
  word TEXT PRIMARY KEY,
  rank INTEGER
);

CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_etymology_links_word ON etymology_links(word);
CREATE INDEX IF NOT EXISTS idx_cognates_english ON cognates(english_word);
`;

interface SeedWord {
  word: string;
  pos: string;
  ipa: string;
  definition: string;
  etymology_text: string;
  etymology_templates: string;
  related_words: string;
  webster1828_def: string;
  webster1828_etym: string;
  webster1828_pos: string;
  webster_def: string;
  etym_links: { parent_word: string; parent_lang: string; relation_type: string }[];
  first_use_year: number;
  first_use_century: string;
  morphemes?: string;
  prefix?: string;
  root?: string;
  suffix?: string;
  morpheme_count?: number;
  cognates?: { word: string; lang: string; langName: string; ancestor: string; ancestorLang: string }[];
}

const WORDS: SeedWord[] = [
  {
    word: "love",
    pos: "noun",
    ipa: "/lʌv/",
    definition: "A profoundly tender, passionate affection for another person; a feeling of warm personal attachment or deep affection.",
    etymology_text: "From Middle English love, luve, from Old English lufu, from Proto-West Germanic *lubu, from Proto-Germanic *lubō, from Proto-Indo-European *lewbʰ- ('to love, to care').",
    etymology_templates: JSON.stringify([{ name: "inh", args: { "1": "en", "2": "enm", "3": "love" } }, { name: "inh", args: { "1": "enm", "2": "ang", "3": "lufu" } }]),
    related_words: JSON.stringify(["lovely", "lover", "beloved", "lovable", "loving"]),
    webster1828_def: "An affection of the mind excited by beauty and worth of any kind, or by the qualities of an object which communicate pleasure, sensual or intellectual.",
    webster1828_etym: "Saxon lufe, lufu; Gothic liufs; German liebe; Dutch liefde.",
    webster1828_pos: "noun",
    webster_def: "A feeling of strong attachment induced by that which delights or commands admiration; preeminent kindness or devotion to another.",
    etym_links: [
      { parent_word: "lufu", parent_lang: "Old English", relation_type: "inherited" },
      { parent_word: "lubō", parent_lang: "Proto-Germanic", relation_type: "inherited" },
      { parent_word: "lewbʰ-", parent_lang: "Proto-Indo-European", relation_type: "inherited" },
    ],
    first_use_year: 725,
    first_use_century: "8th century",
    morphemes: "love",
    root: "love",
    morpheme_count: 1,
    cognates: [
      { word: "Liebe", lang: "deu", langName: "German", ancestor: "lubō", ancestorLang: "Proto-Germanic" },
      { word: "liefde", lang: "nld", langName: "Dutch", ancestor: "lubō", ancestorLang: "Proto-Germanic" },
      { word: "kärlek", lang: "swe", langName: "Swedish", ancestor: "lubō", ancestorLang: "Proto-Germanic" },
    ],
  },
  {
    word: "disaster",
    pos: "noun",
    ipa: "/dɪˈzæstəɹ/",
    definition: "An unforeseen and ruinous event; a sudden calamity; a great misfortune.",
    etymology_text: "From Middle French désastre, from Italian disastro ('ill-starred'), from dis- ('away, without') + astro ('star'), from Latin astrum, from Ancient Greek ἄστρον (ástron, 'star'). Literally 'bad star' — the ancients attributed calamities to unfavorable stellar positions.",
    etymology_templates: JSON.stringify([{ name: "bor", args: { "1": "en", "2": "frm", "3": "désastre" } }, { name: "der", args: { "1": "frm", "2": "it", "3": "disastro" } }]),
    related_words: JSON.stringify(["disastrous", "disastrously"]),
    webster1828_def: "Literally, the blast of an unfavorable star; hence, a sudden misfortune; calamity; any unfortunate event.",
    webster1828_etym: "French désastre; Italian disastro; Spanish desastre; dis and astro, a star; Latin astrum; Greek astron.",
    webster1828_pos: "noun",
    webster_def: "An unpropitious or baleful aspect of a planet or star; malevolent influence of a heavenly body; hence, sudden or great misfortune.",
    etym_links: [
      { parent_word: "désastre", parent_lang: "Middle French", relation_type: "borrowed" },
      { parent_word: "disastro", parent_lang: "Italian", relation_type: "borrowed" },
      { parent_word: "astrum", parent_lang: "Latin", relation_type: "derived" },
      { parent_word: "ástron", parent_lang: "Ancient Greek", relation_type: "derived" },
    ],
    first_use_year: 1591,
    first_use_century: "16th century",
    morphemes: "dis>aster",
    prefix: "dis",
    root: "aster",
    morpheme_count: 2,
    cognates: [
      { word: "désastre", lang: "fra", langName: "French", ancestor: "disastro", ancestorLang: "Italian" },
      { word: "desastre", lang: "spa", langName: "Spanish", ancestor: "disastro", ancestorLang: "Italian" },
      { word: "Desaster", lang: "deu", langName: "German", ancestor: "disastro", ancestorLang: "Italian" },
      { word: "disastro", lang: "ita", langName: "Italian", ancestor: "disastro", ancestorLang: "Italian" },
    ],
  },
  {
    word: "serendipity",
    pos: "noun",
    ipa: "/ˌsɛɹənˈdɪpɪti/",
    definition: "The faculty or phenomenon of finding valuable or agreeable things not sought for; an aptitude for making desirable discoveries by accident.",
    etymology_text: "Coined in 1754 by Horace Walpole, inspired by the Persian fairy tale 'The Three Princes of Serendip,' whose heroes 'were always making discoveries, by accidents and sagacity, of things they were not in quest of.' Serendip is an old name for Sri Lanka, from Arabic Sarandīb, from Sanskrit Siṃhaladvīpa ('island of the Sinhalese').",
    etymology_templates: JSON.stringify([{ name: "coin", args: { "1": "en", "2": "Horace Walpole", "3": "1754" } }]),
    related_words: JSON.stringify(["serendipitous", "serendipitously"]),
    webster1828_def: "The faculty of making happy and unexpected discoveries by accident.",
    webster1828_etym: "Coined by Horace Walpole in 1754, after the fairy tale The Three Princes of Serendip.",
    webster1828_pos: "noun",
    webster_def: "The faculty of making fortunate discoveries by accident; good fortune; luck.",
    etym_links: [
      { parent_word: "Serendip", parent_lang: "English", relation_type: "derived" },
      { parent_word: "Sarandīb", parent_lang: "Arabic", relation_type: "derived" },
      { parent_word: "Siṃhaladvīpa", parent_lang: "Sanskrit", relation_type: "derived" },
    ],
    first_use_year: 1754,
    first_use_century: "18th century",
    morphemes: "serendip>ity",
    root: "serendip",
    suffix: "ity",
    morpheme_count: 2,
  },
  {
    word: "etymology",
    pos: "noun",
    ipa: "/ˌɛtɪˈmɒlədʒi/",
    definition: "The study of the history of words, their origins, and how their form and meaning have changed over time.",
    etymology_text: "From Old French ethimologie, from Latin etymologia, from Ancient Greek ἐτυμολογία (etumología), from ἔτυμον (étumon, 'true sense') + -λογία (-logía, 'study of'). The Greek étumon literally means 'true' — etymology is the study of the 'true' meaning of words.",
    etymology_templates: JSON.stringify([{ name: "bor", args: { "1": "en", "2": "fro", "3": "ethimologie" } }, { name: "der", args: { "1": "fro", "2": "la", "3": "etymologia" } }, { name: "der", args: { "1": "la", "2": "grc", "3": "ἐτυμολογία" } }]),
    related_words: JSON.stringify(["etymological", "etymologically", "etymologist", "etymon"]),
    webster1828_def: "That part of philology which explains the origin and derivation of words, with a view to ascertaining their radical or primary signification.",
    webster1828_etym: "Greek etymologia; etymon, true, and logos, discourse.",
    webster1828_pos: "noun",
    webster_def: "That branch of philological science which treats of the history of words, tracing out their origin, primitive significance, and changes of form and meaning.",
    etym_links: [
      { parent_word: "ethimologie", parent_lang: "Old French", relation_type: "borrowed" },
      { parent_word: "etymologia", parent_lang: "Latin", relation_type: "borrowed" },
      { parent_word: "ἐτυμολογία", parent_lang: "Ancient Greek", relation_type: "derived" },
    ],
    first_use_year: 1398,
    first_use_century: "14th century",
    morphemes: "etymo>logy",
    root: "etymo",
    suffix: "logy",
    morpheme_count: 2,
    cognates: [
      { word: "étymologie", lang: "fra", langName: "French", ancestor: "etymologia", ancestorLang: "Latin" },
      { word: "Etymologie", lang: "deu", langName: "German", ancestor: "etymologia", ancestorLang: "Latin" },
      { word: "etimología", lang: "spa", langName: "Spanish", ancestor: "etymologia", ancestorLang: "Latin" },
      { word: "etimologia", lang: "ita", langName: "Italian", ancestor: "etymologia", ancestorLang: "Latin" },
      { word: "etymologie", lang: "nld", langName: "Dutch", ancestor: "etymologia", ancestorLang: "Latin" },
    ],
  },
  {
    word: "inspire",
    pos: "verb",
    ipa: "/ɪnˈspaɪəɹ/",
    definition: "To fill with an animating, quickening, or exalting influence; to breathe life or spirit into; to stimulate to creativity or action.",
    etymology_text: "From Old French inspirer, from Latin inspīrāre ('to breathe into, inspire'), from in- ('into') + spīrāre ('to breathe'). The original sense was literal — to breathe divine spirit into someone. The metaphorical sense of 'to fill with creative urge' developed by the 16th century.",
    etymology_templates: JSON.stringify([{ name: "bor", args: { "1": "en", "2": "fro", "3": "inspirer" } }, { name: "der", args: { "1": "fro", "2": "la", "3": "inspirare" } }]),
    related_words: JSON.stringify(["inspiration", "inspired", "inspiring", "inspirational"]),
    webster1828_def: "To breathe into. To infuse by breathing. To infuse into the mind; as, to inspire with new life. To draw in breath; to inhale air into the lungs.",
    webster1828_etym: "Latin inspiro; in and spiro, to breathe.",
    webster1828_pos: "verb",
    webster_def: "To breathe into; to fill with breath; to animate. To infuse by breathing, or as if by breathing. To draw in by the operation of breathing; to inhale.",
    etym_links: [
      { parent_word: "inspirer", parent_lang: "Old French", relation_type: "borrowed" },
      { parent_word: "inspīrāre", parent_lang: "Latin", relation_type: "borrowed" },
      { parent_word: "spīrāre", parent_lang: "Latin", relation_type: "derived" },
    ],
    first_use_year: 1340,
    first_use_century: "14th century",
    morphemes: "in>spir>e",
    prefix: "in",
    root: "spir",
    suffix: "e",
    morpheme_count: 3,
    cognates: [
      { word: "inspirer", lang: "fra", langName: "French", ancestor: "inspīrāre", ancestorLang: "Latin" },
      { word: "inspirar", lang: "spa", langName: "Spanish", ancestor: "inspīrāre", ancestorLang: "Latin" },
      { word: "inspirieren", lang: "deu", langName: "German", ancestor: "inspīrāre", ancestorLang: "Latin" },
      { word: "inspirare", lang: "ita", langName: "Italian", ancestor: "inspīrāre", ancestorLang: "Latin" },
    ],
  },
];

async function main() {
  console.log(`Target: ${tursoUrl}`);
  console.log(`Seeding ${WORDS.length} sample words...\n`);

  // Create schema
  console.log("Creating tables...");
  const stmts = SCHEMA.split(";").map(s => s.trim()).filter(Boolean);
  for (const sql of stmts) {
    try {
      await db.execute(sql);
    } catch (e) {
      console.warn(`  schema warn: ${(e as Error).message.slice(0, 80)}`);
    }
  }
  console.log("  Done.\n");

  // Insert each word
  for (const w of WORDS) {
    console.log(`Seeding "${w.word}"...`);
    const batch: { sql: string; args: (string | number | null)[] }[] = [];

    // words table
    batch.push({
      sql: `INSERT OR REPLACE INTO words (word, pos, ipa, definition, etymology_text, etymology_templates, related_words, examples, antonyms, hypernyms, hyponyms, coordinate_terms) VALUES (?, ?, ?, ?, ?, ?, ?, '', '[]', '[]', '[]', '[]')`,
      args: [w.word, w.pos, w.ipa, w.definition, w.etymology_text, w.etymology_templates, w.related_words],
    });

    // webster table
    batch.push({
      sql: `INSERT OR REPLACE INTO webster (word, definition, synonyms) VALUES (?, ?, '')`,
      args: [w.word, w.webster_def],
    });

    // webster1828 table
    batch.push({
      sql: `INSERT OR REPLACE INTO webster1828 (word, part_of_speech, etymology, definition, languages) VALUES (?, ?, ?, ?, '')`,
      args: [w.word, w.webster1828_pos, w.webster1828_etym, w.webster1828_def],
    });

    // ipa_dict
    batch.push({
      sql: `INSERT OR REPLACE INTO ipa_dict (word, ipa) VALUES (?, ?)`,
      args: [w.word, w.ipa],
    });

    // first_use
    batch.push({
      sql: `INSERT OR REPLACE INTO first_use (word, year, century, source) VALUES (?, ?, ?, 'seed data')`,
      args: [w.word, w.first_use_year, w.first_use_century],
    });

    // etymology_links
    for (const link of w.etym_links) {
      batch.push({
        sql: `INSERT INTO etymology_links (word, word_lang, parent_word, parent_lang, relation_type) VALUES (?, 'English', ?, ?, ?)`,
        args: [w.word, link.parent_word, link.parent_lang, link.relation_type],
      });
    }

    // morpholex
    if (w.morphemes) {
      batch.push({
        sql: `INSERT OR REPLACE INTO morpholex (word, morphemes, prefix, root, suffix, morpheme_count) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [w.word, w.morphemes, w.prefix || "", w.root || "", w.suffix || "", w.morpheme_count || 1],
      });
    }

    // cognates
    if (w.cognates) {
      for (const c of w.cognates) {
        batch.push({
          sql: `INSERT INTO cognates (english_word, cognate_word, cognate_lang, cognate_lang_name, shared_ancestor, ancestor_lang) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [w.word, c.word, c.lang, c.langName, c.ancestor, c.ancestorLang],
        });
      }
    }

    await db.batch(batch, "write");
    console.log(`  ✓ ${w.word} (${batch.length} rows)`);
  }

  console.log(`\nDone! ${WORDS.length} words seeded. Visit word-rosy-mu.vercel.app/word/love to verify.`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
