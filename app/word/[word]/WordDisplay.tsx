"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LexicaResult } from "@/types/lexica";

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
  const [searchValue, setSearchValue] = useState("");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchValue.trim().toLowerCase();
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

  const constellation = result.constellation || [];

  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 pb-20 lg:pb-6">
      {/* ===== BREADCRUMB ===== */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-muted)]" style={{ fontFamily: "var(--font-ui)" }}>
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-[var(--accent)] transition-colors">Etymology</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{result.word}</span>
      </nav>

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="word-layout">
        {/* ===== MAIN CONTENT ===== */}
        <div className="min-w-0">
          {/* Hero: The Word */}
          <section>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight word-title" style={{ fontFamily: "var(--font-body)" }}>
              {result.word}
            </h1>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {result.phonetic && (
                <button
                  onClick={handleSpeak}
                  className="flex items-center gap-2 group transition-colors"
                  style={{ color: "var(--accent)" }}
                  title="Click to hear pronunciation"
                >
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px" }}>{result.phonetic}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
              )}
              {allPOS.map(pos => (
                <span key={pos} className="text-sm italic" style={{ color: "var(--text-muted)" }}>({pos})</span>
              ))}
            </div>

            {result.modern_meaning && (
              <p className="text-lg mt-5 leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
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
                  <div className="absolute left-0 top-full mt-2 w-48 border rounded-lg py-1 z-50" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <button onClick={handleCopyLink} className="w-full text-left px-4 py-2.5 text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
                      Copy link
                    </button>
                    <button onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(wordUrl)}&text=${encodeURIComponent(shareText)}`, "_blank"); setShareOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
                      Share on X
                    </button>
                  </div>
                )}
              </div>
              <Link href={`/spells/${encodeURIComponent(result.word)}`} className="action-button" title="Word Spells">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
                <span className="text-xs">Spells</span>
              </Link>
            </div>
          </section>

          {/* ===== FILTER TABS ===== */}
          <div ref={tabsRef} className="sticky top-12 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3 mt-8 border-b border-[var(--border)]" style={{ background: "rgba(29,29,29,0.95)", backdropFilter: "blur(8px)" }}>
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

          {/* ===== ETYMOLOGY ===== */}
          {show("etymology") && hasEtymology && (
            <SectionErrorBoundary>
              <section className="mt-8" id="etymology">
                <SectionHeader label="Etymology" subtitle="The journey of this word through time" />

                {result.truest_meaning && (
                  <div className="etymology-pullquote">
                    <p className="text-lg leading-relaxed italic" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                      &ldquo;{result.truest_meaning.length > 300
                        ? result.truest_meaning.slice(0, 300) + "..."
                        : result.truest_meaning}&rdquo;
                    </p>
                    {result.truest_meaning_source && (
                      <span className="text-xs mt-2 block" style={{ color: "var(--text-muted)", fontFamily: "ui-monospace, monospace" }}>
                        &mdash; {result.truest_meaning_source}
                      </span>
                    )}
                  </div>
                )}

                {result.strata.length > 1 && (
                  <EtymologyTimeline strata={result.strata} word={result.word} />
                )}

                {hasMorphology && (
                  <MorphemeBreakdown morphology={result.morphology!} word={result.word} />
                )}

                {constellation.length >= 2 && (
                  <WordFamilyTree
                    word={result.word}
                    constellation={constellation}
                    rootLabel={result.morphology?.root || result.strata.find(s => s.is_root)?.form}
                  />
                )}

                {result.cognates && result.cognates.cognates.length > 0 && (
                  <CognatesPanel cognates={result.cognates} word={result.word} />
                )}

                {result.root_revelation && (
                  <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: "var(--accent)", background: "var(--accent-muted)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {result.root_revelation}
                    </p>
                  </div>
                )}

                {result.webster1828_etymology && (
                  <div className="mt-6">
                    <p className="text-xs mb-2 uppercase tracking-wider" style={{ fontFamily: "ui-monospace, monospace", color: "var(--text-muted)" }}>Webster&apos;s 1828</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {result.webster1828_etymology.length > 500
                        ? result.webster1828_etymology.slice(0, 500) + "..."
                        : result.webster1828_etymology}
                    </p>
                  </div>
                )}
              </section>
            </SectionErrorBoundary>
          )}

          {/* ===== DEFINITIONS ===== */}
          {show("definitions") && sortedDefs.length > 0 && (
            <section className="mt-10" id="definitions">
              <SectionHeader
                label="Definitions"
                subtitle={`${sortedDefs.length} sources · ${sortedDefs[0]?.year}–${sortedDefs[sortedDefs.length - 1]?.year}`}
              />
              {sortedDefs.length >= 3 && sortedDefs[sortedDefs.length - 1]?.year != null && sortedDefs[0]?.year != null && (sortedDefs[sortedDefs.length - 1].year - sortedDefs[0].year) > 50 && (
                <div className="mb-6">
                  <MeaningTimeline definitions={result.definitions} />
                </div>
              )}
              <DefinitionTimeline definitions={result.definitions} />
            </section>
          )}

          {/* ===== SURPRISING CONNECTIONS ===== */}
          {show(["connections", "all"]) && topConnections.length > 0 && (
            <section className="mt-10" id="connections">
              <SectionHeader label="Surprising Connections" subtitle="Hidden links you won't expect" />
              <div className="space-y-3">
                {topConnections.map((conn, i) => (
                  <div key={conn.type + i} className="discovery-card">
                    <div className="flex items-start gap-3">
                      <div className="discovery-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "ui-monospace, monospace", color: "var(--accent)" }}>
                            Did you know?
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <div key={s} className={`w-1 h-1 rounded-full`} style={{ background: s < Math.round(conn.surpriseScore * 5) ? "var(--accent)" : "var(--border)" }} />
                            ))}
                          </div>
                        </div>
                        <h4 className="text-base font-medium leading-snug mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                          {conn.headline}
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {conn.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(result.hiddenConnections?.connections?.length ?? 0) > 3 && (
                <button
                  onClick={() => setActiveTab("connections")}
                  className="text-xs mt-3 transition-colors"
                  style={{ fontFamily: "ui-monospace, monospace", color: "var(--accent)" }}
                >
                  See all {result.hiddenConnections!.connections.length} connections &rarr;
                </button>
              )}
            </section>
          )}

          {/* ===== CONNECTIONS WEB ===== */}
          {show(["connections", "all"]) && hasTaxonomy && (
            <section className="mt-10">
              <SectionHeader label="Semantic Web" subtitle="How this word relates" />
              <ConnectionsWeb word={result.word} taxonomy={result.taxonomy!} />
            </section>
          )}

          {/* ===== USAGE OVER TIME ===== */}
          {show(["usage", "all"]) && hasUsageData && (
            <section className="mt-10">
              <SectionHeader label="Usage" subtitle="How often this word appears in print" />
              <UsageOverTime
                ngramHistory={result.ngramHistory}
                firstUseYear={result.firstUse?.year}
                word={result.word}
              />
            </section>
          )}

          {/* ===== DEEP DIVE ===== */}
          {show(["usage", "connections", "all"]) && (
            <SectionErrorBoundary>
              <DeepDive result={result} />
            </SectionErrorBoundary>
          )}

          {/* ===== EXPLORE MORE ===== */}
          <section className="mt-16 mb-4 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Continue exploring</p>
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search another word..."
                className="w-full h-10 px-4 pr-12 rounded-full border text-sm"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full text-white flex items-center justify-center"
                style={{ background: "var(--accent)" }}
                aria-label="Search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </section>
        </div>

        {/* ===== SIDEBAR ===== */}
        <aside className="hidden md:block space-y-6">
          {/* Word info card */}
          <div className="sidebar-section">
            <h3>About this word</h3>
            <ul className="sidebar-list">
              {result.firstUse?.year && (
                <li className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>First recorded</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>c. {result.firstUse.year}</span>
                </li>
              )}
              {result.strata.length > 0 && result.strata[0].language && (
                <li className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Origin</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{result.strata[0].language}</span>
                </li>
              )}
              {allPOS.length > 0 && (
                <li className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Part of speech</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{allPOS.join(", ")}</span>
                </li>
              )}
              {result.morphology && result.morphology.morphemeCount >= 2 && (
                <li className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Morphemes</span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{result.morphology.morphemeCount}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Word family / constellation */}
          {constellation.length > 0 && (
            <div className="sidebar-section">
              <h3>Word family</h3>
              <ul className="sidebar-list">
                {constellation.slice(0, 10).map(cw => (
                  <li key={cw.word}>
                    <Link href={`/word/${encodeURIComponent(cw.word)}`} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {cw.word}
                    </Link>
                  </li>
                ))}
                {constellation.length > 10 && (
                  <li>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      +{constellation.length - 10} more
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Related words from taxonomy */}
          {hasTaxonomy && (
            <div className="sidebar-section">
              <h3>Related words</h3>
              <ul className="sidebar-list">
                {result.taxonomy!.hypernyms?.slice(0, 4).map(w => (
                  <li key={w}>
                    <Link href={`/word/${encodeURIComponent(w)}`} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {w}
                    </Link>
                  </li>
                ))}
                {result.taxonomy!.hyponyms?.slice(0, 4).map(w => (
                  <li key={w}>
                    <Link href={`/word/${encodeURIComponent(w)}`} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {w}
                    </Link>
                  </li>
                ))}
                {result.taxonomy!.coordinate_terms?.slice(0, 4).map(w => (
                  <li key={w}>
                    <Link href={`/word/${encodeURIComponent(w)}`} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {w}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cognates */}
          {result.cognates && result.cognates.cognates.length > 0 && (
            <div className="sidebar-section">
              <h3>Cognates</h3>
              <ul className="sidebar-list">
                {result.cognates.cognates.slice(0, 8).map(c => (
                  <li key={c.language + c.word} className="flex justify-between">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.word}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.language}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function SectionHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="section-dot" aria-hidden="true" />
      <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: "var(--font-ui)", color: "var(--accent)" }}>
        {label}
      </span>
      {subtitle && (
        <span className="text-[10px]" style={{ fontFamily: "ui-monospace, monospace", color: "var(--text-muted)" }}>{subtitle}</span>
      )}
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}
