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
  smiths?: { definition: string };
  hitchcocks?: { meaning: string };
  naves?: { topic: string; subtopics: string[]; references: string[] }[];
}

// Morphology types
export interface MorphologyData {
  morphemes: string;
  prefix: string;
  root: string;
  suffix: string;
  morphemeCount: number;
}

// Etymology link types
export interface EtymologyLink {
  parentWord: string;
  parentLang: string;
  relationType: string;
}

// Hidden Connections types
export interface HiddenConnection {
  type:
    | "word_splitting"
    | "root_siblings"
    | "meaning_shift"
    | "cross_cultural"
    | "biblical_echo"
    | "secret_story"
    | "doublets"
    | "semantic_flip"
    | "part_whole"
    | "concept_map"
    | "polysemy"
    | "borrowing_chain";
  headline: string;
  description: string;
  surpriseScore: number;
  evidence: ConnectionEvidence;
}

export interface ConnectionEvidence {
  parts?: { fragment: string; meaning: string; language: string }[];
  sharedRoot?: { root: string; language: string; meaning?: string };
  siblings?: string[];
  oldMeaning?: string;
  newMeaning?: string;
  period?: string;
  languageChain?: { word: string; language: string }[];
  strongsId?: string;
  originalWord?: string;
  originalLanguage?: string;
  // Secret Story
  literalMeaning?: string;
  originStory?: string;
  sourceLanguage?: string;
  // Doublets
  doubletWords?: string[];
  sharedAncestor?: string;
  // Part-Whole
  partsOf?: string[];
  hasParts?: string[];
  // Concept Map
  conceptName?: string;
  conceptNeighbors?: string[];
  // Polysemy
  senseCount?: number;
  sampleSenses?: string[];
  // Borrowing Chain
  borrowingSteps?: { word: string; language: string; type: string }[];
}

export interface HiddenConnectionsData {
  connections: HiddenConnection[];
  wordEquation?: string;
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
  cefrLevel?: string;
  morphology?: MorphologyData;
  dialect?: string[];
  etymologyLinks?: EtymologyLink[];
  googleRank?: number;
  hiddenConnections?: HiddenConnectionsData;
}
