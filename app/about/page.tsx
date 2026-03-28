import Link from "next/link";

const SOURCES = [
  { name: "Wiktionary", year: "2024", desc: "Modern definitions, etymology, and pronunciation from the collaborative dictionary" },
  { name: "Webster\u2019s Unabridged 1913", year: "1913", desc: "The International Dictionary of the English Language" },
  { name: "Webster\u2019s 1828", year: "1828", desc: "Noah Webster\u2019s American Dictionary of the English Language" },
  { name: "GCIDE", year: "2024", desc: "GNU Collaborative International Dictionary of English" },
  { name: "Black\u2019s Law Dictionary", year: "1910", desc: "Definitions of legal terms and phrases" },
  { name: "WordNet", year: "2024", desc: "Princeton University\u2019s lexical database of semantic relations" },
  { name: "Moby Thesaurus", year: "1996", desc: "Over 2.5 million synonyms across 30,000 root words" },
  { name: "Roget\u2019s Thesaurus", year: "1911", desc: "Classic concept-organized synonym reference" },
  { name: "Strong\u2019s Concordance", year: "1890", desc: "Hebrew and Greek roots for biblical vocabulary" },
  { name: "CMU Pronouncing Dictionary", year: "2015", desc: "Phonetic transcriptions for 134,000+ words" },
  { name: "IPA Dictionary", year: "2023", desc: "International Phonetic Alphabet transcriptions" },
  { name: "Oxford 5000", year: "2020", desc: "CEFR-tagged essential vocabulary" },
  { name: "Google Books Ngrams", year: "2012", desc: "Historical word frequency from centuries of published text" },
  { name: "MorphoLex", year: "2020", desc: "Morphological structure and word formation analysis" },
  { name: "Hobson-Jobson", year: "1886", desc: "Anglo-Indian words and phrases" },
  { name: "1811 Dictionary of the Vulgar Tongue", year: "1811", desc: "Georgian-era slang and colloquial language" },
];

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-serif text-4xl font-bold text-text-primary mb-3">About LEXICA</h1>
      <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-3xl">
        LEXICA is a multi-source English dictionary that brings together 27+ historical and modern
        sources into a single research tool. Every word page draws from dictionaries spanning
        two centuries, giving you definitions, etymology, pronunciation, frequency data, and more
        in one place.
      </p>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-4">Why LEXICA exists</h2>
        <div className="space-y-4 text-text-secondary leading-relaxed">
          <p>
            Most dictionaries give you a definition. LEXICA gives you the full story. By cross-referencing
            sources from Noah Webster&apos;s 1828 dictionary to modern Wiktionary entries, LEXICA reveals
            how words have evolved, where they came from, and the surprising connections between them.
          </p>
          <p>
            Features like <Link href="/spells" className="text-accent hover:underline">Word Spells</Link> uncover
            hidden relationships between words that sound alike or share unexpected roots.
            The <Link href="/explore" className="text-accent hover:underline">Explore</Link> section lets you
            browse words by century, language of origin, or language family. And
            the <Link href="/compare" className="text-accent hover:underline">Compare</Link> tool puts any
            two words side by side.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-4">Our sources</h2>
        <p className="text-text-secondary mb-6">
          LEXICA aggregates data from {SOURCES.length}+ freely available dictionary and linguistic
          databases. Each source contributes different information — definitions, etymology, pronunciation,
          frequency, morphology, or semantic relationships.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOURCES.map((src) => (
            <div
              key={src.name}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif font-semibold text-sm text-text-primary">{src.name}</span>
                <span className="text-xs text-accent-secondary font-mono">{src.year}</span>
              </div>
              <p className="text-xs text-text-muted">{src.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-4">Acknowledgments</h2>
        <p className="text-text-secondary leading-relaxed">
          LEXICA is built on the work of countless lexicographers, linguists, and open-data contributors.
          All dictionary data used in this project comes from freely available, public-domain, or
          openly licensed sources. We are grateful to the maintainers of Wiktionary, Princeton WordNet,
          Project Gutenberg, the CMU Sphinx project, and the many other initiatives that make this
          kind of tool possible.
        </p>
      </section>
    </main>
  );
}
