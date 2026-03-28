"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Card from "@/components/ui/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ExplorePage() {
  const [randomWord, setRandomWord] = useState<{ word: string; definition: string; etymology: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search?action=random");
      const data = await res.json();
      setRandomWord(data);
    } catch {
      setRandomWord(null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRandom(); }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-2">Explore</h1>
        <p className="text-text-muted text-sm mb-8">Discover English through different lenses.</p>

        {/* Random Word */}
        {randomWord && (
          <motion.section key={randomWord.word} initial="hidden" animate="show" variants={fadeUp} className="mb-10">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">Random Discovery</span>
                  <Link
                    href={`/word/${encodeURIComponent(randomWord.word)}`}
                    className="font-serif text-2xl font-bold text-accent hover:underline"
                  >
                    {randomWord.word}
                  </Link>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{randomWord.definition}</p>
                  {randomWord.etymology && (
                    <p className="text-xs text-text-muted mt-2 italic line-clamp-2">{randomWord.etymology}</p>
                  )}
                </div>
                <button
                  onClick={fetchRandom}
                  disabled={loading}
                  className="shrink-0 p-2 rounded-lg border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-50"
                  title="New random word"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                </button>
              </div>
            </Card>
          </motion.section>
        )}

        {/* Discovery Tools */}
        <section className="grid sm:grid-cols-2 gap-3">
          <Link href="/explore/timeline">
            <Card hover className="h-full">
              <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">Word Timeline</h3>
              <p className="text-sm text-text-muted">
                Explore when words entered English — from Old English to modern coinages.
              </p>
            </Card>
          </Link>

          <Link href="/explore/families">
            <Card hover className="h-full">
              <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">Language Families</h3>
              <p className="text-sm text-text-muted">
                Browse words by origin — Latin, Greek, French, Norse, and more.
              </p>
            </Card>
          </Link>

          <Link href="/spells">
            <Card hover className="h-full">
              <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">Word Spells</h3>
              <p className="text-sm text-text-muted">
                Discover homophones, anagrams, and sound chains hidden in English.
              </p>
            </Card>
          </Link>

          <Link href="/compare">
            <Card hover className="h-full">
              <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">Compare Words</h3>
              <p className="text-sm text-text-muted">
                Place words side by side to compare etymologies, definitions, and usage.
              </p>
            </Card>
          </Link>
        </section>
      </motion.div>
    </main>
  );
}
