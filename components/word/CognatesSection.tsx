"use client";

import { motion } from "framer-motion";
import type { CognateData } from "@/types/lexica";
import Badge from "@/components/ui/Badge";

// Group cognates by language family
const LANG_FAMILIES: Record<string, string[]> = {
  "Germanic": ["deu", "nld", "swe", "dan", "nob", "isl", "non", "goh", "gmh", "dum", "gml", "osx", "ofs", "fry", "afr", "yid"],
  "Romance": ["fra", "spa", "por", "ita", "ron", "cat", "fro", "frm", "osp", "roa", "oci"],
  "Celtic": ["gle", "cym", "bre", "gla", "cor", "cel"],
  "Slavic": ["rus", "pol", "ces", "ukr", "bul", "hrv", "srp", "slk", "slv", "mkd"],
  "Indo-Iranian": ["san", "hin", "urd", "ben", "fas", "prs", "guj", "mar", "pan", "nep"],
  "Hellenic": ["grc", "ell"],
  "Semitic": ["ara", "heb", "amh"],
  "Turkic": ["tur", "aze", "uzb", "kaz"],
  "Finno-Ugric": ["fin", "hun", "est"],
  "Sino-Tibetan": ["zho", "cmn", "yue", "mya", "bod"],
  "Japonic": ["jpn"],
  "Koreanic": ["kor"],
};

function getFamily(langCode: string): string {
  for (const [family, codes] of Object.entries(LANG_FAMILIES)) {
    if (codes.includes(langCode)) return family;
  }
  return "Other";
}

const FAMILY_COLORS: Record<string, string> = {
  "Germanic": "hsl(210, 70%, 50%)",
  "Romance": "hsl(340, 70%, 50%)",
  "Celtic": "hsl(140, 60%, 40%)",
  "Slavic": "hsl(260, 60%, 55%)",
  "Indo-Iranian": "hsl(30, 80%, 50%)",
  "Hellenic": "hsl(190, 70%, 45%)",
  "Semitic": "hsl(50, 70%, 45%)",
  "Turkic": "hsl(0, 60%, 50%)",
  "Finno-Ugric": "hsl(170, 50%, 45%)",
  "Other": "hsl(0, 0%, 50%)",
};

interface CognatesSectionProps {
  data: CognateData;
  word: string;
}

export function CognatesSection({ data, word }: CognatesSectionProps) {
  if (data.cognates.length === 0) return null;

  // Group by language family
  const grouped = new Map<string, typeof data.cognates>();
  for (const cognate of data.cognates) {
    const family = getFamily(cognate.language);
    let group = grouped.get(family);
    if (!group) {
      group = [];
      grouped.set(family, group);
    }
    group.push(cognate);
  }

  // Sort families by number of cognates (descending)
  const sortedFamilies = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">
        Words related to <span className="font-semibold">{word}</span> across {data.cognates.length} languages, grouped by language family.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {sortedFamilies.map(([family, cognates], fi) => (
          <motion.div
            key={family}
            className="rounded-lg border border-[var(--color-border)] p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: fi * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: FAMILY_COLORS[family] || FAMILY_COLORS["Other"] }}
              />
              <h4 className="font-semibold text-sm">{family}</h4>
              <span className="text-xs text-[var(--color-muted)]">{cognates.length}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {cognates.slice(0, 8).map((c, ci) => (
                <div key={ci} className="flex items-center gap-1.5">
                  <Badge variant="muted">
                    {c.languageName}
                  </Badge>
                  <span className="text-sm font-medium font-[family-name:var(--font-serif)] italic">
                    {c.word}
                  </span>
                </div>
              ))}
              {cognates.length > 8 && (
                <span className="text-xs text-[var(--color-muted)] self-center">
                  +{cognates.length - 8} more
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shared ancestor note */}
      {data.cognates[0]?.sharedAncestor && (
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Shared ancestor: <span className="italic">{data.cognates[0].sharedAncestor}</span>
          {data.cognates[0].ancestorLang && ` (${data.cognates[0].ancestorLang})`}
        </p>
      )}
    </div>
  );
}
