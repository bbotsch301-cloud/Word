"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { LexicaResult } from "@/types/lexica";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";
import CollapsibleSection from "@/components/word/CollapsibleSection";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import FrequencyGauge from "@/components/word/FrequencyGauge";
import EtymologyChain from "@/components/word/EtymologyChain";
import DefinitionTimeline from "@/components/word/DefinitionTimeline";
import DefinitionCard from "@/components/word/DefinitionCard";
import ThesaurusSection from "@/components/word/ThesaurusSection";
import BiblicalStudySection from "@/components/word/BiblicalStudySection";
import MorphologySection from "@/components/word/MorphologySection";
import HiddenConnectionsSection from "@/components/word/HiddenConnectionsSection";
import ConstellationGraph from "@/components/word/ConstellationGraph";
import EtymologyRiver from "@/components/word/EtymologyRiver";
import MeaningTimeline from "@/components/word/MeaningTimeline";
import ConceptGalaxy from "@/components/word/ConceptGalaxy";
import { NgramChart } from "@/components/word/NgramChart";
import { CognatesSection } from "@/components/word/CognatesSection";
import { EtymologyTree } from "@/components/word/EtymologyTree";
import { OriginMap } from "@/components/word/OriginMap";
import { SynonymCloud } from "@/components/word/SynonymCloud";
import { useWordLists } from "@/components/WordListProvider";
import WordProperties from "@/components/word/WordProperties";
import { SITE_URL } from "@/lib/config";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// Section config for sticky nav
type SectionGroup = "origins" | "meaning" | "usage" | "reference";
interface SectionDef {
  id: string;
  label: string;
  shortLabel: string;
  group: SectionGroup;
}

const GROUP_LABELS: Record<SectionGroup, string> = {
  origins: "Origins",
  meaning: "Meaning",
  usage: "Usage & Spread",
  reference: "Reference",
};

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("");
  const [etymView, setEtymView] = useState<"chain" | "river">("chain");
  const { isBookmarked, toggleBookmark } = useWordLists();
  const bookmarked = isBookmarked(result.word);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordUrl = `${SITE_URL}/word/${encodeURIComponent(result.word)}`;
  const shareText = `${result.word}: ${result.modern_meaning?.slice(0, 100) || ""}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(wordUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      const recent: string[] = stored ? JSON.parse(stored) : [];
      const updated = [result.word, ...recent.filter((w) => w !== result.word)].slice(0, 8);
      localStorage.setItem("lexica-recent", JSON.stringify(updated));
    } catch {}
  }, [result.word]);

  const handleSearch = (value: string) => {
    const word = value.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  const rootStratum = [...result.strata].reverse().find((s) => s.is_root);
  const sortedDefs = [...result.definitions].sort((a, b) => a.year - b.year);
  const hasTaxonomy = result.taxonomy && (
    result.taxonomy.hypernyms.length > 0 ||
    result.taxonomy.hyponyms.length > 0 ||
    result.taxonomy.antonyms.length > 0 ||
    result.taxonomy.coordinate_terms.length > 0
  );
  const hasThesaurus = result.thesaurus && (
    result.thesaurus.synonyms.length > 0 ||
    result.thesaurus.wordnetSenses.length > 0 ||
    result.thesaurus.rogetCategories.length > 0
  );
  const hasBiblical = result.biblical && (
    result.biblical.eastons || result.biblical.smiths || result.biblical.hitchcocks || result.biblical.naves
  );
  const hasConnections = result.hiddenConnections && result.hiddenConnections.connections.length > 0;

  // Build available sections for nav (grouped)
  const sections: SectionDef[] = [];
  // Origins group
  if (result.truest_meaning) sections.push({ id: "story", label: "The Story", shortLabel: "Story", group: "origins" });
  if (result.strata.length > 0) sections.push({ id: "etymology", label: "Etymology Chain", shortLabel: "Etymology", group: "origins" });
  if (result.cultural_moment?.description?.trim()) sections.push({ id: "cultural", label: "Historical Note", shortLabel: "History", group: "origins" });
  if (result.webster1828_etymology) sections.push({ id: "webster", label: "Webster's 1828", shortLabel: "1828", group: "origins" });
  if (result.morphology) sections.push({ id: "morphology", label: "Word Structure", shortLabel: "Morph.", group: "origins" });
  // Meaning group
  if (hasConnections) sections.push({ id: "connections", label: "Hidden Connections", shortLabel: "Discover", group: "meaning" });
  if (sortedDefs.length > 0) sections.push({ id: "definitions", label: "Definitions", shortLabel: "Defs", group: "meaning" });
  if (hasThesaurus) sections.push({ id: "thesaurus", label: "Thesaurus", shortLabel: "Thes.", group: "meaning" });
  if (hasTaxonomy || result.constellation.length > 0) sections.push({ id: "related", label: "Related Words", shortLabel: "Related", group: "meaning" });
  // Usage group
  if (result.ngramHistory && result.ngramHistory.length >= 2) sections.push({ id: "usage-over-time", label: "Usage Over Time", shortLabel: "Usage", group: "usage" });
  if (result.cognates && result.cognates.cognates.length > 0) sections.push({ id: "cognates", label: "Cognates", shortLabel: "Cognates", group: "usage" });
  if (result.constellation.length >= 4) sections.push({ id: "constellation-graph", label: "Word Constellation", shortLabel: "Map", group: "usage" });
  // Reference group
  if (hasBiblical) sections.push({ id: "biblical", label: "Biblical Study", shortLabel: "Bible", group: "reference" });

  // Intersection observer for sticky nav
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [result.word]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-text-secondary">{result.word}</span>
      </nav>

      {/* Inline search */}
      <div className="mb-8 max-w-md">
        <SearchField size="md" placeholder="Search another word..." onSubmit={handleSearch} />
      </div>

      {/* ============ WORD HERO ============ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start gap-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary tracking-tight">
            {result.word}
          </h1>
          <div className="flex gap-2 mt-2 shrink-0">
            <button
              onClick={() => toggleBookmark(result.word)}
              className={`p-2 rounded-lg border transition-all ${
                bookmarked
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "border-border text-text-muted hover:border-accent/40 hover:text-accent"
              }`}
              title={bookmarked ? "Remove bookmark" : "Bookmark this word"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <Link
              href={`/compare?words=${encodeURIComponent(result.word)}`}
              className="p-2 rounded-lg border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-all"
              title="Compare with another word"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </Link>
            <div className="relative" data-share-menu>
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="p-2 rounded-lg border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-all"
                title="Share this word"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
                  <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button onClick={handleShareTwitter} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                  <button onClick={handleShareFacebook} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {result.phonetic && (
            <span className="font-mono text-base text-accent-secondary">{result.phonetic}</span>
          )}
          <button
            onClick={handleSpeak}
            className="p-1 rounded-md text-text-muted hover:text-accent transition-colors"
            title="Listen to pronunciation"
            aria-label={`Pronounce ${result.word}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>
          {result.pronunciation?.arpabet && result.pronunciation.arpabet[0] && (
            <span className="font-mono text-xs text-text-muted" title="ARPAbet pronunciation">
              [{result.pronunciation.arpabet[0]}]
            </span>
          )}
          {result.definitions[0]?.pos && (
            <span title="Part of speech"><Badge variant="accent">{result.definitions[0].pos}</Badge></span>
          )}
          {result.frequency && (
            <span title={`Word frequency rank among all English words. Lower = more common.`}>
              <Badge variant="muted">
                {result.frequency.label} &middot; #{result.frequency.rank.toLocaleString()}
              </Badge>
            </span>
          )}
          {result.cefrLevel && (
            <span title={`Common European Framework of Reference for Languages. ${
              result.cefrLevel === "A1" ? "Beginner" : result.cefrLevel === "A2" ? "Elementary" :
              result.cefrLevel === "B1" ? "Intermediate" : result.cefrLevel === "B2" ? "Upper Intermediate" :
              result.cefrLevel === "C1" ? "Advanced" : "Mastery"
            } level.`}>
              <Badge variant="accent">CEFR {result.cefrLevel}</Badge>
            </span>
          )}
          {result.isAcademic && (
            <span title={`Part of the Academic Word List, Sublist ${result.isAcademic.sublist}. Essential vocabulary for academic reading and writing.`}>
              <Badge variant="accent">Academic (List {result.isAcademic.sublist})</Badge>
            </span>
          )}
          {result.firstUse && (
            <span title={`Earliest recorded use in English. Source: ${result.firstUse.source}`}>
              <Badge variant="muted">
                First attested: {result.firstUse.year ? `c. ${result.firstUse.year}` : result.firstUse.century}
              </Badge>
            </span>
          )}
          {result.dialect && result.dialect[0] && result.dialect[0] !== "english" && (
            <Badge variant="muted">{result.dialect[0]}</Badge>
          )}
        </div>

        <p className="text-lg text-text-secondary mt-4 leading-relaxed max-w-3xl">
          <dfn className="not-italic font-normal">{result.modern_meaning}</dfn>
        </p>
      </motion.section>

      {/* ============ QUICK FACTS ============ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <motion.div variants={fadeUp} className="bg-surface border border-border rounded-lg p-4 shadow-sm">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Root Origin</div>
          <div className="text-sm font-medium text-text-primary mt-1">
            {rootStratum
              ? `${rootStratum.language} \u2014 ${rootStratum.form}`
              : result.strata.length > 0
                ? result.strata[result.strata.length - 1].language
                : "Unknown"}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <FrequencyGauge frequency={result.frequency} />
        </motion.div>

        <motion.div variants={fadeUp} className="bg-surface border border-border rounded-lg p-4 shadow-sm">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Sources</div>
          <div className="text-sm font-medium text-text-primary mt-1">
            {result.definitions.length} {result.definitions.length === 1 ? "dictionary" : "dictionaries"}
          </div>
        </motion.div>
      </motion.section>

      {/* ============ COMPUTED PROPERTIES ============ */}
      <WordProperties result={result} />

      {/* ============ AT A GLANCE ============ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-surface border border-border rounded-xl p-5"
      >
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="font-serif text-lg font-semibold text-text-primary">At a Glance</h2>
          <span className="text-xs text-text-muted font-mono">
            {sections.length} sections below
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Definition: </span>
            <span className="text-text-primary">
              {result.modern_meaning
                ? result.modern_meaning.length > 100
                  ? result.modern_meaning.slice(0, 100) + "..."
                  : result.modern_meaning
                : result.definitions[0]?.definition?.slice(0, 100) || "—"}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Origin: </span>
            <span className="text-text-primary">
              {rootStratum
                ? `${rootStratum.language}${rootStratum.form ? ` — ${rootStratum.form}` : ""}`
                : result.strata.length > 0
                  ? result.strata[result.strata.length - 1].language
                  : "Unknown"}
            </span>
          </div>
          <div>
            <span className="text-text-muted">First attested: </span>
            <span className="text-text-primary">
              {result.firstUse
                ? result.firstUse.year ? `c. ${result.firstUse.year}` : result.firstUse.century
                : "Unknown"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============ COLLAPSIBLE SECTIONS ============ */}
      <div className="mt-8 space-y-8">

        {/* ——— ORIGINS ——— */}
        <GroupDivider group="origins" sections={sections} />

        {/* The Story */}
        {result.truest_meaning && (
          <SectionErrorBoundary>
          <CollapsibleSection
            id="story"
            title="The Story"
            defaultOpen
            preview={result.truest_meaning.slice(0, 80) + "..."}
          >
            <div className="border-l-4 border-accent bg-accent-muted/30 rounded-r-xl p-5">
              <p className="font-serif text-base text-text-primary leading-relaxed">
                {result.truest_meaning}
              </p>
              <p className="text-xs text-text-muted mt-3">
                Source: {result.truest_meaning_source || "Wiktionary"}
              </p>
            </div>
            {result.root_revelation && (
              <p className="text-sm text-text-muted mt-4 leading-relaxed italic">
                {result.root_revelation}
                <span className="not-italic text-xs ml-1">(derived from available sources)</span>
              </p>
            )}
          </CollapsibleSection>
          </SectionErrorBoundary>
        )}

        {/* Etymology Chain / River */}
        {result.strata.length > 0 && (
          <SectionErrorBoundary>
          <CollapsibleSection
            id="etymology"
            title="Etymology Chain"
            preview={`${result.strata.length} languages \u2014 ${result.strata[result.strata.length - 1]?.language || ""} to Modern English`}
          >
            {result.strata.length >= 3 && (
              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => setEtymView("chain")}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${etymView === "chain" ? "border-accent text-accent bg-accent/10" : "border-border text-text-muted hover:border-border-hover"}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setEtymView("river")}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${etymView === "river" ? "border-accent text-accent bg-accent/10" : "border-border text-text-muted hover:border-border-hover"}`}
                >
                  River
                </button>
              </div>
            )}
            {etymView === "river" && result.strata.length >= 3 ? (
              <EtymologyRiver strata={result.strata} />
            ) : (
              <>
                <p className="text-sm text-text-muted mb-4">
                  Click any node to expand or collapse its details.
                </p>
                <EtymologyChain strata={result.strata} />
              </>
            )}
            <EtymologyTree word={result.word} />
            <OriginMap strata={result.strata} />
          </CollapsibleSection>
          </SectionErrorBoundary>
        )}

        {/* Historical Note */}
        {result.cultural_moment?.description?.trim() && (
          <CollapsibleSection
            id="cultural"
            title="Historical Note"
            preview={`${result.cultural_moment.period} \u2014 ${result.cultural_moment.description.slice(0, 60)}...`}
          >
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-start gap-3">
              <Badge variant="accent">{result.cultural_moment.period}</Badge>
              <p className="text-sm text-text-secondary leading-relaxed">
                {result.cultural_moment.description}
              </p>
            </div>
            <p className="text-xs text-text-muted mt-2">Extracted from etymology sources</p>
          </CollapsibleSection>
        )}

        {/* Webster's 1828 Etymology */}
        {result.webster1828_etymology && (
          <CollapsibleSection
            id="webster"
            title="Webster&apos;s 1828 Etymology"
            preview={result.webster1828_etymology.slice(0, 80) + "..."}
          >
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <p className="text-xs text-text-muted mb-3">
                Noah Webster&apos;s original 1828 etymology — reflects early 19th century linguistic understanding
              </p>
              <p className="font-mono text-sm text-text-secondary leading-relaxed">
                {result.webster1828_etymology}
              </p>
            </div>
          </CollapsibleSection>
        )}

        {/* Word Structure / Morphology */}
        {result.morphology && (
          <CollapsibleSection
            id="morphology"
            title="Word Structure"
            preview={`${result.morphology.morphemeCount} morphemes: ${result.morphology.morphemes}`}
          >
            <MorphologySection data={result.morphology} />
          </CollapsibleSection>
        )}

        {/* ——— MEANING ——— */}
        <GroupDivider group="meaning" sections={sections} />

        {/* Hidden Connections */}
        {hasConnections && result.hiddenConnections && (
          <CollapsibleSection
            id="connections"
            title="Hidden Connections"
            preview={result.hiddenConnections.wordEquation || `${result.hiddenConnections.connections.length} hidden connections discovered`}
          >
            <p className="text-xs text-text-muted mb-4">
              Patterns discovered algorithmically from etymological data — not all connections are scholarly consensus.
            </p>
            <HiddenConnectionsSection data={result.hiddenConnections} word={result.word} />
            <div className="mt-4 pt-3 border-t border-border">
              <Link
                href={`/spells/${encodeURIComponent(result.word)}`}
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Discover word spells for &ldquo;{result.word}&rdquo; &rarr;
              </Link>
            </div>
          </CollapsibleSection>
        )}

        {/* Definitions Across Time */}
        {sortedDefs.length > 0 && (
          <CollapsibleSection
            id="definitions"
            title="Definitions Across Time"
            preview={`${sortedDefs.length} definitions from ${sortedDefs[0]?.year} to ${sortedDefs[sortedDefs.length - 1]?.year}`}
          >
            {sortedDefs.length >= 3 && (sortedDefs[sortedDefs.length - 1]?.year - sortedDefs[0]?.year) > 50 && (
              <div className="mb-6">
                <MeaningTimeline definitions={result.definitions} />
              </div>
            )}
            <DefinitionTimeline definitions={result.definitions} />
          </CollapsibleSection>
        )}

        {/* Thesaurus */}
        {hasThesaurus && result.thesaurus && (
          <CollapsibleSection
            id="thesaurus"
            title="Thesaurus"
            preview={`${result.thesaurus.synonyms.length} synonyms · ${result.thesaurus.wordnetSenses.length} senses · ${result.thesaurus.rogetCategories.length} concept groups`}
          >
            <ThesaurusSection data={result.thesaurus} />
            {result.thesaurus.synonyms.length >= 5 && (
              <SynonymCloud synonyms={result.thesaurus.synonyms} word={result.word} />
            )}
            {result.thesaurus.rogetCategories.length >= 2 && (
              <div className="mt-6">
                <ConceptGalaxy word={result.word} rogetCategories={result.thesaurus.rogetCategories} />
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Related Words */}
        {(hasTaxonomy || result.constellation.length > 0) && (
          <CollapsibleSection
            id="related"
            title="Related Words"
            preview={`${(result.taxonomy?.hypernyms.length || 0) + (result.taxonomy?.hyponyms.length || 0) + (result.taxonomy?.antonyms.length || 0) + (result.taxonomy?.coordinate_terms.length || 0) + result.constellation.length} related words`}
          >
            <div className="space-y-5">
              {result.taxonomy && (
                <>
                  <WordGroup label="Broader Terms" words={result.taxonomy.hypernyms} />
                  <WordGroup label="Narrower Terms" words={result.taxonomy.hyponyms} />
                  <WordGroup label="Opposites" words={result.taxonomy.antonyms} />
                  <WordGroup label="Related Terms" words={result.taxonomy.coordinate_terms} />
                </>
              )}

              {result.constellation.length > 0 && (
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider font-mono mb-2">Associated Words</div>
                  <div className="flex flex-wrap gap-2">
                    {result.constellation.map((item) => (
                      <Link key={item.word} href={`/word/${item.word}`}>
                        <Badge variant="default" className="cursor-pointer hover:border-accent/40 transition-colors">
                          {item.word}
                          {item.relationship && (
                            <span className="ml-1 text-text-muted text-[10px]">({item.relationship})</span>
                          )}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* ——— USAGE & SPREAD ——— */}
        <GroupDivider group="usage" sections={sections} />

        {/* Usage Over Time (Ngrams) */}
        {result.ngramHistory && result.ngramHistory.length >= 2 && (
          <CollapsibleSection
            id="usage-over-time"
            title="Usage Over Time"
            preview={`Historical usage from ${result.ngramHistory[0].decade}s to ${result.ngramHistory[result.ngramHistory.length - 1].decade}s`}
          >
            <NgramChart data={result.ngramHistory} word={result.word} />
          </CollapsibleSection>
        )}

        {/* Cognates Across Languages */}
        {result.cognates && result.cognates.cognates.length > 0 && (
          <CollapsibleSection
            id="cognates"
            title="Cognates Across Languages"
            preview={`${result.cognates.cognates.length} related words in other languages`}
          >
            <CognatesSection data={result.cognates} word={result.word} />
          </CollapsibleSection>
        )}

        {/* Word Constellation Graph */}
        {result.constellation.length >= 4 && (
          <CollapsibleSection
            id="constellation-graph"
            title="Word Constellation"
            preview={`Visual map of ${result.constellation.length + (result.taxonomy ? result.taxonomy.hypernyms.length + result.taxonomy.hyponyms.length : 0)} connections`}
          >
            <ConstellationGraph
              word={result.word}
              constellation={result.constellation}
              taxonomy={result.taxonomy}
              connections={result.hiddenConnections?.connections}
            />
          </CollapsibleSection>
        )}

        {/* ——— REFERENCE ——— */}
        <GroupDivider group="reference" sections={sections} />

        {/* Biblical Study */}
        {hasBiblical && result.biblical && (
          <CollapsibleSection
            id="biblical"
            title="Biblical Study"
            preview={[
              result.biblical.eastons ? "Easton's" : "",
              result.biblical.smiths ? "Smith's" : "",
              result.biblical.hitchcocks ? "Hitchcock's" : "",
              result.biblical.naves?.length ? "Nave's" : "",
            ].filter(Boolean).join(" · ")}
          >
            <BiblicalStudySection data={result.biblical} />
          </CollapsibleSection>
        )}
      </div>

      {/* ============ EXPLORE MORE ============ */}
      <section className="mt-16 mb-8 pt-8 border-t border-border text-center">
        <p className="text-sm text-text-muted mb-4">Explore another word</p>
        <div className="max-w-md mx-auto">
          <SearchField size="lg" placeholder="Search any word..." onSubmit={handleSearch} />
        </div>
      </section>

      {/* ============ STICKY SECTION NAV ============ */}
      {sections.length >= 3 && (
        <StickyNav sections={sections} activeSection={activeSection} onNavigate={scrollToSection} />
      )}
    </main>
  );
}

function GroupDivider({ group, sections }: { group: SectionGroup; sections: SectionDef[] }) {
  const hasGroupSections = sections.some(s => s.group === group);
  if (!hasGroupSections) return null;
  return (
    <div className="flex items-center gap-3 pt-4 first:pt-0">
      <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
        {GROUP_LABELS[group]}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-accent/20 to-transparent" />
    </div>
  );
}

function StickyNav({ sections, activeSection, onNavigate }: {
  sections: SectionDef[];
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  // Group sections for nav
  const groups: SectionGroup[] = ["origins", "meaning", "usage", "reference"];
  const activeGroup = sections.find(s => s.id === activeSection)?.group;

  return (
    <>
      {/* Desktop: right sidebar */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1.5 items-end" aria-label="Section navigation">
        {groups.map(group => {
          const groupSections = sections.filter(s => s.group === group);
          if (groupSections.length === 0) return null;
          return (
            <div key={group} className="flex flex-col gap-1.5 items-end mb-2">
              <span className={`text-[8px] font-mono uppercase tracking-widest transition-colors ${activeGroup === group ? "text-accent" : "text-text-muted/50"}`}>
                {GROUP_LABELS[group]}
              </span>
              {groupSections.map(section => {
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    onClick={() => onNavigate(section.id)}
                    className="flex items-center gap-2 group"
                    aria-label={`Jump to ${section.label}`}
                  >
                    <span className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                      isActive
                        ? 'opacity-100 text-accent translate-x-0'
                        : 'opacity-0 text-text-muted translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}>
                      {section.shortLabel}
                    </span>
                    <span className={`block rounded-full transition-all ${
                      isActive
                        ? 'w-3 h-3 bg-accent shadow-sm'
                        : 'w-2 h-2 bg-border-hover group-hover:bg-accent/50'
                    }`} />
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Mobile: bottom pills */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-bg/95 backdrop-blur-sm border-t border-border" aria-label="Section groups">
        <div className="flex justify-around py-2 px-4">
          {groups.map(group => {
            const groupSections = sections.filter(s => s.group === group);
            if (groupSections.length === 0) return null;
            const isActive = activeGroup === group;
            const firstSection = groupSections[0];
            return (
              <button
                key={group}
                onClick={() => onNavigate(firstSection.id)}
                className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "text-text-muted"
                }`}
              >
                {GROUP_LABELS[group]}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function WordGroup({ label, words }: { label: string; words: string[] }) {
  if (words.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-xs text-text-muted uppercase tracking-wider font-mono">{label}</div>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <Link key={word} href={`/word/${word}`}>
            <Badge variant="accent" className="cursor-pointer">
              {word}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
