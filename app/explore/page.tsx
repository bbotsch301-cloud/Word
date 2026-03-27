"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { LanguageComposition } from "@/components/word/LanguageComposition";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ExplorePage() {
  const router = useRouter();
  const [randomWord, setRandomWord] = useState<{ word: string; definition: string; etymology: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search?action=random");
      const data = await res.json();
      setRandomWord(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchRandom(); }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Explore</h1>
        <p className="text-text-muted mb-8">Discover the English language through different lenses.</p>

        {/* Random Word */}
        <section className="mb-10">
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-3">Random Discovery</h2>
          {randomWord && (
            <motion.div key={randomWord.word} initial="hidden" animate="show" variants={fadeUp}>
              <Card className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
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
            </motion.div>
          )}
        </section>

        {/* Language Composition */}
        <section className="mb-10">
          <LanguageComposition />
        </section>

        {/* Explorer Tools */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link href="/explore/timeline">
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary">Word Timeline</h3>
              </div>
              <p className="text-sm text-text-muted">
                Explore when English words were first recorded — from Old English to modern coinages.
              </p>
            </Card>
          </Link>

          <Link href="/explore/families">
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="14" />
                    <path d="M6 21v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
                    <circle cx="6" cy="13" r="2" /><circle cx="18" cy="13" r="2" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary">Language Families</h3>
              </div>
              <p className="text-sm text-text-muted">
                Browse English words grouped by their language of origin — Latin, Greek, French, Norse, and more.
              </p>
            </Card>
          </Link>

          <Link href="/search">
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary">Advanced Search</h3>
              </div>
              <p className="text-sm text-text-muted">
                Search by pattern, part of speech, CEFR level, origin language, or century of first use.
              </p>
            </Card>
          </Link>

          <Link href="/compare">
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary">Compare Words</h3>
              </div>
              <p className="text-sm text-text-muted">
                Place two words side by side to compare their etymologies, definitions, and usage.
              </p>
            </Card>
          </Link>

          <Link href="/spells">
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-text-primary">Word Spells</h3>
              </div>
              <p className="text-sm text-text-muted">
                Discover homophones, anagrams, and sound chains — hidden magic encoded in English words.
              </p>
            </Card>
          </Link>
        </section>
      </motion.div>
    </main>
  );
}
