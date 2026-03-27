import {
  lookupPhonemeKey,
  findWordsByPhonemeKey,
  findAnagrams,
  getWordShortDef,
  getWordEtymologyBrief,
  getWordPos,
  getWordFrequencyRank,
  lookupEtymologyLinks,
  getBorrowingChain,
  lookupPronunciation,
  lookupIpaDict,
  getDatabase,
} from "./database";

// === Types ===

export interface SpellMatch {
  word: string;
  phonemeKey: string;
  ipa: string;
  definition: string;
  etymology: string;
  etymologyLang: string;
  pos: string;
  frequency?: number;
}

export interface SpellPair {
  words: [SpellMatch, SpellMatch];
  spellType: "sonic" | "letter" | "chain" | "lost";
  description: string;
  depthScore: number; // 1-5
}

export interface SpellChainStep {
  word: string;
  phonemeKey: string;
  changedPhoneme?: string;
}

export interface SpellChain {
  steps: SpellChainStep[];
}

export interface DivergenceData {
  word1: string;
  word2: string;
  word1Path: { word: string; language: string }[];
  word2Path: { word: string; language: string }[];
}

export interface LostDistinction {
  word1: string;
  word2: string;
  word1Origin: string;
  word2Origin: string;
  description: string;
}

// === Language family mapping ===
const LANG_FAMILY: Record<string, string> = {
  eng: "Germanic", enm: "Germanic", ang: "Germanic",
  non: "Germanic", "Old Norse": "Germanic", "Old English": "Germanic",
  "Middle English": "Germanic", "Proto-Germanic": "Germanic",
  deu: "Germanic", nld: "Germanic", got: "Germanic",
  lat: "Italic", "Latin": "Italic",
  fra: "Romance", fro: "Romance", frm: "Romance",
  "Old French": "Romance", "French": "Romance",
  ita: "Romance", spa: "Romance", por: "Romance",
  grc: "Hellenic", "Ancient Greek": "Hellenic", "Greek": "Hellenic",
  ara: "Semitic", heb: "Semitic",
  san: "Indo-Aryan", hin: "Indo-Aryan",
  fas: "Iranian", "Persian": "Iranian",
  "Proto-Indo-European": "PIE",
};

const LANG_NAMES: Record<string, string> = {
  eng: "English", enm: "Middle English", ang: "Old English",
  non: "Old Norse", lat: "Latin", grc: "Ancient Greek",
  fra: "French", fro: "Old French", frm: "Middle French",
  deu: "German", nld: "Dutch", ita: "Italian",
  spa: "Spanish", por: "Portuguese", ara: "Arabic",
  heb: "Hebrew", san: "Sanskrit", fas: "Persian",
  jpn: "Japanese", zho: "Chinese", tur: "Turkish",
  rus: "Russian", ell: "Greek", got: "Gothic",
};

function langName(code: string): string {
  return LANG_NAMES[code] || code;
}

function langFamily(code: string): string {
  return LANG_FAMILY[code] || LANG_FAMILY[langName(code)] || "Other";
}

// === Enrichment ===

function enrichWord(word: string): SpellMatch | null {
  const def = getWordShortDef(word);
  if (!def) return null;

  const phonemeKey = lookupPhonemeKey(word) || "";
  const ipaEntry = lookupIpaDict(word);
  const cmu = lookupPronunciation(word);
  const ipa = ipaEntry || (cmu.length > 0 ? cmu[0].phonemes : "");
  const etym = getWordEtymologyBrief(word);
  const pos = getWordPos(word);
  const freq = getWordFrequencyRank(word);

  return {
    word,
    phonemeKey,
    ipa,
    definition: def,
    etymology: etym.text,
    etymologyLang: etym.lang,
    pos,
    frequency: freq,
  };
}

// === Spell Depth Scoring ===

function computeSpellDepth(a: SpellMatch, b: SpellMatch): number {
  let score = 0;

  // Semantic contrast: different POS or very different definitions = higher
  if (a.pos && b.pos && a.pos !== b.pos) score += 0.25;

  // Check definition overlap (fewer shared words = higher contrast)
  const wordsA = new Set(a.definition.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.definition.toLowerCase().split(/\s+/));
  const shared = [...wordsA].filter(w => wordsB.has(w) && w.length > 3).length;
  const overlapRatio = shared / Math.max(wordsA.size, wordsB.size, 1);
  score += (1 - overlapRatio) * 0.25;

  // Etymological distance: different language families = higher
  const famA = langFamily(a.etymologyLang);
  const famB = langFamily(b.etymologyLang);
  if (famA && famB && famA !== famB && famA !== "Other" && famB !== "Other") {
    score += 0.3;
  } else if (a.etymologyLang && b.etymologyLang && a.etymologyLang !== b.etymologyLang) {
    score += 0.15;
  }

  // Cultural weight: both common words = higher impact
  const freqA = a.frequency || 50000;
  const freqB = b.frequency || 50000;
  if (freqA < 10000 && freqB < 10000) score += 0.2;
  else if (freqA < 20000 && freqB < 20000) score += 0.1;

  // Map 0-1 to 1-5 stars
  return Math.min(5, Math.max(1, Math.round(score * 5)));
}

// === Spell Description Generator ===

function buildSpellDescription(a: SpellMatch, b: SpellMatch, type: "sonic" | "letter"): string {
  if (type === "sonic") {
    const langA = a.etymologyLang ? langName(a.etymologyLang) : "unknown origins";
    const langB = b.etymologyLang ? langName(b.etymologyLang) : "unknown origins";
    if (langA !== langB && a.etymologyLang && b.etymologyLang) {
      return `One from ${langA}, the other from ${langB} — two words from different worlds that converged into the same sound.`;
    }
    return `"${a.word}" and "${b.word}" share the same sound but carry different meanings — a sonic spell hiding in plain speech.`;
  }
  return `The letters of "${a.word}" rearrange to spell "${b.word}" — as if the meaning was encoded in the letters all along.`;
}

// === Core Spell Detection ===

export function findSonicSpells(word: string): SpellPair[] {
  const phonemeKey = lookupPhonemeKey(word);
  if (!phonemeKey) return [];

  const homophones = findWordsByPhonemeKey(phonemeKey, word);
  if (homophones.length === 0) return [];

  const source = enrichWord(word);
  if (!source) return [];

  const pairs: SpellPair[] = [];
  for (const h of homophones.slice(0, 15)) {
    // Skip trivial variants (plurals, verb forms of same root)
    if (h.startsWith(word.toLowerCase()) || word.toLowerCase().startsWith(h)) continue;

    const match = enrichWord(h);
    if (!match) continue;

    const depth = computeSpellDepth(source, match);
    const desc = buildSpellDescription(source, match, "sonic");
    pairs.push({
      words: [source, match],
      spellType: "sonic",
      description: desc,
      depthScore: depth,
    });
  }

  return pairs.sort((a, b) => b.depthScore - a.depthScore);
}

export function findLetterSpells(word: string): SpellPair[] {
  const anagrams = findAnagrams(word);
  if (anagrams.length === 0) return [];

  const source = enrichWord(word);
  if (!source) return [];

  const pairs: SpellPair[] = [];
  for (const a of anagrams.slice(0, 15)) {
    const match = enrichWord(a);
    if (!match) continue;

    const depth = computeSpellDepth(source, match);
    const desc = buildSpellDescription(source, match, "letter");
    pairs.push({
      words: [source, match],
      spellType: "letter",
      description: desc,
      depthScore: depth,
    });
  }

  return pairs.sort((a, b) => b.depthScore - a.depthScore);
}

// === Spell Chains ===

// Common ARPABET phonemes for substitution
const PHONEME_GROUPS: string[][] = [
  // Vowels
  ["AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW"],
  // Stops
  ["B", "P"], ["D", "T"], ["G", "K"],
  // Fricatives
  ["F", "V"], ["S", "Z"], ["SH", "ZH"], ["TH", "DH"],
  // Nasals
  ["M", "N", "NG"],
  // Liquids/Glides
  ["L", "R"], ["W", "Y"],
];

function getPhonemeSubstitutes(phoneme: string): string[] {
  for (const group of PHONEME_GROUPS) {
    if (group.includes(phoneme)) {
      return group.filter(p => p !== phoneme);
    }
  }
  return [];
}

function generatePhonemeEdits(key: string): string[] {
  const phonemes = key.split(" ");
  const edits = new Set<string>();

  // Delete one phoneme
  for (let i = 0; i < phonemes.length; i++) {
    const copy = [...phonemes];
    copy.splice(i, 1);
    if (copy.length >= 1) edits.add(copy.join(" "));
  }

  // Substitute one phoneme
  for (let i = 0; i < phonemes.length; i++) {
    const subs = getPhonemeSubstitutes(phonemes[i]);
    for (const sub of subs) {
      const copy = [...phonemes];
      copy[i] = sub;
      edits.add(copy.join(" "));
    }
  }

  return [...edits];
}

export function buildSpellChain(word: string, maxLength: number = 8): SpellChain {
  const startKey = lookupPhonemeKey(word);
  if (!startKey) return { steps: [{ word, phonemeKey: "" }] };

  const steps: SpellChainStep[] = [{ word, phonemeKey: startKey }];
  const visited = new Set<string>([startKey, word.toLowerCase()]);

  for (let i = 0; i < maxLength - 1; i++) {
    const currentKey = steps[steps.length - 1].phonemeKey;
    const edits = generatePhonemeEdits(currentKey);

    let bestWord: string | null = null;
    let bestKey = "";
    let bestFreq = Infinity;

    for (const editKey of edits) {
      if (visited.has(editKey)) continue;
      const matches = findWordsByPhonemeKey(editKey);
      for (const m of matches) {
        if (visited.has(m)) continue;
        // Prefer common words
        const freq = getWordFrequencyRank(m) || 50000;
        if (freq < bestFreq) {
          bestWord = m;
          bestKey = editKey;
          bestFreq = freq;
        }
      }
    }

    if (!bestWord) break;

    // Determine which phoneme changed
    const prevPhonemes = currentKey.split(" ");
    const newPhonemes = bestKey.split(" ");
    let changed: string | undefined;
    if (prevPhonemes.length === newPhonemes.length) {
      for (let j = 0; j < prevPhonemes.length; j++) {
        if (prevPhonemes[j] !== newPhonemes[j]) {
          changed = `${prevPhonemes[j]}→${newPhonemes[j]}`;
          break;
        }
      }
    } else {
      changed = prevPhonemes.length > newPhonemes.length ? "−phoneme" : "+phoneme";
    }

    steps.push({ word: bestWord, phonemeKey: bestKey, changedPhoneme: changed });
    visited.add(bestKey);
    visited.add(bestWord);
  }

  return { steps };
}

// === Etymological Divergence ===

export function getEtymologicalDivergence(word1: string, word2: string): DivergenceData {
  const chain1 = getBorrowingChain(word1, 8);
  const chain2 = getBorrowingChain(word2, 8);

  return {
    word1,
    word2,
    word1Path: [{ word: word1, language: "English" }, ...chain1.map(c => ({ word: c.word, language: langName(c.language) }))],
    word2Path: [{ word: word2, language: "English" }, ...chain2.map(c => ({ word: c.word, language: langName(c.language) }))],
  };
}

// === Lost Distinctions ===

export function detectLostDistinctions(word: string): LostDistinction[] {
  const phonemeKey = lookupPhonemeKey(word);
  if (!phonemeKey) return [];

  const homophones = findWordsByPhonemeKey(phonemeKey, word);
  const results: LostDistinction[] = [];

  for (const h of homophones.slice(0, 10)) {
    const etym1 = getWordEtymologyBrief(word);
    const etym2 = getWordEtymologyBrief(h);

    if (!etym1.lang || !etym2.lang) continue;

    const fam1 = langFamily(etym1.lang);
    const fam2 = langFamily(etym2.lang);

    // Different language families means they were once pronounced differently
    if (fam1 !== fam2 || etym1.lang !== etym2.lang) {
      const lang1Name = langName(etym1.lang);
      const lang2Name = langName(etym2.lang);
      results.push({
        word1: word,
        word2: h,
        word1Origin: lang1Name,
        word2Origin: lang2Name,
        description: `"${word}" came from ${lang1Name} while "${h}" came from ${lang2Name}. They once sounded completely different — English collapsed their pronunciations into one.`,
      });
    }
  }

  return results;
}

// === Random & Featured Spells ===

// Curated list of mind-blowing spell pairs
const FEATURED_PAIRS: [string, string, "sonic" | "letter"][] = [
  ["morning", "mourning", "sonic"],
  ["night", "knight", "sonic"],
  ["soul", "sole", "sonic"],
  ["flower", "flour", "sonic"],
  ["hear", "here", "sonic"],
  ["peace", "piece", "sonic"],
  ["write", "right", "sonic"],
  ["alter", "altar", "sonic"],
  ["listen", "silent", "letter"],
  ["earth", "heart", "letter"],
  ["stressed", "desserts", "letter"],
  ["united", "untied", "letter"],
  ["sacred", "scared", "letter"],
  ["angered", "enraged", "letter"],
  ["funeral", "real fun", "letter"],
  ["danger", "garden", "letter"],
];

export function getFeaturedSpells(): SpellPair[] {
  const pairs: SpellPair[] = [];

  for (const [w1, w2, type] of FEATURED_PAIRS) {
    const m1 = enrichWord(w1);
    const m2 = enrichWord(w2);
    if (!m1 || !m2) continue;

    const depth = computeSpellDepth(m1, m2);
    const desc = buildSpellDescription(m1, m2, type);
    pairs.push({
      words: [m1, m2],
      spellType: type,
      description: desc,
      depthScore: Math.max(depth, 3), // Featured spells are at least 3 stars
    });
  }

  return pairs;
}

export function getRandomSpell(): SpellPair | null {
  const db = getDatabase();
  try {
    // Find a random word that has homophones
    const row = db.prepare(`
      SELECT c1.word, c1.phoneme_key FROM cmu_pronunciation c1
      WHERE c1.variant = 0 AND c1.phoneme_key IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM cmu_pronunciation c2
        WHERE c2.phoneme_key = c1.phoneme_key AND c2.word != c1.word AND c2.variant = 0
      )
      ORDER BY RANDOM() LIMIT 20
    `).all() as { word: string; phoneme_key: string }[];

    for (const r of row) {
      const spells = findSonicSpells(r.word);
      if (spells.length > 0 && spells[0].depthScore >= 2) {
        return spells[0];
      }
    }

    // Fallback: try a letter spell
    const letterRow = db.prepare(`
      SELECT wl1.word FROM word_letters wl1
      WHERE EXISTS (
        SELECT 1 FROM word_letters wl2
        WHERE wl2.sorted_letters = wl1.sorted_letters AND wl2.word != wl1.word
      )
      AND wl1.letter_count >= 4
      ORDER BY RANDOM() LIMIT 10
    `).all() as { word: string }[];

    for (const r of letterRow) {
      const spells = findLetterSpells(r.word);
      if (spells.length > 0) return spells[0];
    }

    return null;
  } catch {
    return null;
  }
}

// === Full Spell Analysis for a Word ===

export interface SpellAnalysis {
  word: string;
  pronunciation: string;
  sonicSpells: SpellPair[];
  letterSpells: SpellPair[];
  chain: SpellChain;
  lostDistinctions: LostDistinction[];
  divergence?: DivergenceData;
}

export function analyzeWord(word: string): SpellAnalysis {
  const sonic = findSonicSpells(word);
  const letter = findLetterSpells(word);
  const chain = buildSpellChain(word);
  const lost = detectLostDistinctions(word);

  const ipaEntry = lookupIpaDict(word);
  const cmu = lookupPronunciation(word);
  const pronunciation = ipaEntry || (cmu.length > 0 ? cmu[0].phonemes : "");

  // Get divergence for the top sonic spell
  let divergence: DivergenceData | undefined;
  if (sonic.length > 0) {
    divergence = getEtymologicalDivergence(word, sonic[0].words[1].word);
  }

  return {
    word,
    pronunciation,
    sonicSpells: sonic,
    letterSpells: letter,
    chain,
    lostDistinctions: lost,
    divergence,
  };
}
