import type { Stratum, RelationshipType } from "@/types/lexica";
import { getLanguageMeta, getLanguageDepth } from "./language-meta";
import { parseEtymologyText } from "./etymology-parser";

export function buildStrata(
  word: string,
  etymologyText: string,
  etymologyTemplates: string,
  definition: string
): Stratum[] {
  const strata: Stratum[] = [];

  // Start with modern English stratum
  const modernMeta = getLanguageMeta("eng");
  strata.push({
    era: modernMeta.era,
    period: modernMeta.period,
    form: word,
    language: modernMeta.name,
    meaning: definition || `Current English usage of "${word}".`,
    is_root: false,
    language_family: modernMeta.family,
  });

  // Build from etymology_templates (best structured source)
  const templateStrata = extractStrataFromTemplates(etymologyTemplates);

  // Fallback: parse etymology text with regex
  const parsedStrata = parseEtymologyTextToStrata(etymologyText);

  // Use templates if rich enough, otherwise fall back to parsed text
  const ancestorStrata = templateStrata.length >= 1 ? templateStrata : parsedStrata;

  // Deduplicate by language+form
  const seen = new Set<string>(["English:" + word.toLowerCase()]);
  for (const s of ancestorStrata) {
    const key = `${s.language}:${s.form.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    strata.push(s);
  }

  // Sort by language depth (modern -> ancient)
  strata.sort((a, b) => getLanguageDepth(a.language) - getLanguageDepth(b.language));

  // Add meaning shifts between adjacent strata
  for (let i = 1; i < strata.length; i++) {
    if (strata[i].form !== strata[i - 1].form) {
      strata[i].shift = `From ${strata[i].language} "${strata[i].form}" to ${strata[i - 1].language} "${strata[i - 1].form}".`;
    }
  }

  // Mark the last stratum as root
  for (const s of strata) s.is_root = false;
  if (strata.length > 0) {
    strata[strata.length - 1].is_root = true;
    if (!strata[strata.length - 1].relationship_type) {
      strata[strata.length - 1].relationship_type = "root";
    }
  }

  return strata;
}

function mapRelationshipType(templateName: string): RelationshipType {
  if (/^inh/.test(templateName)) return "inherited";
  if (/^bor/.test(templateName)) return "borrowed";
  if (/^der/.test(templateName)) return "derived";
  if (templateName === "root") return "root";
  return "unknown";
}

function extractStrataFromTemplates(etymologyTemplatesJson: string): Stratum[] {
  if (!etymologyTemplatesJson) return [];

  let templates: Record<string, unknown>[];
  try {
    templates = JSON.parse(etymologyTemplatesJson);
  } catch {
    return [];
  }

  if (!Array.isArray(templates)) return [];

  const strata: Stratum[] = [];

  for (const t of templates) {
    const name = (t.name as string) || "";
    const args = t.args as Record<string, string> | undefined;
    const expansion = (t.expansion as string) || "";

    const isEtymTemplate = /^(inh|bor|der|inherited|borrowed|derived)(\+|$)/.test(name);

    if (isEtymTemplate && args) {
      const sourceLang = args["2"] || "";
      const form = args["3"] || args["2"] || "";
      const meaning = args["t"] || args["gloss"] || args["5"] || args["4"] || "";

      if (sourceLang && form && form !== "-") {
        const meta = getLanguageMeta(sourceLang);
        const meaningText = meaning
          ? `Meaning "${meaning}" in ${meta.name}.`
          : expansion
            ? expansion
            : `${meta.name} form "${form}".`;

        strata.push({
          era: meta.era,
          period: meta.period,
          form,
          language: meta.name,
          meaning: meaningText,
          is_root: false,
          relationship_type: mapRelationshipType(name),
          language_family: meta.family,
        });
      }
    }

    if (name === "root" && args) {
      const rootLang = args["2"] || "";
      const rootForm = args["3"] || "";
      if (rootLang && rootForm) {
        const meta = getLanguageMeta(rootLang);
        strata.push({
          era: meta.era,
          period: meta.period,
          form: rootForm,
          language: meta.name,
          meaning: `${meta.name} root "${rootForm}".`,
          is_root: false,
          relationship_type: "root",
          language_family: meta.family,
        });
      }
    }

    if (name === "etymon" && expansion) {
      const treeStrata = parseEtymologyTree(expansion);
      if (strata.length === 0) {
        strata.push(...treeStrata);
      }
    }
  }

  return strata;
}

function parseEtymologyTree(expansion: string): Stratum[] {
  if (!expansion.includes("\n")) return [];

  const lines = expansion.split("\n").filter((l) => l.trim() && l.trim() !== "Etymology tree");
  const strata: Stratum[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[a-z]+\.$/.test(trimmed)) continue;

    const match = trimmed.match(/^(.+?)\s+(\S+)$/);
    if (match) {
      const language = match[1].trim();
      const form = match[2].trim();
      if (language.length < 3) continue;

      const meta = getLanguageMeta(language);
      strata.push({
        era: meta.era,
        period: meta.period,
        form,
        language: meta.name !== language ? meta.name : language,
        meaning: `${language} form "${form}".`,
        is_root: false,
        relationship_type: "inherited",
        language_family: meta.family,
      });
    }
  }

  return strata.reverse();
}

function parseEtymologyTextToStrata(etymologyText: string): Stratum[] {
  if (!etymologyText) return [];

  const ancestors = parseEtymologyText(etymologyText);
  return ancestors.map((a) => {
    const meta = getLanguageMeta(a.language);
    return {
      era: meta.era,
      period: meta.period,
      form: a.form,
      language: a.language,
      meaning: a.meaning ? `Meaning "${a.meaning}".` : `${a.language} form "${a.form}".`,
      is_root: false,
      relationship_type: "unknown" as RelationshipType,
      language_family: meta.family,
    };
  });
}
