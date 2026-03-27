"use client";

import { motion } from "framer-motion";
import { truncateLabel } from "@/lib/viz-utils";

interface PolysemyTreeProps {
  word: string;
  senseCount: number;
  sampleSenses: string[];
}

export default function PolysemyTree({ word, senseCount, sampleSenses }: PolysemyTreeProps) {
  if (sampleSenses.length < 3) return null;

  const viewW = 600, viewH = 380;
  const trunkX = viewW / 2;
  const trunkTop = 280;
  const trunkBottom = 350;
  const display = sampleSenses.slice(0, 8);
  const ghostCount = Math.max(0, senseCount - display.length);

  // Branch layout: alternate left/right, spread vertically
  const branchSpacing = Math.min(60, 240 / display.length);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full max-w-lg mx-auto" role="img" aria-label={`Polysemy tree: ${senseCount} senses`}>
      {/* Trunk */}
      <motion.rect
        x={trunkX - 12}
        width={24}
        rx={4}
        fill="var(--border-hover)"
        initial={{ y: trunkBottom, height: 0 }}
        whileInView={{ y: trunkTop, height: trunkBottom - trunkTop }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      />

      {/* Word label on trunk */}
      <motion.text
        x={trunkX} y={trunkBottom + 20}
        textAnchor="middle"
        className="fill-text-primary"
        style={{ fontSize: 14, fontWeight: 700, fontFamily: "serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {word}
      </motion.text>

      {/* Branches */}
      {display.map((sense, i) => {
        const isLeft = i % 2 === 0;
        const branchY = trunkTop - 10 - Math.floor(i / 2) * branchSpacing;
        const endX = isLeft ? trunkX - 120 - (i % 3) * 30 : trunkX + 120 + (i % 3) * 30;
        const endY = branchY - 15;
        const ctrlX = isLeft ? trunkX - 50 : trunkX + 50;

        const path = `M ${trunkX} ${branchY} C ${ctrlX} ${branchY} ${ctrlX} ${endY} ${endX} ${endY}`;
        const color = `hsl(${(i * 40 + 200) % 360}, 60%, 55%)`;

        return (
          <motion.g key={i}>
            {/* Branch line */}
            <motion.path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={Math.max(2, 5 - i * 0.4)}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            />

            {/* Leaf circle */}
            <motion.circle
              cx={endX} cy={endY} r={10}
              fill={color}
              fillOpacity={0.2}
              stroke={color}
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
              style={{ transformOrigin: `${endX}px ${endY}px` }}
            />

            {/* Sense number */}
            <motion.text
              x={endX} y={endY + 4}
              textAnchor="middle"
              fill={color}
              style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              {i + 1}
            </motion.text>

            {/* Sense label */}
            <motion.text
              x={endX + (isLeft ? -16 : 16)}
              y={endY + 4}
              textAnchor={isLeft ? "end" : "start"}
              className="fill-text-secondary"
              style={{ fontSize: 9 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.75 + i * 0.1 }}
            >
              {truncateLabel(sense, 28)}
            </motion.text>
          </motion.g>
        );
      })}

      {/* Ghost branches for remaining senses */}
      {ghostCount > 0 && (
        <motion.text
          x={trunkX} y={30}
          textAnchor="middle"
          className="fill-text-muted"
          style={{ fontSize: 10, fontFamily: "monospace" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
        >
          +{ghostCount} more meanings
        </motion.text>
      )}
    </svg>
  );
}
