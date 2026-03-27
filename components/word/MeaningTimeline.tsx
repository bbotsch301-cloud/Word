"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DefinitionSource } from "@/types/lexica";

interface MeaningTimelineProps {
  definitions: DefinitionSource[];
}

export default function MeaningTimeline({ definitions }: MeaningTimelineProps) {
  const sorted = [...definitions]
    .filter((d) => d.year > 0)
    .sort((a, b) => a.year - b.year);

  const [selected, setSelected] = useState(0);

  if (sorted.length < 3) return null;

  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  const yearSpan = maxYear - minYear;
  if (yearSpan < 30) return null;

  const padding = 50;
  const viewW = 600;
  const viewH = 80;
  const usableW = viewW - padding * 2;

  const yearToX = (year: number) => padding + ((year - minYear) / yearSpan) * usableW;

  // Deduplicate years for node positions
  const uniqueYears = sorted.reduce<{ def: DefinitionSource; index: number }[]>((acc, d, i) => {
    if (!acc.some((a) => a.def.year === d.year)) acc.push({ def: d, index: i });
    return acc;
  }, []);

  // Build gradient path points
  const linePoints = uniqueYears.map((u) => ({ x: yearToX(u.def.year), y: 40 }));
  const linePath = linePoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full" role="img" aria-label="Meaning timeline">
        <defs>
          <linearGradient id="timeline-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--accent-secondary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line x1={padding} y1={40} x2={viewW - padding} y2={40} stroke="var(--border)" strokeWidth={1} />

        {/* Animated gradient line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#timeline-grad)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Year nodes */}
        {uniqueYears.map((u, i) => {
          const x = yearToX(u.def.year);
          const isActive = u.index === selected;
          return (
            <motion.g
              key={u.def.year}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(u.index)}
            >
              <motion.circle
                cx={x} cy={40}
                r={isActive ? 8 : 6}
                fill={isActive ? "var(--accent)" : "var(--surface)"}
                stroke={isActive ? "var(--accent)" : "var(--border-hover)"}
                strokeWidth={2}
                animate={{
                  r: isActive ? 8 : 6,
                  fill: isActive ? "var(--accent)" : "var(--surface)",
                }}
              />
              {/* Year label */}
              <text
                x={x} y={62}
                textAnchor="middle"
                className={isActive ? "fill-accent" : "fill-text-muted"}
                style={{ fontSize: 10, fontFamily: "monospace", fontWeight: isActive ? 700 : 400 }}
              >
                {u.def.year}
              </text>
              {/* Source label */}
              <text
                x={x} y={22}
                textAnchor="middle"
                className="fill-text-muted"
                style={{ fontSize: 7, fontFamily: "monospace" }}
              >
                {u.def.label.length > 12 ? u.def.label.slice(0, 11) + "\u2026" : u.def.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Selected definition card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-border rounded-lg p-4 mt-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-accent">{sorted[selected]?.year}</span>
            <span className="text-xs text-text-muted">{sorted[selected]?.label}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {sorted[selected]?.definition.slice(0, 300)}
            {(sorted[selected]?.definition.length || 0) > 300 ? "\u2026" : ""}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
