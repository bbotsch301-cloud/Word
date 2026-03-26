'use client';

import Badge from '@/components/ui/Badge';
import { Stratum } from '@/types/lexica';

function getFamilyColor(family: string): string {
  const map: Record<string, string> = {
    Germanic: '#2563EB',
    Romance: '#DC2626',
    Hellenic: '#7C3AED',
    Celtic: '#059669',
    'Indo-Iranian': '#D97706',
    Semitic: '#92400E',
    'Proto-IE': '#6B21A8',
    Other: '#6B7280',
  };
  return map[family] || '#6B7280';
}

interface EtymologyRowProps {
  stratum: Stratum;
  isLast: boolean;
}

export default function EtymologyRow({ stratum }: EtymologyRowProps) {
  const showRelationship =
    stratum.relationship_type && stratum.relationship_type !== 'unknown';

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="colored"
          color={getFamilyColor(stratum.language_family || 'Other')}
        >
          {stratum.language}
        </Badge>
        <span className="font-mono text-xs text-text-muted">
          {stratum.era}
          {stratum.period ? ` \u00B7 ${stratum.period}` : ''}
        </span>
        {showRelationship && (
          <span className="text-[10px] text-text-muted italic">
            ({stratum.relationship_type})
          </span>
        )}
      </div>

      <div className="font-serif font-medium text-lg text-text-primary">
        {stratum.form}
      </div>

      {stratum.meaning && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {stratum.meaning}
        </p>
      )}

      {stratum.shift && (
        <p className="text-xs text-accent-secondary italic">
          {stratum.shift}
        </p>
      )}
    </div>
  );
}
