"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { LexicaResult } from "@/types/lexica";
import SearchField from "@/components/ui/SearchField";
import Badge from "@/components/ui/Badge";
import EtymologyChain from "@/components/word/EtymologyChain";
import DefinitionCard from "@/components/word/DefinitionCard";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const router = useRouter();

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
          {result.definitions[0]?.pos && (
            <Badge variant="accent">{result.definitions[0].pos}</Badge>
          )}
          {result.frequency && (
            <Badge variant="muted">
              {result.frequency.label} &middot; #{result.frequency.rank.toLocaleString()}
            </Badge>
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
        {[
          {
            label: "Root Origin",
            value: rootStratum
              ? `${rootStratum.language} \u2014 ${rootStratum.form}`
              : result.strata.length > 0
                ? `${result.strata[result.strata.length - 1].language}`
                : "Unknown",
          },
          {
            label: "Frequency",
            value: result.frequency
              ? `${result.frequency.label} (#${result.frequency.rank.toLocaleString()})`
              : "Unknown",
          },
          {
            label: "Sources",
            value: `Found in ${result.definitions.length} ${result.definitions.length === 1 ? "dictionary" : "dictionaries"}`,
          },
        ].map((fact) => (
          <motion.div
            key={fact.label}
            variants={fadeUp}
            className="bg-surface border border-border rounded-lg p-4 shadow-sm"
          >
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">{fact.label}</div>
            <div className="text-sm font-medium text-text-primary mt-1">{fact.value}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* ============ ETYMOLOGY STORY ============ */}
      {result.truest_meaning && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <SectionHeading>The Story</SectionHeading>
          <div className="border-l-4 border-accent bg-accent-muted/30 rounded-r-xl p-5 mt-4">
            <p className="font-serif text-base text-text-primary leading-relaxed">
              {result.truest_meaning}
            </p>
          </div>

          {result.root_revelation && (
            <p className="text-sm text-text-muted mt-4 leading-relaxed italic">
              {result.root_revelation}
            </p>
          )}
        </motion.section>
      )}

      {/* ============ ETYMOLOGY CHAIN ============ */}
      {result.strata.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <SectionHeading>Etymology Chain</SectionHeading>
          <p className="text-sm text-text-muted mt-1 mb-6">
            How &ldquo;{result.word}&rdquo; traveled through {result.strata.length} language{result.strata.length !== 1 ? "s" : ""} to reach Modern English.
          </p>
          <EtymologyChain strata={result.strata} />
        </motion.section>
      )}

      {/* ============ CULTURAL MOMENT ============ */}
      {result.cultural_moment?.description?.trim() && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <SectionHeading>Cultural Context</SectionHeading>
          <div className="bg-surface border border-border rounded-xl p-5 mt-4 shadow-sm flex items-start gap-3">
            <Badge variant="accent">{result.cultural_moment.period}</Badge>
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.cultural_moment.description}
            </p>
          </div>
        </motion.section>
      )}

      {/* ============ WEBSTER 1828 ETYMOLOGY ============ */}
      {result.webster1828_etymology && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <SectionHeading>Webster&apos;s 1828 Etymology</SectionHeading>
          <div className="bg-surface border border-border rounded-xl p-5 mt-4 shadow-sm">
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              {result.webster1828_etymology}
            </p>
          </div>
        </motion.section>
      )}

      {/* ============ DEFINITIONS ACROSS TIME ============ */}
      {sortedDefs.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-12"
        >
          <SectionHeading>Definitions Across Time</SectionHeading>
          <p className="text-sm text-text-muted mt-1 mb-6">
            How &ldquo;{result.word}&rdquo; has been defined from {sortedDefs[0]?.year} to {sortedDefs[sortedDefs.length - 1]?.year}.
          </p>

          <div className="space-y-3">
            {sortedDefs.map((def, index) => (
              <motion.div key={`${def.source}-${def.year}-${index}`} variants={fadeUp}>
                <DefinitionCard definition={def} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ============ RELATED WORDS ============ */}
      {(hasTaxonomy || result.constellation.length > 0) && (
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mt-12"
        >
          <SectionHeading>Related Words</SectionHeading>

          <div className="mt-4 space-y-5">
            {result.taxonomy && (
              <>
                <WordGroup label="Broader Terms" words={result.taxonomy.hypernyms} />
                <WordGroup label="Narrower Terms" words={result.taxonomy.hyponyms} />
                <WordGroup label="Opposites" words={result.taxonomy.antonyms} />
                <WordGroup label="Related Terms" words={result.taxonomy.coordinate_terms} />
              </>
            )}

            {result.constellation.length > 0 && (
              <motion.div variants={fadeUp}>
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
              </motion.div>
            )}
          </div>
        </motion.section>
      )}

      {/* ============ EXPLORE MORE ============ */}
      <section className="mt-16 mb-8 pt-8 border-t border-border text-center">
        <p className="text-sm text-text-muted mb-4">Explore another word</p>
        <div className="max-w-md mx-auto">
          <SearchField size="lg" placeholder="Search any word..." onSubmit={handleSearch} />
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="font-serif text-2xl font-bold text-text-primary whitespace-nowrap">{children}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

function WordGroup({ label, words }: { label: string; words: string[] }) {
  if (words.length === 0) return null;
  return (
    <motion.div variants={fadeUp}>
      <div className="text-xs text-text-muted uppercase tracking-wider font-mono mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <Link key={word} href={`/word/${word}`}>
            <Badge variant="accent" className="cursor-pointer">
              {word}
            </Badge>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
