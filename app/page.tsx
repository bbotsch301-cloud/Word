"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SearchField from "@/components/ui/SearchField";
import { useWordLists } from "@/components/WordListProvider";

const ETYMOLOGY_FACTS = [
  { word: "salary", fact: "Roman soldiers were paid in salt — sal in Latin became salary.", origin: "Latin" },
  { word: "disaster", fact: "Literally 'bad star' — from Italian disastro, when the stars were misaligned.", origin: "Italian" },
  { word: "muscle", fact: "From musculus, 'little mouse' — the Romans saw mice running under skin.", origin: "Latin" },
  { word: "mortgage", fact: "A 'death pledge' — French mort (death) + gage (pledge).", origin: "French" },
  { word: "nice", fact: "Once meant 'foolish, ignorant' in Latin. It took 700 years to become a compliment.", origin: "Latin" },
  { word: "clue", fact: "From 'clew,' a ball of thread — like Theseus used to escape the Minotaur's labyrinth.", origin: "Greek myth" },
  { word: "sarcasm", fact: "From Greek sarkazein — literally 'to tear flesh.' Words can bite.", origin: "Greek" },
  { word: "whiskey", fact: "From Gaelic uisce beatha — 'water of life.' The Irish took their water seriously.", origin: "Gaelic" },
];

interface WotdData {
  word: string;
  definition: string;
  phonetic?: string;
  pos?: string;
  etymologySnippet?: string;
}

const FALLBACK_WOTD: WotdData = {
  word: "serendipity",
  definition: "The faculty of making fortunate discoveries by accident.",
  phonetic: "/ˌsɛrənˈdɪpɪti/",
  pos: "noun",
  etymologySnippet: "Coined by Horace Walpole in 1754, from the Persian fairy tale 'The Three Princes of Serendip.'",
};

export default function Home() {
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<WotdData>(FALLBACK_WOTD);
  const [currentFact, setCurrentFact] = useState(0);
  const { bookmarks } = useWordLists();
  const router = useRouter();
  const factInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      if (stored) setRecentWords(JSON.parse(stored));
    } catch {}

    fetch("/api/word-of-the-day")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.word) setWordOfTheDay({ ...FALLBACK_WOTD, ...data }); })
      .catch(() => {});

    setCurrentFact(Math.floor(Math.random() * ETYMOLOGY_FACTS.length));
    factInterval.current = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % ETYMOLOGY_FACTS.length);
    }, 8000);
    return () => { if (factInterval.current) clearInterval(factInterval.current); };
  }, []);

  const handleSearch = (value: string) => {
    const word = value.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  const fact = ETYMOLOGY_FACTS[currentFact];

  return (
    <main className="min-h-screen">
      {/* ============ HERO — Full viewport, centered ============ */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Animated background orbs */}
        <div className="hero-orbs" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-3 hero-title"
          >
            LEXICA
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-lg sm:text-xl text-text-secondary mb-12 tracking-wide"
          >
            Explore the roots of every word
          </motion.p>

          {/* Search bar — huge and prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hero-search-wrapper"
          >
            <SearchField size="lg" placeholder="Search any word..." onSubmit={handleSearch} autoFocus />
          </motion.div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-xs text-text-muted mt-4 font-mono tracking-wide"
          >
            Try &ldquo;love&rdquo; &middot; &ldquo;disaster&rdquo; &middot; &ldquo;serendipity&rdquo; &middot; &ldquo;melancholy&rdquo; &middot; &ldquo;ephemeral&rdquo;
          </motion.p>

          {/* Recent searches */}
          {recentWords.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-8"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-2.5">
                Recent
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {recentWords.slice(0, 8).map(word => (
                  <Link
                    key={word}
                    href={`/word/${encodeURIComponent(word)}`}
                    className="recent-chip"
                  >
                    {word}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </section>

      {/* ============ DID YOU KNOW? — rotating etymology fact ============ */}
      <section className="border-t border-border relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-6">
            Did you know?
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFact}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Link href={`/word/${encodeURIComponent(fact.word)}`} className="group block">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary group-hover:text-accent transition-colors mb-3">
                  {fact.word}
                </h2>
                <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-xl">
                  {fact.fact}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted bg-surface border border-border rounded-full px-2.5 py-0.5">
                    {fact.origin}
                  </span>
                  <span className="text-sm text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Fact dots */}
          <div className="flex gap-1.5 mt-8">
            {ETYMOLOGY_FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFact(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentFact ? "bg-accent w-4" : "bg-border hover:bg-text-muted"
                }`}
                aria-label={`Show fact ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ WORD OF THE DAY ============ */}
      <section className="border-t border-border bg-surface/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-secondary mb-4">
              Word of the Day
            </p>
            <Link href={`/word/${encodeURIComponent(wordOfTheDay.word)}`} className="group block wotd-card">
              <div className="wotd-card-inner">
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <h2 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary group-hover:text-accent transition-colors">
                    {wordOfTheDay.word}
                  </h2>
                  {wordOfTheDay.pos && (
                    <span className="text-xs italic text-text-muted font-serif">{wordOfTheDay.pos}</span>
                  )}
                </div>
                {wordOfTheDay.phonetic && (
                  <p className="font-mono text-sm text-accent-secondary mb-3">
                    {wordOfTheDay.phonetic}
                  </p>
                )}
                <p className="text-text-secondary leading-relaxed max-w-xl">
                  {wordOfTheDay.definition.length > 180
                    ? wordOfTheDay.definition.slice(0, 180) + "..."
                    : wordOfTheDay.definition}
                </p>
                {wordOfTheDay.etymologySnippet && (
                  <p className="text-sm text-text-muted italic leading-relaxed mt-3 max-w-xl border-l-2 border-accent/30 pl-3">
                    {wordOfTheDay.etymologySnippet}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 mt-5 text-sm text-accent font-medium">
                  Discover its origins
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ BOOKMARKS ============ */}
      {bookmarks.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
                Your bookmarks
              </p>
              {bookmarks.length > 12 && (
                <Link href="/lists" className="text-xs text-accent hover:underline">View all &rarr;</Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmarks.slice(0, 12).map(word => (
                <Link
                  key={word}
                  href={`/word/${encodeURIComponent(word)}`}
                  className="recent-chip"
                >
                  {word}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ SOURCES — minimal ============ */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href="/dictionaries"
            className="group flex items-center justify-between gap-4 source-banner"
          >
            <div>
              <p className="font-serif font-semibold text-text-primary group-hover:text-accent transition-colors">
                Built on 27+ historical sources
              </p>
              <p className="text-sm text-text-muted mt-0.5">
                Webster&apos;s 1828, Strong&apos;s Concordance, Wiktionary, and more.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
