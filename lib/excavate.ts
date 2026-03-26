import Anthropic from "@anthropic-ai/sdk";
import type { LexicaResult } from "@/types/lexica";

const SYSTEM_PROMPT = `You are the world's foremost expert in historical linguistics, etymology, cultural history, and the philosophy of language. Your mission is to excavate any English word to its deepest roots and reveal its truest meaning.

When given a word, return ONLY a single valid JSON object — no markdown fences, no preamble, no explanation, no trailing text. The JSON must exactly match this structure:

{
  "word": "the word as given",
  "phonetic": "IPA pronunciation string",
  "modern_meaning": "1-2 vivid, precise sentences about what this word means today — go beyond the dictionary, capture the texture of how people actually use it",
  "strata": [
    {
      "era": "name of the era (e.g. Modern English, Middle English, Old French)",
      "period": "time range (e.g. 1500s–present, 9th–13th century CE)",
      "form": "the word's form in that era",
      "language": "specific language name",
      "meaning": "2–3 sentences — what did this word mean? Include surprising cultural context, how people actually used it, what it conjured.",
      "shift": "1 sentence on how meaning transformed from the previous stratum — only include if there was a notable shift",
      "is_root": false
    }
  ],
  "truest_meaning": "2–3 sentences of genuine philosophical synthesis — not a definition, but a revelation. What is this word REALLY about at its deepest level? Make the reader see the word differently forever.",
  "root_revelation": "2–3 sentences on the single most astonishing origin fact. Make it genuinely mind-blowing. Examples of the right energy: salary comes from salt money because Roman soldiers were paid in salt; disaster literally means 'bad star' because ancients believed stars caused catastrophes; muscle comes from 'little mouse' because Romans thought flexing muscles looked like a mouse running under skin.",
  "cultural_moment": {
    "period": "specific era or date range",
    "description": "2–3 sentences on one specific vivid historical or cultural moment when this word's meaning crystallised, shifted, or became charged with new meaning. Be specific — name real events, people, or texts."
  },
  "constellation": [
    { "word": "related word", "relationship": "brief relationship descriptor" }
  ]
}

RULES:
- strata must go from index 0 (most modern/current usage) down to the final entry (is_root: true, the deepest traceable origin — ideally Proto-Indo-European or earliest known root)
- Include 4–7 strata. Never fewer than 4.
- The final stratum must have is_root: true. All others must have is_root: false.
- constellation must have exactly 5–7 entries
- Every string value must be valid JSON (escape quotes, no unescaped newlines)
- Return ONLY the JSON object. Nothing else. No \`\`\`json. No explanation.`;

const client = new Anthropic();

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "");
    cleaned = cleaned.replace(/\n?\s*```\s*$/, "");
  }
  return cleaned.trim();
}

function validateResult(data: unknown): data is LexicaResult {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.word !== "string") return false;
  if (typeof obj.phonetic !== "string") return false;
  if (typeof obj.modern_meaning !== "string") return false;
  if (typeof obj.truest_meaning !== "string") return false;
  if (typeof obj.root_revelation !== "string") return false;

  if (!Array.isArray(obj.strata) || obj.strata.length < 4) return false;

  const strata = obj.strata as Record<string, unknown>[];
  const rootCount = strata.filter((s) => s.is_root === true).length;
  if (rootCount !== 1) return false;

  const lastStratum = strata[strata.length - 1];
  if (lastStratum.is_root !== true) return false;

  for (const s of strata) {
    if (typeof s.era !== "string") return false;
    if (typeof s.period !== "string") return false;
    if (typeof s.form !== "string") return false;
    if (typeof s.language !== "string") return false;
    if (typeof s.meaning !== "string") return false;
  }

  if (
    !obj.cultural_moment ||
    typeof obj.cultural_moment !== "object" ||
    typeof (obj.cultural_moment as Record<string, unknown>).period !== "string" ||
    typeof (obj.cultural_moment as Record<string, unknown>).description !== "string"
  ) {
    return false;
  }

  if (!Array.isArray(obj.constellation) || obj.constellation.length < 5) return false;

  return true;
}

export async function excavateWord(word: string): Promise<LexicaResult> {
  const attempt = async (retry: boolean): Promise<LexicaResult> => {
    const userMessage = retry
      ? `${word}\n\nIMPORTANT: Return ONLY raw JSON. No markdown fences. No explanation. The JSON must have at least 4 strata, exactly one with is_root: true as the last entry, and 5-7 constellation entries.`
      : word;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Anthropic");
    }

    const cleaned = stripMarkdownFences(textBlock.text);
    const parsed: unknown = JSON.parse(cleaned);

    if (!validateResult(parsed)) {
      throw new Error("Response failed validation");
    }

    return parsed;
  };

  try {
    return await attempt(false);
  } catch {
    return await attempt(true);
  }
}
