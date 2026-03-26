"use client";

import { useEffect } from "react";
import type { LexicaResult } from "@/types/lexica";
import SectionLabel from "@/components/SectionLabel";
import ExcavationTimeline from "@/components/ExcavationTimeline";
import ConstellationMap from "@/components/ConstellationMap";
import DefinitionTimeline from "@/components/DefinitionTimeline";
import WordHeader from "@/components/WordHeader";
import WordTaxonomy from "@/components/WordTaxonomy";
import SearchInput from "@/components/SearchInput";
import { motion } from "framer-motion";

export default function WordDisplay({ result }: { result: LexicaResult }) {
  // Save to recent excavations
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      const recent: string[] = stored ? JSON.parse(stored) : [];
      const updated = [result.word, ...recent.filter((w) => w !== result.word)].slice(0, 8);
      localStorage.setItem("lexica-recent", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [result.word]);

  const strataDelay = result.strata.length * 0.22 + 0.3;

  return (
    <>
      <main className="max-w-[780px] mx-auto px-6 md:px-10 py-16 pb-32">
        {/* Word Header */}
        <WordHeader
          word={result.word}
          phonetic={result.phonetic}
          modernMeaning={result.modern_meaning}
          pos={result.strata[0]?.language_family}
        />

        {/* Multi-Source Definitions */}
        {result.definitions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SectionLabel label="Definitions Through Time" />
            <DefinitionTimeline definitions={result.definitions} />
          </motion.div>
        )}

        {/* The Excavation — Visual Timeline */}
        <SectionLabel label="The Excavation" />
        <ExcavationTimeline strata={result.strata} />

        {/* Etymology */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay }}
        >
          <SectionLabel label="The Etymology" />
          <div className="border-t-2 border-gold border-l border-r border-b border-gold/25 bg-gold/[0.04] p-6 md:p-8 rounded-sm">
            <p className="font-crimson text-[1.1rem] font-light text-parchment/85 leading-relaxed">
              {result.truest_meaning}
            </p>
            {result.webster1828_etymology && (
              <div className="mt-4 pt-4 border-t border-parchment/10">
                <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-parchment/40 mb-2">
                  Webster&apos;s 1828 Etymology
                </p>
                <p className="font-crimson text-sm italic text-parchment/60 leading-relaxed">
                  {result.webster1828_etymology}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Root Origin */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: strataDelay + 0.22 }}
        >
          <SectionLabel label="Root Origin" />
          <div className="border-l-[3px] border-l-gold bg-gold/[0.06] p-6 md:p-8 rounded-sm">
            <p className="font-crimson text-base text-parchment leading-relaxed">
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
          <div className="border border-parchment/10 bg-stratum-1 p-6 md:p-8 rounded-sm">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-parchment/40 mb-3">
              {result.cultural_moment.period}
            </p>
            <p className="font-crimson italic text-parchment/80 leading-relaxed">
              {result.cultural_moment.description}
            </p>
          </div>
        </motion.div>

        {/* Constellation */}
        {result.constellation.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: strataDelay + 0.66 }}
          >
            <SectionLabel label="Constellation" />
            <ConstellationMap words={result.constellation} centerWord={result.word} />
          </motion.div>
        )}

        {/* Word Taxonomy */}
        {result.taxonomy && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: strataDelay + 0.88 }}
          >
            <SectionLabel label="Semantic Web" />
            <WordTaxonomy taxonomy={result.taxonomy} />
          </motion.div>
        )}
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
