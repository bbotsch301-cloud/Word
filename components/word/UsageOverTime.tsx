'use client';

import { motion } from 'framer-motion';
import type { NgramDataPoint } from '@/types/lexica';

interface UsageOverTimeProps {
  ngramHistory?: NgramDataPoint[];
  firstUseYear?: number;
  word: string;
}

const W = 600;
const H = 220;
const PADDING = { top: 24, right: 24, bottom: 32, left: 24 };

interface Point {
  decade: number;
  frequency: number;
}

function generateEstimatedHistory(firstUseYear: number): Point[] {
  const startDecade = Math.max(1500, Math.floor(firstUseYear / 10) * 10);
  const points: Point[] = [];
  const peakOffset = 80 + Math.random() * 200;
  const peakDecade = Math.min(2010, startDecade + peakOffset);

  for (let decade = startDecade; decade <= 2010; decade += 10) {
    const distFromPeak = Math.abs(decade - peakDecade);
    const normalDistance = distFromPeak / 200;
    const intensity = Math.exp(-normalDistance * normalDistance);
    const noise = 0.85 + Math.random() * 0.3;
    points.push({ decade, frequency: intensity * noise });
  }
  return points;
}

export default function UsageOverTime({ ngramHistory, firstUseYear, word }: UsageOverTimeProps) {
  const realData = (ngramHistory || []).filter(p => p.decade >= 1500);
  const usingReal = realData.length >= 2;
  const data: Point[] = usingReal
    ? realData
    : firstUseYear
      ? generateEstimatedHistory(firstUseYear)
      : [];

  if (data.length < 2) return null;

  const minDecade = data[0].decade;
  const maxDecade = data[data.length - 1].decade;
  const maxFreq = Math.max(...data.map(d => d.frequency), 0.01);

  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const xScale = (decade: number) =>
    PADDING.left + ((decade - minDecade) / Math.max(maxDecade - minDecade, 1)) * innerW;
  const yScale = (freq: number) =>
    PADDING.top + innerH - (freq / maxFreq) * innerH;

  const linePath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.decade)} ${yScale(p.frequency)}`)
    .join(' ');

  const areaPath =
    `M ${xScale(data[0].decade)} ${PADDING.top + innerH} ` +
    data.map(p => `L ${xScale(p.decade)} ${yScale(p.frequency)}`).join(' ') +
    ` L ${xScale(data[data.length - 1].decade)} ${PADDING.top + innerH} Z`;

  // Century gridlines
  const centuries: number[] = [];
  for (let c = Math.ceil(minDecade / 100) * 100; c <= maxDecade; c += 100) {
    centuries.push(c);
  }

  const peakPoint = data.reduce((a, b) => (b.frequency > a.frequency ? b : a));

  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
        Usage Over Time {!usingReal && <span className="text-text-muted/60 normal-case">(estimated)</span>}
      </p>

      <div className="rounded-xl border border-border bg-surface/30 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <linearGradient id={`usage-area-${word}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Century gridlines */}
          {centuries.map(c => (
            <g key={c}>
              <line
                x1={xScale(c)}
                y1={PADDING.top}
                x2={xScale(c)}
                y2={PADDING.top + innerH}
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeDasharray="2 4"
                opacity={0.4}
              />
              <text
                x={xScale(c)}
                y={H - 8}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
                className="font-mono"
              >
                {c}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill={`url(#usage-area-${word})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />

          {/* Peak marker */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            <circle
              cx={xScale(peakPoint.decade)}
              cy={yScale(peakPoint.frequency)}
              r={4}
              fill="var(--accent)"
            />
            <circle
              cx={xScale(peakPoint.decade)}
              cy={yScale(peakPoint.frequency)}
              r={8}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1}
              opacity={0.4}
            />
          </motion.g>
        </svg>
      </div>

      <p className="text-[10px] font-mono text-text-muted mt-2">
        Peak usage: <span className="text-accent">{peakPoint.decade}s</span>
        {firstUseYear && (
          <span className="ml-3">First recorded: {firstUseYear}</span>
        )}
      </p>
    </div>
  );
}
