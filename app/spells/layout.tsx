import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Spells",
  description: "Discover homophones, anagrams, sound chains, and hidden etymological connections between words.",
  openGraph: {
    title: "Word Spells — LEXICA",
    description: "Discover homophones, anagrams, sound chains, and hidden etymological connections between words.",
  },
};

export default function SpellsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
