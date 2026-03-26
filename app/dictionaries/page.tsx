import type { Metadata } from "next";
import Link from "next/link";
import { getAllDictionaries } from "@/lib/dictionaries";
import SearchInput from "@/components/SearchInput";

export const metadata: Metadata = {
  title: "LEXICA — Reference Library",
  description: "Browse individual dictionaries, encyclopedias, and reference works spanning centuries of the English language.",
};

export default function DictionariesPage() {
  const dictionaries = getAllDictionaries();

  return (
    <main className="max-w-[780px] mx-auto px-6 md:px-10 py-16 pb-32">
      <div className="mb-12">
        <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-4">
          Reference Library
        </p>
        <h1
          className="font-cormorant font-light tracking-[0.04em] text-parchment mb-4"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
        >
          The Archives
        </h1>
        <p className="font-crimson italic text-gold/70 text-lg leading-relaxed max-w-lg">
          Browse individual reference works spanning centuries of the English language — from Noah Webster&apos;s 1828 masterwork to Victorian slang.
        </p>
      </div>

      <div className="grid gap-4">
        {dictionaries.map((dict) => (
          <Link
            key={dict.id}
            href={`/dictionaries/${dict.id}`}
            className="group block border border-parchment/10 hover:border-gold/30 bg-stratum-0 hover:bg-stratum-1 p-6 transition-all rounded-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-cormorant text-2xl font-light text-parchment group-hover:text-gold transition-colors">
                  {dict.name}
                </h2>
                <span className="font-mono text-[10px] text-parchment/40">
                  {dict.year}
                </span>
              </div>
              <span className="font-mono text-[10px] text-gold/60 border border-gold/20 px-2 py-1 rounded-sm">
                {dict.entry_count.toLocaleString()} entries
              </span>
            </div>
            <p className="font-crimson text-sm text-parchment/60 leading-relaxed mt-2">
              {dict.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Link back to main excavation */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 transition-all inline-block"
        >
          Excavate a Word
        </Link>
      </div>
    </main>
  );
}
