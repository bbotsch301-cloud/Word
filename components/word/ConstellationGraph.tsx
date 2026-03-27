"use client";

import { motion } from "framer-motion";
import type { ConstellationWord, WordTaxonomy, HiddenConnection } from "@/types/lexica";
import { polarToCartesian, truncateLabel, hashColor } from "@/lib/viz-utils";
import { useRouter } from "next/navigation";

interface ConstellationGraphProps {
  word: string;
  constellation: ConstellationWord[];
  taxonomy?: WordTaxonomy;
  connections?: HiddenConnection[];
}

interface GraphNode {
  word: string;
  group: string;
  color: string;
}

export default function ConstellationGraph({ word, constellation, taxonomy, connections }: ConstellationGraphProps) {
  const router = useRouter();

  // Collect all nodes grouped by type
  const nodes: GraphNode[] = [];
  const seen = new Set<string>([word.toLowerCase()]);

  const addNode = (w: string, group: string, color: string) => {
    const lower = w.toLowerCase();
    if (seen.has(lower) || nodes.length >= 28) return;
    seen.add(lower);
    nodes.push({ word: w, group, color });
  };

  // Taxonomy
  if (taxonomy) {
    taxonomy.hypernyms.forEach((w) => addNode(w, "broader", "#7C3AED"));
    taxonomy.hyponyms.forEach((w) => addNode(w, "narrower", "#059669"));
    taxonomy.antonyms.forEach((w) => addNode(w, "opposite", "#DC2626"));
    taxonomy.coordinate_terms.forEach((w) => addNode(w, "sibling", "#D97706"));
  }

  // Constellation
  constellation.forEach((c) => addNode(c.word, c.relationship, "#2563EB"));

  // Root siblings from connections
  const siblingsConn = connections?.find((c) => c.type === "root_siblings");
  if (siblingsConn?.evidence.siblings) {
    siblingsConn.evidence.siblings.forEach((w) => addNode(w, "root family", "#6B21A8"));
  }

  // Doublets
  const doubletsConn = connections?.find((c) => c.type === "doublets");
  if (doubletsConn?.evidence.doubletWords) {
    doubletsConn.evidence.doubletWords.forEach((w) => addNode(w, "doublet", "#0891B2"));
  }

  if (nodes.length < 3) return null;

  const cx = 300, cy = 300;
  const innerR = 130, outerR = 220;
  const angleStep = 360 / nodes.length;

  // Group legend
  const groups = [...new Set(nodes.map((n) => n.group))];

  return (
    <div className="w-full">
      <svg viewBox="0 0 600 600" className="w-full max-w-lg mx-auto" role="img" aria-label={`Word constellation for ${word}`}>
        {/* Connecting lines */}
        {nodes.map((node, i) => {
          const angle = i * angleStep;
          const r = i < nodes.length / 2 ? innerR : outerR;
          const pos = polarToCartesian(cx, cy, r, angle);
          return (
            <motion.line
              key={`line-${i}`}
              x1={cx} y1={cy} x2={pos.x} y2={pos.y}
              stroke={node.color}
              strokeWidth={1}
              strokeOpacity={0.3}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.04 }}
            />
          );
        })}

        {/* Center node */}
        <motion.circle
          cx={cx} cy={cy} r={28}
          className="fill-accent/20 stroke-accent"
          strokeWidth={2}
          initial={{ r: 0 }}
          whileInView={{ r: 28 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, type: "spring" }}
        />
        <text x={cx} y={cy + 5} textAnchor="middle" className="fill-text-primary font-serif font-bold" style={{ fontSize: 14 }}>
          {truncateLabel(word, 10)}
        </text>

        {/* Outer nodes */}
        {nodes.map((node, i) => {
          const angle = i * angleStep;
          const r = i < nodes.length / 2 ? innerR : outerR;
          const pos = polarToCartesian(cx, cy, r, angle);
          return (
            <motion.g
              key={`node-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.04, type: "spring", stiffness: 400, damping: 25 }}
              style={{ cursor: "pointer", transformOrigin: `${pos.x}px ${pos.y}px` }}
              whileHover={{ scale: 1.15 }}
              onClick={() => router.push(`/word/${node.word}`)}
            >
              <circle cx={pos.x} cy={pos.y} r={16} fill={node.color + "20"} stroke={node.color} strokeWidth={1.5} />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill={node.color}
                style={{ fontSize: 9, fontFamily: "monospace" }}
              >
                {truncateLabel(node.word, 10)}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        {groups.map((g) => {
          const color = nodes.find((n) => n.group === g)?.color || "#6B7280";
          return (
            <div key={g} className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {g}
            </div>
          );
        })}
      </div>
    </div>
  );
}
