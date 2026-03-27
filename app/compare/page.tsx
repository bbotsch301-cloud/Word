"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchField from "@/components/ui/SearchField";
import type { LexicaResult } from "@/types/lexica";

function CompareColumn({ result }: { result: LexicaResult }) {
  return (
    <div className="space-y-6">
      {/* Word title */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary">{result.word}</h2>
        {result.phonetic && (
          <span className="text-sm font-mono text-text-muted">{result.phonetic}</span>
        )}
      </div>

      {/* Definition */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Definition</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {result.modern_meaning || "No definition available."}
        </p>
      </div>

      {/* Etymology */}
      {result.strata.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">Etymology Chain</h3>
          <div className="space-y-1">
            {result.strata.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-accent w-20 shrink-0 truncate">{s.language}</span>
                <span className="font-serif italic">{s.form}</span>
                {s.meaning && <span className="text-text-muted truncate">&mdash; {s.meaning}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequency */}
      {result.frequency && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Frequency</h3>
          <p className="text-sm">
            <span className="font-mono text-accent">{result.frequency.label}</span>
            <span className="text-text-muted ml-2">(Zipf: {result.frequency.zipf.toFixed(2)})</span>
          </p>
        </div>
      )}

      {/* CEFR Level */}
      {result.cefrLevel && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Vocabulary Level</h3>
          <span className="inline-block bg-accent/10 text-accent text-sm font-mono px-2 py-0.5 rounded">
            {result.cefrLevel}
          </span>
        </div>
      )}

      {/* Morphology */}
      {result.morphology && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Word Structure</h3>
          <div className="flex gap-1 text-sm">
            {result.morphology.prefix && (
              <span className="bg-accent-secondary/10 text-accent-secondary px-2 py-0.5 rounded text-xs">{result.morphology.prefix}</span>
            )}
            {result.morphology.root && (
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-semibold">{result.morphology.root}</span>
            )}
            {result.morphology.suffix && (
              <span className="bg-accent/15 text-accent px-2 py-0.5 rounded text-xs">{result.morphology.suffix}</span>
            )}
          </div>
        </div>
      )}

      {/* Pronunciation */}
      {result.pronunciation && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Pronunciation</h3>
          <p className="text-sm font-mono text-text-secondary">{result.pronunciation.ipa}</p>
        </div>
      )}

      {/* Definitions count */}
      {result.definitions.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Definitions</h3>
          <p className="text-sm text-text-muted">{result.definitions.length} definitions across {new Set(result.definitions.map(d => d.source)).size} sources</p>
        </div>
      )}

      {/* Ngram peak */}
      {result.ngramHistory && result.ngramHistory.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Peak Usage</h3>
          <p className="text-sm text-text-secondary">
            {result.ngramHistory.reduce((a, b) => a.frequency > b.frequency ? a : b).decade}s
          </p>
        </div>
      )}

      {/* Cognates count */}
      {result.cognates && result.cognates.cognates.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-1">Cognates</h3>
          <p className="text-sm text-text-secondary">{result.cognates.cognates.length} cognates across languages</p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wordsParam = searchParams.get("words") || "";
  const [words, setWords] = useState<string[]>(() => {
    return wordsParam.split(",").map(w => w.trim()).filter(Boolean).slice(0, 2);
  });

  const [results, setResults] = useState<(LexicaResult | null)[]>([null, null]);
  const [loading, setLoading] = useState<[boolean, boolean]>([false, false]);
  const [errors, setErrors] = useState<[string, string]>(["", ""]);

  const fetchWord = useCallback(async (word: string, index: number) => {
    if (!word) return;
    setLoading(prev => {
      const next = [...prev] as [boolean, boolean];
      next[index] = true;
      return next;
    });
    setErrors(prev => {
      const next = [...prev] as [string, string];
      next[index] = "";
      return next;
    });

    try {
      const res = await fetch("/api/excavate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.toLowerCase() }),
      });
      if (!res.ok) throw new Error(`Word "${word}" not found`);
      const data = await res.json();
      setResults(prev => {
        const next = [...prev];
        next[index] = data;
        return next;
      });
    } catch (err) {
      setErrors(prev => {
        const next = [...prev] as [string, string];
        next[index] = err instanceof Error ? err.message : "Failed to load";
        return next;
      });
    } finally {
      setLoading(prev => {
        const next = [...prev] as [boolean, boolean];
        next[index] = false;
        return next;
      });
    }
  }, []);

  useEffect(() => {
    words.forEach((w, i) => { if (w) fetchWord(w, i); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string, index: number) => {
    const word = value.trim().toLowerCase();
    if (!word) return;
    const next = [...words];
    next[index] = word;
    setWords(next);
    router.replace(`/compare?words=${next.filter(Boolean).join(",")}`);
    fetchWord(word, index);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Compare Words</h1>
        <p className="text-text-muted mb-8">Side-by-side comparison of etymology, definitions, and linguistic data.</p>

        {/* Search inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div>
            <label className="text-xs uppercase tracking-wider text-text-muted mb-2 block">Word 1</label>
            <SearchField
              size="md"
              placeholder={words[0] ? `Current: ${words[0]}` : "Enter first word..."}
              onSubmit={(v) => handleSearch(v, 0)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-text-muted mb-2 block">Word 2</label>
            <SearchField
              size="md"
              placeholder={words[1] ? `Current: ${words[1]}` : "Enter second word..."}
              onSubmit={(v) => handleSearch(v, 1)}
            />
          </div>
        </div>

        {/* Comparison columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="bg-surface border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {loading[i] ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-border rounded w-32" />
                  <div className="h-4 bg-border rounded w-full" />
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-4 bg-border rounded w-1/2" />
                </div>
              ) : errors[i] ? (
                <p className="text-sm text-red-500">{errors[i]}</p>
              ) : results[i] ? (
                <CompareColumn result={results[i]!} />
              ) : (
                <p className="text-text-muted text-sm">Enter a word above to compare.</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
