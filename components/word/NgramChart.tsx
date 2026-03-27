"use client";

import { motion } from "framer-motion";
import type { NgramDataPoint } from "@/types/lexica";

interface NgramChartProps {
  data: NgramDataPoint[];
  word: string;
}

export function NgramChart({ data, word }: NgramChartProps) {
  if (data.length < 2) return null;

  // Filter to 1800+ for cleaner visualization (sparse data before that)
  const filtered = data.filter(d => d.decade >= 1800);
  if (filtered.length < 2) return null;

  const maxFreq = Math.max(...filtered.map(d => d.frequency));
  const minDecade = filtered[0].decade;
  const maxDecade = filtered[filtered.length - 1].decade;
  const decadeRange = maxDecade - minDecade || 1;

  const peakPoint = filtered.reduce((a, b) => a.frequency > b.frequency ? a : b);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 20 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Map data to SVG coordinates
  const points = filtered.map(d => ({
    x: padding.left + ((d.decade - minDecade) / decadeRange) * chartW,
    y: padding.top + chartH - (d.frequency / maxFreq) * chartH,
    decade: d.decade,
    frequency: d.frequency,
  }));

  // Build SVG path for area
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Generate decade labels (every 40 years)
  const labels: { decade: number; x: number }[] = [];
  for (let d = Math.ceil(minDecade / 40) * 40; d <= maxDecade; d += 40) {
    labels.push({
      decade: d,
      x: padding.left + ((d - minDecade) / decadeRange) * chartW,
    });
  }

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {labels.map(l => (
          <line
            key={l.decade}
            x1={l.x} y1={padding.top}
            x2={l.x} y2={padding.top + chartH}
            stroke="var(--color-border)"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="var(--color-accent)"
          fillOpacity={0.15}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Peak indicator */}
        {(() => {
          const peak = points.find(p => p.decade === peakPoint.decade);
          if (!peak) return null;
          return (
            <motion.circle
              cx={peak.x}
              cy={peak.y}
              r={4}
              fill="var(--color-accent)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            />
          );
        })()}

        {/* X-axis labels */}
        {labels.map(l => (
          <text
            key={l.decade}
            x={l.x}
            y={height - 8}
            textAnchor="middle"
            fontSize={11}
            fill="var(--color-muted)"
            fontFamily="var(--font-ibm-plex-mono)"
          >
            {l.decade}s
          </text>
        ))}

        {/* Baseline */}
        <line
          x1={padding.left} y1={padding.top + chartH}
          x2={padding.left + chartW} y2={padding.top + chartH}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      </svg>

      <p className="text-sm text-[var(--color-muted)]">
        Peak usage of <span className="font-semibold text-[var(--color-accent)]">{word}</span> was in the{" "}
        <span className="font-semibold">{peakPoint.decade}s</span>
      </p>
    </div>
  );
}
