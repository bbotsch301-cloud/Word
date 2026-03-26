"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SearchField from "@/components/ui/SearchField";

const FEATURED_WORDS = [
  { word: "salary", hook: "From Latin sal \u2014 Roman soldiers were paid in salt" },
  { word: "disaster", hook: "From Italian disastro \u2014 literally 'bad star'" },
  { word: "silly", hook: "Once meant 'blessed' and 'innocent' in Old English" },
  { word: "nice", hook: "Originally meant 'ignorant' in Latin" },
  { word: "mortgage", hook: "From French mort gage \u2014 a 'death pledge'" },
  { word: "muscle", hook: "From Latin musculus \u2014 'little mouse' under the skin" },
];

const STATS = [
  { value: "800K+", label: "Words" },
  { value: "9", label: "Dictionaries" },
  { value: "1811\u20132024", label: "Spanning Centuries" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

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
    <main className="min-h-screen">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-accent via-accent to-accent-secondary bg-clip-text text-transparent">
              LEXICA
            </h1>
            <p className="font-serif text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Every word has a story. Trace definitions, etymologies, and meaning shifts
              across nine historical, legal, and biblical dictionaries.
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

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 flex justify-center gap-8 md:gap-16"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold font-mono text-accent">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ WHAT IS THIS ============ */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-bold text-text-primary text-center mb-3">
              More than a dictionary
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-muted text-center max-w-2xl mx-auto mb-12">
              LEXICA doesn&apos;t just define words. It excavates them &mdash; pulling up layers of meaning
              from multiple historical sources so you can see how language actually evolved.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Etymology Chains",
                  desc: "Trace a word from Modern English all the way back to its Proto-Indo-European roots, through every language it passed through.",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="4" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="20" r="2" />
                      <line x1="12" y1="6" x2="12" y2="10" /><line x1="12" y1="14" x2="12" y2="18" />
                    </svg>
                  ),
                },
                {
                  title: "Seven Dictionaries",
                  desc: "Compare how the same word was defined in 1811, 1828, 1913, and today. See meaning drift in real time across centuries.",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  ),
                },
                {
                  title: "Word Frequency",
                  desc: "Discover how common or rare a word is, and explore related terms, synonyms, and the full semantic neighborhood.",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="bg-surface border border-border rounded-xl p-6 shadow-sm"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ DISCOVER ============ */}
      <section className="border-t border-border bg-surface/50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-serif text-3xl font-bold text-text-primary text-center mb-3">
              Words with surprising origins
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-muted text-center max-w-xl mx-auto mb-10">
              Every word is an archaeological dig. Pick one and see what you uncover.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURED_WORDS.map((item) => (
                <motion.button
                  key={item.word}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch(item.word)}
                  className="text-left bg-bg border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-md transition-all group"
                >
                  <span className="font-serif text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                    {item.word}
                  </span>
                  <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{item.hook}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ RECENT WORDS ============ */}
      {recentWords.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-text-primary mb-4">Pick up where you left off</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {recentWords.map((word) => (
                <button
                  key={word}
                  onClick={() => handleSearch(word)}
                  className="text-sm font-serif text-text-secondary hover:text-accent bg-surface border border-border hover:border-accent/40 rounded-full px-4 py-1.5 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ SOURCES ============ */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h3 className="font-serif text-lg font-semibold text-text-primary text-center mb-6">Our Sources</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "Wiktionary", year: "2024", desc: "Modern definitions and etymologies" },
              { name: "Webster\u2019s 1828", year: "1828", desc: "Noah Webster\u2019s American Dictionary" },
              { name: "Webster\u2019s 1913", year: "1913", desc: "The Unabridged International" },
              { name: "Black\u2019s Law", year: "1910", desc: "Legal terminology reference" },
              { name: "Bouvier\u2019s Law", year: "1856", desc: "American legal dictionary" },
              { name: "Strong\u2019s Concordance", year: "1890", desc: "Biblical Hebrew & Greek roots" },
              { name: "Hobson-Jobson", year: "1886", desc: "Anglo-Indian words and phrases" },
              { name: "1811 Vulgar Tongue", year: "1811", desc: "Historical slang dictionary" },
            ].map((src) => (
              <Link
                key={src.name}
                href="/dictionaries"
                className="bg-surface border border-border rounded-lg p-4 hover:border-border-hover hover:bg-surface-hover transition-colors group"
              >
                <div className="font-serif font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">{src.name}</div>
                <div className="text-xs text-accent-secondary font-mono">{src.year}</div>
                <div className="text-xs text-text-muted mt-1">{src.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER CTA ============ */}
      <section className="border-t border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-text-primary mb-3">Start exploring</h2>
          <p className="text-text-muted mb-6">Type any word to uncover its full history.</p>
          <div className="max-w-md mx-auto">
            <SearchField size="lg" placeholder="Try a word..." onSubmit={handleSearch} />
          </div>
        </div>
      </section>
    </main>
  );
}
