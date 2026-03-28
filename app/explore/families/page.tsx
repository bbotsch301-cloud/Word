"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface LangData {
  code: string;
  name: string;
  family: string;
  count: number;
  sampleWords: string[];
}

const familyColors: Record<string, string> = {
  Italic: "#8B4513",
  Romance: "#D2691E",
  Hellenic: "#4169E1",
  Germanic: "#2E8B57",
  Semitic: "#B8860B",
  "Indo-Aryan": "#FF8C00",
  Iranian: "#CD853F",
  Slavic: "#6A5ACD",
  Japonic: "#DC143C",
  "Sino-Tibetan": "#FF4500",
  Turkic: "#20B2AA",
};

export default function FamiliesPage() {
  const [data, setData] = useState<LangData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [langWords, setLangWords] = useState<string[]>([]);
  const [langTotal, setLangTotal] = useState(0);
  const [langPage, setLangPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"family" | "count">("family");

  useEffect(() => {
    fetch("/api/search?action=families")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const expandLang = async (code: string, page: number = 1) => {
    if (expanded === code && page === 1) {
      setExpanded(null);
      return;
    }
    setExpanded(code);
    setLangPage(page);
    try {
      const res = await fetch(`/api/search?action=by-origin&lang=${encodeURIComponent(code)}&page=${page}`);
      const d = await res.json();
      setLangWords(d.words || []);
      setLangTotal(d.total || 0);
    } catch {
      setLangWords([]);
    }
  };

  // Group by family
  const families = new Map<string, LangData[]>();
  data.forEach(l => {
    const group = families.get(l.family) || [];
    group.push(l);
    families.set(l.family, group);
  });

  const sortedFamilies = [...families.entries()].sort((a, b) => {
    const totalA = a[1].reduce((s, l) => s + l.count, 0);
    const totalB = b[1].reduce((s, l) => s + l.count, 0);
    return totalB - totalA;
  });

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/explore" className="text-sm text-text-muted hover:text-accent transition-colors">&larr; Explore</Link>
        </div>
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Language Families</h1>
        <p className="text-text-muted mb-6">English is a magpie language. See where our words come from.</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setGroupBy("family")}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${groupBy === "family" ? "border-accent text-accent bg-accent/10" : "border-border text-text-muted"}`}
          >
            By Family
          </button>
          <button
            onClick={() => setGroupBy("count")}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${groupBy === "count" ? "border-accent text-accent bg-accent/10" : "border-border text-text-muted"}`}
          >
            By Count
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading language data...</div>
        ) : groupBy === "family" ? (
          <div className="space-y-6">
            {sortedFamilies.map(([family, langs]) => {
              const color = familyColors[family] || "var(--accent)";
              const familyTotal = langs.reduce((s, l) => s + l.count, 0);
              return (
                <section key={family}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <h2 className="font-serif text-lg font-semibold text-text-primary">{family}</h2>
                    <span className="text-xs text-text-muted">({familyTotal.toLocaleString()} words)</span>
                  </div>
                  <div className="space-y-2 ml-5">
                    {langs.sort((a, b) => b.count - a.count).map(l => (
                      <div key={l.code}>
                        <button onClick={() => expandLang(l.code)} className="w-full text-left group">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-text-secondary w-36 shrink-0">{l.name}</span>
                            <div className="flex-1 relative h-6 bg-surface rounded overflow-hidden border border-border group-hover:border-accent/30 transition-colors">
                              <div
                                className="absolute inset-y-0 left-0 rounded"
                                style={{ width: `${Math.max((l.count / maxCount) * 100, 2)}%`, backgroundColor: color, opacity: 0.6 }}
                              />
                              <span className="absolute inset-y-0 right-2 flex items-center text-xs text-text-muted">
                                {l.count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 mt-0.5 ml-36 flex-wrap">
                            {l.sampleWords.slice(0, 5).map(w => (
                              <span key={w} className="text-xs text-text-muted italic">{w}</span>
                            ))}
                          </div>
                        </button>

                        {expanded === l.code && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="ml-36 mt-2 p-3 rounded-lg border border-border bg-surface"
                          >
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {langWords.map(w => (
                                <Link key={w} href={`/word/${encodeURIComponent(w)}`}>
                                  <Badge variant="default" className="hover:border-accent/40 cursor-pointer transition-colors">
                                    {w}
                                  </Badge>
                                </Link>
                              ))}
                            </div>
                            {langTotal > 50 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); expandLang(l.code, langPage - 1); }}
                                  disabled={langPage <= 1}
                                  className="text-xs text-text-muted hover:text-accent disabled:opacity-30"
                                >
                                  &larr; Prev
                                </button>
                                <span className="text-xs text-text-muted">
                                  Page {langPage} of {Math.ceil(langTotal / 50)}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); expandLang(l.code, langPage + 1); }}
                                  disabled={langPage >= Math.ceil(langTotal / 50)}
                                  className="text-xs text-text-muted hover:text-accent disabled:opacity-30"
                                >
                                  Next &rarr;
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {data.sort((a, b) => b.count - a.count).map((l, i) => {
              const color = familyColors[l.family] || "var(--accent)";
              return (
                <motion.div
                  key={l.code}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button onClick={() => expandLang(l.code)} className="w-full text-left group">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-text-secondary w-36 shrink-0">{l.name}</span>
                      <div className="flex-1 relative h-6 bg-surface rounded overflow-hidden border border-border group-hover:border-accent/30 transition-colors">
                        <div
                          className="absolute inset-y-0 left-0 rounded"
                          style={{ width: `${Math.max((l.count / maxCount) * 100, 2)}%`, backgroundColor: color, opacity: 0.6 }}
                        />
                        <span className="absolute inset-y-0 right-2 flex items-center text-xs text-text-muted">
                          {l.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                  {expanded === l.code && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="ml-12 mt-2 p-3 rounded-lg border border-border bg-surface"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {langWords.map(w => (
                          <Link key={w} href={`/word/${encodeURIComponent(w)}`}>
                            <Badge variant="default" className="hover:border-accent/40 cursor-pointer transition-colors">
                              {w}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      {langTotal > 50 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); expandLang(l.code, langPage - 1); }}
                            disabled={langPage <= 1}
                            className="text-xs text-text-muted hover:text-accent disabled:opacity-30"
                          >
                            &larr; Prev
                          </button>
                          <span className="text-xs text-text-muted">
                            Page {langPage} of {Math.ceil(langTotal / 50)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); expandLang(l.code, langPage + 1); }}
                            disabled={langPage >= Math.ceil(langTotal / 50)}
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
