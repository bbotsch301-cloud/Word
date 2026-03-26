"use client";

import { motion } from "framer-motion";
import type { Stratum } from "@/types/lexica";

const STRATUM_BG = [
  "bg-stratum-0",
  "bg-stratum-1",
  "bg-stratum-2",
  "bg-stratum-3",
  "bg-stratum-4",
  "bg-stratum-root",
];

const ACCENT_COLORS = [
  "border-l-accent-0",
  "border-l-accent-1",
  "border-l-accent-2",
  "border-l-accent-3",
  "border-l-accent-4",
  "border-l-accent-root",
];

const ACCENT_TEXT = [
  "text-accent-0",
  "text-accent-1",
  "text-accent-2",
  "text-accent-3",
  "text-accent-4",
  "text-accent-root",
];

interface StratumBlockProps {
  stratum: Stratum;
  index: number;
  total: number;
}

export default function StratumBlock({ stratum, index, total }: StratumBlockProps) {
  const depthIndex = Math.min(index, 5);
  const isRoot = stratum.is_root;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.22, ease: "easeOut" }}
      className={`relative p-6 md:p-8 ${STRATUM_BG[depthIndex]} border-l-[3px] ${ACCENT_COLORS[depthIndex]} ${
        isRoot ? "border border-gold/60 border-l-[3px] border-l-gold" : ""
      } ${index > 0 ? "mt-1" : ""}`}
    >
      {/* Root glow */}
      {isRoot && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-gold/[0.04] rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {isRoot && (
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold border border-gold/50 px-2 py-0.5">
                The Root
              </span>
            )}
            <span className={`font-mono text-[9px] uppercase tracking-[0.3em] ${ACCENT_TEXT[depthIndex]}`}>
              {stratum.era}
            </span>
          </div>
          <span className="font-mono text-[9px] text-parchment/40">
            {stratum.period}
          </span>
        </div>

        {/* Word form */}
        <h3
          className={`font-cormorant font-light tracking-[0.04em] mt-3 mb-1 ${
            isRoot
              ? "text-[2.5rem] md:text-[3.2rem] text-gold animate-root-pulse"
              : "text-[1.8rem] md:text-[2.4rem] text-parchment"
          }`}
        >
          {stratum.form}
        </h3>

        {/* Language */}
        <p className="font-mono text-[8px] uppercase text-parchment/55 mb-4">
          {stratum.language}
        </p>

        {/* Meaning */}
        <p
          className={`font-crimson text-base leading-relaxed ${
            isRoot ? "text-parchment/90" : "text-parchment/[0.72]"
          }`}
        >
          {stratum.meaning}
        </p>

        {/* Shift note */}
        {stratum.shift && (
          <p className="font-crimson italic text-sm text-gold/40 mt-3">
            ↓ {stratum.shift}
          </p>
        )}
      </div>
    </motion.div>
  );
}
