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

export interface DefinitionSource {
  source: "wiktionary" | "webster1828" | "webster1913" | "blacks_law";
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
  webster1828_etymology?: string;
}
