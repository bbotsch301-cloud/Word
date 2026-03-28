"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { LexicaResult } from "@/types/lexica";
import HiddenConnectionsSection from "./HiddenConnectionsSection";
import ThesaurusSection from "./ThesaurusSection";
import BiblicalStudySection from "./BiblicalStudySection";
import WordProfile from "./WordProfile";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

const ConstellationGraph = dynamic(() => import("./ConstellationGraph"), { ssr: false });
const ConceptGalaxy = dynamic(() => import("./ConceptGalaxy"), { ssr: false });
const SynonymCloud = dynamic(() => import("./SynonymCloud").then(m => ({ default: m.SynonymCloud })), { ssr: false });
const NgramChart = dynamic(() => import("./NgramChart").then(m => ({ default: m.NgramChart })), { ssr: false });
const CognatesSection = dynamic(() => import("./CognatesSection").then(m => ({ default: m.CognatesSection })), { ssr: false });

interface Tab {
  id: string;
  label: string;
  count?: number;
}

export default function DeepDive({ result }: { result: LexicaResult }) {
  const hasConnections = result.hiddenConnections && result.hiddenConnections.connections.length > 0;
  const hasThesaurus = result.thesaurus && (
    result.thesaurus.synonyms.length > 0 ||
    result.thesaurus.wordnetSenses.length > 0 ||
    result.thesaurus.rogetCategories.length > 0
  );
  const hasTaxonomy = result.taxonomy && (
    result.taxonomy.hypernyms.length > 0 ||
    result.taxonomy.hyponyms.length > 0 ||
    result.taxonomy.antonyms.length > 0 ||
    result.taxonomy.coordinate_terms.length > 0
  );
  const hasUsage = (result.ngramHistory && result.ngramHistory.length >= 2) ||
    (result.cognates?.cognates?.length ?? 0) > 0;
  const hasBiblical = result.biblical && (
    result.biblical.eastons || result.biblical.smiths || result.biblical.hitchcocks || result.biblical.naves
  );

  // Build available tabs
  const tabs: Tab[] = [];
  if (hasConnections) tabs.push({ id: "connections", label: "Connections", count: result.hiddenConnections!.connections.length });
  if (hasThesaurus) tabs.push({ id: "thesaurus", label: "Thesaurus", count: result.thesaurus!.synonyms.length });
  if (hasTaxonomy || result.constellation.length > 0) tabs.push({ id: "related", label: "Related" });
  if (hasUsage) tabs.push({ id: "usage", label: "Usage" });
  tabs.push({ id: "profile", label: "Profile" });
  if (hasBiblical) tabs.push({ id: "biblical", label: "Biblical" });

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "profile");

  if (tabs.length <= 1 && tabs[0]?.id === "profile") {
    // Only profile — still show it
    return (
      <section id="deep-dive" className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
            Word Profile
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
        </div>
        <WordProfile result={result} />
      </section>
    );
  }

  return (
    <section id="deep-dive" className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
          Deep Dive
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>

      {/* Tab bar — horizontal scroll on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full border transition-all shrink-0 ${
                isActive
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "connections" && hasConnections && result.hiddenConnections && (
            <div>
              <p className="text-xs text-text-muted mb-4">
                Patterns discovered algorithmically from etymological data.
              </p>
              <HiddenConnectionsSection data={result.hiddenConnections} word={result.word} />
              {result.constellation.length >= 4 && (
                <div className="mt-6">
                  <ConstellationGraph
                    word={result.word}
                    constellation={result.constellation}
                    taxonomy={result.taxonomy}
                    connections={result.hiddenConnections?.connections}
                  />
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-border">
                <Link
                  href={`/spells/${encodeURIComponent(result.word)}`}
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  Discover word spells for &ldquo;{result.word}&rdquo; &rarr;
                </Link>
              </div>
            </div>
          )}

          {activeTab === "thesaurus" && hasThesaurus && result.thesaurus && (
            <div>
              <ThesaurusSection data={result.thesaurus} />
              {result.thesaurus.synonyms.length >= 5 && (
                <SynonymCloud synonyms={result.thesaurus.synonyms} word={result.word} />
              )}
              {result.thesaurus.rogetCategories.length >= 2 && (
                <div className="mt-6">
                  <ConceptGalaxy word={result.word} rogetCategories={result.thesaurus.rogetCategories} />
                </div>
              )}
            </div>
          )}

          {activeTab === "related" && (
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
                    {result.constellation.map(item => (
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
          )}

          {activeTab === "usage" && (
            <div className="space-y-8">
              {result.ngramHistory && result.ngramHistory.length >= 2 && (
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Usage Over Time</h3>
                  <NgramChart data={result.ngramHistory} word={result.word} />
                </div>
              )}
              {(result.cognates?.cognates?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Cognates Across Languages</h3>
                  <CognatesSection data={result.cognates!} word={result.word} />
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <WordProfile result={result} />
          )}

          {activeTab === "biblical" && hasBiblical && result.biblical && (
            <BiblicalStudySection data={result.biblical} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
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
        {words.map(word => (
          <Link key={word} href={`/word/${word}`}>
            <Badge variant="accent" className="cursor-pointer">{word}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
