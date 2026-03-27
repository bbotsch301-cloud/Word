import type { Metadata } from "next";
import { excavateWord } from "@/lib/excavate";
import { definedTermJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import WordDisplay from "./WordDisplay";
import Link from "next/link";

interface PageProps {
  params: { word: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const word = decodeURIComponent(params.word);

  let description = `Definition, etymology, and history of "${word}" across 27+ dictionaries.`;
  try {
    const result = await excavateWord(word.toLowerCase());
    const firstDef = result?.definitions?.[0]?.definition;
    if (firstDef) {
      const clean = firstDef.replace(/\s+/g, " ").trim();
      description = clean.length > 155
        ? `${word}: ${clean.slice(0, 150)}...`
        : `${word}: ${clean}`;
    }
  } catch {
    // Use default description
  }

  return {
    title: word,
    description,
    openGraph: {
      title: `${word} — LEXICA`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${word} — LEXICA`,
      description,
    },
    alternates: {
      canonical: `/word/${encodeURIComponent(word)}`,
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const word = decodeURIComponent(params.word);

  if (!word || word.length > 40 || !/^[a-zA-Z-]+$/.test(word)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Invalid Word</h2>
        <p className="text-text-muted text-center max-w-md mb-6">
          Words must contain only letters and hyphens, up to 40 characters.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  try {
    const result = await excavateWord(word.toLowerCase());

    const jsonLd = definedTermJsonLd(result);
    const breadcrumbs = breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: word, href: `/word/${encodeURIComponent(word)}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
        <WordDisplay result={result} />
      </>
    );
  } catch {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Word Not Found</h2>
        <p className="text-text-muted text-center max-w-md mb-6">
          &ldquo;{word}&rdquo; was not found in any of our dictionaries.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Try Another Word
        </Link>
      </div>
    );
  }
}
