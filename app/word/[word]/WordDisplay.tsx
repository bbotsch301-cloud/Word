"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LexicaResult } from "@/types/lexica";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import EtymologyShowcase from "@/components/word/EtymologyShowcase";
import DefinitionTimeline from "@/components/word/DefinitionTimeline";
import DeepDive from "@/components/word/DeepDive";
import { useWordLists } from "@/components/WordListProvider";
import { SITE_URL } from "@/lib/config";

const MeaningTimeline = dynamic(() => import("@/components/word/MeaningTimeline"), { ssr: false });

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useWordLists();
  const bookmarked = isBookmarked(result.word);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeZone, setActiveZone] = useState("story");

  const wordUrl = `${SITE_URL}/word/${encodeURIComponent(result.word)}`;
  const shareText = `${result.word}: ${result.modern_meaning?.slice(0, 100) || ""}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(wordUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = wordUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShareOpen(false);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(wordUrl)}&text=${encodeURIComponent(shareText)}`, "_blank", "noopener,width=550,height=420");
    setShareOpen(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wordUrl)}`, "_blank", "noopener,width=550,height=420");
    setShareOpen(false);
  };

  const handleSpeak = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Close share dropdown on outside click
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-share-menu]")) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  // Save to recent words
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      const recent: string[] = stored ? JSON.parse(stored) : [];
      const updated = [result.word, ...recent.filter(w => w !== result.word)].slice(0, 8);
      localStorage.setItem("lexica-recent", JSON.stringify(updated));
    } catch {}
  }, [result.word]);

  const handleSearch = (value: string) => {
    const word = value.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  const sortedDefs = [...result.definitions].sort((a, b) => a.year - b.year);
  const hasConnections = result.hiddenConnections && result.hiddenConnections.connections.length > 0;

  // Top 2 hidden connections for Zone 3 inline cards
  const topConnections = hasConnections
    ? [...result.hiddenConnections!.connections]
        .sort((a, b) => b.surpriseScore - a.surpriseScore)
        .slice(0, 2)
    : [];

  // Intersection observer for sticky nav
  const zones = ["story", "definitions", "deep-dive"].filter(id => {
    if (id === "story") return result.strata.length > 0 || result.truest_meaning;
    if (id === "definitions") return sortedDefs.length > 0;
    return true;
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    zones.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveZone(id); },
        { threshold: 0.2, rootMargin: "-80px 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [result.word]);

  const scrollToZone = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Minimal back nav */}
      <nav className="mb-6 flex items-center gap-2">
        <Link href="/" className="text-xs text-text-muted hover:text-accent transition-colors">
          &larr; Home
        </Link>
      </nav>

      {/* ==================== ZONE 1: THE HEADLINE ==================== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Word title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary tracking-tight">
          {result.word}
        </h1>

        {/* Pronunciation + POS */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {result.phonetic && (
            <span className="font-mono text-base text-accent-secondary">{result.phonetic}</span>
          )}
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-md text-text-muted hover:text-accent transition-colors"
            title="Listen to pronunciation"
            aria-label={`Pronounce ${result.word}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
          {result.definitions[0]?.pos && (
            <Badge variant="accent">{result.definitions[0].pos}</Badge>
          )}
        </div>

        {/* Modern meaning */}
        <p className="text-lg text-text-secondary mt-4 leading-relaxed max-w-2xl">
          {result.modern_meaning}
        </p>

        {/* Action buttons — compact row */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => toggleBookmark(result.word)}
            className={`p-2 rounded-lg border transition-all text-sm flex items-center gap-1.5 ${
              bookmarked
                ? "bg-accent/10 border-accent/40 text-accent"
                : "border-border text-text-muted hover:border-accent/40 hover:text-accent"
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <Link
            href={`/compare?words=${encodeURIComponent(result.word)}`}
            className="p-2 rounded-lg border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-all"
            title="Compare"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </Link>
          <div className="relative" data-share-menu>
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="p-2 rounded-lg border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-all"
              title="Share"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
                <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button onClick={handleShareTwitter} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
                  Share on X
                </button>
                <button onClick={handleShareFacebook} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
                  Share on Facebook
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ==================== ZONE 2: THE ORIGIN STORY ==================== */}
      <SectionErrorBoundary>
        <EtymologyShowcase result={result} />
      </SectionErrorBoundary>

      {/* ==================== ZONE 3: HIDDEN CONNECTIONS (top 2) ==================== */}
      {topConnections.length > 0 && (
        <section className="mt-10">
          <div className="space-y-3">
            {topConnections.map((conn, i) => (
              <motion.div
                key={conn.type + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-border rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                    Did you know?
                  </span>
                </div>
                <h4 className="font-serif text-base font-medium text-text-primary leading-snug mb-1">
                  {conn.headline}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {conn.description}
                </p>
              </motion.div>
            ))}
          </div>
          {(result.hiddenConnections?.connections?.length ?? 0) > 2 && (
            <button
              onClick={() => {
                document.getElementById("deep-dive")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs text-text-muted hover:text-accent font-mono mt-3 transition-colors"
            >
              See all {result.hiddenConnections!.connections.length} connections &rarr;
            </button>
          )}
        </section>
      )}

      {/* ==================== ZONE 4: DEFINITIONS ==================== */}
      {sortedDefs.length > 0 && (
        <section id="definitions" className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
              Definitions
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              {sortedDefs.length} sources &middot; {sortedDefs[0]?.year}&ndash;{sortedDefs[sortedDefs.length - 1]?.year}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
          </div>

          {/* Meaning timeline visualization */}
          {sortedDefs.length >= 3 && sortedDefs[sortedDefs.length - 1]?.year != null && sortedDefs[0]?.year != null && (sortedDefs[sortedDefs.length - 1].year - sortedDefs[0].year) > 50 && (
            <div className="mb-6">
              <MeaningTimeline definitions={result.definitions} />
            </div>
          )}

          <DefinitionTimeline definitions={result.definitions} />
        </section>
      )}

      {/* ==================== ZONE 5: DEEP DIVE (TABS) ==================== */}
      <SectionErrorBoundary>
        <DeepDive result={result} />
      </SectionErrorBoundary>

      {/* ==================== EXPLORE MORE ==================== */}
      <section className="mt-16 mb-8 pt-8 border-t border-border text-center">
        <p className="text-sm text-text-muted mb-4">Explore another word</p>
        <div className="max-w-md mx-auto">
          <SearchField size="lg" placeholder="Search any word..." onSubmit={handleSearch} />
        </div>
      </section>

      {/* ==================== STICKY NAV (simplified) ==================== */}
      {zones.length >= 2 && (
        <>
          {/* Desktop: right sidebar */}
          <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 items-end" aria-label="Section navigation">
            {zones.map(zone => {
              const label = zone === "story" ? "Story" : zone === "definitions" ? "Defs" : "Dive";
              const isActive = activeZone === zone;
              return (
                <button
                  key={zone}
                  onClick={() => scrollToZone(zone)}
                  className="flex items-center gap-2 group"
                  aria-label={`Jump to ${label}`}
                >
                  <span className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                    isActive
                      ? "opacity-100 text-accent translate-x-0"
                      : "opacity-0 text-text-muted translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}>
                    {label}
                  </span>
                  <span className={`block rounded-full transition-all ${
                    isActive
                      ? "w-3 h-3 bg-accent shadow-sm"
                      : "w-2 h-2 bg-border-hover group-hover:bg-accent/50"
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Mobile: bottom pills */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-bg/95 backdrop-blur-sm border-t border-border" aria-label="Section groups">
            <div className="flex justify-around py-2 px-4">
              {zones.map(zone => {
                const label = zone === "story" ? "Story" : zone === "definitions" ? "Definitions" : "Deep Dive";
                const isActive = activeZone === zone;
                return (
                  <button
                    key={zone}
                    onClick={() => scrollToZone(zone)}
                    className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : "text-text-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </main>
  );
}
