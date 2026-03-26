'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DefinitionSource } from '@/types/lexica';
import DefinitionCard from './DefinitionCard';

interface DefinitionTimelineProps {
  definitions: DefinitionSource[];
}

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
  // Handle "Black's Law: ..." variant labels
  if (source.startsWith('blacks_law') || source === 'blacks_law') return map.blacks_law;
  return map[source] || '#6B7280';
}

export default function DefinitionTimeline({ definitions }: DefinitionTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sorted = [...definitions].sort((a, b) => a.year - b.year);

  if (sorted.length === 0) return null;

  // Mobile fallback: simple card list
  if (isMobile) {
    return (
      <div className="space-y-3">
        {sorted.map((def, i) => (
          <DefinitionCard key={`${def.source}-${def.year}-${i}`} definition={def} />
        ))}
      </div>
    );
  }

  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  const yearSpan = maxYear - minYear || 1;

  return (
    <div>
      {/* Timeline bar */}
      <div className="relative h-20 mb-4">
        {/* Track */}
        <div className="absolute top-8 left-0 right-0 h-[3px] rounded-full bg-border" />
        {/* Gradient overlay */}
        <div
          className="absolute top-8 left-0 right-0 h-[3px] rounded-full opacity-40"
          style={{
            background: `linear-gradient(to right, ${getSourceColor(sorted[0].source)}, ${getSourceColor(sorted[sorted.length - 1].source)})`,
          }}
        />

        {/* Year markers */}
        {sorted.map((def, index) => {
          const pct = sorted.length === 1 ? 50 : ((def.year - minYear) / yearSpan) * 88 + 6; // 6%-94% range
          const color = getSourceColor(def.source);
          const isActive = index === activeIndex;

          return (
            <button
              key={`${def.source}-${def.year}-${index}`}
              className="absolute flex flex-col items-center group"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              onClick={() => setActiveIndex(index)}
            >
              {/* Year label above */}
              <span className={`text-[11px] font-mono mb-1.5 transition-colors ${
                isActive ? 'text-text-primary font-semibold' : 'text-text-muted'
              }`}>
                {def.year}
              </span>

              {/* Dot */}
              <motion.div
                className="rounded-full border-2 transition-colors"
                style={{
                  borderColor: color,
                  backgroundColor: isActive ? color : color + '30',
                }}
                animate={{
                  width: isActive ? 16 : 12,
                  height: isActive ? 16 : 12,
                  boxShadow: isActive ? `0 0 12px ${color}50` : `0 0 0px ${color}00`,
                }}
                whileHover={{
                  scale: 1.2,
                  boxShadow: `0 0 12px ${color}50`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />

              {/* Source label below */}
              <span className={`text-[9px] mt-1.5 whitespace-nowrap transition-colors ${
                isActive ? 'text-text-secondary' : 'text-text-muted'
              }`}>
                {def.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active definition card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${sorted[activeIndex].source}-${sorted[activeIndex].year}-${activeIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <DefinitionCard definition={sorted[activeIndex]} />
        </motion.div>
      </AnimatePresence>

      {/* Pagination hint */}
      {sorted.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIndex ? 'bg-accent' : 'bg-border hover:bg-border-hover'
              }`}
              aria-label={`Definition ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
