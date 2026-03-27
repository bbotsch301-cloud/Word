"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ChainStep {
  word: string;
  phonemeKey: string;
  changedPhoneme?: string;
}

export function SpellChainViz({ steps }: { steps: ChainStep[] }) {
  if (steps.length < 2) return null;

  const nodeW = 70;
  const gap = 40;
  const totalW = steps.length * nodeW + (steps.length - 1) * gap;
  const height = 80;

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Spell Chain</h4>
      <div className="bg-surface border border-border rounded-xl p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${Math.max(totalW, 300)} ${height}`} className="w-full min-w-[400px]" style={{ minHeight: 80 }}>
          {steps.map((step, i) => {
            const x = i * (nodeW + gap) + nodeW / 2;
            const cy = height / 2;

            return (
              <motion.g
                key={`step-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Connector line to next */}
                {i < steps.length - 1 && (
                  <motion.line
                    x1={x + nodeW / 2 - 5}
                    y1={cy}
                    x2={x + nodeW + gap - nodeW / 2 + 5}
                    y2={cy}
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                    strokeDasharray="4 3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: i * 0.1 + 0.05, duration: 0.3 }}
                  />
                )}

                {/* Changed phoneme label */}
                {step.changedPhoneme && i > 0 && (
                  <text
                    x={x - gap / 2 - nodeW / 2 + 5}
                    y={cy - 18}
                    textAnchor="middle"
                    className="fill-accent"
                    fontSize="6"
                    fontFamily="monospace"
                  >
                    {step.changedPhoneme}
                  </text>
                )}

                {/* Node */}
                <rect
                  x={x - nodeW / 2 + 5}
                  y={cy - 14}
                  width={nodeW - 10}
                  height={28}
                  rx={6}
                  fill={i === 0 ? "var(--accent)" : "var(--bg)"}
                  fillOpacity={i === 0 ? 0.15 : 1}
                  stroke={i === 0 ? "var(--accent)" : "var(--border)"}
                  strokeWidth={1.5}
                />

                {/* Word label */}
                <Link href={`/spells/${encodeURIComponent(step.word)}`}>
                  <text
                    x={x}
                    y={cy + 4}
                    textAnchor="middle"
                    className={i === 0 ? "fill-accent" : "fill-text-primary"}
                    fontSize="10"
                    fontWeight={i === 0 ? "bold" : "normal"}
                    fontFamily="var(--font-serif)"
                    style={{ cursor: "pointer" }}
                  >
                    {step.word}
                  </text>
                </Link>

                {/* Step number */}
                <text
                  x={x}
                  y={cy + 26}
                  textAnchor="middle"
                  className="fill-text-muted"
                  fontSize="7"
                >
                  {i + 1}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
