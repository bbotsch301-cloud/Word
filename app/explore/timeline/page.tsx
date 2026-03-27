"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface CenturyData {
  century: string;
  count: number;
  sampleWords: string[];
}

const centuryColors: Record<string, string> = {
  "8th century": "#8B4513",
  "9th century": "#A0522D",
  "10th century": "#CD853F",
  "11th century": "#D2691E",
  "12th century": "#B8860B",
  "13th century": "#DAA520",
  "14th century": "#BDB76B",
  "15th century": "#6B8E23",
  "16th century": "#2E8B57",
  "17th century": "#20B2AA",
  "18th century": "#4682B4",
  "19th century": "#6A5ACD",
  "20th century": "#8B008B",
  "21st century": "#FF1493",
};

export default function TimelinePage() {
  const [data, setData] = useState<CenturyData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [centuryWords, setCenturyWords] = useState<{ word: string; year: number }[]>([]);
  const [centuryTotal, setCenturyTotal] = useState(0);
  const [centuryPage, setCenturyPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/search?action=timeline")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const expandCentury = async (century: string, page: number = 1) => {
    if (expanded === century && page === 1) {
      setExpanded(null);
      return;
    }
    setExpanded(century);
    setCenturyPage(page);
    try {
      const res = await fetch(`/api/search?action=by-century&century=${encodeURIComponent(century)}&page=${page}`);
      const d = await res.json();
      setCenturyWords(d.words || []);
      setCenturyTotal(d.total || 0);
    } catch {
      setCenturyWords([]);
    }
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/explore" className="text-sm text-text-muted hover:text-accent transition-colors">&larr; Explore</Link>
        </div>
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Word Timeline</h1>
        <p className="text-text-muted mb-8">When did English words first appear? Explore by century of first recorded use.</p>

        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading timeline data...</div>
        ) : (
          <div className="space-y-3">
            {data.map((c, i) => {
              const barWidth = Math.max((c.count / maxCount) * 100, 3);
              const color = centuryColors[c.century] || "var(--accent)";
              const isExpanded = expanded === c.century;

              return (
                <motion.div
                  key={c.century}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    onClick={() => expandCentury(c.century)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 group">
                      <span className="font-serif text-sm font-semibold text-text-secondary w-28 shrink-0">
                        {c.century}
                      </span>
                      <div className="flex-1 relative h-8 bg-surface rounded overflow-hidden border border-border group-hover:border-accent/30 transition-colors">
                        <div
                          className="absolute inset-y-0 left-0 rounded transition-all"
                          style={{ width: `${barWidth}%`, backgroundColor: color, opacity: 0.7 }}
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs text-text-muted">
                          {c.count.toLocaleString()} words
                        </span>
                      </div>
                    </div>
                    {/* Sample words preview */}
                    <div className="flex gap-1.5 mt-1 ml-[7.5rem] flex-wrap">
                      {c.sampleWords.slice(0, 5).map(w => (
                        <span key={w} className="text-xs text-text-muted italic">{w}</span>
                      ))}
                    </div>
                  </button>

                  {/* Expanded word list */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="ml-[7.5rem] mt-2 p-3 rounded-lg border border-border bg-surface"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {centuryWords.map(w => (
                          <Link key={w.word} href={`/word/${encodeURIComponent(w.word)}`}>
                            <Badge variant="default" className="hover:border-accent/40 cursor-pointer transition-colors">
                              {w.word} {w.year > 0 && <span className="text-text-muted ml-1">({w.year})</span>}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      {centuryTotal > 50 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); expandCentury(c.century, centuryPage - 1); }}
                            disabled={centuryPage <= 1}
                            className="text-xs text-text-muted hover:text-accent disabled:opacity-30"
                          >
                            &larr; Prev
                          </button>
                          <span className="text-xs text-text-muted">
                            Page {centuryPage} of {Math.ceil(centuryTotal / 50)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); expandCentury(c.century, centuryPage + 1); }}
                            disabled={centuryPage >= Math.ceil(centuryTotal / 50)}
                            className="text-xs text-text-muted hover:text-accent disabled:opacity-30"
                          >
                            Next &rarr;
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
}
