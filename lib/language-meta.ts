export interface LanguageMeta {
  name: string;
  era: string;
  period: string;
  family: string;
}

// Maps Wiktionary/etymology-db language codes to human-readable metadata
const LANGUAGE_MAP: Record<string, LanguageMeta> = {
  // English (Germanic)
  eng: { name: "English", era: "Modern English", period: "1500s–present", family: "Germanic" },
  en: { name: "English", era: "Modern English", period: "1500s–present", family: "Germanic" },
  English: { name: "English", era: "Modern English", period: "1500s–present", family: "Germanic" },
  enm: { name: "Middle English", era: "Middle English", period: "1100–1500", family: "Germanic" },
  "Middle English": { name: "Middle English", era: "Middle English", period: "1100–1500", family: "Germanic" },
  ang: { name: "Old English", era: "Old English", period: "450–1100 CE", family: "Germanic" },
  "Old English": { name: "Old English", era: "Old English", period: "450–1100 CE", family: "Germanic" },

  // French (Romance)
  fra: { name: "French", era: "French", period: "14th century–present", family: "Romance" },
  fr: { name: "French", era: "French", period: "14th century–present", family: "Romance" },
  French: { name: "French", era: "French", period: "14th century–present", family: "Romance" },
  fro: { name: "Old French", era: "Old French", period: "9th–14th century", family: "Romance" },
  "Old French": { name: "Old French", era: "Old French", period: "9th–14th century", family: "Romance" },
  frm: { name: "Middle French", era: "Middle French", period: "14th–17th century", family: "Romance" },
  "Middle French": { name: "Middle French", era: "Middle French", period: "14th–17th century", family: "Romance" },
  xno: { name: "Anglo-Norman", era: "Anglo-Norman", period: "11th–14th century", family: "Romance" },
  "Anglo-Norman": { name: "Anglo-Norman", era: "Anglo-Norman", period: "11th–14th century", family: "Romance" },

  // Latin (Romance)
  lat: { name: "Latin", era: "Latin", period: "75 BC–3rd century CE", family: "Romance" },
  la: { name: "Latin", era: "Latin", period: "75 BC–3rd century CE", family: "Romance" },
  Latin: { name: "Latin", era: "Latin", period: "75 BC–3rd century CE", family: "Romance" },
  LL: { name: "Late Latin", era: "Late Latin", period: "3rd–6th century CE", family: "Romance" },
  "Late Latin": { name: "Late Latin", era: "Late Latin", period: "3rd–6th century CE", family: "Romance" },
  ML: { name: "Medieval Latin", era: "Medieval Latin", period: "6th–15th century", family: "Romance" },
  "Medieval Latin": { name: "Medieval Latin", era: "Medieval Latin", period: "6th–15th century", family: "Romance" },
  VL: { name: "Vulgar Latin", era: "Vulgar Latin", period: "3rd–9th century CE", family: "Romance" },
  "Vulgar Latin": { name: "Vulgar Latin", era: "Vulgar Latin", period: "3rd–9th century CE", family: "Romance" },
  NL: { name: "New Latin", era: "New Latin", period: "15th–18th century", family: "Romance" },
  "New Latin": { name: "New Latin", era: "New Latin", period: "15th–18th century", family: "Romance" },
  "la-med": { name: "Medieval Latin", era: "Medieval Latin", period: "6th–15th century", family: "Romance" },

  // Greek (Hellenic)
  grc: { name: "Ancient Greek", era: "Ancient Greek", period: "9th century BC–6th century CE", family: "Hellenic" },
  "Ancient Greek": { name: "Ancient Greek", era: "Ancient Greek", period: "9th century BC–6th century CE", family: "Hellenic" },
  ell: { name: "Greek", era: "Modern Greek", period: "15th century–present", family: "Hellenic" },
  el: { name: "Greek", era: "Modern Greek", period: "15th century–present", family: "Hellenic" },
  Greek: { name: "Greek", era: "Greek", period: "9th century BC–present", family: "Hellenic" },

  // Germanic
  gem: { name: "Germanic", era: "Germanic", period: "500 BC–present", family: "Germanic" },
  "Proto-Germanic": { name: "Proto-Germanic", era: "Proto-Germanic", period: "500 BC–CE", family: "Germanic" },
  "gem-pro": { name: "Proto-Germanic", era: "Proto-Germanic", period: "500 BC–CE", family: "Germanic" },
  goh: { name: "Old High German", era: "Old High German", period: "750–1050 CE", family: "Germanic" },
  "Old High German": { name: "Old High German", era: "Old High German", period: "750–1050 CE", family: "Germanic" },
  gmh: { name: "Middle High German", era: "Middle High German", period: "1050–1350", family: "Germanic" },
  deu: { name: "German", era: "German", period: "1350–present", family: "Germanic" },
  de: { name: "German", era: "German", period: "1350–present", family: "Germanic" },
  German: { name: "German", era: "German", period: "1350–present", family: "Germanic" },
  nld: { name: "Dutch", era: "Dutch", period: "1500–present", family: "Germanic" },
  nl: { name: "Dutch", era: "Dutch", period: "1500–present", family: "Germanic" },
  Dutch: { name: "Dutch", era: "Dutch", period: "1500–present", family: "Germanic" },
  odt: { name: "Old Dutch", era: "Old Dutch", period: "5th–12th century", family: "Germanic" },
  dum: { name: "Middle Dutch", era: "Middle Dutch", period: "1150–1500", family: "Germanic" },
  non: { name: "Old Norse", era: "Old Norse", period: "8th–14th century", family: "Germanic" },
  "Old Norse": { name: "Old Norse", era: "Old Norse", period: "8th–14th century", family: "Germanic" },
  nob: { name: "Norwegian", era: "Norwegian", period: "16th century–present", family: "Germanic" },
  swe: { name: "Swedish", era: "Swedish", period: "16th century–present", family: "Germanic" },
  dan: { name: "Danish", era: "Danish", period: "16th century–present", family: "Germanic" },
  isl: { name: "Icelandic", era: "Icelandic", period: "12th century–present", family: "Germanic" },
  frk: { name: "Frankish", era: "Frankish", period: "3rd–8th century", family: "Germanic" },
  Frankish: { name: "Frankish", era: "Frankish", period: "3rd–8th century", family: "Germanic" },
  "gmw-pro": { name: "Proto-West Germanic", era: "Proto-West Germanic", period: "200–700 CE", family: "Germanic" },
  "Proto-West Germanic": { name: "Proto-West Germanic", era: "Proto-West Germanic", period: "200–700 CE", family: "Germanic" },

  // Proto-Indo-European
  ine: { name: "Proto-Indo-European", era: "Proto-Indo-European", period: "4500–2500 BCE", family: "Proto-IE" },
  "ine-pro": { name: "Proto-Indo-European", era: "Proto-Indo-European", period: "4500–2500 BCE", family: "Proto-IE" },
  "Proto-Indo-European": { name: "Proto-Indo-European", era: "Proto-Indo-European", period: "4500–2500 BCE", family: "Proto-IE" },

  // Celtic
  cel: { name: "Celtic", era: "Celtic", period: "800 BC–present", family: "Celtic" },
  "Proto-Celtic": { name: "Proto-Celtic", era: "Proto-Celtic", period: "800–300 BC", family: "Celtic" },
  gle: { name: "Irish", era: "Irish", period: "12th century–present", family: "Celtic" },
  sga: { name: "Old Irish", era: "Old Irish", period: "6th–10th century", family: "Celtic" },
  cym: { name: "Welsh", era: "Welsh", period: "12th century–present", family: "Celtic" },

  // Indo-Iranian
  san: { name: "Sanskrit", era: "Sanskrit", period: "1500 BC–600 BC", family: "Indo-Iranian" },
  sa: { name: "Sanskrit", era: "Sanskrit", period: "1500 BC–600 BC", family: "Indo-Iranian" },
  Sanskrit: { name: "Sanskrit", era: "Sanskrit", period: "1500 BC–600 BC", family: "Indo-Iranian" },
  pal: { name: "Pali", era: "Pali", period: "3rd century BC–present", family: "Indo-Iranian" },
  fas: { name: "Persian", era: "Persian", period: "9th century–present", family: "Indo-Iranian" },
  fa: { name: "Persian", era: "Persian", period: "9th century–present", family: "Indo-Iranian" },
  Persian: { name: "Persian", era: "Persian", period: "9th century–present", family: "Indo-Iranian" },
  peo: { name: "Old Persian", era: "Old Persian", period: "525–300 BC", family: "Indo-Iranian" },

  // Semitic
  ara: { name: "Arabic", era: "Arabic", period: "1st century–present", family: "Semitic" },
  ar: { name: "Arabic", era: "Arabic", period: "1st century–present", family: "Semitic" },
  Arabic: { name: "Arabic", era: "Arabic", period: "1st century–present", family: "Semitic" },
  heb: { name: "Hebrew", era: "Hebrew", period: "10th century BC–present", family: "Semitic" },
  he: { name: "Hebrew", era: "Hebrew", period: "10th century BC–present", family: "Semitic" },

  // Italian / Spanish / Portuguese (Romance)
  ita: { name: "Italian", era: "Italian", period: "14th century–present", family: "Romance" },
  it: { name: "Italian", era: "Italian", period: "14th century–present", family: "Romance" },
  Italian: { name: "Italian", era: "Italian", period: "14th century–present", family: "Romance" },
  spa: { name: "Spanish", era: "Spanish", period: "13th century–present", family: "Romance" },
  es: { name: "Spanish", era: "Spanish", period: "13th century–present", family: "Romance" },
  Spanish: { name: "Spanish", era: "Spanish", period: "13th century–present", family: "Romance" },
  por: { name: "Portuguese", era: "Portuguese", period: "13th century–present", family: "Romance" },
  "itc-pro": { name: "Proto-Italic", era: "Proto-Italic", period: "1000–500 BC", family: "Romance" },
  "Proto-Italic": { name: "Proto-Italic", era: "Proto-Italic", period: "1000–500 BC", family: "Romance" },

  // East Asian
  jpn: { name: "Japanese", era: "Japanese", period: "8th century–present", family: "Japonic" },
  ja: { name: "Japanese", era: "Japanese", period: "8th century–present", family: "Japonic" },
  zho: { name: "Chinese", era: "Chinese", period: "14th century BC–present", family: "Sinitic" },
  zh: { name: "Chinese", era: "Chinese", period: "14th century BC–present", family: "Sinitic" },

  // Turkic
  tur: { name: "Turkish", era: "Turkish", period: "11th century–present", family: "Turkic" },
  tr: { name: "Turkish", era: "Turkish", period: "11th century–present", family: "Turkic" },

  // Slavic
  rus: { name: "Russian", era: "Russian", period: "15th century–present", family: "Slavic" },
  ru: { name: "Russian", era: "Russian", period: "15th century–present", family: "Slavic" },
  chu: { name: "Old Church Slavonic", era: "Old Church Slavonic", period: "9th–11th century", family: "Slavic" },
  "Proto-Slavic": { name: "Proto-Slavic", era: "Proto-Slavic", period: "2000 BC–600 CE", family: "Slavic" },

  // Misc
  xno_and_fro: { name: "Old French/Anglo-Norman", era: "Old French", period: "9th–14th century", family: "Romance" },
};

export function getLanguageMeta(code: string): LanguageMeta {
  return LANGUAGE_MAP[code] ?? {
    name: code,
    era: code,
    period: "",
    family: "Other",
  };
}

export function getFamilyColor(family: string): string {
  const colors: Record<string, string> = {
    Germanic: "#7c9eb2",
    Romance: "#b87a4b",
    Hellenic: "#8b7bb8",
    Celtic: "#6b9b6b",
    "Indo-Iranian": "#c4956a",
    Semitic: "#a67c52",
    "Proto-IE": "#c8920a",
    Slavic: "#8b9b6b",
    Turkic: "#9b7c6b",
    Japonic: "#6b8b9b",
    Sinitic: "#9b6b7c",
  };
  return colors[family] || "#ede0c0";
}

// Ordered list of language "depth" for sorting strata (modern -> ancient)
const DEPTH_ORDER: string[] = [
  "eng", "en", "English",
  "enm", "Middle English",
  "ang", "Old English",
  "fra", "fr", "French",
  "frm", "Middle French",
  "fro", "Old French",
  "xno", "Anglo-Norman",
  "nld", "nl", "Dutch",
  "dum", "Middle Dutch",
  "odt", "Old Dutch",
  "deu", "de", "German",
  "gmh", "Middle High German",
  "goh", "Old High German",
  "non", "Old Norse",
  "frk", "Frankish",
  "gmw-pro", "Proto-West Germanic",
  "lat", "la", "Latin",
  "la-med", "Medieval Latin",
  "LL", "Late Latin",
  "ML", "Medieval Latin",
  "VL", "Vulgar Latin",
  "NL", "New Latin",
  "grc", "Ancient Greek",
  "ita", "it", "Italian",
  "spa", "es", "Spanish",
  "ara", "ar", "Arabic",
  "fas", "fa", "Persian",
  "peo", "Old Persian",
  "san", "sa", "Sanskrit",
  "sga", "Old Irish",
  "itc-pro", "Proto-Italic",
  "gem-pro", "Proto-Germanic",
  "Proto-Celtic",
  "Proto-Slavic",
  "ine-pro", "ine", "Proto-Indo-European",
];

export function getLanguageDepth(code: string): number {
  const idx = DEPTH_ORDER.indexOf(code);
  return idx === -1 ? 50 : idx;
}
