'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ConstellationWord } from '@/types/lexica';

interface WordFamilyTreeProps {
  word: string;
  constellation: ConstellationWord[];
  rootLabel?: string;
}

interface PositionedNode {
  word: string;
  relationship: string;
  x: number;
  y: number;
  angle: number;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  inherited: 'var(--accent)',
  borrowed: 'var(--accent-secondary)',
  derived: '#a78bfa',
  root: 'var(--accent-hover)',
  cognate: '#34d399',
  default: 'var(--text-muted)',
};

function colorFor(rel: string): string {
  const key = rel.toLowerCase();
  for (const [k, v] of Object.entries(RELATIONSHIP_COLORS)) {
    if (key.includes(k)) return v;
  }
  return RELATIONSHIP_COLORS.default;
}

export default function WordFamilyTree({ word, constellation, rootLabel }: WordFamilyTreeProps) {
  if (!constellation || constellation.length < 2) return null;

  const nodes = constellation.slice(0, 12);
  const W = 600;
  const H = 360;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) * 0.36;

  const positioned: PositionedNode[] = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      word: node.word,
      relationship: node.relationship,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  });

  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
        Word Family {rootLabel && <span className="text-accent normal-case font-serif italic">&middot; from {rootLabel}</span>}
      </p>
      <div className="relative w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ minWidth: 320, maxWidth: 720 }}
          role="img"
          aria-label={`Word family tree for ${word}`}
        >
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glow halo */}
          <circle cx={cx} cy={cy} r={48} fill="url(#centerGlow)" />

          {/* Connector lines */}
          {positioned.map((node, i) => (
            <motion.line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={node.x}
              y2={node.y}
              stroke={colorFor(node.relationship)}
              strokeWidth={1}
              strokeOpacity={0.35}
              strokeDasharray="3 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.35 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
          ))}

          {/* Center node (current word) */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle cx={cx} cy={cy} r={28} fill="var(--accent)" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-serif font-bold"
              fontSize={Math.max(11, Math.min(16, 180 / Math.max(word.length, 6)))}
              fill="var(--bg)"
            >
              {word}
            </text>
          </motion.g>

          {/* Branch nodes */}
          {positioned.map((node, i) => {
            const color = colorFor(node.relationship);
            const labelOnRight = node.x > cx;
            return (
              <motion.g
                key={`node-${node.word}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/word/${encodeURIComponent(node.word)}`}>
                  <g className="cursor-pointer family-tree-node">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={18}
                      fill="var(--surface)"
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <text
                      x={node.x}
                      y={node.y - 26}
                      textAnchor="middle"
                      className="font-serif"
                      fontSize={13}
                      fill="var(--text-primary)"
                    >
                      {node.word}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 32}
                      textAnchor="middle"
                      fontSize={9}
                      fill={color}
                      className="font-mono uppercase tracking-wider"
                    >
                      {node.relationship}
                    </text>
                  </g>
                </Link>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <p className="text-[10px] font-mono text-text-muted mt-2 text-center">
        Click any word to explore its etymology
      </p>
    </div>
  );
}
