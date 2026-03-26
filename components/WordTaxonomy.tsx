"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { WordTaxonomy as WordTaxonomyType } from "@/types/lexica";

interface WordTaxonomyProps {
  taxonomy: WordTaxonomyType;
}

const SECTION_LABELS: { key: keyof WordTaxonomyType; label: string }[] = [
  { key: "hypernyms", label: "Broader" },
  { key: "hyponyms", label: "Narrower" },
  { key: "antonyms", label: "Opposites" },
  { key: "coordinate_terms", label: "Related" },
];

export default function WordTaxonomy({ taxonomy }: WordTaxonomyProps) {
  const hasAny = SECTION_LABELS.some((s) => taxonomy[s.key]?.length > 0);
  if (!hasAny) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3"
    >
      {SECTION_LABELS.map(({ key, label }) => {
        const items = taxonomy[key];
        if (!items || items.length === 0) return null;

        return (
          <div key={key}>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-parchment/40 block mb-1">
              {label}
            </span>
            <div className="font-crimson text-sm text-parchment/70">
              {items.map((word, i) => (
                <span key={word}>
                  {i > 0 && <span className="text-parchment/30"> &middot; </span>}
                  <Link
                    href={`/word/${encodeURIComponent(word)}`}
                    className="hover:text-gold transition-colors"
                  >
                    {word}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
