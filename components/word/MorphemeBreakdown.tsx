'use client';

import type { MorphologyData } from '@/types/lexica';

interface MorphemeBreakdownProps {
  morphology: MorphologyData;
  word: string;
}

interface MorphemePart {
  text: string;
  type: 'prefix' | 'root' | 'suffix' | 'unknown';
}

function parseMorphemes(data: MorphologyData): MorphemePart[] {
  const raw = data.morphemes || '';
  const segments = raw.split(/[>+\-{}()]+/).filter(Boolean).map(s => s.trim()).filter(Boolean);

  if (segments.length === 0) return [];

  const prefixParts = data.prefix ? data.prefix.split(/[,;/]+/).map(s => s.trim().toLowerCase()).filter(Boolean) : [];
  const suffixParts = data.suffix ? data.suffix.split(/[,;/]+/).map(s => s.trim().toLowerCase()).filter(Boolean) : [];

  return segments.map(seg => {
    const lower = seg.toLowerCase();
    if (prefixParts.some(p => lower.includes(p) || p.includes(lower))) {
      return { text: seg, type: 'prefix' };
    }
    if (suffixParts.some(s => lower.includes(s) || s.includes(lower))) {
      return { text: seg, type: 'suffix' };
    }
    return { text: seg, type: 'root' };
  });
}

const STYLES: Record<MorphemePart['type'], { bg: string; border: string; label: string }> = {
  prefix: { bg: 'bg-blue-900/20', border: 'border-blue-700/40', label: 'prefix' },
  root: { bg: 'bg-accent-muted', border: 'border-accent/30', label: 'root' },
  suffix: { bg: 'bg-violet-900/20', border: 'border-violet-700/40', label: 'suffix' },
  unknown: { bg: 'bg-surface', border: 'border-border', label: '' },
};

export default function MorphemeBreakdown({ morphology, word }: MorphemeBreakdownProps) {
  const parts = parseMorphemes(morphology);
  if (parts.length < 2) return null;

  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
        Word Structure
      </p>

      {/* Visual blocks */}
      <div className="flex items-stretch gap-0.5 max-w-lg">
        {parts.map((part, i) => {
          const style = STYLES[part.type];
          const isFirst = i === 0;
          const isLastItem = i === parts.length - 1;
          return (
            <div
              key={i}
              className={`flex-1 min-w-0 ${style.bg} border ${style.border} px-3 py-2.5 ${
                isFirst ? 'rounded-l-lg' : ''
              } ${isLastItem ? 'rounded-r-lg' : ''}`}
            >
              <p className="font-serif text-sm font-semibold text-text-primary text-center truncate">
                {part.text}
              </p>
              {style.label && (
                <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted text-center mt-1">
                  {style.label}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Raw morpheme string */}
      <p className="text-xs text-text-muted mt-2 font-mono">
        {morphology.morphemes}
        <span className="ml-2 text-text-muted/60">&middot; {morphology.morphemeCount} morphemes</span>
      </p>
    </div>
  );
}
