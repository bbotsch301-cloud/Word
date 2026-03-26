"use client";

import Link from "next/link";
import type { DictionaryEntry } from "@/lib/dictionaries";

interface DictionaryBrowserProps {
  entries: DictionaryEntry[];
  dictId: string;
}

export default function DictionaryBrowser({ entries, dictId }: DictionaryBrowserProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-crimson text-parchment/50 italic">No entries found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry, i) => (
        <div
          key={`${entry.word}-${i}`}
          className="group border-b border-parchment/5 py-3 hover:bg-stratum-0/50 px-3 -mx-3 transition-colors"
        >
          <div className="flex items-baseline gap-3">
            <Link
              href={`/word/${encodeURIComponent(entry.word)}`}
              className="font-cormorant text-xl font-light text-parchment hover:text-gold transition-colors shrink-0"
            >
              {entry.word}
            </Link>
            {entry.pos && (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-parchment/30">
                {entry.pos}
              </span>
            )}
          </div>
          <p className="font-crimson text-sm text-parchment/55 leading-relaxed mt-1 line-clamp-2">
            {entry.definition}
          </p>
          {entry.etymology && (
            <p className="font-crimson text-xs italic text-gold/30 mt-1 line-clamp-1">
              {entry.etymology}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
