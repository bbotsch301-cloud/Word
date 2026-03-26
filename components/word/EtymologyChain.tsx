'use client';

import { motion } from 'framer-motion';
import { Stratum } from '@/types/lexica';
import EtymologyRow from '@/components/word/EtymologyRow';

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
  if (strata.length === 0) {
    return (
      <p className="text-sm text-text-muted">No etymology data available.</p>
    );
  }

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
        const depth = index / Math.max(strata.length - 1, 1);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="relative pl-8"
          >
            {/* Node marker */}
            <div
              className="absolute left-0 top-5 w-[16px] h-[16px] rounded-full border-2"
              style={{
                borderColor: color,
                backgroundColor: color + '20',
                boxShadow: `0 0 8px ${color}30`,
              }}
            />

            {/* Connector chevron */}
            {index < strata.length - 1 && (
              <div className="absolute left-[5px] bottom-0 text-text-muted opacity-40">
                <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                  <path d="M3 0v6M1 4l2 2 2-2" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            )}

            <div
              className="rounded-lg border border-border p-3 mb-2 transition-colors"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: color,
                backgroundColor: depth > 0.5
                  ? 'color-mix(in srgb, var(--accent-muted) ' + Math.round(depth * 15) + '%, var(--bg))'
                  : undefined,
              }}
            >
              <EtymologyRow stratum={stratum} isLast={index === strata.length - 1} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
