'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import QuickFacts from '@/components/word/QuickFacts';
import { LexicaResult } from '@/types/lexica';

interface OverviewTabProps {
  result: LexicaResult;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function OverviewTab({ result }: OverviewTabProps) {
  const primaryDefinition =
    result.definitions.length > 0
      ? result.definitions[0].definition
      : result.modern_meaning;

  const etymologySummary = result.truest_meaning
    ? (result.truest_meaning.length > 200
      ? result.truest_meaning.slice(0, 200) + '...'
      : result.truest_meaning)
    : '';

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={fadeUp}>
        <Card>
          <p className="text-sm text-text-secondary leading-relaxed">
            {primaryDefinition}
          </p>
        </Card>
      </motion.div>

      {etymologySummary && (
        <motion.p variants={fadeUp} className="text-sm text-text-muted leading-relaxed font-serif italic">
          {etymologySummary}
        </motion.p>
      )}

      <motion.div variants={fadeUp}>
        <QuickFacts
          strata={result.strata}
          frequency={result.frequency}
          definitionCount={result.definitions.length}
        />
      </motion.div>

      {result.constellation.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-sm font-medium text-text-primary">
              Related Words
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {result.constellation.map((item) => (
              <Link key={item.word} href={`/word/${item.word}`}>
                <Badge variant="accent" className="cursor-pointer">
                  {item.word}
                </Badge>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
