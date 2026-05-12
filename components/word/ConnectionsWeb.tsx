'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { WordTaxonomy } from '@/types/lexica';

interface ConnectionsWebProps {
  word: string;
  taxonomy: WordTaxonomy;
}

interface Node {
  id: string;
  label: string;
  type: 'center' | 'hypernym' | 'hyponym' | 'antonym' | 'coordinate';
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

const TYPE_COLORS: Record<Node['type'], string> = {
  center: 'var(--accent)',
  hypernym: '#60a5fa',
  hyponym: '#34d399',
  antonym: '#f87171',
  coordinate: '#a78bfa',
};

const TYPE_LABELS: Record<Node['type'], string> = {
  center: 'word',
  hypernym: 'broader',
  hyponym: 'narrower',
  antonym: 'opposite',
  coordinate: 'sibling',
};

const W = 600;
const H = 420;

function buildNodes(word: string, t: WordTaxonomy): Node[] {
  const nodes: Node[] = [
    { id: word, label: word, type: 'center', x: W / 2, y: H / 2, vx: 0, vy: 0, fx: W / 2, fy: H / 2 },
  ];
  const add = (words: string[], type: Node['type'], maxCount: number, baseAngle: number) => {
    words.slice(0, maxCount).forEach((w, i, arr) => {
      const spread = Math.PI / 2;
      const angle = baseAngle + (i / Math.max(arr.length - 1, 1)) * spread - spread / 2;
      const r = 140 + Math.random() * 30;
      nodes.push({
        id: `${type}-${w}`,
        label: w,
        type,
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      });
    });
  };
  add(t.hypernyms, 'hypernym', 4, -Math.PI / 2);
  add(t.coordinate_terms, 'coordinate', 5, 0);
  add(t.hyponyms, 'hyponym', 4, Math.PI / 2);
  add(t.antonyms, 'antonym', 3, Math.PI);
  return nodes;
}

function simulate(nodes: Node[], iterations = 120) {
  const idealLen = 130;
  const repulse = 5500;
  const attract = 0.012;
  const damping = 0.85;
  const minX = 50, maxX = W - 50, minY = 50, maxY = H - 50;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.fx !== undefined) continue;
      let fx = 0, fy = 0;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const o = nodes[j];
        const dx = n.x - o.x;
        const dy = n.y - o.y;
        const d2 = dx * dx + dy * dy + 1;
        const d = Math.sqrt(d2);
        const f = repulse / d2;
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      }
      // Spring to center
      const cdx = n.x - W / 2;
      const cdy = n.y - H / 2;
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
      const springF = (cdist - idealLen) * attract;
      fx -= (cdx / Math.max(cdist, 1)) * springF;
      fy -= (cdy / Math.max(cdist, 1)) * springF;

      n.vx = (n.vx + fx) * damping;
      n.vy = (n.vy + fy) * damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(minX, Math.min(maxX, n.x));
      n.y = Math.max(minY, Math.min(maxY, n.y));
    }
  }
}

export default function ConnectionsWeb({ word, taxonomy }: ConnectionsWebProps) {
  const [nodes, setNodes] = useState<Node[] | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const built = buildNodes(word, taxonomy);
    simulate(built);
    setNodes(built);
  }, [word, taxonomy]);

  const total =
    (taxonomy.hypernyms?.length || 0) +
    (taxonomy.hyponyms?.length || 0) +
    (taxonomy.antonyms?.length || 0) +
    (taxonomy.coordinate_terms?.length || 0);
  if (total < 2) return null;

  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
        Connections Web
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3 text-[10px] font-mono text-text-muted">
        {(['hypernym', 'coordinate', 'hyponym', 'antonym'] as const).map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[t] }} />
            <span>{TYPE_LABELS[t]}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/30 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: 280 }}>
          <defs>
            <radialGradient id="webCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {nodes && (
            <>
              {/* Edges */}
              {nodes.slice(1).map((n, i) => (
                <motion.line
                  key={`edge-${n.id}`}
                  x1={W / 2}
                  y1={H / 2}
                  x2={n.x}
                  y2={n.y}
                  stroke={TYPE_COLORS[n.type]}
                  strokeWidth={1}
                  strokeOpacity={0.25}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
                />
              ))}

              {/* Center halo */}
              <circle cx={W / 2} cy={H / 2} r={50} fill="url(#webCenterGlow)" />

              {/* Center node */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <circle cx={W / 2} cy={H / 2} r={26} fill="var(--accent)" className="connections-pulse" />
                <text
                  x={W / 2}
                  y={H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--bg)"
                  fontSize={Math.max(10, Math.min(14, 180 / Math.max(word.length, 6)))}
                  className="font-serif font-bold"
                >
                  {word}
                </text>
              </motion.g>

              {/* Outer nodes */}
              {nodes.slice(1).map((n, i) => (
                <motion.g
                  key={n.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/word/${encodeURIComponent(n.label)}`}>
                    <g className="cursor-pointer connection-node">
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={Math.min(22, 8 + n.label.length * 1.5)}
                        fill="var(--surface)"
                        stroke={TYPE_COLORS[n.type]}
                        strokeWidth={1.5}
                      />
                      <text
                        x={n.x}
                        y={n.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--text-primary)"
                        fontSize={11}
                        className="font-serif pointer-events-none"
                      >
                        {n.label.length > 10 ? n.label.slice(0, 9) + '…' : n.label}
                      </text>
                    </g>
                  </Link>
                </motion.g>
              ))}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
