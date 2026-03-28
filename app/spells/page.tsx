"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SpellCard } from "@/components/spells/SpellCard";

interface SpellMatch {
  word: string;
  definition: string;
  etymology: string;
  etymologyLang: string;
  pos: string;
  ipa: string;
  phonemeKey: string;
  frequency?: number;
}

interface SpellPair {
  words: [SpellMatch, SpellMatch];
  spellType: "sonic" | "letter" | "chain" | "lost";
  description: string;
  depthScore: number;
}

type TabId = "all" | "sonic" | "letter";

export default function SpellsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<SpellPair[]>([]);
  const [randomSpell, setRandomSpell] = useState<SpellPair | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetch("/api/spells?action=featured")
      .then(r => r.json())
      .then(d => { setFeatured(d.pairs || []); setLoadingFeatured(false); })
      .catch((err) => { console.error("Failed to load featured spells:", err); setLoadingFeatured(false); });
  }, []);

  const fetchRandom = useCallback(async () => {
    setRandomLoading(true);
    try {
      const res = await fetch("/api/spells?action=random");
      const data = await res.json();
      if (data && data.words && data.words.length === 2) {
        setRandomSpell(data);
      }
    } catch {}
    setRandomLoading(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/spells/${encodeURIComponent(query.trim().toLowerCase())}`);
    }
  };

  const filteredFeatured = activeTab === "all"
    ? featured
    : featured.filter(p => p.spellType === activeTab);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl font-bold text-text-primary mb-3">
            Word Spells
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Words that sound alike or share letters cast semantic shadows on each other.
            Discover the hidden magic encoded in English — where <em>morning</em> meets <em>mourning</em>,
            and <em>listen</em> rearranges to <em>silent</em>.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-10">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="6.5" cy="6.5" r="5" /><line x1="10" y1="10" x2="15" y2="15" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type any word to reveal its spells..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-all"
              autoFocus
            />
          </div>
        </form>

        {/* Reveal a Spell */}
        <section className="mb-10 text-center">
          <button
            onClick={fetchRandom}
            disabled={randomLoading}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {randomLoading ? "Revealing..." : "Reveal a Spell"}
          </button>

          {randomSpell && (
            <motion.div
              key={randomSpell.words[0].word + randomSpell.words[1].word}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 max-w-md mx-auto"
            >
              <SpellCard
                word1={randomSpell.words[0].word}
                word2={randomSpell.words[1].word}
                def1={randomSpell.words[0].definition}
                def2={randomSpell.words[1].definition}
                spellType={randomSpell.spellType}
                description={randomSpell.description}
                depthScore={randomSpell.depthScore}
              />
            </motion.div>
          )}
        </section>

        {/* Featured Spells */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-text-primary">Featured Spells</h2>
            <div className="flex gap-1">
              {([["all", "All"], ["sonic", "Sonic"], ["letter", "Letter"]] as [TabId, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`text-xs px-3 py-2.5 sm:py-1.5 rounded-lg transition-colors ${
                    activeTab === id
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loadingFeatured ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredFeatured.map((pair, i) => (
                <SpellCard
                  key={pair.words[0].word + pair.words[1].word}
                  word1={pair.words[0].word}
                  word2={pair.words[1].word}
                  def1={pair.words[0].definition}
                  def2={pair.words[1].definition}
                  spellType={pair.spellType}
                  description={pair.description}
                  depthScore={pair.depthScore}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-xl font-semibold text-text-primary mb-4">What Are Word Spells?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-text-secondary">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Sonic Spells</h3>
              <p>Homophones — words that sound identical but carry different meanings and origins. They&apos;re phonetic collisions where unrelated meanings share the same breath.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Letter Spells</h3>
              <p>Anagrams with semantic resonance — words whose letters rearrange to form other words, often with uncanny connections in meaning.</p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Spell Chains</h3>
              <p>Walk through sound-space one phoneme at a time, watching meanings transform as each sound shifts. Night becomes knight becomes knit.</p>
            </div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}
