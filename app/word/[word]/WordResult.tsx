"use client";

import { useState, useEffect, useCallback } from "react";
import type { LexicaResult } from "@/types/lexica";
import ExcavationLoader from "@/components/ExcavationLoader";
import SectionLabel from "@/components/SectionLabel";
import StratumBlock from "@/components/StratumBlock";
import ConstellationMap from "@/components/ConstellationMap";
import SearchInput from "@/components/SearchInput";
import { motion } from "framer-motion";

export default function WordResult({ word }: { word: string }) {
  const [result, setResult] = useState<LexicaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchResult = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/excavate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Excavation failed");
        return;
      }
      setResult(data as LexicaResult);

      // Save to recent
      try {
        const stored = localStorage.getItem("lexica-recent");
        const recent: string[] = stored ? JSON.parse(stored) : [];
        const updated = [word, ...recent.filter((w) => w !== word)].slice(0, 8);
        localStorage.setItem("lexica-recent", JSON.stringify(updated));
      } catch {
        // ignore
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return <ExcavationLoader word={word} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
          EXCAVATION FAILED
        </p>
        <h2 className="font-cormorant text-4xl font-light text-parchment mb-4">
          {word}
        </h2>
        <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
          {error}
        </p>
        <button
          onClick={fetchResult}
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 transition-all"
          aria-label="Retry excavation"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!result) return null;

  const strataDelay = result.strata.length * 0.22 + 0.3;

  return (
    <>
      <main className="max-w-[780px] mx-auto px-6 md:px-10 py-16 pb-32">
        {/* Word header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="font-cormorant font-light tracking-[0.04em] text-parchment mb-2"
            style={{ fontSize: "clamp(3.5rem, 9vw, 6rem)" }}
          >
            {result.word}
          </h1>
          <p className="font-mono text-xs text-parchment/40 mb-4">
            {result.phonetic}
          </p>
          <p className="font-crimson italic text-gold/70 text-lg leading-relaxed mb-4">
            {result.modern_meaning}
          </p>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-parchment/40 hover:text-gold transition-colors"
            aria-label="Share this excavation"
          >
            {copied ? "✓ Copied link" : "⎘ Share this excavation"}
          </button>
        </motion.div>

        {/* The Excavation */}
        <SectionLabel label="The Excavation" />
        <div>
          {result.strata.map((stratum, i) => (
            <StratumBlock
              key={i}
              stratum={stratum}
              index={i}
              total={result.strata.length}
            />
          ))}
        </div>

        {/* Truest Meaning */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay }}
        >
          <SectionLabel label="Synthesis" />
          <div className="border-t-2 border-gold border-l border-r border-b border-gold/25 bg-gold/[0.04] p-6 md:p-8">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold/60 mb-4">
              The Truest Meaning
            </p>
            <p className="font-cormorant text-[1.55rem] font-light italic text-parchment leading-relaxed">
              {result.truest_meaning}
            </p>
          </div>
        </motion.div>

        {/* Root Revelation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay + 0.22 }}
        >
          <SectionLabel label="Revelation" />
          <div className="border-l-[3px] border-l-gold bg-gold/[0.06] p-6 md:p-8">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold/60 mb-4">
              ↯ The Mind-Blowing Fact
            </p>
            <p className="font-crimson text-lg text-parchment leading-relaxed">
              {result.root_revelation}
            </p>
          </div>
        </motion.div>

        {/* Cultural Moment */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay + 0.44 }}
        >
          <SectionLabel label="Cultural Moment" />
          <div className="border border-parchment/10 bg-stratum-1 p-6 md:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-parchment/40 mb-3">
              {result.cultural_moment.period}
            </p>
            <p className="font-crimson italic text-parchment/80 leading-relaxed">
              {result.cultural_moment.description}
            </p>
          </div>
        </motion.div>

        {/* Constellation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay + 0.66 }}
        >
          <SectionLabel label="Constellation" />
          <ConstellationMap words={result.constellation} centerWord={result.word} />
        </motion.div>
      </main>

      {/* Fixed bottom search bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-ink/95 backdrop-blur-sm border-t border-gold/10 p-4">
        <div className="max-w-[780px] mx-auto">
          <SearchInput compact />
        </div>
      </div>
    </>
  );
}
