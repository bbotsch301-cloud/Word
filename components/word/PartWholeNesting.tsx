"use client";

import { motion } from "framer-motion";
import { truncateLabel } from "@/lib/viz-utils";
import { useRouter } from "next/navigation";

interface PartWholeNestingProps {
  word: string;
  partsOf: string[];
  hasParts: string[];
}

export default function PartWholeNesting({ word, partsOf, hasParts }: PartWholeNestingProps) {
  const router = useRouter();
  if (partsOf.length + hasParts.length < 2) return null;

  const cx = 250, cy = 200;

  // Layout: outer ring (partsOf), middle ring (word), inner cluster (hasParts)
  const outerRx = 200, outerRy = 150;
  const midRx = 110, midRy = 80;
  const innerR = 35;

  const outerItems = partsOf.slice(0, 6);
  const innerItems = hasParts.slice(0, 6);

  return (
    <svg viewBox="0 0 500 400" className="w-full max-w-md mx-auto" role="img" aria-label="Part-whole nesting">
      {/* Outer ring: things this word is part of */}
      {outerItems.length > 0 && (
        <motion.ellipse
          cx={cx} cy={cy} rx={outerRx} ry={outerRy}
          fill="none"
          stroke="var(--border-hover)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      )}

      {/* Outer labels */}
      {outerItems.map((w, i) => {
        const angle = (i / outerItems.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + outerRx * Math.cos(angle) * 0.85;
        const y = cy + outerRy * Math.sin(angle) * 0.85;
        return (
          <motion.g
            key={`outer-${w}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.1 }}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/word/${w}`)}
          >
            <circle cx={x} cy={y} r={22} fill="var(--border)" fillOpacity={0.15} stroke="var(--border-hover)" strokeWidth={1} />
            <text x={x} y={y + 4} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 9, fontFamily: "monospace" }}>
              {truncateLabel(w, 9)}
            </text>
          </motion.g>
        );
      })}

      {/* Middle ring: the word itself */}
      <motion.ellipse
        cx={cx} cy={cy} rx={midRx} ry={midRy}
        fill="var(--accent)"
        fillOpacity={0.08}
        stroke="var(--accent)"
        strokeWidth={2}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <motion.text
        x={cx} y={cy - midRy + 18}
        textAnchor="middle"
        className="fill-accent"
        style={{ fontSize: 14, fontWeight: 700, fontFamily: "serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        {word}
      </motion.text>

      {/* Inner cluster: parts of this word */}
      {innerItems.map((w, i) => {
        const angle = (i / Math.max(innerItems.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const dist = innerItems.length === 1 ? 0 : innerR + 15;
        const x = cx + dist * Math.cos(angle);
        const y = cy + dist * Math.sin(angle) + 10;
        return (
          <motion.g
            key={`inner-${w}`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.08, type: "spring" }}
            style={{ cursor: "pointer", transformOrigin: `${x}px ${y}px` }}
            whileHover={{ scale: 1.1 }}
            onClick={() => router.push(`/word/${w}`)}
          >
            <circle cx={x} cy={y} r={18} fill="var(--accent-secondary)" fillOpacity={0.15} stroke="var(--accent-secondary)" strokeWidth={1.5} />
            <text x={x} y={y + 4} textAnchor="middle" className="fill-accent-secondary" style={{ fontSize: 9, fontFamily: "monospace" }}>
              {truncateLabel(w, 8)}
            </text>
          </motion.g>
        );
      })}

      {/* Labels */}
      {outerItems.length > 0 && (
        <text x={cx} y={30} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 8, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2 }}>
          part of
        </text>
      )}
      {innerItems.length > 0 && (
        <text x={cx} y={cy + midRy - 10} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 8, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2 }}>
          contains
        </text>
      )}
    </svg>
  );
}
