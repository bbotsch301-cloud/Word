import type { ConstellationWord } from "@/types/lexica";
import { lookupWebster, lookupAllPOS, lookupBlacksLaw } from "./database";

export function buildConstellation(
  word: string,
  relatedWordsJson: string,
  _etymChainSource?: { word: string; lang: string }
): ConstellationWord[] {
  const constellation: ConstellationWord[] = [];
  const seen = new Set<string>([word.toLowerCase()]);

  const addWord = (w: string, relationship: string) => {
    const lower = w.toLowerCase().trim();
    if (!lower || seen.has(lower) || !/^[a-z-]+$/i.test(lower)) return;
    if (constellation.length >= 7) return;
    seen.add(lower);
    constellation.push({ word: lower, relationship });
  };

  // 1. Related words from Kaikki (related, derived, synonyms)
  if (relatedWordsJson) {
    try {
      const related = JSON.parse(relatedWordsJson) as string[];
      for (const w of related) {
        addWord(w, "related form");
      }
    } catch {
      // ignore
    }
  }

  // 2. Multiple POS entries may have different related words
  if (constellation.length < 5) {
    const allEntries = lookupAllPOS(word);
    for (const entry of allEntries) {
      if (entry.related_words) {
        try {
          const related = JSON.parse(entry.related_words) as string[];
          for (const w of related) {
            addWord(w, "related");
          }
        } catch {
          // ignore
        }
      }
    }
  }

  // 3. Black's Law related terms
  if (constellation.length < 5) {
    const blacks = lookupBlacksLaw(word);
    if (blacks?.related_terms) {
      try {
        const related = JSON.parse(blacks.related_terms) as string[];
        for (const r of related) {
          addWord(r, "legal term");
        }
      } catch {
        // ignore
      }
    }
  }

  // 4. Webster synonyms as fallback
  if (constellation.length < 5) {
    const webster = lookupWebster(word);
    if (webster?.synonyms) {
      try {
        const syns = JSON.parse(webster.synonyms) as string[];
        for (const s of syns) {
          addWord(s, "synonym");
        }
      } catch {
        // ignore
      }
    }
  }

  return constellation.slice(0, 7);
}
