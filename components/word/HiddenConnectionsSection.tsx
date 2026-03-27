"use client";

import { motion } from "framer-motion";
import type { HiddenConnectionsData, HiddenConnection } from "@/types/lexica";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import RootExplosion from "./RootExplosion";
import PartWholeNesting from "./PartWholeNesting";
import PolysemyTree from "./PolysemyTree";
import BorrowingMap from "./BorrowingMap";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const TYPE_LABELS: Record<HiddenConnection["type"], string> = {
  word_splitting: "DECODED",
  root_siblings: "FAMILY",
  meaning_shift: "DRIFT",
  cross_cultural: "JOURNEY",
  biblical_echo: "ANCIENT",
  secret_story: "SECRET",
  doublets: "TWINS",
  semantic_flip: "FLIPPED",
  part_whole: "LAYERS",
  concept_map: "CONCEPT",
  polysemy: "FRACTURED",
  borrowing_chain: "BORROWED",
};

const TYPE_COLORS: Record<HiddenConnection["type"], string> = {
  word_splitting: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  root_siblings: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  meaning_shift: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  cross_cultural: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  biblical_echo: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  secret_story: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  doublets: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  semantic_flip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  part_whole: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  concept_map: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  polysemy: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  borrowing_chain: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
};

function WordEquation({ equation }: { equation: string }) {
  const segments = equation.split(" + ");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-wrap items-center justify-center gap-3 py-6 px-4"
    >
      {segments.map((seg, i) => {
        const match = seg.match(/^(.+?)\s*\((.+)\)$/);
        const fragment = match ? match[1] : seg;
        const meaning = match ? match[2] : "";
        return (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && (
              <span className="text-xl text-text-muted font-mono">+</span>
            )}
            <span className="flex flex-col items-center">
              <span className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 font-serif text-lg text-accent font-medium">
                {fragment}
              </span>
              {meaning && (
                <span className="text-xs text-text-muted mt-1 font-mono">
                  {meaning}
                </span>
              )}
            </span>
          </span>
        );
      })}
    </motion.div>
  );
}

function WordLink({ word }: { word: string }) {
  return (
    <Link href={`/word/${word}`}>
      <Badge
        variant="accent"
        className="cursor-pointer hover:border-accent/60 transition-colors text-xs"
      >
        {word}
      </Badge>
    </Link>
  );
}

function ConnectionCard({ connection, word }: { connection: HiddenConnection; word: string }) {
  const { type, headline, description, evidence } = connection;

  return (
    <motion.div
      variants={fadeUp}
      className="bg-surface border border-border rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${TYPE_COLORS[type]}`}
        >
          {TYPE_LABELS[type]}
        </span>
      </div>

      <h4 className="font-serif text-base font-medium text-text-primary leading-snug mb-2">
        {headline}
      </h4>

      <p className="text-sm text-text-secondary leading-relaxed mb-3">
        {description}
      </p>

      {/* Root siblings */}
      {type === "root_siblings" && evidence.siblings && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {evidence.siblings.map((sibling) => (
            <WordLink key={sibling} word={sibling} />
          ))}
        </div>
      )}

      {/* Meaning shift */}
      {(type === "meaning_shift" || type === "semantic_flip") && evidence.oldMeaning && evidence.newMeaning && (
        <div className="flex items-start gap-3 mt-2 text-sm">
          <div className="flex-1 bg-surface-secondary/50 rounded-lg p-3 border border-border">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">
              {evidence.period || "Historical"}
            </div>
            <p className="text-text-secondary leading-relaxed">
              {evidence.oldMeaning}
            </p>
          </div>
          <span className="text-text-muted mt-3 font-mono text-lg shrink-0">
            &rarr;
          </span>
          <div className="flex-1 bg-surface-secondary/50 rounded-lg p-3 border border-border">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">
              Modern
            </div>
            <p className="text-text-secondary leading-relaxed">
              {evidence.newMeaning}
            </p>
          </div>
        </div>
      )}

      {/* Cross-cultural language chain */}
      {type === "cross_cultural" && evidence.languageChain && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {evidence.languageChain.map((link, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-text-muted text-xs">&rarr;</span>
              )}
              <Badge variant="muted" className="text-xs">
                {link.language}
              </Badge>
            </span>
          ))}
        </div>
      )}

      {/* Biblical echo */}
      {type === "biblical_echo" && evidence.originalWord && (
        <div className="mt-2 bg-surface-secondary/50 rounded-lg p-3 border border-border">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl text-accent">
              {evidence.originalWord}
            </span>
            {evidence.strongsId && (
              <span className="text-xs text-text-muted font-mono">
                {evidence.strongsId}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Secret story */}
      {type === "secret_story" && evidence.literalMeaning && (
        <div className="mt-2 bg-surface-secondary/50 rounded-lg p-3 border border-border">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg text-accent italic">
              &ldquo;{evidence.literalMeaning}&rdquo;
            </span>
            {evidence.sourceLanguage && (
              <span className="text-xs text-text-muted font-mono">
                {evidence.sourceLanguage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Doublets */}
      {type === "doublets" && evidence.doubletWords && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {evidence.doubletWords.map((dw) => (
            <WordLink key={dw} word={dw} />
          ))}
        </div>
      )}

      {/* Part-Whole */}
      {type === "part_whole" && (
        <div className="mt-2 space-y-2">
          {evidence.partsOf && evidence.partsOf.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">
                Part of
              </div>
              <div className="flex flex-wrap gap-1.5">
                {evidence.partsOf.map((w) => (
                  <WordLink key={w} word={w} />
                ))}
              </div>
            </div>
          )}
          {evidence.hasParts && evidence.hasParts.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1">
                Contains
              </div>
              <div className="flex flex-wrap gap-1.5">
                {evidence.hasParts.map((w) => (
                  <WordLink key={w} word={w} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Concept Map */}
      {type === "concept_map" && evidence.conceptNeighbors && (
        <div className="mt-2">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono mb-1.5">
            Conceptual neighbors
          </div>
          <div className="flex flex-wrap gap-1.5">
            {evidence.conceptNeighbors.map((w) => (
              <WordLink key={w} word={w} />
            ))}
          </div>
        </div>
      )}

      {/* Polysemy */}
      {type === "polysemy" && evidence.sampleSenses && (
        <div className="mt-2 space-y-1.5">
          {evidence.sampleSenses.slice(0, 4).map((sense, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-accent font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <span className="text-text-secondary">{sense}</span>
            </div>
          ))}
          {(evidence.senseCount || 0) > 4 && (
            <div className="text-xs text-text-muted font-mono">
              ...and {(evidence.senseCount || 0) - 4} more senses
            </div>
          )}
        </div>
      )}

      {/* Borrowing Chain */}
      {type === "borrowing_chain" && evidence.borrowingSteps && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {evidence.borrowingSteps.map((step, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-text-muted text-xs">&rarr;</span>
              )}
              <span className="inline-flex flex-col items-center">
                <Badge variant={step.type === "borrowed" ? "accent" : "muted"} className="text-xs">
                  {step.language}
                </Badge>
                <span className="text-[9px] text-text-muted font-mono mt-0.5 italic">
                  {step.word}
                </span>
              </span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="text-text-muted text-xs">&rarr;</span>
            <Badge variant="accent" className="text-xs">English</Badge>
          </span>
        </div>
      )}

      {/* === Inline Visualizations === */}
      {type === "root_siblings" && evidence.sharedRoot && evidence.siblings && evidence.siblings.length >= 3 && (
        <div className="mt-4">
          <RootExplosion sharedRoot={evidence.sharedRoot} siblings={evidence.siblings} word={word} />
        </div>
      )}

      {type === "part_whole" && (
        <div className="mt-4">
          <PartWholeNesting word={word} partsOf={evidence.partsOf || []} hasParts={evidence.hasParts || []} />
        </div>
      )}

      {type === "polysemy" && evidence.sampleSenses && evidence.sampleSenses.length >= 3 && (
        <div className="mt-4">
          <PolysemyTree word={word} senseCount={evidence.senseCount || 0} sampleSenses={evidence.sampleSenses} />
        </div>
      )}

      {type === "borrowing_chain" && evidence.borrowingSteps && evidence.borrowingSteps.length >= 2 && (
        <div className="mt-4">
          <BorrowingMap borrowingSteps={evidence.borrowingSteps} />
        </div>
      )}
    </motion.div>
  );
}

export default function HiddenConnectionsSection({
  data,
  word,
}: {
  data: HiddenConnectionsData;
  word: string;
}) {
  return (
    <div className="space-y-4">
      {data.wordEquation && <WordEquation equation={data.wordEquation} />}

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="space-y-3"
      >
        {data.connections.map((connection, i) => (
          <ConnectionCard key={i} connection={connection} word={word} />
        ))}
      </motion.div>
    </div>
  );
}
