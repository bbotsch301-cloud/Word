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

export default function EtymologyRow({ stratum, isLast }: EtymologyRowProps) {
  const showRelationship =
    stratum.relationship_type && stratum.relationship_type !== 'unknown';

  return (
    <div
      className={`flex items-start gap-3 py-3 ${
        !isLast ? 'border-b border-border' : ''
      }`}
    >
      <Badge
        variant="colored"
        color={getFamilyColor(stratum.language_family || 'Other')}
      >
        {stratum.language}
      </Badge>

      <div className="min-w-0 flex-1">
        <div className="font-medium text-text-primary">{stratum.form}</div>
        <div className="text-xs text-text-muted">
          {stratum.era}
          {stratum.period ? ` \u00B7 ${stratum.period}` : ''}
        </div>
        {showRelationship && (
          <span className="text-xs text-text-muted">
            {stratum.relationship_type}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-shrink text-right">
        <p className="text-sm text-text-secondary line-clamp-2">
          {stratum.meaning}
        </p>
      </div>
    </div>
  );
}
