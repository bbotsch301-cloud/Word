import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, browseDictionary } from "@/lib/dictionaries";
import DictionaryBrowser from "@/components/DictionaryBrowser";

interface PageProps {
  params: { id: string };
  searchParams: { q?: string; letter?: string; page?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dict = getDictionary(params.id);
  const name = dict?.name || params.id;
  return {
    title: `LEXICA — ${name}`,
    description: dict?.description || `Browse the ${name} dictionary.`,
  };
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export default function DictionaryPage({ params, searchParams }: PageProps) {
  const dict = getDictionary(params.id);

  if (!dict) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
          ARCHIVE NOT FOUND
        </p>
        <h2 className="font-cormorant text-4xl font-light text-parchment mb-4">
          {params.id}
        </h2>
        <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
          This reference work is not in our archives.
        </p>
        <Link
          href="/dictionaries"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 transition-all"
        >
          Browse All Archives
        </Link>
      </div>
    );
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = browseDictionary(params.id, {
    page,
    pageSize: 50,
    letter: searchParams.letter,
    query: searchParams.q,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  return (
    <main className="max-w-[780px] mx-auto px-6 md:px-10 py-16 pb-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dictionaries"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-parchment/40 hover:text-gold transition-colors mb-4 inline-block"
        >
          &larr; All Archives
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-cormorant text-4xl font-light text-parchment">
              {dict.name}
            </h1>
            <p className="font-mono text-[10px] text-parchment/40 mt-1">
              {dict.year} &middot; {dict.entry_count.toLocaleString()} entries
            </p>
          </div>
        </div>
        <p className="font-crimson text-sm text-parchment/60 leading-relaxed mt-3 max-w-lg">
          {dict.description}
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder={`Search ${dict.name}...`}
            className="flex-1 bg-transparent border-b border-gold/25 font-cormorant text-lg font-light tracking-subtle text-parchment placeholder:italic placeholder:text-gold/30 focus:outline-none focus:border-gold py-2 transition-all"
          />
          <button
            type="submit"
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold border border-gold/25 px-4 py-2 hover:bg-gold/10 transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-8">
        <Link
          href={`/dictionaries/${params.id}`}
          className={`font-mono text-[10px] px-2 py-1 transition-colors ${
            !searchParams.letter && !searchParams.q
              ? "text-gold border border-gold/40 bg-gold/10"
              : "text-parchment/40 hover:text-gold"
          }`}
        >
          All
        </Link>
        {ALPHABET.map((l) => (
          <Link
            key={l}
            href={`/dictionaries/${params.id}?letter=${l}`}
            className={`font-mono text-[10px] px-2 py-1 uppercase transition-colors ${
              searchParams.letter === l
                ? "text-gold border border-gold/40 bg-gold/10"
                : "text-parchment/40 hover:text-gold"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>

      {/* Results info */}
      <p className="font-mono text-[9px] text-parchment/40 mb-4">
        {result.total.toLocaleString()} entries
        {searchParams.q && ` matching "${searchParams.q}"`}
        {searchParams.letter && ` starting with "${searchParams.letter.toUpperCase()}"`}
        {totalPages > 1 && ` — Page ${page} of ${totalPages}`}
      </p>

      {/* Entries */}
      <DictionaryBrowser entries={result.entries} dictId={params.id} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {page > 1 && (
            <Link
              href={`/dictionaries/${params.id}?${new URLSearchParams({
                ...(searchParams.letter ? { letter: searchParams.letter } : {}),
                ...(searchParams.q ? { q: searchParams.q } : {}),
                page: String(page - 1),
              })}`}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/25 px-4 py-2 hover:bg-gold/10 transition-all"
            >
              &larr; Previous
            </Link>
          )}
          <span className="font-mono text-[10px] text-parchment/40">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dictionaries/${params.id}?${new URLSearchParams({
                ...(searchParams.letter ? { letter: searchParams.letter } : {}),
                ...(searchParams.q ? { q: searchParams.q } : {}),
                page: String(page + 1),
              })}`}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/25 px-4 py-2 hover:bg-gold/10 transition-all"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
