// Regex utilities for extracting structured data from etymology prose text

interface ParsedAncestor {
  language: string;
  form: string;
  meaning: string;
}

// Common patterns in Wiktionary etymology text:
// "from Old French salaire, from Latin salarium ("salt money")"
// "from Middle English sely, from Old English sǣliġ ("happy, blessed")"
// "borrowed from Latin disaster, from Ancient Greek δυσ- + ἀστήρ"
const FROM_PATTERN = /(?:from|borrowed from|derived from|via)\s+([A-Z][\w\s-]+?)\s+(\S+?)(?:\s*\([""]([^""")]+)["")]\s*\))?(?=[,;.]|\s+from|\s+(?:meaning|literally)|$)/gi;

// Pattern for "X word, meaning Y" or "X word ("Y")"
const MEANING_PATTERN = /[""\(]([^"""\)]+)[""\)]/;

// Date patterns
const DATE_PATTERN = /(\d{1,2}(?:st|nd|rd|th)?\s+century(?:\s+[A-Z]+)?|\d{3,4}s?(?:\s*[-–]\s*\d{3,4}s?)?(?:\s*(?:BC|BCE|AD|CE))?)/gi;

export function parseEtymologyText(text: string): ParsedAncestor[] {
  if (!text) return [];

  const ancestors: ParsedAncestor[] = [];
  const seen = new Set<string>();

  let match;
  const regex = new RegExp(FROM_PATTERN.source, FROM_PATTERN.flags);

  while ((match = regex.exec(text)) !== null) {
    const language = match[1].trim();
    const form = match[2].trim().replace(/[,;.]+$/, "");
    const meaning = match[3]?.trim() || "";

    const key = `${language}:${form}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Skip if the language looks like a word (too short or lowercase start)
    if (language.length < 3 || !/^[A-Z]/.test(language)) continue;

    ancestors.push({ language, form, meaning });
  }

  return ancestors;
}

export function extractDates(text: string): string[] {
  if (!text) return [];
  const dates: string[] = [];
  let match;
  const regex = new RegExp(DATE_PATTERN.source, DATE_PATTERN.flags);
  while ((match = regex.exec(text)) !== null) {
    dates.push(match[1]);
  }
  return dates;
}

export function extractFirstSentence(text: string): string {
  if (!text) return "";
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 200);
}

// Build a root revelation sentence from the deepest ancestor
export function buildRevelationText(
  word: string,
  rootForm: string,
  rootLang: string,
  rootMeaning: string,
  etymText: string
): string {
  if (rootForm && rootLang) {
    const meaningPart = rootMeaning ? `, meaning "${rootMeaning}"` : "";
    return `According to its etymology, "${word}" traces back to ${rootLang} "${rootForm}"${meaningPart}. ${extractFirstSentence(etymText)}`;
  }
  // Fallback to first sentence of etymology text
  return extractFirstSentence(etymText) || `The documented origins of "${word}" are found in historical linguistic records.`;
}

// Extract a cultural moment from etymology text
export function extractCulturalMoment(
  etymText: string,
  word: string
): { period: string; description: string } {
  const dates = extractDates(etymText);
  const period = dates.length > 0 ? dates[0] : "Historical";

  // Try to find a sentence with a date or cultural reference
  const sentences = etymText.split(/(?<=[.!?])\s+/);
  const culturalSentence = sentences.find(
    (s) => DATE_PATTERN.test(s) || /recorded|attested|first|coined|usage|appear/i.test(s)
  );

  const description = culturalSentence
    ? culturalSentence.trim()
    : sentences[0]?.trim() || `The word "${word}" has evolved through centuries of use across multiple languages and cultures.`;

  return { period, description };
}
