'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { Stratum } from '@/types/lexica';

interface EtymologyChainProps {
  strata: Stratum[];
}

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

export default function EtymologyChain({ strata }: EtymologyChainProps) {
  // First and last start expanded, middle nodes collapsed
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (strata.length > 0) initial.add(0);
    if (strata.length > 1) initial.add(strata.length - 1);
    return initial;
  });

  if (strata.length === 0) {
    return (
      <p className="text-sm text-text-muted">No etymology data available.</p>
    );
  }

  const toggleNode = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="relative ml-4">
      {/* Gradient timeline line */}
      <div
        className="absolute left-[7px] top-4 bottom-4 w-[2px] rounded-full"
        style={{
          background: 'linear-gradient(to bottom, var(--accent), var(--accent-secondary))',
          opacity: 0.4,
        }}
      />

      {strata.map((stratum, index) => {
        const color = getFamilyColor(stratum.language_family || 'Other');
        const isOpen = expanded.has(index);
        const depth = index / Math.max(strata.length - 1, 1);

        return (
          <motion.div
            key={`${stratum.language}-${stratum.form}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="relative pl-8"
          >
            {/* Node marker */}
            <motion.div
              className="absolute left-0 top-4 w-[16px] h-[16px] rounded-full border-2 cursor-pointer"
              style={{
                borderColor: color,
                backgroundColor: color + '20',
              }}
              animate={{
                boxShadow: isOpen ? `0 0 12px ${color}40` : `0 0 4px ${color}20`,
              }}
              whileHover={{
                boxShadow: `0 0 14px ${color}50`,
                scale: 1.15,
              }}
              onClick={() => toggleNode(index)}
            />

            {/* Connector chevron */}
            {index < strata.length - 1 && (
              <div className="absolute left-[5px] bottom-0 text-text-muted opacity-40">
                <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                  <path d="M3 0v6M1 4l2 2 2-2" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}

            <motion.div
              layout
              className="rounded-lg border border-border p-3 mb-2 cursor-pointer transition-colors hover:border-border-hover"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: color,
                backgroundColor: depth > 0.5
                  ? 'color-mix(in srgb, var(--accent-muted) ' + Math.round(depth * 15) + '%, var(--bg))'
                  : undefined,
              }}
              onClick={() => toggleNode(index)}
            >
              {/* Always visible: compact header */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="colored"
                  color={color}
                >
                  {stratum.language}
                </Badge>
                <span className="font-serif font-medium text-lg text-text-primary">
                  {stratum.form}
                </span>
                <span className="font-mono text-xs text-text-muted">
                  {stratum.era}
                </span>
                {!isOpen && stratum.meaning && (
                  <span className="text-xs text-text-muted truncate max-w-[200px]">
                    &mdash; {stratum.meaning}
                  </span>
                )}
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-text-muted ml-auto flex-shrink-0"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M3.5 5.5L7 9L10.5 5.5" />
                </motion.svg>
              </div>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5">
                      {stratum.period && (
                        <span className="font-mono text-xs text-text-muted block">
                          {stratum.period}
                        </span>
                      )}
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
                      {stratum.relationship_type && stratum.relationship_type !== 'unknown' && (
                        <span className="text-[10px] text-text-muted italic">
                          ({stratum.relationship_type})
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
