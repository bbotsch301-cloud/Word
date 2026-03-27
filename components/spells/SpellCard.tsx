"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface SpellCardProps {
  word1: string;
  word2: string;
  def1: string;
  def2: string;
  spellType: "sonic" | "letter" | "chain" | "lost";
  description: string;
  depthScore: number;
  delay?: number;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  sonic: { label: "Sonic Spell", color: "text-purple-400" },
  letter: { label: "Letter Spell", color: "text-amber-400" },
  chain: { label: "Chain Spell", color: "text-cyan-400" },
  lost: { label: "Lost Distinction", color: "text-rose-400" },
};

export function SpellCard({ word1, word2, def1, def2, spellType, description, depthScore, delay = 0 }: SpellCardProps) {
  const typeInfo = TYPE_LABELS[spellType] || TYPE_LABELS.sonic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative bg-surface border border-border rounded-xl p-5 hover:border-accent/40 transition-all"
    >
      {/* Type badge + depth score */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 12 12" className={i < depthScore ? "text-accent" : "text-border"}>
              <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" fill="currentColor" />
            </svg>
          ))}
        </div>
      </div>

      {/* Word pair */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Link href={`/spells/${encodeURIComponent(word1)}`} className="text-center group/w">
          <span className="font-serif text-xl font-bold text-text-primary group-hover/w:text-accent transition-colors">
            {word1}
          </span>
        </Link>

        {/* Connector */}
        {spellType === "sonic" ? (
          <svg width="32" height="20" viewBox="0 0 32 20" className="text-accent/40 shrink-0">
            <path d="M4,10 Q8,2 12,10 Q16,18 20,10 Q24,2 28,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="32" height="20" viewBox="0 0 32 20" className="text-accent/40 shrink-0">
            <path d="M4,10 L12,4 L20,16 L28,10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        )}

        <Link href={`/spells/${encodeURIComponent(word2)}`} className="text-center group/w">
          <span className="font-serif text-xl font-bold text-text-primary group-hover/w:text-accent transition-colors">
            {word2}
          </span>
        </Link>
      </div>

      {/* Definitions side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <p className="text-xs text-text-muted line-clamp-2">{def1}</p>
        <p className="text-xs text-text-muted line-clamp-2">{def2}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary italic">{description}</p>
    </motion.div>
  );
}
