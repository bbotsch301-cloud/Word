"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface SearchResult {
  word: string;
  preview: string;
  pos?: string;
  originLang?: string;
  firstUseYear?: number;
}

interface Filters {
  languages: { code: string; name: string; count: number }[];
  centuries: { century: string; count: number }[];
  partsOfSpeech: { pos: string; count: number }[];
}

export default function SearchPage() {
  const router = useRouter();
  const [pattern, setPattern] = useState("");
  const [originLang, setOriginLang] = useState("");
  const [century, setCentury] = useState("");
  const [pos, setPos] = useState("");
  const [cefrLevel, setCefrLevel] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("alpha");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    fetch("/api/search?action=filters")
      .then(r => r.json())
      .then(setFilters)
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async (p: number = 1) => {
    const params = new URLSearchParams();
    if (pattern) params.set("pattern", pattern);
    if (originLang) params.set("originLang", originLang);
    if (century) params.set("century", century);
    if (pos) params.set("pos", pos);
    if (cefrLevel) params.set("cefrLevel", cefrLevel);
    if (sort !== "alpha") params.set("sort", sort);
    params.set("page", String(p));

    if (!pattern && !originLang && !century && !pos && !cefrLevel) return;

    setLoading(true);
    if (p === 1) window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [pattern, originLang, century, pos, cefrLevel, sort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">Advanced Search</h1>
        <p className="text-text-muted mb-8">Search by pattern, origin language, century, and more.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {/* Pattern */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Word Pattern
              <span className="text-text-muted font-normal ml-2">Use * for any characters, ? for single character</span>
            </label>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="e.g. *ology, un*able, ?at"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Origin language */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Origin Language</label>
              <select
                value={originLang}
                onChange={e => setOriginLang(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="">Any</option>
                {filters?.languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name} ({l.count.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* Century */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">First Used</label>
              <select
                value={century}
                onChange={e => setCentury(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="">Any century</option>
                {filters?.centuries.map(c => (
                  <option key={c.century} value={c.century}>{c.century} ({c.count.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* Part of speech */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Part of Speech</label>
              <select
                value={pos}
                onChange={e => setPos(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="">Any</option>
                {filters?.partsOfSpeech.map(p => (
                  <option key={p.pos} value={p.pos}>{p.pos} ({p.count.toLocaleString()})</option>
                ))}
              </select>
            </div>

            {/* CEFR Level */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">CEFR Level</label>
              <select
                value={cefrLevel}
                onChange={e => setCefrLevel(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="">Any</option>
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper Inter.)</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="C2">C2 (Mastery)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-lg bg-gradient-to-r from-accent to-accent-hover text-white font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
              aria-label="Sort results by"
            >
              <option value="alpha">A-Z</option>
              <option value="length">Shortest first</option>
              <option value="frequency">Most common</option>
            </select>
            <button
              type="button"
              onClick={() => { setPattern(""); setOriginLang(""); setCentury(""); setPos(""); setCefrLevel(""); setSort("alpha"); setResults([]); setTotal(0); }}
              className="h-10 px-4 rounded-lg border border-border text-text-muted text-sm hover:text-text-primary transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Results */}
        {total > 0 && (
          <p className="text-sm text-text-muted mb-4">
            {total.toLocaleString()} result{total !== 1 ? "s" : ""} found
            {total > 50 && ` — showing page ${page}`}
          </p>
        )}

        {!loading && total === 0 && (pattern || originLang || century || pos || cefrLevel) && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted mb-2">No results found.</p>
            <p className="text-sm text-text-muted">
              Try a different pattern. Use <code className="font-mono bg-bg px-1 rounded">*</code> for any characters
              and <code className="font-mono bg-bg px-1 rounded">?</code> for a single character.
              For example: <code className="font-mono bg-bg px-1 rounded">*ology</code>, <code className="font-mono bg-bg px-1 rounded">un*able</code>.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {results.map((r, i) => (
            <motion.div
              key={r.word}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                href={`/word/${encodeURIComponent(r.word)}`}
                className="block p-3 rounded-lg border border-border bg-surface hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-semibold text-text-primary">{r.word}</span>
                  {r.pos && <Badge variant="accent">{r.pos}</Badge>}
                  {r.firstUseYear && <Badge variant="muted">c. {r.firstUseYear}</Badge>}
                </div>
                <p className="text-sm text-text-muted line-clamp-1">{r.preview}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => doSearch(page - 1)}
              disabled={page <= 1}
              className="h-8 px-3 rounded border border-border text-sm text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page} of {Math.ceil(total / 50)}
            </span>
            <button
              onClick={() => doSearch(page + 1)}
              disabled={page >= Math.ceil(total / 50)}
              className="h-8 px-3 rounded border border-border text-sm text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
