"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWordLists } from "@/components/WordListProvider";

const ETYMOLOGY_FACTS = [
  { word: "salary", fact: "Roman soldiers were paid in salt — sal in Latin became salary.", origin: "Latin" },
  { word: "disaster", fact: "Literally 'bad star' — from Italian disastro, when the stars were misaligned.", origin: "Italian" },
  { word: "muscle", fact: "From musculus, 'little mouse' — the Romans saw mice running under skin.", origin: "Latin" },
  { word: "mortgage", fact: "A 'death pledge' — French mort (death) + gage (pledge).", origin: "French" },
  { word: "nice", fact: "Once meant 'foolish, ignorant' in Latin. It took 700 years to become a compliment.", origin: "Latin" },
  { word: "clue", fact: "From 'clew,' a ball of thread — like Theseus used to escape the Minotaur's labyrinth.", origin: "Greek myth" },
  { word: "sarcasm", fact: "From Greek sarkazein — literally 'to tear flesh.' Words can bite.", origin: "Greek" },
  { word: "whiskey", fact: "From Gaelic uisce beatha — 'water of life.' The Irish took their water seriously.", origin: "Gaelic" },
];

interface WotdData {
  word: string;
  definition: string;
  phonetic?: string;
  pos?: string;
  etymologySnippet?: string;
}

const FALLBACK_WOTD: WotdData = {
  word: "serendipity",
  definition: "The faculty of making fortunate discoveries by accident.",
  phonetic: "/ˌsɛrənˈdɪpɪti/",
  pos: "noun",
  etymologySnippet: "Coined by Horace Walpole in 1754, from the Persian fairy tale 'The Three Princes of Serendip.'",
};

export default function Home() {
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<WotdData>(FALLBACK_WOTD);
  const [currentFact, setCurrentFact] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const { bookmarks } = useWordLists();
  const router = useRouter();
  const factInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      if (stored) setRecentWords(JSON.parse(stored));
    } catch {}

    fetch("/api/word-of-the-day")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.word) setWordOfTheDay({ ...FALLBACK_WOTD, ...data }); })
      .catch(() => {});

    setCurrentFact(Math.floor(Math.random() * ETYMOLOGY_FACTS.length));
    factInterval.current = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % ETYMOLOGY_FACTS.length);
    }, 8000);
    return () => { if (factInterval.current) clearInterval(factInterval.current); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchValue.trim().toLowerCase();
    if (word) router.push(`/word/${encodeURIComponent(word)}`);
  };

  const fact = ETYMOLOGY_FACTS[currentFact];

  return (
    <main className="min-h-screen">
      {/* ============ HERO ============ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3 hero-title" style={{ fontFamily: "var(--font-ui)" }}>
            LEXICA
          </h1>
          <p className="text-lg text-[var(--text-muted)] mb-10" style={{ fontFamily: "var(--font-body)" }}>
            Explore the roots of every word
          </p>

          {/* Search bar with orange button */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search any word..."
              autoFocus
              className="w-full h-12 px-5 pr-28 rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 h-9 px-6 rounded-full text-white text-sm font-medium"
              style={{ fontFamily: "var(--font-ui)", background: "var(--accent)" }}
            >
              Search
            </button>
          </form>

          <p className="text-sm text-[var(--text-muted)] mt-4" style={{ fontFamily: "var(--font-body)" }}>
            Try &ldquo;love&rdquo; &middot; &ldquo;disaster&rdquo; &middot; &ldquo;serendipity&rdquo; &middot; &ldquo;melancholy&rdquo; &middot; &ldquo;ephemeral&rdquo;
          </p>

          {/* Recent searches */}
          {recentWords.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-2" style={{ fontFamily: "var(--font-ui)" }}>
                Recent
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {recentWords.slice(0, 8).map(word => (
                  <Link key={word} href={`/word/${encodeURIComponent(word)}`} className="recent-chip">
                    {word}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ DID YOU KNOW? ============ */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-5" style={{ fontFamily: "var(--font-ui)" }}>
            Did you know?
          </p>
          <Link href={`/word/${encodeURIComponent(fact.word)}`} className="group block">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
              {fact.word}
            </h2>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-xl">
              {fact.fact}
            </p>
            <span className="inline-block mt-3 text-xs uppercase tracking-wider text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--surface)]" style={{ fontFamily: "var(--font-ui)" }}>
              {fact.origin}
            </span>
          </Link>

          <div className="flex gap-1.5 mt-6">
            {ETYMOLOGY_FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFact(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentFact ? "bg-[var(--accent)] w-4" : "bg-[var(--border)] hover:bg-[var(--text-muted)]"
                }`}
                aria-label={`Show fact ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ WORD OF THE DAY ============ */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-4" style={{ fontFamily: "var(--font-ui)" }}>
            Word of the Day
          </p>
          <Link href={`/word/${encodeURIComponent(wordOfTheDay.word)}`} className="group block">
            <div className="entry-card">
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <h2 className="text-4xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {wordOfTheDay.word}
                </h2>
                {wordOfTheDay.pos && (
                  <span className="text-sm text-[var(--text-muted)]">({wordOfTheDay.pos})</span>
                )}
              </div>
              {wordOfTheDay.phonetic && (
                <p className="text-sm text-[var(--accent)] mb-3" style={{ fontFamily: "ui-monospace, monospace" }}>
                  {wordOfTheDay.phonetic}
                </p>
              )}
              <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">
                {wordOfTheDay.definition}
              </p>
              {wordOfTheDay.etymologySnippet && (
                <p className="text-sm text-[var(--text-muted)] italic leading-relaxed mt-3 max-w-xl border-l-2 border-[var(--accent)] pl-3">
                  {wordOfTheDay.etymologySnippet}
                </p>
              )}
            </div>
          </Link>
        </div>
      </section>

      {/* ============ BOOKMARKS ============ */}
      {bookmarks.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]" style={{ fontFamily: "var(--font-ui)" }}>
                Your bookmarks
              </p>
              {bookmarks.length > 12 && (
                <Link href="/lists" className="text-xs text-[var(--accent)]">View all &rarr;</Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {bookmarks.slice(0, 12).map(word => (
                <Link key={word} href={`/word/${encodeURIComponent(word)}`} className="recent-chip">
                  {word}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ SOURCES ============ */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/dictionaries" className="group flex items-center justify-between gap-4 source-banner">
            <div>
              <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors" style={{ fontFamily: "var(--font-ui)" }}>
                Built on 27+ historical sources
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Webster&apos;s 1828, Strong&apos;s Concordance, Wiktionary, and more.
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)] shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
