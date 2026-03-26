"use client";

import Link from "next/link";
import type { DictionaryEntry } from "@/lib/dictionaries";

interface DictionaryTableProps {
  entries: DictionaryEntry[];
}

export default function DictionaryTable({ entries }: DictionaryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">No entries found.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="px-4 py-2.5 text-xs font-medium text-text-muted w-40">Word</th>
            <th className="px-4 py-2.5 text-xs font-medium text-text-muted">Definition</th>
            <th className="px-4 py-2.5 text-xs font-medium text-text-muted w-20 hidden md:table-cell">POS</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={`${entry.word}-${i}`}
              className="border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors"
            >
              <td className="px-4 py-2.5">
                <Link
                  href={`/word/${encodeURIComponent(entry.word)}`}
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  {entry.word}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-sm text-text-secondary line-clamp-2">
                {entry.definition}
              </td>
              <td className="px-4 py-2.5 text-xs text-text-muted hidden md:table-cell">
                {entry.pos || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
