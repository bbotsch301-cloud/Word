"use client";

import { motion } from "framer-motion";
import type { Stratum } from "@/types/lexica";
import LanguageBadge from "./LanguageBadge";
import RelationshipBadge from "./RelationshipBadge";

const STRATUM_BG = [
  "bg-stratum-0",
  "bg-stratum-1",
  "bg-stratum-2",
  "bg-stratum-3",
  "bg-stratum-4",
  "bg-stratum-root",
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
      className={`relative p-5 md:p-6 ${STRATUM_BG[depthIndex]} ${
        isRoot ? "border border-gold/60 animate-root-reveal" : ""
      } ${index > 0 ? "mt-1" : ""} rounded-sm`}
    >
      {/* Root glow */}
      {isRoot && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gold/[0.06] rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-1 flex-wrap gap-y-1">
          <div className="flex items-center gap-2">
            {isRoot && (
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold border border-gold/50 px-2 py-0.5 rounded-sm">
                The Root
              </span>
            )}
            <span className={`font-mono text-[9px] uppercase tracking-[0.3em] ${ACCENT_TEXT[depthIndex]}`}>
              {stratum.era}
            </span>
            {stratum.language_family && (
              <LanguageBadge family={stratum.language_family} />
            )}
          </div>
          <div className="flex items-center gap-3">
            {stratum.relationship_type && (
              <RelationshipBadge type={stratum.relationship_type} />
            )}
            <span className="font-mono text-[9px] text-parchment/40">
              {stratum.period}
            </span>
          </div>
        </div>

        {/* Word form */}
        <h3
          className={`font-cormorant font-light tracking-[0.04em] mt-2 mb-1 ${
            isRoot
              ? "text-[2.2rem] md:text-[2.8rem] text-gold animate-root-pulse"
              : "text-[1.6rem] md:text-[2rem] text-parchment"
          }`}
        >
          {stratum.form}
        </h3>

        {/* Language */}
        <p className="font-mono text-[8px] uppercase text-parchment/55 mb-3">
          {stratum.language}
        </p>

        {/* Meaning */}
        <p
          className={`font-crimson text-sm leading-relaxed ${
            isRoot ? "text-parchment/90" : "text-parchment/[0.72]"
          }`}
        >
          {stratum.meaning}
        </p>
      </div>
    </motion.div>
  );
}
