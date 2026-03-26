"use client";

import { motion } from "framer-motion";
import type { DefinitionSource } from "@/types/lexica";

const SOURCE_BORDER_COLORS: Record<string, string> = {
  wiktionary: "#c8920a",
  webster1828: "#b8885a",
  webster1913: "#7a4818",
  blacks_law: "#8b4040",
};

const SOURCE_BG_CLASSES: Record<string, string> = {
  wiktionary: "bg-transparent",
  webster1828: "bg-gradient-to-b from-[#1a1408] to-transparent",
  webster1913: "bg-stratum-1/50",
  blacks_law: "bg-[#120808]/50",
};

interface DefinitionTimelineProps {
  definitions: DefinitionSource[];
}

export default function DefinitionTimeline({ definitions }: DefinitionTimelineProps) {
  if (definitions.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {definitions.map((def, i) => {
          const borderColor = SOURCE_BORDER_COLORS[def.source] || "#c8920a";
          const bgClass = SOURCE_BG_CLASSES[def.source] || "bg-transparent";

          return (
            <div
              key={`${def.source}-${i}`}
              className={`relative border border-parchment/10 p-4 ${bgClass}`}
              style={{ borderTopWidth: "2px", borderTopColor: borderColor }}
            >
              {/* Year badge */}
              <span className="absolute top-2 left-3 font-mono text-[10px] text-parchment/30">
                {def.year}
              </span>

              {/* Source label */}
              <div className="mt-4 mb-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-parchment/40">
                  {def.label}
                </span>
              </div>

              {/* POS if present */}
              {def.pos && (
                <span className="inline-block font-mono text-[7px] uppercase tracking-[0.2em] text-parchment/40 border border-parchment/15 px-1.5 py-0.5 mb-2">
                  {def.pos}
                </span>
              )}

              {/* Definition */}
              <p className="font-crimson text-sm text-parchment/80 leading-relaxed">
                {def.definition}
              </p>

              {/* Etymology (Webster 1828) */}
              {def.etymology && (
                <p className="font-crimson italic text-xs text-parchment/40 mt-3 leading-relaxed">
                  {def.etymology}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
