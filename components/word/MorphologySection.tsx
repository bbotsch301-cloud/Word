"use client";

import type { MorphologyData } from "@/types/lexica";

export default function MorphologySection({ data }: { data: MorphologyData }) {
  const parts = data.morphemes.split(/[>+\-{}()]/).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Visual decomposition */}
      <div className="flex items-center gap-1 flex-wrap">
        {parts.map((part, i) => {
          const isPrefix = i === 0 && data.prefix && parts.length > 1;
          const isSuffix = i === parts.length - 1 && data.suffix && parts.length > 1;
          const isRoot = !isPrefix && !isSuffix;

          return (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-muted text-lg">+</span>}
              <div className={`px-3 py-2 rounded-lg border text-center ${
                isRoot
                  ? "bg-accent-muted/30 border-accent/40 text-accent font-semibold"
                  : isPrefix
                    ? "bg-surface border-border text-text-secondary"
                    : "bg-surface border-border text-text-secondary"
              }`}>
                <div className="text-sm font-mono">{part}</div>
                <div className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
                  {isPrefix ? "prefix" : isSuffix ? "suffix" : "root"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw morpheme string */}
      <div className="text-xs text-text-muted font-mono">
        Segmentation: {data.morphemes} ({data.morphemeCount} morpheme{data.morphemeCount !== 1 ? "s" : ""})
      </div>
    </div>
  );
}
