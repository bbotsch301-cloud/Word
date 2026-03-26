"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";

const EXAMPLE_WORDS = [
  "salary", "disaster", "silly", "awful", "nice", "muscle",
  "paradise", "tragedy", "liberty", "mortgage", "bungalow",
];

export default function Home() {
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      if (stored) setRecentWords(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSearch = (value: string) => {
    const word = value.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center w-full max-w-xl">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2">
          LEXICA
        </h1>
        <p className="text-text-muted text-center mb-8">
          Search 800K+ words across 7 historical dictionaries
        </p>

        <div className="w-full max-w-md">
          <SearchField size="lg" placeholder="Look up any word..." onSubmit={handleSearch} autoFocus />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {EXAMPLE_WORDS.map((word) => (
            <button
              key={word}
              onClick={() => handleSearch(word)}
              className="text-sm text-text-muted hover:text-accent border border-border hover:border-accent-subtle rounded-full px-3 py-1 transition-colors"
            >
              {word}
            </button>
          ))}
        </div>

        {recentWords.length > 0 && (
          <div className="mt-10 w-full">
            <p className="text-xs font-medium text-text-muted mb-3 text-center">
              Recent
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {recentWords.map((word) => (
                <button
                  key={word}
                  onClick={() => handleSearch(word)}
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-12 text-xs text-text-muted text-center">
          Wiktionary &middot; Webster&apos;s 1828 &middot; Webster&apos;s 1913 &middot; Black&apos;s Law &middot; Hobson-Jobson &middot; 1811 Vulgar Tongue
        </p>
      </div>
    </main>
  );
}
