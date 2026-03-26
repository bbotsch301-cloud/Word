"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STATUS_MESSAGES = [
  "Surveying the surface layer…",
  "Dating the sediment…",
  "Cross-referencing the corpus…",
  "Descending through centuries…",
  "Reaching the bedrock…",
  "Unearthing the root…",
];

const BAR_COLORS = [
  "bg-accent-0",
  "bg-accent-1",
  "bg-accent-2",
  "bg-accent-3",
  "bg-accent-4",
  "bg-accent-root",
];

export default function ExcavationLoader({ word }: { word: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="font-mono text-[9px] uppercase tracking-label text-gold/60 mb-8">
        Excavating
      </p>
      <h2 className="font-cormorant text-4xl md:text-5xl font-light tracking-subtle text-parchment mb-12">
        {word}
      </h2>

      <div className="flex flex-col gap-2 w-48 mb-10">
        {BAR_COLORS.map((color, i) => (
          <motion.div
            key={i}
            className={`h-2 ${color} rounded-sm origin-left`}
            initial={{ scaleX: 0, opacity: 0.3 }}
            animate={{
              scaleX: [0, 1, 0.6, 1],
              opacity: [0.3, 0.8, 0.5, 0.7],
            }}
            transition={{
              duration: 2,
              delay: i * 0.25,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="font-crimson italic text-parchment/50 text-sm"
      >
        {STATUS_MESSAGES[messageIndex]}
      </motion.p>
    </div>
  );
}
