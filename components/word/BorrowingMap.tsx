"use client";

import { motion } from "framer-motion";
import { LANGUAGE_POSITIONS, truncateLabel, getFamilyColor } from "@/lib/viz-utils";
import type { Stratum } from "@/types/lexica";

interface BorrowingMapProps {
  borrowingSteps?: { word: string; language: string; type: string }[];
  strata?: Stratum[];
}

function findPosition(lang: string): { x: number; y: number } {
  // Try exact match, then partial
  if (LANGUAGE_POSITIONS[lang]) return LANGUAGE_POSITIONS[lang];
  for (const [key, pos] of Object.entries(LANGUAGE_POSITIONS)) {
    if (lang.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(lang.toLowerCase())) {
      return pos;
    }
  }
  // Default: center area with some randomization based on string
  let hash = 0;
  for (let i = 0; i < lang.length; i++) hash = lang.charCodeAt(i) + ((hash << 5) - hash);
  return { x: 300 + (hash % 150), y: 180 + ((hash >> 8) % 100) };
}

export default function BorrowingMap({ borrowingSteps, strata }: BorrowingMapProps) {
  // Build steps from borrowingSteps or fall back to strata
  let steps: { word: string; language: string; type: string }[] = [];

  if (borrowingSteps && borrowingSteps.length >= 2) {
    steps = borrowingSteps;
  } else if (strata && strata.length >= 3) {
    // Use strata reversed (ancient → modern), skip first (Modern English) and last if it's just the word
    const reversed = [...strata].reverse();
    steps = reversed.slice(0, -1).map((s) => ({
      word: s.form,
      language: s.language,
      type: s.relationship_type || "inherited",
    }));
  }

  if (steps.length < 2) return null;

  const viewW = 700, viewH = 380;

  // All involved languages + English endpoint
  const allLangs = [...steps.map((s) => s.language), "English"];
  const involvedSet = new Set(allLangs);

  // Background: show all language positions at low opacity
  const bgLangs = Object.entries(LANGUAGE_POSITIONS)
    .filter(([key]) => !involvedSet.has(key))
    .slice(0, 10);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full" role="img" aria-label="Borrowing map">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" fillOpacity={0.6} />
        </marker>
      </defs>

      {/* Background language dots */}
      {bgLangs.map(([name, pos]) => (
        <g key={`bg-${name}`} opacity={0.15}>
          <circle cx={pos.x} cy={pos.y} r={4} fill="var(--text-muted)" />
          <text x={pos.x} y={pos.y + 12} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 7 }}>
            {name}
          </text>
        </g>
      ))}

      {/* Arcs between steps */}
      {steps.map((step, i) => {
        if (i === 0) return null;
        const from = findPosition(steps[i - 1].language);
        const to = findPosition(step.language);
        const midX = (from.x + to.x) / 2;
        const midY = Math.min(from.y, to.y) - 40 - i * 10;
        const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
        const isBorrowed = step.type === "borrowed";

        return (
          <motion.path
            key={`arc-${i}`}
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeOpacity={0.6}
            strokeDasharray={isBorrowed ? "6 3" : "none"}
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.4 }}
          />
        );
      })}

      {/* Final arc to English */}
      {steps.length > 0 && (() => {
        const lastStep = steps[steps.length - 1];
        const from = findPosition(lastStep.language);
        const to = findPosition("English");
        const midX = (from.x + to.x) / 2;
        const midY = Math.min(from.y, to.y) - 30;
        const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

        return (
          <motion.path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeOpacity={0.6}
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + steps.length * 0.4 }}
          />
        );
      })()}

      {/* Language nodes */}
      {allLangs.map((lang, i) => {
        const pos = findPosition(lang);
        const isEnd = lang === "English";
        return (
          <motion.g
            key={`node-${lang}-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, type: "spring" }}
            style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
          >
            <circle
              cx={pos.x} cy={pos.y}
              r={isEnd ? 18 : 14}
              fill={isEnd ? "var(--accent)" : "var(--surface)"}
              fillOpacity={isEnd ? 0.2 : 0.8}
              stroke={isEnd ? "var(--accent)" : "var(--accent-secondary)"}
              strokeWidth={isEnd ? 2.5 : 1.5}
            />
            <text
              x={pos.x} y={pos.y + 4}
              textAnchor="middle"
              fill={isEnd ? "var(--accent)" : "var(--accent-secondary)"}
              style={{ fontSize: isEnd ? 8 : 7, fontWeight: isEnd ? 700 : 500, fontFamily: "monospace" }}
            >
              {truncateLabel(lang, 10)}
            </text>
            {/* Word form label below */}
            {i < steps.length && (
              <text
                x={pos.x} y={pos.y + 26}
                textAnchor="middle"
                className="fill-text-muted"
                style={{ fontSize: 9, fontStyle: "italic", fontFamily: "serif" }}
              >
                {truncateLabel(steps[i].word, 12)}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
