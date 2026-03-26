'use client';

import { useState } from 'react';
import DefinitionCard from '@/components/word/DefinitionCard';
import { DefinitionSource } from '@/types/lexica';

interface DefinitionsTabProps {
  definitions: DefinitionSource[];
}

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
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            sortOrder === 'newest'
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
          }`}
        >
          Newest First
        </button>
        <button
          onClick={() => setSortOrder('oldest')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            sortOrder === 'oldest'
              ? 'bg-accent text-white'
              : 'bg-surface text-text-muted border border-border hover:text-text-secondary'
          }`}
        >
          Oldest First
        </button>
      </div>

      {sorted.map((def, index) => (
        <DefinitionCard key={`${def.source}-${def.year}-${index}`} definition={def} />
      ))}
    </div>
  );
}
