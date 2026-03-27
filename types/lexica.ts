export type RelationshipType = "inherited" | "borrowed" | "derived" | "root" | "unknown";

export interface Stratum {
  era: string;
  period: string;
  form: string;
  language: string;
  meaning: string;
  shift?: string;
  is_root: boolean;
  relationship_type?: RelationshipType;
  language_family?: string;
}

export interface ConstellationWord {
  word: string;
  relationship: string;
}

export interface CulturalMoment {
  period: string;
  description: string;
}

export interface WordFrequency {
  rank: number;
  zipf: number;
  label: string;
}

export interface DefinitionSource {
  source: "wiktionary" | "webster1828" | "webster1913" | "blacks_law" | "hobson_jobson" | "vulgar_tongue" | "bouvier" | string;
  label: string;
  year: number;
  definition: string;
  pos?: string;
  etymology?: string;
}

export interface WordTaxonomy {
  hypernyms: string[];
  hyponyms: string[];
  antonyms: string[];
  coordinate_terms: string[];
}

// Thesaurus types
export interface WordNetSense {
  pos: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  hypernyms: string[];
  hyponyms: string[];
}

export interface RogetCategory {
  number: number;
  name: string;
  relatedWords: string[];
}

export interface ThesaurusData {
  synonyms: string[];
  wordnetSenses: WordNetSense[];
  rogetCategories: RogetCategory[];
}

// Pronunciation types
export interface PronunciationData {
  ipa: string;
  arpabet?: string[];
}

// Biblical study types
export interface BiblicalStudyData {
  eastons?: { definition: string };
  hitchcocks?: { meaning: string };
  naves?: { topic: string; subtopics: string[]; references: string[] }[];
}

// Etymology link types
export interface EtymologyLink {
  parentWord: string;
  parentLang: string;
  relationType: string;
}

export interface LexicaResult {
  word: string;
  phonetic: string;
  modern_meaning: string;
  strata: Stratum[];
  truest_meaning: string;
  root_revelation: string;
  cultural_moment: CulturalMoment;
  constellation: ConstellationWord[];
  definitions: DefinitionSource[];
  taxonomy?: WordTaxonomy;
  thesaurus?: ThesaurusData;
  biblical?: BiblicalStudyData;
  pronunciation?: PronunciationData;
  webster1828_etymology?: string;
  frequency?: WordFrequency;
  isAcademic?: { sublist: number };
  dialect?: string[];
  etymologyLinks?: EtymologyLink[];
}
