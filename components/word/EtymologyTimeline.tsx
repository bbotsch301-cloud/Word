'use client';

import type { Stratum } from '@/types/lexica';

interface EtymologyTimelineProps {
  strata: Stratum[];
  word: string;
}

const FAMILY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Indo-European': { bg: 'bg-amber-900/20', border: 'border-amber-700/40', text: 'text-amber-400' },
  'Germanic': { bg: 'bg-blue-900/20', border: 'border-blue-700/40', text: 'text-blue-400' },
  'Romance': { bg: 'bg-rose-900/20', border: 'border-rose-700/40', text: 'text-rose-400' },
  'Hellenic': { bg: 'bg-violet-900/20', border: 'border-violet-700/40', text: 'text-violet-400' },
  'Semitic': { bg: 'bg-emerald-900/20', border: 'border-emerald-700/40', text: 'text-emerald-400' },
  'Celtic': { bg: 'bg-green-900/20', border: 'border-green-700/40', text: 'text-green-400' },
  'Slavic': { bg: 'bg-cyan-900/20', border: 'border-cyan-700/40', text: 'text-cyan-400' },
};

const DEFAULT_COLOR = { bg: 'bg-surface', border: 'border-border', text: 'text-text-secondary' };

function getColor(family?: string) {
  if (!family) return DEFAULT_COLOR;
  for (const [key, val] of Object.entries(FAMILY_COLORS)) {
    if (family.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return DEFAULT_COLOR;
}

export default function EtymologyTimeline({ strata, word }: EtymologyTimelineProps) {
  if (strata.length < 2) return null;

  return (
    <div className="mt-6">
      {/* Desktop: horizontal */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-start gap-0 min-w-max">
          {strata.map((s, i) => {
            const color = getColor(s.language_family);
            const isLast = i === strata.length - 1;
            return (
              <div key={i} className="flex items-start">
                <div className="flex flex-col items-center w-36">
                  {/* Node */}
                  <div className={`w-3 h-3 rounded-full border-2 ${color.border} ${i === 0 ? 'bg-accent' : isLast ? 'bg-accent-secondary' : color.bg}`} />
                  {/* Card */}
                  <div className={`mt-3 p-3 rounded-lg border ${color.border} ${color.bg} w-full`}>
                    <p className={`text-[10px] font-mono uppercase tracking-wider ${color.text} mb-1`}>
                      {s.language}
                    </p>
                    {s.form && s.form !== word && (
                      <p className="font-serif text-sm font-semibold text-text-primary italic">
                        {s.form}
                      </p>
                    )}
                    {s.meaning && (
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                        &ldquo;{s.meaning}&rdquo;
                      </p>
                    )}
                    {s.era && (
                      <p className="text-[10px] text-text-muted mt-1.5 font-mono">
                        {s.era}
                      </p>
                    )}
                  </div>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div className="flex items-center mt-1.5 px-0">
                    <div className="w-8 h-px bg-gradient-to-r from-border to-accent/30" />
                    <svg width="6" height="10" viewBox="0 0 6 10" className="text-accent/40 -ml-1">
                      <path d="M1 1L5 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-0">
        {strata.map((s, i) => {
          const color = getColor(s.language_family);
          const isLast = i === strata.length - 1;
          return (
            <div key={i} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${color.border} ${i === 0 ? 'bg-accent' : isLast ? 'bg-accent-secondary' : color.bg} shrink-0`} />
                {!isLast && <div className="w-px flex-1 bg-border min-h-[24px]" />}
              </div>
              {/* Content */}
              <div className={`pb-4 ${isLast ? '' : ''}`}>
                <p className={`text-[10px] font-mono uppercase tracking-wider ${color.text}`}>
                  {s.language}
                  {s.era && <span className="text-text-muted ml-2">{s.era}</span>}
                </p>
                {s.form && s.form !== word && (
                  <p className="font-serif text-sm font-semibold text-text-primary italic mt-0.5">
                    {s.form}
                  </p>
                )}
                {s.meaning && (
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    &ldquo;{s.meaning}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
