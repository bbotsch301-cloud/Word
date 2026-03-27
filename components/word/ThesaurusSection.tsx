"use client";

import { useState } from "react";
import Link from "next/link";
import type { ThesaurusData } from "@/types/lexica";
import Badge from "@/components/ui/Badge";

export default function ThesaurusSection({ data }: { data: ThesaurusData }) {
  const [showAllSynonyms, setShowAllSynonyms] = useState(false);

  const displaySynonyms = showAllSynonyms ? data.synonyms : data.synonyms.slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Moby Synonyms */}
      {data.synonyms.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xs text-text-muted uppercase tracking-wider font-mono">
              Synonyms
            </div>
            <div className="text-xs text-text-muted">
              ({data.synonyms.length} from Moby Thesaurus)
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displaySynonyms.map((syn) => (
              <Link key={syn} href={`/word/${encodeURIComponent(syn)}`}>
                <span className="inline-block px-2 py-0.5 text-sm bg-surface border border-border rounded hover:border-accent/40 hover:text-accent transition-colors cursor-pointer text-text-secondary">
                  {syn}
                </span>
              </Link>
            ))}
          </div>
          {data.synonyms.length > 30 && (
            <button
              onClick={() => setShowAllSynonyms(!showAllSynonyms)}
              className="mt-2 text-xs text-accent hover:text-accent-secondary transition-colors"
            >
              {showAllSynonyms ? "Show fewer" : `Show all ${data.synonyms.length} synonyms`}
            </button>
          )}
        </div>
      )}

      {/* WordNet Senses */}
      {data.wordnetSenses.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xs text-text-muted uppercase tracking-wider font-mono">
              WordNet Senses
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {data.wordnetSenses.map((sense, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Badge variant="accent" className="shrink-0 text-[10px]">{sense.pos}</Badge>
                  <p className="text-sm text-text-primary">{sense.definition}</p>
                </div>
                {sense.synonyms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sense.synonyms.map((syn) => (
                      <Link key={syn} href={`/word/${encodeURIComponent(syn)}`}>
                        <span className="text-xs px-1.5 py-0.5 bg-accent-muted/30 text-accent rounded cursor-pointer hover:bg-accent-muted/50 transition-colors">
                          {syn}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {sense.examples.length > 0 && (
                  <div className="mt-2">
                    {sense.examples.slice(0, 2).map((ex, j) => (
                      <p key={j} className="text-xs text-text-muted italic">&ldquo;{ex}&rdquo;</p>
                    ))}
                  </div>
                )}
                {(sense.hypernyms.length > 0 || sense.hyponyms.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
                    {sense.hypernyms.length > 0 && (
                      <span>Broader: {sense.hypernyms.join("; ")}</span>
                    )}
                    {sense.hyponyms.length > 0 && (
                      <span>Narrower: {sense.hyponyms.join("; ")}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roget's Categories */}
      {data.rogetCategories.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xs text-text-muted uppercase tracking-wider font-mono">
              Roget&apos;s Concept Groups
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {data.rogetCategories.map((cat) => (
              <div key={cat.number} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-text-muted">#{cat.number}</span>
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.relatedWords.map((w) => (
                    <Link key={w} href={`/word/${encodeURIComponent(w)}`}>
                      <span className="text-xs px-1.5 py-0.5 bg-surface border border-border-hover rounded cursor-pointer hover:border-accent/40 transition-colors text-text-secondary">
                        {w}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
