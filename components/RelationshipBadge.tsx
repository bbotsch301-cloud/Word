"use client";

import { motion } from "framer-motion";
import type { RelationshipType } from "@/types/lexica";

interface RelationshipBadgeProps {
  type: RelationshipType;
}

export default function RelationshipBadge({ type }: RelationshipBadgeProps) {
  if (type === "root" || type === "unknown") return null;

  const config: Record<string, { symbol: string; label: string; className: string }> = {
    inherited: { symbol: "\u2193", label: "inherited", className: "text-parchment/50" },
    borrowed: { symbol: "\u2190", label: "borrowed", className: "text-gold/60" },
    derived: { symbol: "\u2295", label: "derived", className: "text-parchment/40" },
  };

  const { symbol, label, className } = config[type];

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1 font-mono text-[7px] uppercase tracking-[0.2em] ${className}`}
    >
      <span>{symbol}</span>
      <span>{label}</span>
    </motion.span>
  );
}
