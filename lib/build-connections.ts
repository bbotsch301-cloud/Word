import type {
  HiddenConnection,
  HiddenConnectionsData,
  Stratum,
  DefinitionSource,
  MorphologyData,
  EtymologyLink,
  ThesaurusData,
  RogetCategory,
} from "@/types/lexica";
import type { StrongsRow } from "./database";
import {
  findWordsByEtymologyRoot,
  getWordNetMeronyms,
  getWordNetHolonyms,
  getPolysemyCount,
  findDoublets,
  getBorrowingChain,
  lookupRogets,
} from "./database";

// === Connection Type 1: Word Splitting ===
function buildWordSplitting(
  word: string,
  etymologyTemplates: string,
  etymologyText: string,
  morphology: MorphologyData | undefined
): HiddenConnection | undefined {
  const parts: { fragment: string; meaning: string; language: string }[] = [];

  if (etymologyTemplates) {
    try {
      const templates = JSON.parse(etymologyTemplates) as Record<string, unknown>[];
      const etymTemplates = templates.filter((t) => {
        const name = (t.name as string) || "";
        return /^(inh|bor|der|inherited|borrowed|derived|affix|prefix|suffix|compound|com)/.test(name);
      });

      for (const t of etymTemplates) {
        const args = t.args as Record<string, string> | undefined;
        if (!args) continue;
        const form = args["3"] || args["2"] || "";
        const meaning = args["t"] || args["gloss"] || args["5"] || args["4"] || "";
        const lang = args["2"] || "";
        if (form && meaning && form !== "-" && form !== word) {
          parts.push({ fragment: form, meaning, language: lang });
        }
      }
    } catch {
      // ignore
    }
  }

  let literalMeaning = "";
  if (etymologyText) {
    const literalMatch = etymologyText.match(
      /literally\s+[""\u201c]([^""\u201d]+)[""\u201d]|literally\s+([^.,;"]+)/i
    );
    if (literalMatch) {
      literalMeaning = (literalMatch[1] || literalMatch[2] || "").trim();
    }
  }

  if (parts.length === 0 && morphology && morphology.morphemeCount >= 2) {
    const morphemes = morphology.morphemes.split(/[><{}\-]+/).filter(Boolean);
    for (const m of morphemes) {
      if (m.length > 1) {
        parts.push({ fragment: m, meaning: "", language: "English" });
      }
    }
  }

  if (parts.length < 2 && !literalMeaning) return undefined;

  const hasRichParts = parts.some((p) => p.meaning);
  const headline =
    hasRichParts
      ? parts.map((p) => `${p.fragment} (${p.meaning})`).join(" + ")
      : literalMeaning
        ? `literally "${literalMeaning}"`
        : parts.map((p) => p.fragment).join(" + ");

  return {
    type: "word_splitting",
    headline: `${word} = ${headline}`,
    description: literalMeaning
      ? `The word "${word}" literally means "${literalMeaning}" when traced to its root components.`
      : `The word "${word}" is composed of ${parts.length} distinct elements, each carrying its own ancient meaning.`,
    surpriseScore: hasRichParts ? 0.9 : literalMeaning ? 0.85 : 0.5,
    evidence: {
      parts: hasRichParts ? parts : undefined,
    },
  };
}

// === Connection Type 2: Root Siblings ===
async function buildRootSiblings(
  word: string,
  etymologyTemplates: string
): Promise<HiddenConnection | undefined> {
  if (!etymologyTemplates) return undefined;

  let rootForm = "";
  let rootLang = "";

  try {
    const templates = JSON.parse(etymologyTemplates) as Record<string, unknown>[];
    for (const t of templates) {
      if ((t.name as string) === "root") {
        const args = t.args as Record<string, string> | undefined;
        if (args) {
          rootLang = args["2"] || "";
          rootForm = args["3"] || "";
          break;
        }
      }
    }
  } catch {
    return undefined;
  }

  if (!rootForm || !rootLang) return undefined;

  const siblings = await findWordsByEtymologyRoot(rootForm, word, 15);
  if (siblings.length < 2) return undefined;

  const prefix = word.toLowerCase().slice(0, 3);
  const surprisingSiblings = siblings.filter(
    (s) => s.toLowerCase().slice(0, 3) !== prefix
  );
  const displaySiblings = surprisingSiblings.length >= 2
    ? surprisingSiblings.slice(0, 8)
    : siblings.slice(0, 8);

  const isSurprising = surprisingSiblings.length >= 2;

  return {
    type: "root_siblings",
    headline: `Shares ancient root ${rootForm} with ${displaySiblings.slice(0, 3).join(", ")}`,
    description: `"${word}" and words like "${displaySiblings[0]}" and "${displaySiblings[1]}" all descend from the same ${rootLang === "ine-pro" ? "Proto-Indo-European" : rootLang} root ${rootForm}.`,
    surpriseScore: isSurprising ? 0.85 : 0.4,
    evidence: {
      sharedRoot: {
        root: rootForm,
        language: rootLang === "ine-pro" ? "Proto-Indo-European" : rootLang,
      },
      siblings: displaySiblings,
    },
  };
}

// === Connection Type 3: Meaning Shift ===
function buildMeaningShift(
  word: string,
  definitions: DefinitionSource[],
  strata: Stratum[],
  etymologyText: string
): HiddenConnection | undefined {
  const sorted = [...definitions].sort((a, b) => a.year - b.year);
  const oldest = sorted.find(
    (d) => d.source === "webster1828" || d.source === "webster1913" || d.year < 1920
  );
  const modern = sorted.find(
    (d) => d.source === "wiktionary" || d.year >= 2000
  );

  let etymShift = "";
  if (etymologyText) {
    const shiftMatch = etymologyText.match(
      /originally\s+(?:meant?\s+)?[""]?([^"".,;]+)[""]?|formerly\s+[""]?([^"".,;]+)[""]?|once\s+meant\s+[""]?([^"".,;]+)[""]?|first\s+meant\s+[""]?([^"".,;]+)[""]?/i
    );
    if (shiftMatch) {
      etymShift = (shiftMatch[1] || shiftMatch[2] || shiftMatch[3] || shiftMatch[4] || "").trim();
    }
  }

  const deepestRoot = strata.length > 1 ? strata[strata.length - 1] : null;
  const rootMeaning = deepestRoot?.meaning?.match(/Meaning "([^"]+)"/)?.[1];

  if (!oldest && !etymShift && !rootMeaning) return undefined;

  const oldMeaning = etymShift
    || (oldest ? oldest.definition.split(/[.;]/)[0].trim() : "")
    || rootMeaning
    || "";
  const newMeaning = modern
    ? modern.definition.split(/[.;]/)[0].trim()
    : definitions[0]?.definition.split(/[.;]/)[0].trim() || "";

  if (!oldMeaning || !newMeaning) return undefined;

  const oldWords = new Set(oldMeaning.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const newWords = new Set(newMeaning.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  let overlap = 0;
  for (const w of oldWords) {
    if (newWords.has(w)) overlap++;
  }
  const maxSize = Math.max(oldWords.size, newWords.size, 1);
  const overlapRatio = overlap / maxSize;

  if (overlapRatio > 0.5) return undefined;

  const period = oldest ? `${oldest.year}` : deepestRoot?.era || "";

  return {
    type: "meaning_shift",
    headline: `Meaning appears to have shifted since ${period || "ancient times"}`,
    description: etymShift
      ? `"${word}" may have originally meant "${etymShift}" — compare historical and modern definitions below.`
      : `The meaning of "${word}" appears to have shifted over the centuries — compare historical and modern definitions below.`,
    surpriseScore: overlapRatio < 0.2 ? 0.85 : 0.6,
    evidence: {
      oldMeaning: oldMeaning.slice(0, 200),
      newMeaning: newMeaning.slice(0, 200),
      period,
    },
  };
}

// === Connection Type 4: Cross-Cultural Journey ===
function buildCrossCultural(
  word: string,
  strata: Stratum[],
  definitions: DefinitionSource[]
): HiddenConnection | undefined {
  if (strata.length < 3) return undefined;

  const families = new Set<string>();
  const chain: { word: string; language: string }[] = [];

  for (const s of strata) {
    if (s.language_family) families.add(s.language_family);
    chain.push({ word: s.form, language: s.language });
  }

  let score = 0;
  if (families.size >= 3) score = 0.7;
  else if (families.size >= 2 && strata.length >= 4) score = 0.55;
  else return undefined;

  const hasHobsonJobson = definitions.some((d) => d.source === "hobson_jobson");
  const hasVulgarTongue = definitions.some((d) => d.source === "vulgar_tongue");
  if (hasHobsonJobson) score += 0.15;
  if (hasVulgarTongue) score += 0.1;

  const deepest = strata[strata.length - 1];
  const nonIE = deepest?.language_family && !["Indo-European", "Germanic", "Romance", "Celtic", "Italic"].includes(deepest.language_family);
  if (nonIE) score += 0.15;

  const origin = strata[strata.length - 1]?.language || "unknown";
  const familyList = [...families].filter((f) => f).join(", ");

  return {
    type: "cross_cultural",
    headline: `Traveled through ${families.size} language families`,
    description: `"${word}" journeyed from ${origin} through ${strata.length} languages${familyList ? ` crossing ${familyList}` : ""} before arriving in Modern English.`,
    surpriseScore: Math.min(score, 1),
    evidence: {
      languageChain: chain,
    },
  };
}

// === Connection Type 5: Biblical Echo ===
function buildBiblicalEcho(
  word: string,
  strongsEntries: StrongsRow[]
): HiddenConnection | undefined {
  if (strongsEntries.length === 0) return undefined;

  const entry = strongsEntries[0];
  const lang = entry.language === "hebrew" ? "Hebrew" : "Greek";
  const def = (entry.strongs_def || "").replace(/^\{/, "").replace(/\}$/, "").trim();

  if (!def) return undefined;

  const modernWords = new Set(word.toLowerCase().split(/\W+/));
  const biblicalWords = new Set(def.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  let overlap = 0;
  for (const w of modernWords) {
    if (biblicalWords.has(w)) overlap++;
  }
  const diverges = overlap === 0;

  return {
    type: "biblical_echo",
    headline: `${lang}: ${entry.lemma || ""} (${entry.xlit || ""})`,
    description: diverges
      ? `In biblical ${lang}, "${word}" connects to "${entry.lemma}" meaning "${def.slice(0, 120)}" — a deeper layer of meaning beyond modern usage.`
      : `The biblical ${lang} root "${entry.lemma}" (${entry.xlit}) carries the meaning: ${def.slice(0, 120)}.`,
    surpriseScore: diverges ? 0.8 : 0.55,
    evidence: {
      strongsId: entry.id,
      originalWord: entry.lemma || "",
      originalLanguage: lang,
    },
  };
}

// === NEW Connection Type 6: Secret Story ===
function buildSecretStory(
  word: string,
  etymologyText: string,
  webster1828Etymology: string | undefined,
  definitions: DefinitionSource[]
): HiddenConnection | undefined {
  // Look for vivid origin stories: animals, body parts, mythology, objects
  const allEtymText = [etymologyText, webster1828Etymology || ""].join(" ");
  if (!allEtymText || allEtymText.length < 20) return undefined;

  // Pattern: "from Latin X meaning Y" or "from Greek X 'Y'"
  const storyPatterns = [
    // "from Latin musculus 'little mouse'"
    /from\s+(?:Latin|Greek|Old French|Arabic|Sanskrit|Persian)\s+(\S+)\s+["'\u201c]([^"'\u201d]+)["'\u201d]/i,
    // "named after/for X"
    /named\s+(?:after|for)\s+([^.,;]+)/i,
    // "so called because X"
    /so\s+called\s+because\s+([^.;]+)/i,
    // "originally referred to X"
    /originally\s+referred\s+to\s+([^.;]+)/i,
    // "from the practice of X"
    /from\s+the\s+(?:practice|custom|habit|belief|idea|notion)\s+(?:of|that)\s+([^.;]+)/i,
  ];

  let story = "";
  let sourceForm = "";

  for (const pat of storyPatterns) {
    const m = allEtymText.match(pat);
    if (m) {
      sourceForm = m[1] || "";
      story = m[2] || m[1] || "";
      break;
    }
  }

  // Also check for mythology, body parts, animals in etymology
  const mythKeywords = /\b(god|goddess|deity|titan|muse|nymph|Pan|Mars|Venus|Mercury|Jupiter|Apollo|Minerva|Atlas|Prometheus)\b/i;
  const animalKeywords = /\b(mouse|horse|bull|snake|serpent|bird|eagle|lion|wolf|fox|dog|cat|bear|fish|crow|raven|bee|ant|spider|pig|goat|sheep|cow|deer|ox)\b/i;
  const bodyKeywords = /\b(head|eye|hand|foot|heart|bone|blood|mouth|tongue|tooth|finger|arm|leg|belly|skin|skull|brain)\b/i;

  const hasMythology = mythKeywords.test(allEtymText);
  const hasAnimal = animalKeywords.test(allEtymText);
  const hasBody = bodyKeywords.test(allEtymText);

  // Extract the literal meaning if we found a pattern
  let literalMeaning = "";
  const literalMatch = allEtymText.match(
    /literally\s+[""\u201c]([^""\u201d]+)[""\u201d]|literally\s+["']([^"']+)["']|literally\s+([^.,;"]+)/i
  );
  if (literalMatch) {
    literalMeaning = (literalMatch[1] || literalMatch[2] || literalMatch[3] || "").trim();
  }

  if (!story && !literalMeaning && !hasMythology && !hasAnimal && !hasBody) return undefined;

  // Build rich description
  const displayMeaning = literalMeaning || story;
  let category = "";
  if (hasMythology) category = "mythology";
  else if (hasAnimal) category = "the animal kingdom";
  else if (hasBody) category = "the human body";

  // Extract source language
  const langMatch = allEtymText.match(/from\s+(Latin|Greek|Old French|Arabic|Sanskrit|Persian|Old English|Old Norse|Germanic|Hebrew)/i);
  const sourceLang = langMatch ? langMatch[1] : "";

  const headline = displayMeaning
    ? `Literally means "${displayMeaning}"`
    : category
      ? `Hidden connection to ${category}`
      : `Surprising origin story`;

  let description = "";
  if (displayMeaning && sourceLang) {
    description = `In ${sourceLang}, "${word}" literally meant "${displayMeaning}." `;
  } else if (displayMeaning) {
    description = `"${word}" literally meant "${displayMeaning}" in its original language. `;
  }

  if (category) {
    description += `This word has a hidden connection to ${category} — `;
    if (hasAnimal) {
      const animalMatch = allEtymText.match(animalKeywords);
      description += `its etymology traces back to the word for "${animalMatch?.[1] || "an animal"}," reflecting how ancient people saw the world through nature.`;
    } else if (hasMythology) {
      const mythMatch = allEtymText.match(mythKeywords);
      description += `it derives from ${mythMatch?.[1] || "a mythological figure"}, showing how ancient beliefs shaped everyday language.`;
    } else if (hasBody) {
      const bodyMatch = allEtymText.match(bodyKeywords);
      description += `it connects back to the ${bodyMatch?.[1] || "body"}, revealing how our ancestors used their physical experience to name abstract concepts.`;
    }
  } else if (!description) {
    description = `"${word}" carries a surprising origin story hidden in its etymology that most speakers never suspect.`;
  }

  const score = (displayMeaning ? 0.6 : 0.4)
    + (hasMythology ? 0.2 : 0)
    + (hasAnimal ? 0.2 : 0)
    + (hasBody ? 0.15 : 0)
    + (sourceLang ? 0.05 : 0);

  return {
    type: "secret_story",
    headline,
    description: description.trim(),
    surpriseScore: Math.min(score, 0.95),
    evidence: {
      literalMeaning: displayMeaning || undefined,
      originStory: story || undefined,
      sourceLanguage: sourceLang || undefined,
    },
  };
}

// === NEW Connection Type 7: Doublets & Cousins ===
async function buildDoublets(
  word: string,
  etymologyTemplates: string
): Promise<HiddenConnection | undefined> {
  // Check for doublet template in etymology
  const doubletWords = await findDoublets(word);
  if (doubletWords.length === 0) return undefined;

  // Try to find the shared ancestor
  let sharedAncestor = "";
  try {
    const templates = JSON.parse(etymologyTemplates) as Record<string, unknown>[];
    for (const t of templates) {
      const name = (t.name as string) || "";
      if (/^(inh|bor|der)/.test(name)) {
        const args = t.args as Record<string, string> | undefined;
        if (args && args["3"]) {
          sharedAncestor = args["3"];
          break;
        }
      }
    }
  } catch {
    // ignore
  }

  const display = doubletWords.slice(0, 5);

  return {
    type: "doublets",
    headline: `Doublet of ${display.join(", ")}`,
    description: `"${word}" and "${display[0]}" are doublets — they both descend from the same ancestor word${sharedAncestor ? ` "${sharedAncestor}"` : ""} but entered English through different paths (e.g., one via French, the other directly from Latin). Same DNA, different journey.`,
    surpriseScore: 0.88,
    evidence: {
      doubletWords: display,
      sharedAncestor: sharedAncestor || undefined,
    },
  };
}

// === NEW Connection Type 8: Semantic Flip ===
function buildSemanticFlip(
  word: string,
  definitions: DefinitionSource[],
  etymologyText: string
): HiddenConnection | undefined {
  // Look for words where meaning completely reversed or flipped valence
  const flipPatterns = [
    /originally\s+(?:meant?|signified)\s+[""]?([^"".,;]+)/i,
    /(?:earlier|archaic|obsolete)\s+(?:sense|meaning)\s+(?:of|was)\s+[""]?([^"".,;]+)/i,
    /the\s+(?:original|earliest)\s+(?:sense|meaning)\s+was\s+[""]?([^"".,;]+)/i,
  ];

  let originalMeaning = "";
  for (const pat of flipPatterns) {
    const m = etymologyText.match(pat);
    if (m) {
      originalMeaning = m[1].trim();
      break;
    }
  }

  // Check Webster 1828 vs Wiktionary for valence flip
  const webster = definitions.find((d) => d.source === "webster1828");
  const modern = definitions.find((d) => d.source === "wiktionary");

  if (!webster || !modern) {
    if (!originalMeaning) return undefined;
  }

  const oldDef = originalMeaning || (webster ? webster.definition.split(/[.;]/)[0].trim() : "");
  const newDef = modern ? modern.definition.split(/[.;]/)[0].trim() : definitions[0]?.definition?.split(/[.;]/)[0].trim() || "";

  if (!oldDef || !newDef) return undefined;

  // Detect valence flip: positive -> negative or vice versa
  const positiveWords = new Set(["good", "great", "worthy", "noble", "sacred", "blessed", "holy", "awe", "reverence", "excellent", "pleasant", "happy", "fortunate", "wonderful", "terrifying", "terror", "fear"]);
  const negativeWords = new Set(["bad", "foolish", "silly", "stupid", "wicked", "evil", "terrible", "awful", "dreadful", "ignorant", "simple", "mean", "poor", "vulgar", "common"]);

  const oldLower = oldDef.toLowerCase();
  const newLower = newDef.toLowerCase();

  let oldPositive = 0, oldNegative = 0, newPositive = 0, newNegative = 0;
  for (const w of oldLower.split(/\W+/)) {
    if (positiveWords.has(w)) oldPositive++;
    if (negativeWords.has(w)) oldNegative++;
  }
  for (const w of newLower.split(/\W+/)) {
    if (positiveWords.has(w)) newPositive++;
    if (negativeWords.has(w)) newNegative++;
  }

  const flipped = (oldPositive > oldNegative && newNegative > newPositive) ||
    (oldNegative > oldPositive && newPositive > newNegative);

  if (!flipped && !originalMeaning) return undefined;

  return {
    type: "semantic_flip",
    headline: flipped ? `Meaning completely reversed over time` : `Originally meant something very different`,
    description: flipped
      ? `"${word}" underwent a dramatic valence flip — it once carried ${oldPositive > oldNegative ? "positive" : "negative"} connotations ("${oldDef.slice(0, 80)}") but now means the ${newPositive > newNegative ? "opposite" : "reverse"} ("${newDef.slice(0, 80)}"). Language can do a complete 180.`
      : `"${word}" originally meant "${originalMeaning}" — a meaning that would surprise most modern speakers. Over centuries of use, it drifted far from its roots.`,
    surpriseScore: flipped ? 0.92 : 0.7,
    evidence: {
      oldMeaning: oldDef.slice(0, 200),
      newMeaning: newDef.slice(0, 200),
    },
  };
}

// === NEW Connection Type 9: Part-Whole Web ===
async function buildPartWhole(
  word: string
): Promise<HiddenConnection | undefined> {
  const meronyms = await getWordNetMeronyms(word);
  const holonyms = await getWordNetHolonyms(word);

  if (meronyms.length === 0 && holonyms.length === 0) return undefined;

  const partsOf = holonyms.map((h) => h.word);
  const hasParts = meronyms.map((m) => m.word);

  let headline = "";
  let description = "";

  if (hasParts.length > 0 && partsOf.length > 0) {
    headline = `Contains ${hasParts.length} parts, belongs to ${partsOf.length} wholes`;
    description = `"${word}" is part of ${partsOf.slice(0, 3).join(", ")}${partsOf.length > 3 ? "..." : ""}, and itself contains ${hasParts.slice(0, 3).join(", ")}${hasParts.length > 3 ? "..." : ""}. Every concept sits in a web of containment — zoom in or zoom out, and the connections multiply.`;
  } else if (hasParts.length > 0) {
    headline = `Contains ${hasParts.length} conceptual parts`;
    description = `"${word}" can be broken down into ${hasParts.slice(0, 4).join(", ")}${hasParts.length > 4 ? " and more" : ""}. Language maps how we mentally decompose the world into smaller pieces.`;
  } else {
    headline = `Part of ${partsOf.slice(0, 3).join(", ")}`;
    description = `"${word}" belongs to ${partsOf.slice(0, 4).join(", ")}${partsOf.length > 4 ? " and more" : ""}. Tracing these part-whole relationships reveals how our minds organize reality into nested layers.`;
  }

  const total = hasParts.length + partsOf.length;

  return {
    type: "part_whole",
    headline,
    description,
    surpriseScore: total >= 6 ? 0.75 : total >= 3 ? 0.6 : 0.45,
    evidence: {
      partsOf: partsOf.length > 0 ? partsOf.slice(0, 8) : undefined,
      hasParts: hasParts.length > 0 ? hasParts.slice(0, 8) : undefined,
    },
  };
}

// === NEW Connection Type 10: Concept Map (Roget's) ===
async function buildConceptMap(
  word: string,
  thesaurus: ThesaurusData | undefined
): Promise<HiddenConnection | undefined> {
  // Use Roget's categories to find surprising conceptual neighbors
  const rogetEntries = await lookupRogets(word, 3);
  if (rogetEntries.length === 0) return undefined;

  // Find the most interesting category (one with diverse words)
  let bestCategory = rogetEntries[0];
  let bestNeighbors: string[] = [];

  for (const r of rogetEntries) {
    const words = r.words.split(/[,;]/).map((w) => w.trim()).filter((w) => w && w.length < 25 && w !== word);
    // Pick words that look least related to the search word
    const surprising = words.filter((w) => {
      const prefix = word.toLowerCase().slice(0, 3);
      return w.toLowerCase().slice(0, 3) !== prefix && w.length > 2;
    });
    if (surprising.length > bestNeighbors.length) {
      bestCategory = r;
      bestNeighbors = surprising;
    }
  }

  if (bestNeighbors.length < 3) return undefined;

  const display = bestNeighbors.slice(0, 10);
  const categoryNames = rogetEntries.map((r) => r.category_name);

  return {
    type: "concept_map",
    headline: `Filed under "${bestCategory.category_name}" in Roget's Thesaurus`,
    description: `Roget's doesn't organize by spelling — it groups by concept. "${word}" shares conceptual space with words like ${display.slice(0, 3).map((w) => `"${w}"`).join(", ")} under the category "${bestCategory.category_name}."${categoryNames.length > 1 ? ` It also appears in ${categoryNames.slice(1).map((n) => `"${n}"`).join(" and ")}.` : ""} These unexpected neighbors reveal how humans truly categorize ideas.`,
    surpriseScore: bestNeighbors.length >= 8 ? 0.72 : 0.55,
    evidence: {
      conceptName: bestCategory.category_name,
      conceptNeighbors: display,
    },
  };
}

// === NEW Connection Type 11: Polysemy Explosion ===
async function buildPolysemy(
  word: string
): Promise<HiddenConnection | undefined> {
  const { count, senses } = await getPolysemyCount(word);

  if (count < 8) return undefined;

  // Pick the most diverse senses
  const uniqueSenses = senses
    .filter((s, i) => senses.indexOf(s) === i)
    .slice(0, 6);

  return {
    type: "polysemy",
    headline: `${count} distinct meanings`,
    description: `"${word}" has fractured into ${count} separate senses in English — from "${uniqueSenses[0]}" to "${uniqueSenses[Math.min(2, uniqueSenses.length - 1)]}." Each meaning evolved independently, like species branching from a common ancestor. The more common the word, the more meanings it tends to accumulate over centuries of use.`,
    surpriseScore: count >= 30 ? 0.9 : count >= 15 ? 0.75 : 0.6,
    evidence: {
      senseCount: count,
      sampleSenses: uniqueSenses,
    },
  };
}

// === NEW Connection Type 12: Borrowing Chain ===
async function buildBorrowingChain(
  word: string,
  etymologyLinks: EtymologyLink[] | undefined
): Promise<HiddenConnection | undefined> {
  // Use etymology_links to trace the borrowing path
  const chain = await getBorrowingChain(word, 8);

  if (chain.length < 2) return undefined;

  // Count how many were borrowed (vs inherited)
  const borrowed = chain.filter((s) => s.type === "borrowed");
  const hasBorrowing = borrowed.length > 0;

  // Build language list
  const langs = chain.map((s) => s.language);
  const uniqueLangs = [...new Set(langs)];

  if (uniqueLangs.length < 2) return undefined;

  const steps = chain.map((s) => ({
    word: s.word,
    language: s.language,
    type: s.type,
  }));

  return {
    type: "borrowing_chain",
    headline: `Passed through ${uniqueLangs.length} languages to reach English`,
    description: hasBorrowing
      ? `"${word}" was borrowed across cultures: ${steps.map((s) => `${s.language} "${s.word}"`).join(" \u2192 ")} \u2192 English. Each borrowing carries traces of the culture it passed through — trade routes, conquests, and cultural exchanges encoded in a single word.`
      : `"${word}" was inherited through ${uniqueLangs.length} ancestral languages: ${steps.map((s) => s.language).join(" \u2192 ")} \u2192 English. This is a word that has survived thousands of years of linguistic evolution.`,
    surpriseScore: chain.length >= 4 ? 0.8 : chain.length >= 3 ? 0.65 : 0.5,
    evidence: {
      borrowingSteps: steps,
    },
  };
}

// === Orchestrator ===
export async function buildHiddenConnections(
  word: string,
  etymologyTemplates: string,
  etymologyText: string,
  morphology: MorphologyData | undefined,
  strata: Stratum[],
  definitions: DefinitionSource[],
  strongsEntries: StrongsRow[],
  webster1828Etymology?: string,
  etymologyLinks?: EtymologyLink[],
  thesaurus?: ThesaurusData,
): Promise<HiddenConnectionsData | undefined> {
  const connections: HiddenConnection[] = [];

  // Original 5
  const splitting = buildWordSplitting(word, etymologyTemplates, etymologyText, morphology);
  if (splitting) connections.push(splitting);

  const siblings = await buildRootSiblings(word, etymologyTemplates);
  if (siblings) connections.push(siblings);

  const shift = buildMeaningShift(word, definitions, strata, etymologyText);
  if (shift) connections.push(shift);

  const cultural = buildCrossCultural(word, strata, definitions);
  if (cultural) connections.push(cultural);

  const biblical = buildBiblicalEcho(word, strongsEntries);
  if (biblical) connections.push(biblical);

  // New 7
  const secret = buildSecretStory(word, etymologyText, webster1828Etymology, definitions);
  if (secret) connections.push(secret);

  const doublets = await buildDoublets(word, etymologyTemplates);
  if (doublets) connections.push(doublets);

  const flip = buildSemanticFlip(word, definitions, etymologyText);
  if (flip) connections.push(flip);

  const partWhole = await buildPartWhole(word);
  if (partWhole) connections.push(partWhole);

  const concept = await buildConceptMap(word, thesaurus);
  if (concept) connections.push(concept);

  const polysemy = await buildPolysemy(word);
  if (polysemy) connections.push(polysemy);

  const borrowing = await buildBorrowingChain(word, etymologyLinks);
  if (borrowing) connections.push(borrowing);

  // Filter by minimum score and sort
  const filtered = connections
    .filter((c) => c.surpriseScore >= 0.4)
    .sort((a, b) => b.surpriseScore - a.surpriseScore)
    .slice(0, 8);

  if (filtered.length === 0) return undefined;

  // Build word equation from splitting data
  let wordEquation: string | undefined;
  if (splitting && splitting.evidence.parts && splitting.evidence.parts.length >= 2) {
    wordEquation = splitting.evidence.parts
      .map((p) => `${p.fragment} (${p.meaning})`)
      .join(" + ");
  }

  return { connections: filtered, wordEquation };
}
