"use client";

import { motion } from "framer-motion";

interface DivergenceProps {
  word1: string;
  word2: string;
  path1: { word: string; language: string }[];
  path2: { word: string; language: string }[];
}

export function DivergenceTimeline({ word1, word2, path1, path2 }: DivergenceProps) {
  if (path1.length < 2 && path2.length < 2) return null;

  const maxLen = Math.max(path1.length, path2.length);
  const width = 500;
  const height = 180;
  const padX = 50;
  const padY = 30;
  const usableW = width - padX * 2;

  // Path 1 goes along the top, path 2 along the bottom, both converge at the left (Modern English)
  const stepW = maxLen > 1 ? usableW / (maxLen - 1) : usableW;

  const p1Points = path1.map((_, i) => ({
    x: padX + i * (path1.length > 1 ? usableW / (path1.length - 1) : 0),
    y: i === 0 ? height / 2 : padY + 10,
  }));

  const p2Points = path2.map((_, i) => ({
    x: padX + i * (path2.length > 1 ? usableW / (path2.length - 1) : 0),
    y: i === 0 ? height / 2 : height - padY - 10,
  }));

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      d += ` Q ${cx} ${points[i - 1].y} ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Etymological Divergence</h4>
      <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Etymology divergence timeline">
          {/* Convergence point label */}
          <text x={padX} y={height / 2 + 4} textAnchor="middle" className="fill-accent" fontSize="9" fontWeight="bold">
            Modern English
          </text>

          {/* Path 1 (top) */}
          <motion.path
            d={buildPath(p1Points)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeOpacity={0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Path 2 (bottom) */}
          <motion.path
            d={buildPath(p2Points)}
            fill="none"
            stroke="#D97706"
            strokeWidth={2}
            strokeOpacity={0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />

          {/* Path 1 nodes */}
          {path1.map((step, i) => {
            const pt = p1Points[i];
            if (!pt) return null;
            return (
              <motion.g
                key={`p1-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
              >
                <circle cx={pt.x} cy={pt.y} r={i === 0 ? 5 : 3.5}
                  fill={i === 0 ? "var(--accent)" : "var(--bg)"}
                  stroke="var(--accent)" strokeWidth={1.5}
                />
                {i > 0 && (
                  <>
                    <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="fill-text-primary" fontSize="8" fontWeight="bold">
                      {step.word}
                    </text>
                    <text x={pt.x} y={pt.y - 2} textAnchor="middle" className="fill-text-muted" fontSize="6">
                      {step.language}
                    </text>
                  </>
                )}
              </motion.g>
            );
          })}

          {/* Path 2 nodes */}
          {path2.map((step, i) => {
            const pt = p2Points[i];
            if (!pt) return null;
            return (
              <motion.g
                key={`p2-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.3 }}
              >
                <circle cx={pt.x} cy={pt.y} r={i === 0 ? 5 : 3.5}
                  fill={i === 0 ? "#D97706" : "var(--bg)"}
                  stroke="#D97706" strokeWidth={1.5}
                />
                {i > 0 && (
                  <>
                    <text x={pt.x} y={pt.y + 16} textAnchor="middle" className="fill-text-primary" fontSize="8" fontWeight="bold">
                      {step.word}
                    </text>
                    <text x={pt.x} y={pt.y + 24} textAnchor="middle" className="fill-text-muted" fontSize="6">
                      {step.language}
                    </text>
                  </>
                )}
              </motion.g>
            );
          })}

          {/* Legend */}
          <circle cx={width - 90} cy={12} r={4} fill="var(--accent)" />
          <text x={width - 82} y={15} className="fill-text-muted" fontSize="7">{word1}</text>
          <circle cx={width - 90} cy={26} r={4} fill="#D97706" />
          <text x={width - 82} y={29} className="fill-text-muted" fontSize="7">{word2}</text>
        </svg>
      </div>
    </div>
  );
}
