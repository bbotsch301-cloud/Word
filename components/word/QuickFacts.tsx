'use client';

import Card from '@/components/ui/Card';
import { Stratum, WordFrequency } from '@/types/lexica';

interface QuickFactsProps {
  strata: Stratum[];
  frequency?: WordFrequency;
  definitionCount: number;
}

export default function QuickFacts({
  strata,
  frequency,
  definitionCount,
}: QuickFactsProps) {
  const rootStratum = [...strata].reverse().find((s) => s.is_root);
  const rootDisplay = rootStratum
    ? `${rootStratum.language} ${rootStratum.form}`
    : strata.length > 0
      ? `${strata[strata.length - 1].language} ${strata[strata.length - 1].form}`
      : 'Unknown';

  const frequencyDisplay = frequency
    ? `${frequency.label} #${frequency.rank}`
    : 'Unknown';

  const sourcesDisplay = `${definitionCount} ${
    definitionCount === 1 ? 'dictionary' : 'dictionaries'
  }`;

  const facts = [
    { label: 'Root', value: rootDisplay },
    { label: 'Frequency', value: frequencyDisplay },
    { label: 'Sources', value: sourcesDisplay },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {facts.map((fact) => (
        <Card key={fact.label}>
          <div className="text-xs text-text-muted">{fact.label}</div>
          <div className="text-sm font-medium text-text-primary mt-1">
            {fact.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
