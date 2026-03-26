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
    title: `LEXICA — Excavating '${word}'`,
    description: `Unearth the deep etymology, linguistic history, and truest meaning of "${word}".`,
    openGraph: {
      title: `LEXICA — Excavating '${word}'`,
      description: `Unearth the deep etymology, linguistic history, and truest meaning of "${word}".`,
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const word = decodeURIComponent(params.word);

  // Validate input server-side
  if (!word || word.length > 40 || !/^[a-zA-Z-]+$/.test(word)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
          INVALID WORD
        </p>
        <h2 className="font-cormorant text-4xl font-light text-parchment mb-4">
          &ldquo;{word}&rdquo;
        </h2>
        <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
          Words must contain only letters and hyphens, up to 40 characters.
        </p>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 transition-all"
        >
          Return to Surface
        </Link>
      </div>
    );
  }

  try {
    const result = await excavateWord(word.toLowerCase());
    return <WordDisplay result={result} />;
  } catch {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
          EXCAVATION FAILED
        </p>
        <h2 className="font-cormorant text-4xl font-light text-parchment mb-4">
          {word}
        </h2>
        <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
          Could not excavate this word. The dig site may be unstable.
        </p>
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 transition-all"
        >
          Try Another Word
        </Link>
      </div>
    );
  }
}
