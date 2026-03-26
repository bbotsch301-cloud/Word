"use client";

import { motion } from "framer-motion";

const FAMILY_COLORS: Record<string, string> = {
  germanic: "#7c9eb2",
  romance: "#b87a4b",
  hellenic: "#8b7bb8",
  celtic: "#6b9b6b",
  indoiranian: "#c4956a",
  "indo-iranian": "#c4956a",
  semitic: "#a67c52",
  proto: "#c8920a",
};

function resolveColor(family: string): string {
  const key = family.toLowerCase().replace(/[\s-]+/g, "");
  for (const [k, v] of Object.entries(FAMILY_COLORS)) {
    if (key.includes(k.replace(/-/g, ""))) return v;
  }
  return "#c8920a";
}

interface LanguageBadgeProps {
  family: string;
}

export default function LanguageBadge({ family }: LanguageBadgeProps) {
  const color = resolveColor(family);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center font-mono text-[7px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
      style={{
        color,
        backgroundColor: `${color}26`,
        border: `1px solid ${color}40`,
      }}
    >
      {family}
    </motion.span>
  );
}
