import type { Metadata } from "next";
import WordResult from "./WordResult";

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

export default function WordPage({ params }: PageProps) {
  const word = decodeURIComponent(params.word);
  return <WordResult word={word} />;
}
