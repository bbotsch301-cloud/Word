export interface Stratum {
  era: string;
  period: string;
  form: string;
  language: string;
  meaning: string;
  shift?: string;
  is_root: boolean;
}

export interface ConstellationWord {
  word: string;
  relationship: string;
}

export interface CulturalMoment {
  period: string;
  description: string;
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
}
