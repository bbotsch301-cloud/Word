"use client";

import { motion } from "framer-motion";
import type { RogetCategory } from "@/types/lexica";
import { truncateLabel, hashColor } from "@/lib/viz-utils";
import { useRouter } from "next/navigation";

interface ConceptGalaxyProps {
  word: string;
  rogetCategories: RogetCategory[];
}

export default function ConceptGalaxy({ word, rogetCategories }: ConceptGalaxyProps) {
  const router = useRouter();
  if (rogetCategories.length < 2) return null;

  const display = rogetCategories.slice(0, 5);
  const viewW = 700, viewH = 460;

  // Position clusters in a grid
  const positions = [
    { x: 175, y: 140 },
    { x: 525, y: 140 },
    { x: 350, y: 280 },
    { x: 140, y: 370 },
    { x: 560, y: 370 },
  ];

  // Find connections: clusters that share the searched word
  const clustersWithWord = display
    .map((c, i) => ({ index: i, has: c.relatedWords.some((w) => w.toLowerCase() === word.toLowerCase()) }))
    .filter((c) => c.has)
    .map((c) => c.index);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full" role="img" aria-label="Concept galaxy">
        {/* Connecting lines between clusters that share the word */}
        {clustersWithWord.length > 1 && clustersWithWord.map((a, ai) => {
          return clustersWithWord.slice(ai + 1).map((b) => {
            const posA = positions[a];
            const posB = positions[b];
            return (
              <motion.line
                key={`conn-${a}-${b}`}
                x1={posA.x} y1={posA.y}
                x2={posB.x} y2={posB.y}
                stroke="var(--accent)"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
              />
            );
          });
        })}

        {/* Clusters */}
        {display.map((cat, ci) => {
          const pos = positions[ci];
          const clusterColor = hashColor(cat.name);
          const words = cat.relatedWords.slice(0, 8);
          const clusterR = 55;

          return (
            <motion.g
              key={ci}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.15 }}
            >
              {/* Cluster background */}
              <circle cx={pos.x} cy={pos.y} r={clusterR + 10} fill={clusterColor} fillOpacity={0.04} stroke={clusterColor} strokeWidth={1} strokeOpacity={0.2} strokeDasharray="3 3" />

              {/* Category label */}
              <text x={pos.x} y={pos.y - clusterR - 4} textAnchor="middle" fill={clusterColor} style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>
                {truncateLabel(cat.name, 18)}
              </text>

              {/* Word circles */}
              {words.map((w, wi) => {
                const angle = (wi / words.length) * Math.PI * 2 - Math.PI / 2;
                const dist = words.length <= 3 ? 25 : 35;
                const wx = pos.x + dist * Math.cos(angle);
                const wy = pos.y + dist * Math.sin(angle);
                const isTarget = w.toLowerCase() === word.toLowerCase();

                return (
                  <motion.g
                    key={`${ci}-${wi}`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.15 + wi * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                    style={{ cursor: "pointer", transformOrigin: `${wx}px ${wy}px` }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => router.push(`/word/${w}`)}
                  >
                    <circle
                      cx={wx} cy={wy}
                      r={isTarget ? 16 : 12}
                      fill={isTarget ? "var(--accent)" : clusterColor}
                      fillOpacity={isTarget ? 0.3 : 0.15}
                      stroke={isTarget ? "var(--accent)" : clusterColor}
                      strokeWidth={isTarget ? 2 : 1}
                    />
                    <text
                      x={wx} y={wy + 3}
                      textAnchor="middle"
                      fill={isTarget ? "var(--accent)" : clusterColor}
                      style={{ fontSize: isTarget ? 8 : 7, fontFamily: "monospace", fontWeight: isTarget ? 700 : 400 }}
                    >
                      {truncateLabel(w, 8)}
                    </text>
                  </motion.g>
                );
              })}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
