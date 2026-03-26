'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

function WordGroup({ label, words }: WordGroupProps) {
  if (words.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="h-px flex-1 bg-border" />
      </div>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {words.map((word) => (
          <motion.div key={word} variants={fadeUp}>
            <Link href={`/word/${word}`}>
              <Badge variant="accent" className="cursor-pointer">
                {word}
              </Badge>
            </Link>
          </motion.div>
        ))}
      </motion.div>
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
    <div className="space-y-5">
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
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm font-medium text-text-primary">
              Associated Words
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-2"
          >
            {constellation.map((item) => (
              <motion.div key={item.word} variants={fadeUp}>
                <Link href={`/word/${item.word}`}>
                  <Badge variant="default" className="cursor-pointer">
                    {item.word}
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
