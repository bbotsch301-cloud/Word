"use client";

import { motion } from "framer-motion";
import type { Stratum } from "@/types/lexica";
import { getFamilyColor, truncateLabel, parseEraToYear } from "@/lib/viz-utils";

interface EtymologyRiverProps {
  strata: Stratum[];
}

export default function EtymologyRiver({ strata }: EtymologyRiverProps) {
  if (strata.length < 2) return null;

  const reversed = [...strata].reverse(); // ancient → modern
  const padding = 40;
  const bandH = 50;
  const viewW = 600;
  const viewH = bandH + padding * 2 + 30;
  const usableW = viewW - padding * 2;
  const segW = usableW / reversed.length;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full" role="img" aria-label="Etymology river">
      <defs>
        {reversed.map((s, i) => {
          const color = getFamilyColor(s.language_family || "Other");
          const nextColor = i < reversed.length - 1
            ? getFamilyColor(reversed[i + 1].language_family || "Other")
            : color;
          return (
            <linearGradient key={`grad-${i}`} id={`river-grad-${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={nextColor} />
            </linearGradient>
          );
        })}
      </defs>

      {/* River bands */}
      {reversed.map((s, i) => {
        const x = padding + i * segW;
        const y = padding;
        const color = getFamilyColor(s.language_family || "Other");

        return (
          <motion.g key={i}>
            {/* Band */}
            <motion.rect
              x={x} y={y}
              width={segW + 1} height={bandH}
              rx={i === 0 ? 8 : 0}
              ry={i === 0 ? 8 : 0}
              fill={`url(#river-grad-${i})`}
              fillOpacity={0.25}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.4}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              style={{ transformOrigin: `${x}px ${y + bandH / 2}px` }}
            />

            {/* Language label */}
            <motion.text
              x={x + segW / 2}
              y={y + 20}
              textAnchor="middle"
              fill={color}
              style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {truncateLabel(s.language, 14)}
            </motion.text>

            {/* Form */}
            <motion.text
              x={x + segW / 2}
              y={y + 36}
              textAnchor="middle"
              className="fill-text-secondary"
              style={{ fontSize: 11, fontFamily: "serif", fontStyle: "italic" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {truncateLabel(s.form, 12)}
            </motion.text>

            {/* Junction marker */}
            {i > 0 && (
              <motion.circle
                cx={x} cy={y + bandH / 2} r={4}
                fill={color}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, type: "spring" }}
              />
            )}

            {/* Relationship type label */}
            {i > 0 && s.relationship_type && s.relationship_type !== "unknown" && (
              <motion.text
                x={x}
                y={y + bandH + 14}
                textAnchor="middle"
                className="fill-text-muted"
                style={{ fontSize: 8, fontFamily: "monospace" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.1 }}
              >
                {s.relationship_type}
              </motion.text>
            )}
          </motion.g>
        );
      })}

      {/* Arrow at end */}
      <motion.path
        d={`M ${padding + usableW + 5} ${padding + bandH / 2} l 10 0 l -5 -4 m 5 4 l -5 4`}
        stroke="var(--accent)"
        strokeWidth={1.5}
        fill="none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: reversed.length * 0.1 + 0.2 }}
      />
    </svg>
  );
}
