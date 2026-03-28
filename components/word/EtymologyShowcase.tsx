"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { LexicaResult } from "@/types/lexica";
import EtymologyChain from "./EtymologyChain";
import MorphologySection from "./MorphologySection";
import Badge from "@/components/ui/Badge";

const EtymologyRiver = dynamic(() => import("./EtymologyRiver"), { ssr: false });
const EtymologyTree = dynamic(() => import("./EtymologyTree").then(m => ({ default: m.EtymologyTree })), { ssr: false });
const OriginMap = dynamic(() => import("./OriginMap").then(m => ({ default: m.OriginMap })), { ssr: false });

interface Props {
  result: LexicaResult;
}

export default function EtymologyShowcase({ result }: Props) {
  const [etymView, setEtymView] = useState<"chain" | "river">("chain");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasStrata = result.strata.length > 0;
  const hasTruestMeaning = !!result.truest_meaning;
  const hasMorphology = !!result.morphology;
  const hasCulturalMoment = !!result.cultural_moment?.description?.trim();

  if (!hasTruestMeaning && !hasStrata) return null;

  return (
    <section id="story" className="mt-10">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
          Origin Story
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>

      {/* Truest Meaning — editorial pull-quote */}
      {hasTruestMeaning && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-l-4 border-accent rounded-r-xl bg-accent-muted/20 px-5 sm:px-6 py-5 mb-8"
        >
          <p className="font-serif text-lg sm:text-xl text-text-primary leading-relaxed">
            {result.truest_meaning}
          </p>
          {result.truest_meaning_source && (
            <p className="text-xs text-text-muted mt-3">
              Source: {result.truest_meaning_source}
            </p>
          )}
          {result.root_revelation && (
            <p className="text-sm text-text-secondary mt-3 italic leading-relaxed">
              {result.root_revelation}
            </p>
          )}
        </motion.div>
      )}

      {/* Etymology Chain — always visible */}
      {hasStrata && (
        <div className="mb-6">
          {/* View toggle */}
          {result.strata.length >= 3 && (
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => setEtymView("chain")}
                className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
                  etymView === "chain"
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-text-muted hover:border-border-hover"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setEtymView("river")}
                className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${
                  etymView === "river"
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-text-muted hover:border-border-hover"
                }`}
              >
                River
              </button>
            </div>
          )}

          {etymView === "river" && result.strata.length >= 3 ? (
            <EtymologyRiver strata={result.strata} />
          ) : (
            <EtymologyChain strata={result.strata} />
          )}
        </div>
      )}

      {/* Morphology — compact inline */}
      {hasMorphology && result.morphology && (
        <div className="mb-6">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">
            Word Structure
          </div>
          <MorphologySection data={result.morphology} />
        </div>
      )}

      {/* Cultural Moment — aside card */}
      {hasCulturalMoment && result.cultural_moment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <Badge variant="accent">{result.cultural_moment.period}</Badge>
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.cultural_moment.description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Webster's 1828 Etymology */}
      {result.webster1828_etymology && (
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-6">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-2">
            Webster&apos;s 1828 Etymology
          </div>
          <p className="font-mono text-sm text-text-secondary leading-relaxed">
            {result.webster1828_etymology}
          </p>
        </div>
      )}

      {/* Advanced Visualizations — progressive disclosure */}
      {hasStrata && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-text-muted hover:text-accent font-mono transition-colors flex items-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}
            >
              <path d="M4.5 2.5L8 6L4.5 9.5" />
            </svg>
            {showAdvanced ? "Hide" : "Explore"} visual maps
          </button>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              <EtymologyTree word={result.word} />
              <OriginMap strata={result.strata} />
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
