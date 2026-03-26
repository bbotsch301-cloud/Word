'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EtymologyChain from '@/components/word/EtymologyChain';
import { LexicaResult } from '@/types/lexica';

interface EtymologyTabProps {
  result: LexicaResult;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function EtymologyTab({ result }: EtymologyTabProps) {
  const hasCulturalContext =
    result.cultural_moment &&
    result.cultural_moment.description &&
    result.cultural_moment.description.trim().length > 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={fadeUp}>
        <EtymologyChain strata={result.strata} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="border-l-4 border-accent bg-accent-muted/30 rounded-r-lg p-4">
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Etymology
          </h3>
          <p className="font-serif text-base text-text-primary leading-relaxed">
            {result.truest_meaning}
          </p>
        </div>
      </motion.div>

      {result.webster1828_etymology && (
        <motion.div variants={fadeUp}>
          <Card>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Webster&apos;s 1828 Etymology
            </h3>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              {result.webster1828_etymology}
            </p>
          </Card>
        </motion.div>
      )}

      {hasCulturalContext && (
        <motion.div variants={fadeUp}>
          <Card>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Cultural Context
            </h3>
            <div className="flex items-start gap-2">
              <Badge variant="accent">{result.cultural_moment.period}</Badge>
              <p className="text-sm text-text-secondary leading-relaxed">
                {result.cultural_moment.description}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {result.root_revelation && (
        <motion.div variants={fadeUp}>
          <Card>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Root Origin
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.root_revelation}
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
