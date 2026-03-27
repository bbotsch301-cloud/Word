"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SynonymCloudProps {
  synonyms: string[];
  word: string;
}

// Simple deterministic hash for consistent layout
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function SynonymCloud({ synonyms, word }: SynonymCloudProps) {
  const cloudWords = useMemo(() => {
    const display = synonyms.slice(0, 40);
    return display.map((syn, i) => {
      const hash = hashStr(syn + word);
      // Size based on position (earlier = more relevant = bigger)
      const sizeClass = i < 5 ? "text-lg font-semibold" : i < 15 ? "text-sm font-medium" : "text-xs";
      const opacity = i < 5 ? 1 : i < 15 ? 0.8 : 0.6;
      // Slight hue rotation for visual variety
      const hueShift = (hash % 40) - 20;

      return { word: syn, sizeClass, opacity, hueShift, hash };
    });
  }, [synonyms, word]);

  if (cloudWords.length < 5) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Synonym Cloud</h4>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 p-4 bg-surface border border-border rounded-xl">
        {cloudWords.map((w, i) => (
          <motion.div
            key={w.word}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: w.opacity, scale: 1 }}
            transition={{ delay: i * 0.02, type: "spring", stiffness: 200 }}
          >
            <Link
              href={`/word/${encodeURIComponent(w.word)}`}
              className={`${w.sizeClass} text-accent hover:text-accent-hover transition-colors cursor-pointer inline-block`}
              style={{ filter: `hue-rotate(${w.hueShift}deg)` }}
            >
              {w.word}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
