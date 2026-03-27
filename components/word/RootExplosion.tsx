"use client";

import { motion } from "framer-motion";
import { polarToCartesian, describeArc, truncateLabel, hashColor } from "@/lib/viz-utils";
import { useRouter } from "next/navigation";

interface RootExplosionProps {
  sharedRoot: { root: string; language: string; meaning?: string };
  siblings: string[];
  word: string;
}

export default function RootExplosion({ sharedRoot, siblings, word }: RootExplosionProps) {
  const router = useRouter();
  if (siblings.length < 3) return null;

  const cx = 250, cy = 250;
  const innerR = 60, outerR = 180;
  const display = siblings.slice(0, 14);
  const angleStep = 360 / display.length;

  return (
    <svg viewBox="0 0 500 500" className="w-full max-w-md mx-auto" role="img" aria-label="Root explosion">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connecting lines from center to outer */}
      {display.map((_, i) => {
        const angle = i * angleStep;
        const outer = polarToCartesian(cx, cy, outerR - 20, angle);
        return (
          <motion.line
            key={`line-${i}`}
            x1={cx} y1={cy} x2={outer.x} y2={outer.y}
            stroke="var(--border-hover)"
            strokeWidth={1}
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
          />
        );
      })}

      {/* Center: root */}
      <motion.circle
        cx={cx} cy={cy} r={innerR}
        fill="var(--accent)"
        fillOpacity={0.1}
        stroke="var(--accent)"
        strokeWidth={2}
        filter="url(#glow)"
        initial={{ r: 0 }}
        whileInView={{ r: innerR }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: "spring" }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-accent" style={{ fontSize: 16, fontWeight: 700, fontFamily: "serif" }}>
        {sharedRoot.root}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 9, fontFamily: "monospace" }}>
        {truncateLabel(sharedRoot.language, 20)}
      </text>
      {sharedRoot.meaning && (
        <text x={cx} y={cy + 24} textAnchor="middle" className="fill-text-secondary" style={{ fontSize: 8 }}>
          {truncateLabel(sharedRoot.meaning, 25)}
        </text>
      )}

      {/* Outer: sibling words */}
      {display.map((sib, i) => {
        const angle = i * angleStep;
        const pos = polarToCartesian(cx, cy, outerR - 20, angle);
        const color = hashColor(sib);
        const isTarget = sib.toLowerCase() === word.toLowerCase();

        return (
          <motion.g
            key={sib}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
            style={{ cursor: "pointer", transformOrigin: `${pos.x}px ${pos.y}px` }}
            whileHover={{ scale: 1.15 }}
            onClick={() => router.push(`/word/${sib}`)}
          >
            <circle
              cx={pos.x} cy={pos.y}
              r={isTarget ? 22 : 18}
              fill={isTarget ? "var(--accent)" : color + "20"}
              stroke={isTarget ? "var(--accent)" : color}
              strokeWidth={isTarget ? 2 : 1.5}
              fillOpacity={isTarget ? 0.3 : 0.6}
            />
            <text
              x={pos.x} y={pos.y + 4}
              textAnchor="middle"
              fill={isTarget ? "var(--accent)" : color}
              style={{ fontSize: isTarget ? 10 : 9, fontFamily: "monospace", fontWeight: isTarget ? 700 : 400 }}
            >
              {truncateLabel(sib, 9)}
            </text>
          </motion.g>
        );
      })}

      {siblings.length > 14 && (
        <text x={cx} y={cy + innerR + 20} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 10, fontFamily: "monospace" }}>
          +{siblings.length - 14} more
        </text>
      )}
    </svg>
  );
}
