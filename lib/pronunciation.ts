// ARPAbet to human-readable pronunciation conversion

const ARPABET_TO_READABLE: Record<string, string> = {
  "AA": "ah",
  "AE": "a",
  "AH": "uh",
  "AO": "aw",
  "AW": "ow",
  "AY": "eye",
  "B": "b",
  "CH": "ch",
  "D": "d",
  "DH": "th",
  "EH": "eh",
  "ER": "er",
  "EY": "ay",
  "F": "f",
  "G": "g",
  "HH": "h",
  "IH": "ih",
  "IY": "ee",
  "JH": "j",
  "K": "k",
  "L": "l",
  "M": "m",
  "N": "n",
  "NG": "ng",
  "OW": "oh",
  "OY": "oy",
  "P": "p",
  "R": "r",
  "S": "s",
  "SH": "sh",
  "T": "t",
  "TH": "th",
  "UH": "oo",
  "UW": "oo",
  "V": "v",
  "W": "w",
  "Y": "y",
  "Z": "z",
  "ZH": "zh",
};

export function arpabetToReadable(phonemes: string): string {
  const parts = phonemes.split(/\s+/);
  const readable: string[] = [];

  for (const part of parts) {
    // Remove stress markers (0, 1, 2) to get base phoneme
    const base = part.replace(/[012]$/, "");
    const stress = part.match(/[012]$/)?.[0];
    const readable_part = ARPABET_TO_READABLE[base] || base.toLowerCase();

    if (stress === "1") {
      readable.push(readable_part.toUpperCase()); // primary stress
    } else {
      readable.push(readable_part);
    }
  }

  return readable.join("-");
}

export function arpabetToSyllableCount(phonemes: string): number {
  // Count vowel phonemes (those with stress markers) for syllable count
  return (phonemes.match(/[012]/g) || []).length;
}
