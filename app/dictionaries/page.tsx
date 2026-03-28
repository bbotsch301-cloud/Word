import type { Metadata } from "next";
import { getAllDictionaries } from "@/lib/dictionaries";
import DictionaryGrid from "@/components/DictionaryGrid";

export const metadata: Metadata = {
  title: "Dictionaries — LEXICA",
  description: "Browse 7 reference works spanning centuries of the English language.",
};

export default function DictionariesPage() {
  const dictionaries = getAllDictionaries();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-serif text-4xl font-bold text-text-primary tracking-tight mb-1">
        Dictionaries
      </h1>
      <p className="font-serif italic text-text-muted mb-8">
        Browse individual reference works spanning centuries of the English language.
      </p>

      <DictionaryGrid dictionaries={dictionaries} />
    </main>
  );
}
