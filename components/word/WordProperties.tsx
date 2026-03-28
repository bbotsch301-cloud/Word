'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LexicaResult } from '@/types/lexica';
import {
  computeScrabbleScore,
  computeLetterStats,
  computeSyllableCount,
  computeStressPattern,
  computeWordAge,
  computeRarityPercentile,
  computeLanguageJourney,
  computeFormality,
} from '@/lib/word-properties';

interface Props {
  result: LexicaResult;
}

function PropertyCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-sm">
      <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{label}</div>
      <div className="text-sm font-medium text-text-primary mt-1">{value}</div>
      {detail && <div className="text-[10px] text-text-muted mt-0.5">{detail}</div>}
    </div>
  );
}

function WordChip({ word }: { word: string }) {
  return (
    <Link
      href={`/word/${encodeURIComponent(word)}`}
      className="inline-block text-xs font-serif text-text-secondary hover:text-accent bg-bg border border-border hover:border-accent/40 rounded-full px-2.5 py-0.5 transition-colors"
    >
      {word}
    </Link>
  );
}

export default function WordProperties({ result }: Props) {
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [anagrams, setAnagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/word-properties?word=${encodeURIComponent(result.word)}`)
      .then(r => r.json())
      .then(data => {
        setRhymes(data.rhymes || []);
        setAnagrams(data.anagrams || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [result.word]);

  // Compute properties
  const syllables = computeSyllableCount(result.pronunciation?.arpabet);
  const stress = computeStressPattern(result.pronunciation?.arpabet);
  const scrabble = computeScrabbleScore(result.word);
  const letters = computeLetterStats(result.word);
  const age = computeWordAge(result.firstUse);
  const rarity = computeRarityPercentile(result.frequency);
  const journey = computeLanguageJourney(result);
  const formality = computeFormality(result);

  // Build property cards (only show non-null values)
  const properties: { label: string; value: string | number; detail?: string }[] = [];

  if (syllables !== null) properties.push({ label: "Syllables", value: syllables, detail: stress || undefined });
  if (age) properties.push({ label: "Word Age", value: age });
  if (rarity) properties.push({ label: "Frequency", value: rarity, detail: result.frequency ? `Rank #${result.frequency.rank.toLocaleString()}` : undefined });
  properties.push({ label: "Scrabble", value: `${scrabble} pts`, detail: `${result.word.length} letters` });
  properties.push({ label: "Letters", value: `${letters.vowels}V ${letters.consonants}C`, detail: `${letters.unique} unique` });
  if (journey) properties.push({ label: "Journey", value: journey, detail: `${result.strata[0]?.language} → ${result.strata[result.strata.length - 1]?.language}` });
  if (formality) properties.push({ label: "Register", value: formality, detail: result.cefrLevel ? `CEFR ${result.cefrLevel}` : undefined });

  const hasExtras = rhymes.length > 0 || anagrams.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="mt-6"
    >
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Computed Properties</h2>
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {properties.map(p => (
          <PropertyCard key={p.label} {...p} />
        ))}
      </div>

      {/* Rhymes & Anagrams */}
      {!loading && hasExtras && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rhymes.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-3 shadow-sm">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">Rhymes With</div>
              <div className="flex flex-wrap gap-1.5">
                {rhymes.map(w => <WordChip key={w} word={w} />)}
              </div>
            </div>
          )}
          {anagrams.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-3 shadow-sm">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">Anagrams</div>
              <div className="flex flex-wrap gap-1.5">
                {anagrams.map(w => <WordChip key={w} word={w} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-3 flex gap-3">
          <div className="h-16 flex-1 bg-surface border border-border rounded-lg animate-pulse" />
          <div className="h-16 flex-1 bg-surface border border-border rounded-lg animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}
