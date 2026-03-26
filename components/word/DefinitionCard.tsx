'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DefinitionSource } from '@/types/lexica';

function getSourceColor(source: string): string {
  const map: Record<string, string> = {
    wiktionary: '#2563EB',
    webster1828: '#D97706',
    webster1913: '#059669',
    blacks_law: '#DC2626',
    hobson_jobson: '#7C3AED',
    vulgar_tongue: '#0891B2',
    bouvier: '#B45309',
  };
  return map[source] || '#6B7280';
}

interface DefinitionCardProps {
  definition: DefinitionSource;
}

export default function DefinitionCard({ definition }: DefinitionCardProps) {
  return (
    <Card accentColor={getSourceColor(definition.source)}>
      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant="colored"
          color={getSourceColor(definition.source)}
        >
          {definition.label}
        </Badge>
        <span className="text-xs text-text-muted font-mono">{definition.year}</span>
        {definition.pos && (
          <Badge variant="default">{definition.pos}</Badge>
        )}
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {definition.definition}
      </p>

      {definition.etymology && (
        <p className="text-xs text-text-muted italic mt-2 font-serif">
          {definition.etymology}
        </p>
      )}
    </Card>
  );
}
