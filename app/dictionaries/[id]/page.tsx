import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, browseDictionary } from "@/lib/dictionaries";

export const dynamic = "force-dynamic";
import DictionaryTable from "@/components/DictionaryTable";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface PageProps {
  params: { id: string };
  searchParams: { q?: string; letter?: string; page?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dict = getDictionary(params.id);
  return {
    title: `${dict?.name || params.id} — LEXICA`,
    description: dict?.description || `Browse the ${params.id} dictionary.`,
  };
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export default function DictionaryPage({ params, searchParams }: PageProps) {
  const dict = getDictionary(params.id);

  if (!dict) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">Dictionary Not Found</h2>
        <p className="text-text-muted mb-6">This reference work is not in our collection.</p>
        <Link href="/dictionaries" className="text-sm font-medium text-accent hover:text-accent-hover">
          Browse All Dictionaries
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Dictionaries", href: "/dictionaries" },
        { label: dict.name },
      ]} />

      <div className="mt-4 mb-6">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-serif text-4xl font-bold text-text-primary tracking-tight">{dict.name}</h1>
          <span className="text-sm text-accent-secondary font-mono">{dict.year}</span>
          <span className="text-xs font-mono text-text-muted bg-surface rounded-full px-2.5 py-0.5 border border-border">
            {dict.entry_count.toLocaleString()} entries
          </span>
        </div>
        <p className="text-sm text-text-secondary mt-2 max-w-2xl">{dict.description}</p>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder={`Search ${dict.name}...`}
            className="flex-1 h-9 px-3 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] shadow-sm transition-all"
          />
          <button
            type="submit"
            className="h-9 px-4 text-sm font-medium bg-gradient-to-r from-accent to-accent-hover text-white rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            Search
          </button>
        </div>
      </form>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        <Link
          href={`/dictionaries/${params.id}`}
          className={`text-xs px-2.5 py-1.5 rounded-md font-mono transition-all ${
            !searchParams.letter && !searchParams.q
              ? "bg-accent text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-surface"
          }`}
        >
          All
        </Link>
        {ALPHABET.map((l) => (
          <Link
            key={l}
            href={`/dictionaries/${params.id}?letter=${l}`}
            className={`text-xs px-2.5 py-1.5 rounded-md uppercase font-mono transition-all ${
              searchParams.letter === l
                ? "bg-accent text-white shadow-sm"
                : "text-text-muted hover:text-text-primary hover:bg-surface"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>

      {/* Results info */}
      <p className="text-xs text-text-muted mb-3 font-mono">
        {result.total.toLocaleString()} entries
        {searchParams.q && ` matching "${searchParams.q}"`}
        {searchParams.letter && ` starting with "${searchParams.letter.toUpperCase()}"`}
        {totalPages > 1 && ` — Page ${page} of ${totalPages}`}
      </p>

      <DictionaryTable entries={result.entries} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/dictionaries/${params.id}?${new URLSearchParams({
                ...(searchParams.letter ? { letter: searchParams.letter } : {}),
                ...(searchParams.q ? { q: searchParams.q } : {}),
                page: String(page - 1),
              })}`}
              className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-surface flex items-center transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-xs text-text-muted font-mono">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dictionaries/${params.id}?${new URLSearchParams({
                ...(searchParams.letter ? { letter: searchParams.letter } : {}),
                ...(searchParams.q ? { q: searchParams.q } : {}),
                page: String(page + 1),
              })}`}
              className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-surface flex items-center transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
