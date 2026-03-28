"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SearchField from "@/components/ui/SearchField";
import { useWordLists } from "@/components/WordListProvider";

const FEATURED_WORDS = [
  { word: "salary", hook: "From Latin sal — Roman soldiers were paid in salt", origin: "Latin" },
  { word: "disaster", hook: "From Italian disastro — literally 'bad star'", origin: "Italian" },
  { word: "silly", hook: "Once meant 'blessed' and 'innocent' in Old English", origin: "Old English" },
  { word: "nice", hook: "Originally meant 'ignorant' in Latin", origin: "Latin" },
  { word: "mortgage", hook: "From French mort gage — a 'death pledge'", origin: "French" },
  { word: "muscle", hook: "From Latin musculus — 'little mouse' under the skin", origin: "Latin" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function Home() {
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<{ word: string; definition: string } | null>(null);
  const { bookmarks } = useWordLists();
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      if (stored) setRecentWords(JSON.parse(stored));
    } catch {}

    fetch("/api/word-of-the-day")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setWordOfTheDay(data); })
      .catch(() => {});
  }, []);

  const handleSearch = (value: string) => {
    const word = value.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  return (
    <main className="min-h-screen">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-accent via-accent to-accent-secondary bg-clip-text text-transparent">
              LEXICA
            </h1>
            <p className="font-serif text-lg sm:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
              Every word has a story. Trace its origins across 27 historical sources.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-10 max-w-lg mx-auto"
          >
            <SearchField size="lg" placeholder="Search any English word..." onSubmit={handleSearch} autoFocus />
          </motion.div>
        </div>
      </section>

      {/* ============ WORD OF THE DAY — with etymology hook ============ */}
      {wordOfTheDay && (
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[10px] uppercase tracking-widest text-accent font-mono mb-4 block">
                Word of the Day
              </span>
              <Link href={`/word/${encodeURIComponent(wordOfTheDay.word)}`} className="group block">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary group-hover:text-accent transition-colors mb-2">
                  {wordOfTheDay.word}
                </h2>
                <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
                  {wordOfTheDay.definition.length > 200
                    ? wordOfTheDay.definition.slice(0, 200) + "..."
                    : wordOfTheDay.definition}
                </p>
                <span className="inline-block mt-3 text-sm text-accent font-medium">
                  Explore etymology &rarr;
                </span>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============ SURPRISING ORIGINS ============ */}
      <section className="border-t border-border bg-surface/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Words with surprising origins
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-muted mb-8 text-sm">
              Every word is an archaeological dig. Pick one and see what you uncover.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURED_WORDS.map(item => (
                <motion.div key={item.word} variants={fadeUp}>
                  <Link
                    href={`/word/${encodeURIComponent(item.word)}`}
                    className="block bg-bg border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-serif text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                        {item.word}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider shrink-0">
                        {item.origin}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{item.hook}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ RECENT WORDS / BOOKMARKS ============ */}
      {(recentWords.length > 0 || bookmarks.length > 0) && (
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            {bookmarks.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Bookmarks</h3>
                  {bookmarks.length > 12 && (
                    <Link href="/lists" className="text-xs text-accent hover:underline">View all &rarr;</Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {bookmarks.slice(0, 12).map(word => (
                    <Link
                      key={word}
                      href={`/word/${encodeURIComponent(word)}`}
                      className="text-sm font-serif text-text-secondary hover:text-accent bg-surface border border-border hover:border-accent/40 rounded-full px-3 py-1 transition-all"
                    >
                      {word}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {recentWords.length > 0 && (
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Recent</h3>
                <div className="flex flex-wrap gap-2">
                  {recentWords.map(word => (
                    <Link
                      key={word}
                      href={`/word/${encodeURIComponent(word)}`}
                      className="text-sm font-serif text-text-secondary hover:text-accent bg-surface border border-border hover:border-accent/40 rounded-full px-3 py-1 transition-all"
                    >
                      {word}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ SOURCES BANNER ============ */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/dictionaries"
            className="flex items-center justify-between gap-4 bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-accent/40 transition-all group"
          >
            <div>
              <p className="font-serif font-semibold text-text-primary group-hover:text-accent transition-colors">
                Built on 27+ sources
              </p>
              <p className="text-sm text-text-muted mt-0.5">
                From Webster&apos;s 1828 to modern Wiktionary, spanning two centuries of English.
              </p>
            </div>
            <span className="text-accent text-sm font-medium shrink-0">
              Browse &rarr;
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
