import type { Metadata } from "next";
import Link from "next/link";
import { getAllDictionaries } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "Dictionaries — LEXICA",
  description: "Browse 7 reference works spanning centuries of the English language.",
};

export default function DictionariesPage() {
  const dictionaries = getAllDictionaries();

  return (
    <main className="max-w-4xl mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">
        Dictionaries
      </h1>
      <p className="text-text-muted mb-8">
        Browse individual reference works spanning centuries of the English language.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dictionaries.map((dict) => (
          <Link
            key={dict.id}
            href={`/dictionaries/${dict.id}`}
            className="group block bg-surface border border-border rounded-lg p-5 hover:border-border-hover hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                {dict.name}
              </h2>
              <span className="text-xs font-medium text-text-muted bg-surface rounded-full px-2.5 py-0.5 border border-border">
                {dict.entry_count.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-2">{dict.year}</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {dict.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
