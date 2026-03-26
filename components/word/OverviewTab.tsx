'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import QuickFacts from '@/components/word/QuickFacts';
import { LexicaResult } from '@/types/lexica';

interface OverviewTabProps {
  result: LexicaResult;
}

export default function OverviewTab({ result }: OverviewTabProps) {
  const primaryDefinition =
    result.definitions.length > 0
      ? result.definitions[0].definition
      : result.modern_meaning;

  const etymologySummary =
    result.truest_meaning.length > 200
      ? result.truest_meaning.slice(0, 200) + '...'
      : result.truest_meaning;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-text-secondary leading-relaxed">
          {primaryDefinition}
        </p>
      </Card>

      {etymologySummary && (
        <p className="text-sm text-text-muted leading-relaxed">
          {etymologySummary}
        </p>
      )}

      <QuickFacts
        strata={result.strata}
        frequency={result.frequency}
        definitionCount={result.definitions.length}
      />

      {result.constellation.length > 0 && (
        <div>
          <div className="text-sm font-medium text-text-primary mb-2">
            Related Words
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
        </div>
      )}
    </div>
  );
}
