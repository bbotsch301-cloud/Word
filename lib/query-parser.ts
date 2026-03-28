export interface QueryIntent {
  type: "word" | "compare" | "search";
  word?: string;
  compareWords?: string[];
  searchParams?: Record<string, string>;
  label?: string; // Human-readable description of the intent
}

// Map of common language names to database codes
const LANGUAGE_CODES: Record<string, string> = {
  latin: "lat",
  greek: "grc",
  french: "fra",
  "old french": "fro",
  "old english": "ang",
  "middle english": "enm",
  german: "deu",
  spanish: "spa",
  italian: "ita",
  portuguese: "por",
  dutch: "nld",
  arabic: "ara",
  persian: "fas",
  sanskrit: "san",
  hindi: "hin",
  japanese: "jpn",
  chinese: "zho",
  russian: "rus",
  norse: "non",
  "old norse": "non",
  hebrew: "heb",
  turkish: "tur",
  welsh: "cym",
  irish: "gle",
  "proto-germanic": "gem-pro",
  "proto-indo-european": "ine-pro",
};

const CENTURY_PATTERN = /(\d{1,2})(?:st|nd|rd|th)\s+century/i;

export function parseQuery(input: string): QueryIntent {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Comparison: "love vs hate" or "love versus hate"
  const vsMatch = trimmed.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+)$/i);
  if (vsMatch) {
    const words = [vsMatch[1].trim(), vsMatch[2].trim()];
    return {
      type: "compare",
      compareWords: words,
      label: `Compare "${words[0]}" and "${words[1]}"`,
    };
  }

  // 2. Origin language: "words from Latin", "from Arabic"
  const originMatch = lower.match(/^(?:words?\s+)?from\s+(.+)$/);
  if (originMatch) {
    const lang = originMatch[1].trim();
    const code = LANGUAGE_CODES[lang];
    if (code) {
      return {
        type: "search",
        searchParams: { originLang: code },
        label: `Words from ${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
      };
    }
    // Check for century: "from the 14th century"
    const centuryMatch = lang.match(/(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)\s+century/i);
    if (centuryMatch) {
      const num = parseInt(centuryMatch[1], 10);
      if (num >= 1 && num <= 21) {
        const suffix = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
        const century = `${num}${suffix} century`;
        return {
          type: "search",
          searchParams: { century },
          label: `Words from the ${century}`,
        };
      }
    }
  }

  // 3. Century: "14th century words"
  const centuryMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)\s+century\s+words?/);
  if (centuryMatch) {
    const num = parseInt(centuryMatch[1], 10);
    if (num >= 1 && num <= 21) {
      const suffix = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
      const century = `${num}${suffix} century`;
      return {
        type: "search",
        searchParams: { century },
        label: `Words from the ${century}`,
      };
    }
  }

  // 4. Suffix pattern: "words ending in -tion" or "ending in ly"
  const endingMatch = lower.match(/(?:words?\s+)?ending\s+in\s+[-]?(\w+)/);
  if (endingMatch) {
    return {
      type: "search",
      searchParams: { pattern: `*${endingMatch[1]}` },
      label: `Words ending in -${endingMatch[1]}`,
    };
  }

  // 5. Prefix pattern: "words starting with un" or "beginning with re"
  const startingMatch = lower.match(/(?:words?\s+)?(?:starting|beginning)\s+with\s+(\w+)/);
  if (startingMatch) {
    return {
      type: "search",
      searchParams: { pattern: `${startingMatch[1]}*` },
      label: `Words starting with ${startingMatch[1]}-`,
    };
  }

  // 6. N-letter words: "5 letter words", "seven letter words"
  const NUMBER_WORDS: Record<string, number> = {
    two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  };
  const letterMatch = lower.match(/^(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*[-\s]?letter\s+words?$/);
  if (letterMatch) {
    const n = parseInt(letterMatch[1]) || NUMBER_WORDS[letterMatch[1]] || 0;
    if (n >= 2 && n <= 20) {
      return {
        type: "search",
        searchParams: { pattern: "?".repeat(n) },
        label: `${n}-letter words`,
      };
    }
  }

  // 7. Part of speech: "nouns from Latin", "adjectives"
  const posMatch = lower.match(/^(nouns?|verbs?|adjectives?|adverbs?)(?:\s+from\s+(\w+))?$/);
  if (posMatch) {
    const pos = posMatch[1].replace(/s$/, "");
    const params: Record<string, string> = { pos };
    let label = `${pos.charAt(0).toUpperCase() + pos.slice(1)}s`;
    if (posMatch[2]) {
      const code = LANGUAGE_CODES[posMatch[2]];
      if (code) {
        params.originLang = code;
        label += ` from ${posMatch[2].charAt(0).toUpperCase() + posMatch[2].slice(1)}`;
      }
    }
    return { type: "search", searchParams: params, label };
  }

  // 8. Contains wildcard characters → pattern search
  if (trimmed.includes("*") || trimmed.includes("?")) {
    return {
      type: "search",
      searchParams: { pattern: trimmed },
      label: `Pattern search: ${trimmed}`,
    };
  }

  // 9. Default: word lookup
  return {
    type: "word",
    word: trimmed.toLowerCase().replace(/\s+/g, " "),
  };
}
