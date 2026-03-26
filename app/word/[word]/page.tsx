import type { Metadata } from "next";
import { excavateWord } from "@/lib/excavate";
import WordDisplay from "./WordDisplay";
import Link from "next/link";

interface PageProps {
  params: { word: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const word = decodeURIComponent(params.word);
  return {
    title: `${word} — LEXICA`,
    description: `Definition, etymology, and history of "${word}" from 7 dictionaries.`,
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
    return <WordDisplay result={result} />;
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
