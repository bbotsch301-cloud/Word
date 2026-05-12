"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface SearchResult {
  word: string;
  preview: string;
  pos?: string;
  originLang?: string;
  firstUseYear?: number;
}

type ResultFilter = "all" | "etymology" | "root" | "similar";

const RESULT_FILTERS: { id: ResultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "etymology", label: "Etymology" },
  { id: "root", label: "By Root" },
  { id: "similar", label: "Similar Words" },
];

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
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");

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
    setError(null);
    if (p === 1) window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      setResults([]);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pattern, originLang, century, pos, cefrLevel, sort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResultFilter("all");
    doSearch(1);
  };

  const categorized = useMemo(() => {
    const cleanPattern = pattern.replace(/[*?]/g, "").toLowerCase();
    return results.map(r => {
      const word = r.word.toLowerCase();
      let matchType: ResultFilter = "similar";
      if (cleanPattern && word.startsWith(cleanPattern)) {
        matchType = "root";
      } else if (cleanPattern && (word.endsWith(cleanPattern) || word.includes(cleanPattern))) {
        matchType = "etymology";
      }
      return { ...r, matchType };
    });
  }, [results, pattern]);

  const filteredResults = useMemo(() => {
    if (resultFilter === "all") return categorized;
    return categorized.filter(r => r.matchType === resultFilter);
  }, [categorized, resultFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<ResultFilter, number> = { all: categorized.length, etymology: 0, root: 0, similar: 0 };
    categorized.forEach(r => { counts[r.matchType]++; });
    return counts;
  }, [categorized]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
        Advanced Search
      </h1>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>Search by pattern, origin language, century, and more.</p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Word Pattern
            <span className="font-normal ml-2" style={{ color: "var(--text-muted)" }}>Use * for any characters, ? for single character</span>
          </label>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="e.g. *ology, un*able, ?at"
            className="w-full h-10 px-3 rounded-lg border text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Origin Language</label>
            <select
              value={originLang}
              onChange={e => setOriginLang(e.target.value)}
              className="w-full h-11 sm:h-9 px-3 sm:px-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="">Any</option>
              {filters?.languages.map(l => (
                <option key={l.code} value={l.code}>{l.name} ({l.count.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>First Used</label>
            <select
              value={century}
              onChange={e => setCentury(e.target.value)}
              className="w-full h-11 sm:h-9 px-3 sm:px-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="">Any century</option>
              {filters?.centuries.map(c => (
                <option key={c.century} value={c.century}>{c.century} ({c.count.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Part of Speech</label>
            <select
              value={pos}
              onChange={e => setPos(e.target.value)}
              className="w-full h-11 sm:h-9 px-3 sm:px-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="">Any</option>
              {filters?.partsOfSpeech.map(p => (
                <option key={p.pos} value={p.pos}>{p.pos} ({p.count.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>CEFR Level</label>
            <select
              value={cefrLevel}
              onChange={e => setCefrLevel(e.target.value)}
              className="w-full h-11 sm:h-9 px-3 sm:px-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
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
            className="h-10 px-6 rounded-lg text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--accent)", fontFamily: "var(--font-ui)" }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-10 px-3 rounded-lg border text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            aria-label="Sort results by"
          >
            <option value="alpha">A-Z</option>
            <option value="length">Shortest first</option>
            <option value="frequency">Most common</option>
          </select>
          <button
            type="button"
            onClick={() => { setPattern(""); setOriginLang(""); setCentury(""); setPos(""); setCefrLevel(""); setSort("alpha"); setResults([]); setTotal(0); }}
            className="h-10 px-4 rounded-lg border text-sm transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Clear
          </button>
        </div>
      </form>

      {total > 0 && (
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="text-2xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{total.toLocaleString()}</span>
            <span className="ml-2" style={{ color: "var(--text-muted)" }}>result{total !== 1 ? "s" : ""}</span>
            {total > 50 && <span className="ml-2" style={{ color: "var(--text-muted)" }}>&middot; page {page} of {Math.ceil(total / 50)}</span>}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
          {RESULT_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setResultFilter(f.id)}
              className={`filter-pill ${resultFilter === f.id ? "filter-pill-active" : ""}`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60 text-[11px]">{filterCounts[f.id]}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg p-6 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--accent)" }}>{error}</p>
        </div>
      )}

      {!loading && !error && total === 0 && (pattern || originLang || century || pos || cefrLevel) && (
        <div className="rounded-lg p-10 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3" style={{ color: "var(--text-muted)" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="mb-2" style={{ color: "var(--text-muted)" }}>No results found.</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Try a different pattern. Use <code className="px-1 rounded" style={{ fontFamily: "ui-monospace, monospace", background: "var(--bg)" }}>*</code> for any characters
            and <code className="px-1 rounded" style={{ fontFamily: "ui-monospace, monospace", background: "var(--bg)" }}>?</code> for a single character.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filteredResults.map(r => (
          <Link
            key={r.word}
            href={`/word/${encodeURIComponent(r.word)}`}
            className="search-result-card group block p-4 rounded-lg border"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
              <span className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                {r.word}
              </span>
              {r.pos && <Badge variant="accent">{r.pos}</Badge>}
              {r.originLang && (
                <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "ui-monospace, monospace", color: "var(--text-muted)" }}>
                  from {r.originLang}
                </span>
              )}
              {r.firstUseYear && (
                <span className="text-[10px] ml-auto" style={{ fontFamily: "ui-monospace, monospace", color: "var(--text-muted)" }}>
                  c. {r.firstUseYear}
                </span>
              )}
            </div>
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.preview}</p>
          </Link>
        ))}
      </div>

      {total > 50 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => doSearch(page - 1)}
            disabled={page <= 1}
            className="h-8 px-3 rounded border text-sm disabled:opacity-30 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <button
            onClick={() => doSearch(page + 1)}
            disabled={page >= Math.ceil(total / 50)}
            className="h-8 px-3 rounded border text-sm disabled:opacity-30 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
