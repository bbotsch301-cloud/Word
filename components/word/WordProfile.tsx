"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LexicaResult } from "@/types/lexica";
import {
  computeScrabbleScore,
  computeLetterStats,
  computeSyllableCount,
  computeStressPattern,
  computeWordAge,
  computeRarityPercentile,
  computeLanguageJourney,
  computeFormality,
} from "@/lib/word-properties";

function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
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

export default function WordProfile({ result }: { result: LexicaResult }) {
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [anagrams, setAnagrams] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/word-properties?word=${encodeURIComponent(result.word)}`)
      .then(r => r.json())
      .then(data => {
        setRhymes(data.rhymes || []);
        setAnagrams(data.anagrams || []);
      })
      .catch(() => {});
  }, [result.word]);

  const rootStratum = [...result.strata].reverse().find(s => s.is_root);

  // Computed properties
  const syllables = computeSyllableCount(result.pronunciation?.arpabet);
  const stress = computeStressPattern(result.pronunciation?.arpabet);
  const scrabble = computeScrabbleScore(result.word);
  const letters = computeLetterStats(result.word);
  const age = computeWordAge(result.firstUse);
  const rarity = computeRarityPercentile(result.frequency);
  const journey = computeLanguageJourney(result);
  const formality = computeFormality(result);

  return (
    <div className="space-y-6">
      {/* Core metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat
          label="Origin"
          value={rootStratum ? rootStratum.language : result.strata.length > 0 ? result.strata[result.strata.length - 1].language : "Unknown"}
          detail={rootStratum?.form}
        />
        {result.frequency && (
          <Stat
            label="Frequency"
            value={result.frequency.label}
            detail={`Rank #${result.frequency.rank.toLocaleString()}`}
          />
        )}
        {rarity && (
          <Stat label="Rarity" value={rarity} />
        )}
        {result.cefrLevel && (
          <Stat
            label="CEFR Level"
            value={result.cefrLevel}
            detail={
              result.cefrLevel === "A1" ? "Beginner" : result.cefrLevel === "A2" ? "Elementary" :
              result.cefrLevel === "B1" ? "Intermediate" : result.cefrLevel === "B2" ? "Upper Intermediate" :
              result.cefrLevel === "C1" ? "Advanced" : "Mastery"
            }
          />
        )}
        {result.isAcademic && (
          <Stat label="Academic" value={`Sublist ${result.isAcademic.sublist}`} />
        )}
        {result.firstUse && (
          <Stat
            label="First Attested"
            value={result.firstUse.year ? `c. ${result.firstUse.year}` : result.firstUse.century}
            detail={result.firstUse.source}
          />
        )}
        {age && <Stat label="Word Age" value={age} />}
        {syllables !== null && <Stat label="Syllables" value={syllables} detail={stress || undefined} />}
        <Stat label="Scrabble" value={`${scrabble} pts`} detail={`${result.word.length} letters`} />
        <Stat label="Letters" value={`${letters.vowels}V ${letters.consonants}C`} detail={`${letters.unique} unique`} />
        {journey && result.strata.length > 0 && (
          <Stat label="Journey" value={journey} />
        )}
        {formality && <Stat label="Register" value={formality} detail={result.cefrLevel ? `CEFR ${result.cefrLevel}` : undefined} />}
        {result.dialect && result.dialect[0] && result.dialect[0] !== "english" && (
          <Stat label="Dialect" value={result.dialect[0]} />
        )}
        <Stat label="Sources" value={`${result.definitions.length} dictionaries`} />
      </div>

      {/* Rhymes & Anagrams */}
      {(rhymes.length > 0 || anagrams.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rhymes.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-3">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">Rhymes With</div>
              <div className="flex flex-wrap gap-1.5">
                {rhymes.map(w => <WordChip key={w} word={w} />)}
              </div>
            </div>
          )}
          {anagrams.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-3">
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">Anagrams</div>
              <div className="flex flex-wrap gap-1.5">
                {anagrams.map(w => <WordChip key={w} word={w} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
