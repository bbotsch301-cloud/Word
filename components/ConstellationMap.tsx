"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ConstellationWord } from "@/types/lexica";

interface ConstellationMapProps {
  words: ConstellationWord[];
  centerWord: string;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function ConstellationMap({ words, centerWord }: ConstellationMapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  const stars = useMemo(() => {
    const rand = seededRandom(centerWord.length * 7 + 42);
    return Array.from({ length: 28 }, () => ({
      x: rand() * 420,
      y: rand() * 420,
      r: rand() * 1.2 + 0.3,
      opacity: rand() * 0.3 + 0.05,
    }));
  }, [centerWord]);

  const cx = 210;
  const cy = 210;
  const radius = 155;

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 420 420"
        className="w-full max-w-[420px] h-auto"
        role="img"
        aria-label={`Constellation map for ${centerWord} and related words`}
      >
        {/* Background stars */}
        {stars.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#ede0c0"
            opacity={star.opacity}
          />
        ))}

        {/* Connector lines */}
        {words.map((_, i) => {
          const angle = (i / words.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return (
            <line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#c8920a"
              strokeWidth={0.5}
              strokeDasharray="4 4"
              opacity={hoveredIndex === i ? 0.6 : 0.15}
              className="transition-opacity duration-300"
            />
          );
        })}

        {/* Center node */}
        <circle cx={cx} cy={cy} r={28} fill="#c8920a" opacity={0.9} />
        <circle cx={cx} cy={cy} r={28} fill="none" stroke="#e8b430" strokeWidth={1} opacity={0.5} />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-cormorant text-[13px] font-light"
          fill="#080502"
        >
          {centerWord}
        </text>

        {/* Satellite nodes */}
        {words.map((w, i) => {
          const angle = (i / words.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const isHovered = hoveredIndex === i;

          return (
            <motion.g
              key={`sat-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.8 + i * 0.12,
              }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => router.push(`/word/${encodeURIComponent(w.word.toLowerCase())}`)}
              className="cursor-pointer"
              role="button"
              aria-label={`Explore ${w.word} — ${w.relationship}`}
            >
              <circle
                cx={x}
                cy={y}
                r={22}
                fill={isHovered ? "#c8920a" : "#0d0804"}
                stroke={isHovered ? "#e8b430" : "#c8920a"}
                strokeWidth={isHovered ? 1.5 : 0.8}
                opacity={isHovered ? 1 : 0.7}
                className="transition-all duration-200"
              />

              {/* Relationship label */}
              <text
                x={x}
                y={y - 30}
                textAnchor="middle"
                className="font-mono text-[7px] uppercase"
                fill="#c8920a"
                opacity={isHovered ? 0.8 : 0.4}
              >
                {w.relationship}
              </text>

              {/* Word label */}
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-cormorant text-[11px] font-light"
                fill={isHovered ? "#080502" : "#ede0c0"}
              >
                {w.word}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
