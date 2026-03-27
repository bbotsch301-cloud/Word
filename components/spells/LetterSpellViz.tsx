"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface LetterSpellVizProps {
  word1: string;
  word2: string;
}

export function LetterSpellViz({ word1, word2 }: LetterSpellVizProps) {
  const [showSecond, setShowSecond] = useState(false);

  const letters1 = word1.toLowerCase().split("");
  const letters2 = word2.toLowerCase().split("");

  // Build position mapping: where does each letter of word1 go in word2?
  const used = new Array(letters2.length).fill(false);
  const mapping: number[] = letters1.map(letter => {
    const idx = letters2.findIndex((l, i) => l === letter && !used[i]);
    if (idx >= 0) used[idx] = true;
    return idx;
  });

  const boxW = 28;
  const boxH = 34;
  const gap = 4;
  const totalW = Math.max(letters1.length, letters2.length) * (boxW + gap);
  const padX = 20;

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Letter Rearrangement</h4>
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setShowSecond(!showSecond)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
          >
            {showSecond ? `Show "${word1}"` : `Rearrange to "${word2}"`}
          </button>
        </div>

        <svg
          viewBox={`0 0 ${totalW + padX * 2} ${boxH + 20}`}
          className="w-full"
          style={{ maxHeight: 70 }}
          role="img"
          aria-label={`Letters of "${word1}" rearranging to spell "${word2}"`}
        >
          {letters1.map((letter, i) => {
            const fromX = padX + i * (boxW + gap);
            const toIdx = mapping[i];
            const toX = toIdx >= 0 ? padX + toIdx * (boxW + gap) : fromX;

            return (
              <motion.g
                key={`letter-${i}`}
                initial={false}
                animate={{
                  x: showSecond ? toX - fromX : 0,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 15, delay: i * 0.04 }}
              >
                <rect
                  x={fromX}
                  y={8}
                  width={boxW}
                  height={boxH}
                  rx={5}
                  fill="var(--bg)"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
                <text
                  x={fromX + boxW / 2}
                  y={8 + boxH / 2 + 5}
                  textAnchor="middle"
                  className="fill-text-primary"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="var(--font-serif)"
                >
                  {letter}
                </text>
              </motion.g>
            );
          })}
        </svg>

        <div className="flex justify-center gap-3 mt-2">
          <span className={`text-sm font-serif font-semibold transition-colors ${!showSecond ? "text-accent" : "text-text-muted"}`}>
            {word1}
          </span>
          <span className="text-text-muted">&rarr;</span>
          <span className={`text-sm font-serif font-semibold transition-colors ${showSecond ? "text-accent" : "text-text-muted"}`}>
            {word2}
          </span>
        </div>
      </div>
    </div>
  );
}
