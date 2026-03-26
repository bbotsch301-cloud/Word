"use client";

import { motion } from "framer-motion";

interface SemanticShiftProps {
  fromForm: string;
  toForm: string;
  fromLang: string;
  toLang: string;
  familyColor: string;
}

export default function SemanticShift({
  fromForm,
  toForm,
  fromLang,
  toLang,
  familyColor,
}: SemanticShiftProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center py-1"
    >
      {/* Dashed vertical connector */}
      <svg width="2" height="16" className="overflow-visible">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="16"
          stroke="rgba(200,146,10,0.3)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Shift pill */}
      <div
        className="inline-flex items-center gap-1 font-mono text-[8px] px-2 py-0.5 rounded-full"
        style={{
          color: familyColor,
          backgroundColor: `${familyColor}15`,
          border: `1px solid ${familyColor}30`,
        }}
      >
        <span>{fromForm}</span>
        <span className="text-parchment/30">&rarr;</span>
        <span>{toForm}</span>
      </div>

      {/* Dashed vertical connector */}
      <svg width="2" height="16" className="overflow-visible">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="16"
          stroke="rgba(200,146,10,0.3)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
    </motion.div>
  );
}
