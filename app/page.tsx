"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";

const EXAMPLE_WORDS = [
  "salary",
  "disaster",
  "silly",
  "awful",
  "nice",
  "muscle",
  "paradise",
  "tragedy",
];

export default function Home() {
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      if (stored) {
        setRecentWords(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const navigateToWord = (word: string) => {
    router.push(`/word/${encodeURIComponent(word.toLowerCase())}`);
  };

  return (
    <main className="home-glow min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center w-full max-w-xl">
        {/* Title */}
        <h1
          className="font-cormorant font-light tracking-archaeological text-parchment text-center mb-4"
          style={{ fontSize: "clamp(5rem, 12vw, 10rem)" }}
        >
          LEXICA
        </h1>

        {/* Tagline */}
        <p className="font-cormorant italic text-gold/70 text-lg md:text-xl mb-16 text-center">
          Excavate the buried history of words
        </p>

        {/* Search */}
        <SearchInput autoFocus />

        {/* Example words */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {EXAMPLE_WORDS.map((word) => (
            <button
              key={word}
              onClick={() => navigateToWord(word)}
              className="font-crimson italic text-sm text-parchment-dim border border-parchment/10 px-3 py-1.5 hover:text-gold hover:border-gold/30 transition-all"
              aria-label={`Excavate the word ${word}`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Recent excavations */}
        {recentWords.length > 0 && (
          <div className="mt-14 w-full">
            <p className="font-mono text-[9px] uppercase tracking-label text-gold/50 mb-4 text-center">
              Recent Digs
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {recentWords.map((word) => (
                <button
                  key={word}
                  onClick={() => navigateToWord(word)}
                  className="font-cormorant text-base text-parchment/60 border border-parchment/8 px-3 py-1 hover:text-gold hover:border-gold/25 transition-all"
                  aria-label={`Re-excavate ${word}`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
