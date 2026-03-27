import type { LexicaResult, DefinitionSource, WordTaxonomy, WordFrequency, ThesaurusData, WordNetSense, RogetCategory, BiblicalStudyData, PronunciationData, EtymologyLink, MorphologyData, NgramDataPoint, CognateData } from "@/types/lexica";
import { lookupWord, lookupWebster, lookupWebster1828, lookupBlacksLaw, searchBlacksLaw, lookupBouvier, lookupStrongs,
  lookupMobyThesaurus, lookupWordNet, getWordNetSynonyms, getWordNetRelations, lookupRogets,
  lookupPronunciation, lookupEastons, lookupSmiths, lookupHitchcocks, lookupNaves, lookupGcide,
  lookupScowl, lookupAcademicWord, lookupEtymologyLinks,
  lookupIpaDict, lookupCefrLevel, lookupMorphology, lookupGoogleFrequency, lookupBDB,
  lookupNgramHistory, lookupCognates } from "./database";
import { buildStrata } from "./build-strata";
import { buildConstellation } from "./build-constellation";
import { buildHiddenConnections } from "./build-connections";
import { buildRevelationText, extractCulturalMoment } from "./etymology-parser";
import { getWordFrequency, lookupInDictionary } from "./dictionaries";
import { arpabetToReadable } from "./pronunciation";

function parseJsonArray(json: string): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

export async function excavateWord(word: string): Promise<LexicaResult> {
  const entry = lookupWord(word);
  const webster = lookupWebster(word);
  const webster1828 = lookupWebster1828(word);
  const blacksLaw = lookupBlacksLaw(word);

  if (!entry && !webster && !webster1828 && !blacksLaw) {
    throw new Error(`Word "${word}" not found in database`);
  }

  // Build multi-source definitions
  const definitions: DefinitionSource[] = [];
  const wiktionaryDef = entry?.definition || "";
  const webster1828Def = webster1828?.definition || "";
  const websterDef = webster?.definition || "";
  const blacksDef = blacksLaw?.definition || "";

  if (wiktionaryDef) {
    definitions.push({
      source: "wiktionary",
      label: "Modern Usage",
      year: 2024,
      definition: wiktionaryDef,
      pos: entry?.pos,
    });
  }
  if (webster1828Def) {
    definitions.push({
      source: "webster1828",
      label: "Webster's 1828",
      year: 1828,
      definition: webster1828Def,
      pos: webster1828?.part_of_speech,
      etymology: webster1828?.etymology || undefined,
    });
  }
  if (websterDef) {
    definitions.push({
      source: "webster1913",
      label: "Webster's 1913",
      year: 1913,
      definition: websterDef,
    });
  }
  if (blacksDef) {
    definitions.push({
      source: "blacks_law",
      label: "Black's Law Dictionary",
      year: 1910,
      definition: blacksDef,
    });
  }

  // Related Black's Law entries (fuzzy match)
  const relatedBlacks = searchBlacksLaw(word);
  for (const rb of relatedBlacks) {
    definitions.push({
      source: "blacks_law",
      label: `Black's Law: ${rb.term}`,
      year: 1910,
      definition: rb.definition,
    });
  }

  // Bouvier's Law Dictionary
  const bouvier = lookupBouvier(word);
  if (bouvier) {
    definitions.push({
      source: "bouvier",
      label: "Bouvier's Law (1856)",
      year: 1856,
      definition: bouvier.definition,
    });
  }

  // Strong's Concordance (Hebrew + Greek biblical roots)
  const strongsEntries = lookupStrongs(word);
  for (const se of strongsEntries) {
    const lang = se.language === "hebrew" ? "Hebrew" : "Greek";
    const parts = [];
    if (se.lemma) parts.push(se.lemma);
    if (se.xlit) parts.push(`(${se.xlit})`);
    if (se.pron) parts.push(`[${se.pron}]`);
    parts.push("—");
    if (se.strongs_def) parts.push(se.strongs_def.replace(/^\{/, "").replace(/\}$/, ""));
    const def = parts.join(" ");

    definitions.push({
      source: "strongs",
      label: `Strong's ${lang} (${se.id})`,
      year: 1890,
      definition: def,
    });
  }

  // New dictionaries
  const hobsonJobson = lookupInDictionary("hobson-jobson", word);
  if (hobsonJobson) {
    definitions.push({
      source: "hobson_jobson",
      label: "Hobson-Jobson",
      year: 1886,
      definition: hobsonJobson.definition,
    });
  }

  const vulgarTongue = lookupInDictionary("vulgar-tongue", word);
  if (vulgarTongue) {
    definitions.push({
      source: "vulgar_tongue",
      label: "1811 Vulgar Tongue",
      year: 1811,
      definition: vulgarTongue.definition,
    });
  }

  // Primary definition for backward compat
  const definition = wiktionaryDef || websterDef || webster1828Def || blacksDef;

  // Etymology
  const etymologyText = entry?.etymology_text || "";
  const etymologyTemplates = entry?.etymology_templates || "";
  const ipa = entry?.ipa || "";
  const relatedWords = entry?.related_words || "";

  // Build strata
  const strata = buildStrata(word, etymologyText, etymologyTemplates, definition);

  const deepestRoot = strata.length > 1 ? strata[strata.length - 1] : null;
  const etymSource = deepestRoot
    ? { word: deepestRoot.form, lang: deepestRoot.language }
    : undefined;
  const constellation = buildConstellation(word, relatedWords, etymSource);

  const rootRevelation = buildRevelationText(
    word,
    deepestRoot?.form || "",
    deepestRoot?.language || "",
    "",
    etymologyText
  );

  const culturalMoment = extractCulturalMoment(etymologyText, word);

  // Build truest_meaning (etymology narrative)
  let truestMeaning = etymologyText;
  if (!truestMeaning && webster1828Def) {
    truestMeaning = `Webster's 1828: ${webster1828Def}`;
  }
  if (!truestMeaning) {
    truestMeaning = definition || `The word "${word}" is part of the English lexicon.`;
  }

  // Build taxonomy from new Kaikki fields
  let taxonomy: WordTaxonomy | undefined;
  if (entry) {
    const hypernyms = parseJsonArray(entry.hypernyms);
    const hyponyms = parseJsonArray(entry.hyponyms);
    const antonyms = parseJsonArray(entry.antonyms);
    const coordinate_terms = parseJsonArray(entry.coordinate_terms);

    if (hypernyms.length > 0 || hyponyms.length > 0 || antonyms.length > 0 || coordinate_terms.length > 0) {
      taxonomy = { hypernyms, hyponyms, antonyms, coordinate_terms };
    }
  }

  // === Phase 1: Thesaurus ===
  let thesaurus: ThesaurusData | undefined;
  const moby = lookupMobyThesaurus(word);
  const wordnetSynsets = lookupWordNet(word);
  const rogetEntries = lookupRogets(word);

  if (moby || wordnetSynsets.length > 0 || rogetEntries.length > 0) {
    const synonyms = moby ? moby.synonyms.split(",").map(s => s.trim()).filter(Boolean).slice(0, 50) : [];

    const wordnetSenses: WordNetSense[] = wordnetSynsets.map(ws => {
      const examples = (() => { try { return JSON.parse(ws.examples) as string[]; } catch { return []; } })();
      const synWords = getWordNetSynonyms(ws.synset_id).filter(w => w !== word);
      const hypernyms = getWordNetRelations(ws.synset_id, "hypernym", 3).map(h => h.definition);
      const hyponyms = getWordNetRelations(ws.synset_id, "hyponym", 3).map(h => h.definition);
      return {
        pos: ws.pos,
        definition: ws.definition,
        examples,
        synonyms: synWords.slice(0, 8),
        hypernyms,
        hyponyms,
      };
    });

    const rogetCategories: RogetCategory[] = rogetEntries.map(r => ({
      number: r.category_num,
      name: r.category_name,
      relatedWords: r.words.split(/[,;]/).map(w => w.trim()).filter(w => w && w.length < 30).slice(0, 15),
    }));

    thesaurus = { synonyms, wordnetSenses, rogetCategories };
  }

  // === Phase 2: Pronunciation ===
  let pronunciation: PronunciationData | undefined;
  const cmuEntries = lookupPronunciation(word);
  const ipaDictEntry = lookupIpaDict(word);
  const bestIpa = ipa || ipaDictEntry || "";
  if (bestIpa || cmuEntries.length > 0) {
    pronunciation = {
      ipa: bestIpa,
      arpabet: cmuEntries.length > 0 ? cmuEntries.map(c => c.phonemes) : undefined,
    };
  }

  // === Phase 3: Biblical ===
  let biblical: BiblicalStudyData | undefined;
  const eastons = lookupEastons(word);
  const smiths = lookupSmiths(word);
  const hitchcocks = lookupHitchcocks(word);
  const navesEntries = lookupNaves(word);

  if (eastons || smiths || hitchcocks || navesEntries.length > 0) {
    biblical = {};
    if (eastons) biblical.eastons = { definition: eastons.definition };
    if (smiths) biblical.smiths = { definition: smiths.definition };
    if (hitchcocks) biblical.hitchcocks = { meaning: hitchcocks.meaning };
    if (navesEntries.length > 0) {
      biblical.naves = navesEntries.map(n => ({
        topic: n.topic,
        subtopics: (() => { try { return JSON.parse(n.subtopics) as string[]; } catch { return []; } })(),
        references: (() => { try { return JSON.parse(n.refs) as string[]; } catch { return []; } })(),
      }));
    }
  }

  // Also add biblical dicts to definitions
  if (eastons) {
    definitions.push({ source: "eastons", label: "Easton's Bible Dict.", year: 1897, definition: eastons.definition });
  }
  if (smiths) {
    definitions.push({ source: "smiths", label: "Smith's Bible Dict.", year: 1863, definition: smiths.definition });
  }

  // === Phase 4: Enrichment ===
  // GCIDE
  const gcide = lookupGcide(word);
  if (gcide) {
    definitions.push({
      source: "gcide",
      label: "GCIDE",
      year: 2024,
      definition: gcide.definition,
      pos: gcide.pos || undefined,
      etymology: gcide.etymology || undefined,
    });
  }

  // SCOWL dialect info
  const scowl = lookupScowl(word);
  const dialect = scowl ? [scowl.dialect] : undefined;

  // Academic Word List
  const awl = lookupAcademicWord(word);
  const isAcademic = awl ? { sublist: awl.sublist } : undefined;

  // Etymology-DB links
  const etymLinks = lookupEtymologyLinks(word);
  const etymologyLinks: EtymologyLink[] | undefined = etymLinks.length > 0
    ? etymLinks.map(l => ({ parentWord: l.parent_word, parentLang: l.parent_lang, relationType: l.relation_type }))
    : undefined;

  // === Phase 5: New enrichment ===
  const cefrLevel = lookupCefrLevel(word) || undefined;

  const morphoRow = lookupMorphology(word);
  const morphology: MorphologyData | undefined = morphoRow && morphoRow.morphemes
    ? { morphemes: morphoRow.morphemes, prefix: morphoRow.prefix, root: morphoRow.root, suffix: morphoRow.suffix, morphemeCount: morphoRow.morpheme_count }
    : undefined;

  const googleRank = lookupGoogleFrequency(word) || undefined;

  // === Phase 6: Ngrams & Cognates ===
  const ngramRows = lookupNgramHistory(word);
  const ngramHistory: NgramDataPoint[] | undefined = ngramRows.length > 0
    ? ngramRows.map(r => ({ decade: r.decade, frequency: r.frequency }))
    : undefined;

  const cognateRows = lookupCognates(word);
  const cognates: CognateData | undefined = cognateRows.length > 0
    ? {
        cognates: cognateRows.map(r => ({
          word: r.cognate_word,
          language: r.cognate_lang,
          languageName: r.cognate_lang_name,
          sharedAncestor: r.shared_ancestor,
          ancestorLang: r.ancestor_lang,
        })),
      }
    : undefined;

  // === Phase 7: Hidden Connections ===
  const hiddenConnections = buildHiddenConnections(
    word, etymologyTemplates, etymologyText,
    morphology, strata, definitions, strongsEntries,
    webster1828?.etymology || undefined,
    etymologyLinks,
    thesaurus,
  );

  return {
    word,
    phonetic: bestIpa || ipa,
    modern_meaning: definition,
    strata: strata.length > 0 ? strata : [{
      era: "Modern English",
      period: "Present",
      form: word,
      language: "English",
      meaning: definition || `The word "${word}".`,
      is_root: true,
      language_family: "Germanic",
    }],
    truest_meaning: truestMeaning,
    root_revelation: rootRevelation,
    cultural_moment: culturalMoment,
    constellation,
    definitions,
    taxonomy,
    thesaurus,
    biblical,
    pronunciation,
    webster1828_etymology: webster1828?.etymology || undefined,
    frequency: getWordFrequency(word) || undefined,
    isAcademic,
    cefrLevel,
    morphology,
    dialect,
    etymologyLinks,
    googleRank,
    hiddenConnections,
    ngramHistory,
    cognates,
  };
}
