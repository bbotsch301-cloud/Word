import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import SpellDetailContent from "@/components/spells/SpellDetailContent";

interface PageProps {
  params: { word: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const word = decodeURIComponent(params.word);
  return {
    title: `${word} — Word Spells`,
    description: `Homophones, anagrams, sound chains, and hidden etymological connections for "${word}".`,
    openGraph: {
      title: `${word} — Word Spells — LEXICA`,
      description: `Discover the sonic and letter spells hiding inside "${word}".`,
    },
    alternates: {
      canonical: `/spells/${encodeURIComponent(word)}`,
    },
  };
}

export default function SpellWordPage({ params }: PageProps) {
  const word = decodeURIComponent(params.word);

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Word Spells", href: "/spells" },
    { name: word, href: `/spells/${encodeURIComponent(word)}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <SpellDetailContent word={word} />
    </>
  );
}
