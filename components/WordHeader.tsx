"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WordHeaderProps {
  word: string;
  phonetic: string;
  modernMeaning: string;
  pos?: string;
  frequency?: { rank: number; label: string };
}

export default function WordHeader({ word, phonetic, modernMeaning, pos, frequency }: WordHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Word title */}
      <h1
        className="font-cormorant font-light tracking-[0.04em] text-parchment mb-2"
        style={{ fontSize: "clamp(3.5rem, 9vw, 6rem)" }}
      >
        {word}
      </h1>

      {/* Phonetic */}
      <p className="font-mono text-xs text-parchment/40 mb-3">
        {phonetic}
      </p>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {pos && (
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] border border-parchment/20 px-2 py-0.5 text-parchment/50">
            {pos}
          </span>
        )}
        {frequency && (
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] border border-gold/20 px-2 py-0.5 text-gold/50">
            {frequency.label} &middot; #{frequency.rank.toLocaleString()}
          </span>
        )}
      </div>

      {/* Modern meaning */}
      <p className="font-crimson italic text-gold/70 text-lg leading-relaxed mb-4">
        {modernMeaning}
      </p>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="font-mono text-[9px] uppercase tracking-[0.3em] text-parchment/40 hover:text-gold transition-colors"
        aria-label="Share this excavation"
      >
        {copied ? "\u2713 Copied link" : "\u2398 Share this excavation"}
      </button>
    </motion.div>
  );
}
