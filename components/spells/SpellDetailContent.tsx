"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SpellCard } from "@/components/spells/SpellCard";
import { DivergenceTimeline } from "@/components/spells/DivergenceTimeline";
import { SpellChainViz } from "@/components/spells/SpellChainViz";
import { LetterSpellViz } from "@/components/spells/LetterSpellViz";

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

interface ChainStep {
  word: string;
  phonemeKey: string;
  changedPhoneme?: string;
}

interface DivergenceData {
  word1: string;
  word2: string;
  word1Path: { word: string; language: string }[];
  word2Path: { word: string; language: string }[];
}

interface LostDistinction {
  word1: string;
  word2: string;
  word1Origin: string;
  word2Origin: string;
  description: string;
}

interface SpellAnalysis {
  word: string;
  pronunciation: string;
  sonicSpells: SpellPair[];
  letterSpells: SpellPair[];
  chain: { steps: ChainStep[] };
  lostDistinctions: LostDistinction[];
  divergence?: DivergenceData;
}

export default function SpellDetailContent({ word }: { word: string }) {
  const [data, setData] = useState<SpellAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/spells?word=${encodeURIComponent(word)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => controller.abort();
  }, [word]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          <div className="h-12 w-48 bg-surface border border-border rounded-xl animate-pulse" />
          <div className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
          <div className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  const hasContent = data && (
    data.sonicSpells.length > 0 ||
    data.letterSpells.length > 0 ||
    (data.chain.steps.length > 1) ||
    data.lostDistinctions.length > 0
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <Link href="/spells" className="text-sm text-text-muted hover:text-accent transition-colors mb-2 inline-block">
            &larr; Word Spells
          </Link>
          <div className="flex items-baseline gap-4">
            <h1 className="font-serif text-4xl font-bold text-text-primary">{word}</h1>
            {data?.pronunciation && (
              <span className="text-text-muted text-sm font-mono">{data.pronunciation}</span>
            )}
          </div>
          <Link
            href={`/word/${encodeURIComponent(word)}`}
            className="text-sm text-accent hover:underline mt-1 inline-block"
          >
            View full word entry &rarr;
          </Link>
        </div>

        {!hasContent && (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg mb-2">No spells found for &ldquo;{word}&rdquo;</p>
            <p className="text-text-muted text-sm mb-6">This word has no known homophones, anagrams, or phoneme neighbors in our database.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/word/${encodeURIComponent(word)}`}
                className="text-sm text-accent hover:underline"
              >
                Explore &ldquo;{word}&rdquo; etymology &rarr;
              </Link>
              <span className="text-text-muted hidden sm:inline">·</span>
              <Link
                href="/spells"
                className="text-sm text-accent hover:underline"
              >
                Try featured spells &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Sonic Spells */}
        {data && data.sonicSpells.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-text-primary mb-1">Sonic Spells</h2>
            <p className="text-sm text-text-muted mb-4">Words that share the same sound but carry different meanings.</p>

            <div className="space-y-4">
              {data.sonicSpells.map((pair, i) => (
                <SpellCard
                  key={pair.words[1].word}
                  word1={pair.words[0].word}
                  word2={pair.words[1].word}
                  def1={pair.words[0].definition}
                  def2={pair.words[1].definition}
                  spellType="sonic"
                  description={pair.description}
                  depthScore={pair.depthScore}
                  delay={i * 0.05}
                />
              ))}
            </div>

            {/* Divergence Timeline for top pair */}
            {data.divergence && data.divergence.word1Path.length > 1 && data.divergence.word2Path.length > 1 && (
              <DivergenceTimeline
                word1={data.divergence.word1}
                word2={data.divergence.word2}
                path1={data.divergence.word1Path}
                path2={data.divergence.word2Path}
              />
            )}
          </section>
        )}

        {/* Letter Spells */}
        {data && data.letterSpells.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-text-primary mb-1">Letter Spells</h2>
            <p className="text-sm text-text-muted mb-4">Rearrange the letters to reveal hidden words.</p>

            <div className="space-y-4">
              {data.letterSpells.map((pair, i) => (
                <div key={pair.words[1].word}>
                  <SpellCard
                    word1={pair.words[0].word}
                    word2={pair.words[1].word}
                    def1={pair.words[0].definition}
                    def2={pair.words[1].definition}
                    spellType="letter"
                    description={pair.description}
                    depthScore={pair.depthScore}
                    delay={i * 0.05}
                  />
                  {i === 0 && (
                    <LetterSpellViz word1={pair.words[0].word} word2={pair.words[1].word} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Spell Chain */}
        {data && data.chain.steps.length > 1 && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-text-primary mb-1">Spell Chain</h2>
            <p className="text-sm text-text-muted mb-4">Walk through sound-space one phoneme at a time.</p>
            <SpellChainViz steps={data.chain.steps} />
          </section>
        )}

        {/* Lost Distinctions */}
        {data && data.lostDistinctions.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-xl font-semibold text-text-primary mb-1">The Unspeakable</h2>
            <p className="text-sm text-text-muted mb-4">Sounds that English collapsed — words that were once pronounced differently.</p>

            <div className="space-y-3">
              {data.lostDistinctions.map((ld, i) => (
                <motion.div
                  key={ld.word2}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface border border-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif font-semibold text-text-primary">{ld.word1}</span>
                    <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold">Lost Distinction</span>
                    <span className="font-serif font-semibold text-text-primary">{ld.word2}</span>
                  </div>
                  <div className="flex gap-4 mb-2 text-xs">
                    <span className="text-accent">Origin: {ld.word1Origin}</span>
                    <span className="text-amber-500">Origin: {ld.word2Origin}</span>
                  </div>
                  <p className="text-sm text-text-secondary italic">{ld.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </main>
  );
}
