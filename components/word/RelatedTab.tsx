'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { WordTaxonomy, ConstellationWord } from '@/types/lexica';

interface RelatedTabProps {
  taxonomy?: WordTaxonomy;
  constellation: ConstellationWord[];
}

interface WordGroupProps {
  label: string;
  words: string[];
}

function WordGroup({ label, words }: WordGroupProps) {
  if (words.length === 0) return null;

  return (
    <div>
      <div className="text-sm font-medium text-text-primary mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <Link key={word} href={`/word/${word}`}>
            <Badge variant="accent" className="cursor-pointer">
              {word}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RelatedTab({ taxonomy, constellation }: RelatedTabProps) {
  const hasTaxonomy =
    taxonomy &&
    (taxonomy.hypernyms.length > 0 ||
      taxonomy.hyponyms.length > 0 ||
      taxonomy.antonyms.length > 0 ||
      taxonomy.coordinate_terms.length > 0);

  const hasConstellation = constellation.length > 0;

  if (!hasTaxonomy && !hasConstellation) {
    return (
      <p className="text-sm text-text-muted">No related words found.</p>
    );
  }

  return (
    <div className="space-y-4">
      {taxonomy && (
        <>
          <WordGroup label="Broader Terms" words={taxonomy.hypernyms} />
          <WordGroup label="Narrower Terms" words={taxonomy.hyponyms} />
          <WordGroup label="Opposites" words={taxonomy.antonyms} />
          <WordGroup label="Related Terms" words={taxonomy.coordinate_terms} />
        </>
      )}

      {hasConstellation && (
        <div>
          <div className="text-sm font-medium text-text-primary mb-2">
            Associated Words
          </div>
          <div className="flex flex-wrap gap-2">
            {constellation.map((item) => (
              <Link key={item.word} href={`/word/${item.word}`}>
                <Badge variant="default" className="cursor-pointer">
                  {item.word}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
