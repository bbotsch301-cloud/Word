"use client";

import { useState } from "react";
import type { BiblicalStudyData } from "@/types/lexica";
import Badge from "@/components/ui/Badge";

export default function BiblicalStudySection({ data }: { data: BiblicalStudyData }) {
  const [expandedNave, setExpandedNave] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Easton's Bible Dictionary */}
      {data.eastons && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="accent">Easton&apos;s</Badge>
            <span className="text-[10px] text-text-muted font-mono">1897</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.eastons.definition.length > 500
              ? data.eastons.definition.slice(0, 500) + "..."
              : data.eastons.definition}
          </p>
        </div>
      )}

      {/* Smith's Bible Dictionary */}
      {data.smiths && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="accent">Smith&apos;s</Badge>
            <span className="text-[10px] text-text-muted font-mono">1863</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.smiths.definition.length > 500
              ? data.smiths.definition.slice(0, 500) + "..."
              : data.smiths.definition}
          </p>
        </div>
      )}

      {/* Hitchcock's Bible Names */}
      {data.hitchcocks && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="muted">Hitchcock&apos;s Names</Badge>
            <span className="text-[10px] text-text-muted font-mono">1869</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed italic">
            {data.hitchcocks.meaning}
          </p>
        </div>
      )}

      {/* Nave's Topical Bible */}
      {data.naves && data.naves.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xs text-text-muted uppercase tracking-wider font-mono">
              Nave&apos;s Topical Bible
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {data.naves.map((entry, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4">
                <button
                  onClick={() => setExpandedNave(expandedNave === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-text-primary capitalize">{entry.topic}</span>
                  <span className="text-xs text-text-muted">
                    {entry.subtopics.length > 0 && `${entry.subtopics.length} subtopics`}
                    {entry.references.length > 0 && ` · ${entry.references.length} refs`}
                  </span>
                </button>
                {expandedNave === i && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {entry.subtopics.length > 0 && (
                      <div className="mb-2">
                        {entry.subtopics.slice(0, 10).map((sub, j) => (
                          <p key={j} className="text-xs text-text-secondary leading-relaxed">{sub}</p>
                        ))}
                      </div>
                    )}
                    {entry.references.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.references.slice(0, 20).map((ref, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 bg-accent-muted/20 text-accent rounded font-mono">
                            {ref}
                          </span>
                        ))}
                        {entry.references.length > 20 && (
                          <span className="text-[10px] text-text-muted">+{entry.references.length - 20} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
