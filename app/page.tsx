"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchField from "@/components/ui/SearchField";

const EXAMPLE_WORDS = [
  "salary", "disaster", "silly", "awful", "nice", "muscle",
  "paradise", "tragedy", "liberty", "mortgage", "bungalow",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
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
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center w-full max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-5xl md:text-6xl font-bold tracking-tight mb-3 bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent"
        >
          LEXICA
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-serif italic text-text-secondary text-center mb-8 text-lg"
        >
          Trace every word to its roots
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <SearchField size="lg" placeholder="Look up any word..." onSubmit={handleSearch} autoFocus />
        </motion.div>

        {/* Decorative divider */}
        <div className="relative w-full max-w-xs my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-border-hover to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-border-hover" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-2"
        >
          {EXAMPLE_WORDS.map((word) => (
            <motion.button
              key={word}
              variants={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSearch(word)}
              className="text-sm text-text-muted hover:text-accent bg-surface hover:bg-accent-muted border border-border hover:border-accent-subtle rounded-full px-3.5 py-1.5 transition-colors shadow-sm"
            >
              {word}
            </motion.button>
          ))}
        </motion.div>

        {recentWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 w-full"
          >
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Recent
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
            </div>
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
          </motion.div>
        )}

        <p className="mt-12 text-xs text-text-muted text-center font-mono tracking-wide">
          Wiktionary &middot; Webster&apos;s 1828 &middot; Webster&apos;s 1913 &middot; Black&apos;s Law &middot; Hobson-Jobson &middot; 1811 Vulgar Tongue
        </p>
      </div>
    </main>
  );
}
