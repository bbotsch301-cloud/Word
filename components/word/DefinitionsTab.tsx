'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DefinitionCard from '@/components/word/DefinitionCard';
import { DefinitionSource } from '@/types/lexica';

interface DefinitionsTabProps {
  definitions: DefinitionSource[];
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DefinitionsTab({ definitions }: DefinitionsTabProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  if (definitions.length === 0) {
    return (
      <p className="text-sm text-text-muted">No definitions found.</p>
    );
  }

  const sorted = [...definitions].sort((a, b) =>
    sortOrder === 'newest' ? b.year - a.year : a.year - b.year
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <button
          onClick={() => setSortOrder('newest')}
          className={`px-3 py-1 text-xs rounded-lg transition-all ${
            sortOrder === 'newest'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
          }`}
        >
          Newest First
        </button>
        <button
          onClick={() => setSortOrder('oldest')}
          className={`px-3 py-1 text-xs rounded-lg transition-all ${
            sortOrder === 'oldest'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
          }`}
        >
          Oldest First
        </button>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-3"
        key={sortOrder}
      >
        {sorted.map((def, index) => (
          <motion.div key={`${def.source}-${def.year}-${index}`} variants={fadeUp}>
            <DefinitionCard definition={def} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
