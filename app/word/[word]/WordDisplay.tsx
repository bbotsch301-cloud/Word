"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { LexicaResult } from "@/types/lexica";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import EtymologyTimeline from "@/components/word/EtymologyTimeline";
import MorphemeBreakdown from "@/components/word/MorphemeBreakdown";
import WordFamilyTree from "@/components/word/WordFamilyTree";
import ConnectionsWeb from "@/components/word/ConnectionsWeb";
import CognatesPanel from "@/components/word/CognatesPanel";
import UsageOverTime from "@/components/word/UsageOverTime";
import DefinitionTimeline from "@/components/word/DefinitionTimeline";
import DeepDive from "@/components/word/DeepDive";
import { useWordLists } from "@/components/WordListProvider";
import { useToast } from "@/components/Toast";
import { SITE_URL } from "@/lib/config";

const MeaningTimeline = dynamic(() => import("@/components/word/MeaningTimeline"), { ssr: false });

type Tab = "all" | "etymology" | "definitions" | "connections" | "usage";

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useWordLists();
  const toast = useToast();
  const bookmarked = isBookmarked(result.word);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const tabsRef = useRef<HTMLDivElement>(null);

  const wordUrl = `${SITE_URL}/word/${encodeURIComponent(result.word)}`;
  const shareText = `${result.word}: ${result.modern_meaning?.slice(0, 100) || ""}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(wordUrl);
      toast.show("Link copied!");
    } catch {
      const input = document.createElement("input");
      input.value = wordUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast.show("Link copied!");
    }
    setShareOpen(false);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(result.word);
    toast.show(bookmarked ? "Removed from collection" : "Saved to collection", "info");
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

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-share-menu]")) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

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
  const topConnections = hasConnections
    ? [...result.hiddenConnections!.connections].sort((a, b) => b.surpriseScore - a.surpriseScore).slice(0, 3)
    : [];

  const allPOS = [...new Set(result.definitions.map(d => d.pos).filter(Boolean))];
  const hasEtymology = result.strata.length > 0 || result.truest_meaning;
  const hasMorphology = result.morphology && result.morphology.morphemeCount >= 2;
  const taxCounts =
    (result.taxonomy?.hypernyms?.length || 0) +
    (result.taxonomy?.hyponyms?.length || 0) +
    (result.taxonomy?.antonyms?.length || 0) +
    (result.taxonomy?.coordinate_terms?.length || 0);
  const hasTaxonomy = taxCounts >= 2;
  const hasUsageData = (result.ngramHistory && result.ngramHistory.length >= 2) || !!result.firstUse?.year;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "all", label: "All", show: true },
    { id: "etymology", label: "Etymology", show: !!hasEtymology },
    { id: "definitions", label: "Definitions", show: sortedDefs.length > 0 },
    { id: "connections", label: "Connections", show: !!hasConnections },
    { id: "usage", label: "Usage & More", show: true },
  ];

  const visibleTabs = tabs.filter(t => t.show);
  const show = (section: Tab | Tab[]) => {
    if (activeTab === "all") return true;
    return Array.isArray(section) ? section.includes(activeTab) : activeTab === section;
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-20 lg:pb-6">
      {/* ===== BREADCRUMB ===== */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-mono text-text-muted">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-accent transition-colors">Etymology</Link>
        <span>/</span>
        <span className="text-text-primary">{result.word}</span>
      </nav>

      {/* ===== HERO: THE WORD ===== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight word-title">
          {result.word}
        </h1>

        {/* Pronunciation + POS badges */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {result.phonetic && (
            <button
              onClick={handleSpeak}
              className="flex items-center gap-2 text-accent-secondary hover:text-accent-secondary-hover transition-colors group"
              title="Click to hear pronunciation"
            >
              <span className="font-mono text-base">{result.phonetic}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
          )}
          {allPOS.map(pos => (
            <Badge key={pos} variant="accent">{pos}</Badge>
          ))}
        </div>

        {/* Core meaning — one sentence */}
        {result.modern_meaning && (
          <p className="text-lg text-text-secondary mt-5 leading-relaxed max-w-2xl word-meaning-text">
            {result.modern_meaning}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={handleBookmarkToggle}
            className={`action-button ${bookmarked ? "action-button-active" : ""}`}
            title={bookmarked ? "Remove from collection" : "Add to collection"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs">{bookmarked ? "Saved" : "Save"}</span>
          </button>
          <div className="relative" data-share-menu>
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="action-button"
              title="Share"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span className="text-xs">Share</span>
            </button>
            {shareOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
                <button onClick={handleCopyLink} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-hover transition-colors">
                  Copy link
                </button>
                <button onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(wordUrl)}&text=${encodeURIComponent(shareText)}`, "_blank"); setShareOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-hover transition-colors">
                  Share on X
                </button>
              </div>
            )}
          </div>
          <Link
            href={`/spells/${encodeURIComponent(result.word)}`}
            className="action-button"
            title="Word Spells"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            <span className="text-xs">Spells</span>
          </Link>
        </div>
      </motion.section>

      {/* ===== FILTER TABS ===== */}
      <div ref={tabsRef} className="sticky top-14 z-30 bg-bg/95 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3 mt-8 border-b border-border">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`filter-tab ${activeTab === tab.id ? "filter-tab-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== ETYMOLOGY TIMELINE ===== */}
      {show("etymology") && hasEtymology && (
        <SectionErrorBoundary>
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
            id="etymology"
          >
            <SectionHeader label="Etymology" subtitle="The journey of this word through time" />

            {/* Truest meaning — editorial pull-quote */}
            {result.truest_meaning && (
              <div className="etymology-pullquote">
                <p className="font-serif text-lg text-text-primary leading-relaxed italic">
                  &ldquo;{result.truest_meaning.length > 300
                    ? result.truest_meaning.slice(0, 300) + "..."
                    : result.truest_meaning}&rdquo;
                </p>
                {result.truest_meaning_source && (
                  <span className="text-xs text-text-muted font-mono mt-2 block">
                    &mdash; {result.truest_meaning_source}
                  </span>
                )}
              </div>
            )}

            {/* Visual timeline */}
            {result.strata.length > 1 && (
              <EtymologyTimeline strata={result.strata} word={result.word} />
            )}

            {/* Morpheme breakdown */}
            {hasMorphology && (
              <MorphemeBreakdown morphology={result.morphology!} word={result.word} />
            )}

            {/* Word family tree */}
            {result.constellation && result.constellation.length >= 2 && (
              <WordFamilyTree
                word={result.word}
                constellation={result.constellation}
                rootLabel={result.morphology?.root || result.strata.find(s => s.is_root)?.form}
              />
            )}

            {/* Cognates across languages */}
            {result.cognates && result.cognates.cognates.length > 0 && (
              <CognatesPanel cognates={result.cognates} word={result.word} />
            )}

            {/* Root revelation */}
            {result.root_revelation && (
              <div className="mt-6 p-4 border border-accent/20 rounded-xl bg-accent-muted/30">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {result.root_revelation}
                </p>
              </div>
            )}

            {/* Webster 1828 etymology */}
            {result.webster1828_etymology && (
              <div className="mt-6">
                <p className="text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">Webster&apos;s 1828</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {result.webster1828_etymology.length > 500
                    ? result.webster1828_etymology.slice(0, 500) + "..."
                    : result.webster1828_etymology}
                </p>
              </div>
            )}
          </motion.section>
        </SectionErrorBoundary>
      )}

      {/* ===== DEFINITIONS ===== */}
      {show("definitions") && sortedDefs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
          id="definitions"
        >
          <SectionHeader
            label="Definitions"
            subtitle={`${sortedDefs.length} sources \u00b7 ${sortedDefs[0]?.year}\u2013${sortedDefs[sortedDefs.length - 1]?.year}`}
          />

          {sortedDefs.length >= 3 && sortedDefs[sortedDefs.length - 1]?.year != null && sortedDefs[0]?.year != null && (sortedDefs[sortedDefs.length - 1].year - sortedDefs[0].year) > 50 && (
            <div className="mb-6">
              <MeaningTimeline definitions={result.definitions} />
            </div>
          )}

          <DefinitionTimeline definitions={result.definitions} />
        </motion.section>
      )}

      {/* ===== SURPRISING CONNECTIONS ===== */}
      {show(["connections", "all"]) && topConnections.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
          id="connections"
        >
          <SectionHeader label="Surprising Connections" subtitle="Hidden links you won't expect" />
          <div className="space-y-3">
            {topConnections.map((conn, i) => (
              <motion.div
                key={conn.type + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="discovery-card"
              >
                <div className="flex items-start gap-3">
                  <div className="discovery-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                        Did you know?
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, s) => (
                          <div key={s} className={`w-1 h-1 rounded-full ${s < Math.round(conn.surpriseScore * 5) ? "bg-accent" : "bg-border"}`} />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-serif text-base font-medium text-text-primary leading-snug mb-1">
                      {conn.headline}
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {conn.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {(result.hiddenConnections?.connections?.length ?? 0) > 3 && (
            <button
              onClick={() => setActiveTab("connections")}
              className="text-xs text-accent hover:text-accent-hover font-mono mt-3 transition-colors"
            >
              See all {result.hiddenConnections!.connections.length} connections &rarr;
            </button>
          )}
        </motion.section>
      )}

      {/* ===== CONNECTIONS WEB (semantic graph) ===== */}
      {show(["connections", "all"]) && hasTaxonomy && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <SectionHeader label="Semantic Web" subtitle="How this word relates" />
          <ConnectionsWeb word={result.word} taxonomy={result.taxonomy!} />
        </motion.section>
      )}

      {/* ===== USAGE OVER TIME ===== */}
      {show(["usage", "all"]) && hasUsageData && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <SectionHeader label="Usage" subtitle="How often this word appears in print" />
          <UsageOverTime
            ngramHistory={result.ngramHistory}
            firstUseYear={result.firstUse?.year}
            word={result.word}
          />
        </motion.section>
      )}

      {/* ===== DEEP DIVE (Thesaurus, Related, Usage, Profile, Biblical) ===== */}
      {show(["usage", "connections", "all"]) && (
        <SectionErrorBoundary>
          <DeepDive result={result} />
        </SectionErrorBoundary>
      )}

      {/* ===== EXPLORE MORE ===== */}
      <section className="mt-16 mb-4 pt-8 border-t border-border text-center">
        <p className="text-sm text-text-muted mb-4">Continue exploring</p>
        <div className="max-w-md mx-auto">
          <SearchField size="lg" placeholder="Search another word..." onSubmit={handleSearch} />
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="section-dot" aria-hidden="true" />
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent font-semibold">
        {label}
      </span>
      {subtitle && (
        <span className="text-[10px] text-text-muted font-mono">{subtitle}</span>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-accent/20 to-transparent" />
    </div>
  );
}
