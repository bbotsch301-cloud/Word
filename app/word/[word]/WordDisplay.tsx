"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { LexicaResult } from "@/types/lexica";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";
import CollapsibleSection from "@/components/word/CollapsibleSection";
import FrequencyGauge from "@/components/word/FrequencyGauge";
import EtymologyChain from "@/components/word/EtymologyChain";
import DefinitionTimeline from "@/components/word/DefinitionTimeline";
import DefinitionCard from "@/components/word/DefinitionCard";
import ThesaurusSection from "@/components/word/ThesaurusSection";
import BiblicalStudySection from "@/components/word/BiblicalStudySection";
import MorphologySection from "@/components/word/MorphologySection";
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
interface SectionDef {
  id: string;
  label: string;
  shortLabel: string;
}

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("");

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

  // Build available sections for nav
  const sections: SectionDef[] = [];
  if (result.truest_meaning) sections.push({ id: "story", label: "The Story", shortLabel: "Story" });
  if (result.strata.length > 0) sections.push({ id: "etymology", label: "Etymology Chain", shortLabel: "Etymology" });
  if (result.cultural_moment?.description?.trim()) sections.push({ id: "cultural", label: "Cultural Context", shortLabel: "Cultural" });
  if (result.webster1828_etymology) sections.push({ id: "webster", label: "Webster's 1828", shortLabel: "1828" });
  if (sortedDefs.length > 0) sections.push({ id: "definitions", label: "Definitions", shortLabel: "Defs" });
  if (result.morphology) sections.push({ id: "morphology", label: "Word Structure", shortLabel: "Morph." });
  if (hasThesaurus) sections.push({ id: "thesaurus", label: "Thesaurus", shortLabel: "Thes." });
  if (hasBiblical) sections.push({ id: "biblical", label: "Biblical Study", shortLabel: "Bible" });
  if (hasTaxonomy || result.constellation.length > 0) sections.push({ id: "related", label: "Related Words", shortLabel: "Related" });

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
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary tracking-tight">
          {result.word}
        </h1>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {result.phonetic && (
            <span className="font-mono text-base text-accent-secondary">{result.phonetic}</span>
          )}
          {result.pronunciation?.arpabet && result.pronunciation.arpabet[0] && (
            <span className="font-mono text-xs text-text-muted" title="ARPAbet pronunciation">
              [{result.pronunciation.arpabet[0]}]
            </span>
          )}
          {result.definitions[0]?.pos && (
            <Badge variant="accent">{result.definitions[0].pos}</Badge>
          )}
          {result.frequency && (
            <Badge variant="muted">
              {result.frequency.label} &middot; #{result.frequency.rank.toLocaleString()}
            </Badge>
          )}
          {result.cefrLevel && (
            <Badge variant="accent">CEFR {result.cefrLevel}</Badge>
          )}
          {result.isAcademic && (
            <Badge variant="accent">Academic (List {result.isAcademic.sublist})</Badge>
          )}
          {result.dialect && result.dialect[0] && result.dialect[0] !== "english" && (
            <Badge variant="muted">{result.dialect[0]}</Badge>
          )}
        </div>

        <p className="text-lg text-text-secondary mt-4 leading-relaxed max-w-3xl">
          {result.modern_meaning}
        </p>
      </motion.section>

      {/* ============ QUICK FACTS ============ */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-10 grid grid-cols-3 gap-3"
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

      {/* ============ COLLAPSIBLE SECTIONS ============ */}
      <div className="mt-12 space-y-8">
        {/* The Story */}
        {result.truest_meaning && (
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
            </div>
            {result.root_revelation && (
              <p className="text-sm text-text-muted mt-4 leading-relaxed italic">
                {result.root_revelation}
              </p>
            )}
          </CollapsibleSection>
        )}

        {/* Etymology Chain */}
        {result.strata.length > 0 && (
          <CollapsibleSection
            id="etymology"
            title="Etymology Chain"
            defaultOpen
            preview={`${result.strata.length} languages \u2014 ${result.strata[result.strata.length - 1]?.language || ""} to Modern English`}
          >
            <p className="text-sm text-text-muted mb-4">
              Click any node to expand or collapse its details.
            </p>
            <EtymologyChain strata={result.strata} />
          </CollapsibleSection>
        )}

        {/* Cultural Context */}
        {result.cultural_moment?.description?.trim() && (
          <CollapsibleSection
            id="cultural"
            title="Cultural Context"
            preview={`${result.cultural_moment.period} \u2014 ${result.cultural_moment.description.slice(0, 60)}...`}
          >
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-start gap-3">
              <Badge variant="accent">{result.cultural_moment.period}</Badge>
              <p className="text-sm text-text-secondary leading-relaxed">
                {result.cultural_moment.description}
              </p>
            </div>
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

        {/* Definitions Across Time */}
        {sortedDefs.length > 0 && (
          <CollapsibleSection
            id="definitions"
            title="Definitions Across Time"
            preview={`${sortedDefs.length} definitions from ${sortedDefs[0]?.year} to ${sortedDefs[sortedDefs.length - 1]?.year}`}
          >
            <p className="text-sm text-text-muted mb-6">
              Click a year on the timeline to read that definition.
            </p>
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
          </CollapsibleSection>
        )}

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

function StickyNav({ sections, activeSection, onNavigate }: {
  sections: SectionDef[];
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 items-end">
      {sections.map((section) => {
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
    </nav>
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
