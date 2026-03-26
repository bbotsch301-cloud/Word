'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EtymologyChain from '@/components/word/EtymologyChain';
import { LexicaResult } from '@/types/lexica';

interface EtymologyTabProps {
  result: LexicaResult;
}

export default function EtymologyTab({ result }: EtymologyTabProps) {
  const hasCulturalContext =
    result.cultural_moment &&
    result.cultural_moment.description &&
    result.cultural_moment.description.trim().length > 0;

  return (
    <div className="space-y-4">
      <EtymologyChain strata={result.strata} />

      <Card>
        <h3 className="text-sm font-medium text-text-primary mb-2">
          Etymology
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {result.truest_meaning}
        </p>
      </Card>

      {result.webster1828_etymology && (
        <Card>
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Webster&apos;s 1828 Etymology
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {result.webster1828_etymology}
          </p>
        </Card>
      )}

      {hasCulturalContext && (
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Cultural Context
          </h3>
          <div className="flex items-start gap-2">
            <Badge variant="muted">{result.cultural_moment.period}</Badge>
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.cultural_moment.description}
            </p>
          </div>
        </div>
      )}

      {result.root_revelation && (
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Root Origin
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {result.root_revelation}
          </p>
        </div>
      )}
    </div>
  );
}
