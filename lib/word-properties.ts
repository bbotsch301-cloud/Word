import type { LexicaResult } from "@/types/lexica";

// Scrabble letter values
const SCRABBLE_VALUES: Record<string, number> = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10,
};

const VOWELS = new Set("aeiou");

// CMU vowel phonemes (stress markers stripped)
const CMU_VOWELS = new Set([
  "AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH",
  "IY", "OW", "OY", "UH", "UW",
]);

export function computeScrabbleScore(word: string): number {
  return word.toLowerCase().split("").reduce((sum, c) => sum + (SCRABBLE_VALUES[c] || 0), 0);
}

export function computeLetterStats(word: string): { vowels: number; consonants: number; unique: number } {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  let vowels = 0;
  let consonants = 0;
  for (const c of lower) {
    if (VOWELS.has(c)) vowels++;
    else consonants++;
  }
  return { vowels, consonants, unique: new Set(lower).size };
}

export function computeSyllableCount(arpabet: string[] | undefined): number | null {
  if (!arpabet || arpabet.length === 0 || !arpabet[0]) return null;
  // Count vowel phonemes (they have stress markers: 0, 1, or 2)
  const phonemes = arpabet[0].split(" ");
  const count = phonemes.filter(p => /\d$/.test(p)).length;
  return count > 0 ? count : null;
}

export function computeStressPattern(arpabet: string[] | undefined): string | null {
  if (!arpabet || arpabet.length === 0 || !arpabet[0]) return null;
  const phonemes = arpabet[0].split(" ");
  const stresses = phonemes
    .filter(p => /\d$/.test(p))
    .map(p => {
      const level = p[p.length - 1];
      return level === "1" ? "\u02C8" : level === "2" ? "\u02CC" : "\u00B7";
    });
  return stresses.length > 0 ? stresses.join("") : null;
}

export function computeWordAge(firstUse: { year?: number; century: string } | undefined): string | null {
  if (!firstUse) return null;
  const year = firstUse.year;
  if (year) {
    const age = new Date().getFullYear() - year;
    if (age > 0) return `~${age} years`;
  }
  // Estimate from century
  const match = firstUse.century?.match(/(\d+)/);
  if (match) {
    const centuryNum = parseInt(match[1], 10);
    if (centuryNum >= 1 && centuryNum <= 25) {
      const centuryMid = (centuryNum - 1) * 100 + 50;
      const age = new Date().getFullYear() - centuryMid;
      if (age > 0) return `~${age} years`;
    }
  }
  return null;
}

export function computeRarityPercentile(frequency: { rank: number } | undefined): string | null {
  if (!frequency) return null;
  // Assuming ~170,000 words in the frequency list
  const totalWords = 170000;
  const percentile = ((totalWords - frequency.rank) / totalWords) * 100;
  if (percentile >= 99.9) return "Top 0.1%";
  if (percentile >= 99) return `Top ${(100 - percentile).toFixed(1)}%`;
  if (percentile >= 90) return `Top ${Math.round(100 - percentile)}%`;
  return `Top ${Math.round(100 - percentile)}%`;
}

export function computeLanguageJourney(result: LexicaResult): string | null {
  if (result.strata.length <= 1) return null;
  const languages = result.strata.map(s => s.language);
  return `${languages.length} languages`;
}

export function computeFormality(result: LexicaResult): string | null {
  const cefr = result.cefrLevel;
  if (!cefr) return null;
  const levels: Record<string, string> = {
    A1: "Basic", A2: "Basic",
    B1: "Everyday", B2: "Formal",
    C1: "Advanced", C2: "Specialized",
  };
  return levels[cefr] || null;
}
