'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { WordFrequency } from '@/types/lexica';

interface FrequencyGaugeProps {
  frequency?: WordFrequency;
}

function getGaugeColor(zipf: number): string {
  if (zipf >= 5) return 'var(--accent)';
  if (zipf >= 4) return 'var(--accent-secondary)';
  if (zipf >= 3) return 'var(--text-muted)';
  return 'var(--border-hover)';
}

export default function FrequencyGauge({ frequency }: FrequencyGaugeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (!frequency) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
        <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Frequency</div>
        <div className="text-sm font-medium text-text-primary mt-1">Unknown</div>
      </div>
    );
  }

  const fillPercent = Math.min(Math.max(frequency.zipf / 7, 0), 1);
  const color = getGaugeColor(frequency.zipf);

  // SVG arc math - semicircle from left to right
  const cx = 60;
  const cy = 52;
  const r = 40;
  const startAngle = Math.PI; // left
  const endAngle = 0; // right

  const arcStart = {
    x: cx + r * Math.cos(startAngle),
    y: cy + r * Math.sin(startAngle),
  };
  const arcEnd = {
    x: cx + r * Math.cos(endAngle),
    y: cy + r * Math.sin(endAngle),
  };

  // Background arc path (full semicircle)
  const bgPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  return (
    <div ref={ref} className="bg-surface border border-border rounded-lg p-4 shadow-sm flex flex-col items-center">
      <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono self-start">Frequency</div>
      <svg width="120" height="68" viewBox="0 0 120 68" className="mt-1" role="img" aria-label={`Frequency: ${frequency.label}, rank ${frequency.rank}`}>
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d={bgPath}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: fillPercent } : { pathLength: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Rank number */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-text-primary text-sm font-bold font-mono"
          style={{ fontSize: '14px' }}
        >
          #{frequency.rank.toLocaleString()}
        </text>
        {/* Label */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-text-muted"
          style={{ fontSize: '10px' }}
        >
          {frequency.label}
        </text>
      </svg>
    </div>
  );
}
