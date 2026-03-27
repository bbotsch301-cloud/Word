"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LangData {
  code: string;
  name: string;
  family: string;
  count: number;
}

const FAMILY_COLORS: Record<string, string> = {
  Italic: "#8B4513",
  Romance: "#D2691E",
  Hellenic: "#4169E1",
  Germanic: "#2E8B57",
  Semitic: "#B8860B",
  "Indo-Aryan": "#FF8C00",
  Iranian: "#CD853F",
  Slavic: "#6A5ACD",
  Japonic: "#DC143C",
  "Sino-Tibetan": "#FF4500",
  Turkic: "#20B2AA",
};

export function LanguageComposition() {
  const [data, setData] = useState<LangData[]>([]);

  useEffect(() => {
    fetch("/api/search?action=families")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (data.length === 0) return null;

  // Aggregate by family
  const familyMap = new Map<string, number>();
  data.forEach(l => {
    familyMap.set(l.family, (familyMap.get(l.family) || 0) + l.count);
  });
  const families = [...familyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const total = families.reduce((s, f) => s + f[1], 0);

  // Build donut segments
  const cx = 120, cy = 120, r = 90, innerR = 55;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;

  const segments = families.map(([family, count]) => {
    const pct = count / total;
    const offset = accumulated;
    accumulated += pct;
    return { family, count, pct, offset };
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="font-serif text-lg font-semibold text-text-primary mb-4 text-center">
        Where English Words Come From
      </h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Donut chart */}
        <svg viewBox="0 0 240 240" className="w-48 h-48 shrink-0">
          {segments.map((seg, i) => {
            const color = FAMILY_COLORS[seg.family] || "var(--accent)";
            const dashArray = `${seg.pct * circumference} ${circumference}`;
            const dashOffset = -seg.offset * circumference;
            return (
              <motion.circle
                key={seg.family}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={r - innerR}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: i * 0.1 }}
              />
            );
          })}
          {/* Inner circle for donut hole */}
          <circle cx={cx} cy={cy} r={innerR} fill="var(--bg)" />
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-text-primary" fontSize="16" fontWeight="bold" fontFamily="var(--font-serif)">
            {(total / 1000).toFixed(0)}K+
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-text-muted" fontSize="8">
            traced words
          </text>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {segments.map(seg => {
            const color = FAMILY_COLORS[seg.family] || "var(--accent)";
            return (
              <div key={seg.family} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color, opacity: 0.8 }} />
                <div>
                  <span className="text-sm text-text-primary">{seg.family}</span>
                  <span className="text-xs text-text-muted ml-1.5">{(seg.pct * 100).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
