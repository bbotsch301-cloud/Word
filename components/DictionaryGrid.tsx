"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface DictionaryItem {
  id: string;
  name: string;
  year: number;
  description: string;
  entry_count: number;
}

const SOURCE_COLORS: Record<string, string> = {
  wiktionary: '#2563EB',
  webster1828: '#D97706',
  webster1913: '#059669',
  blacks_law: '#DC2626',
  hobson_jobson: '#7C3AED',
  vulgar_tongue: '#0891B2',
  bouvier: '#B45309',
  strongs: '#4338CA',
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DictionaryGrid({ dictionaries }: { dictionaries: DictionaryItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {dictionaries.map((dict) => (
        <motion.div key={dict.id} variants={fadeUp}>
          <Link
            href={`/dictionaries/${dict.id}`}
            className="group block bg-surface border border-border rounded-lg p-5 hover:border-border-hover hover:bg-surface-hover transition-all shadow-sm hover:shadow-md"
            style={{
              borderLeftWidth: '3px',
              borderLeftColor: SOURCE_COLORS[dict.id] || 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="font-serif text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                {dict.name}
              </h2>
              <span className="text-xs font-mono text-text-muted bg-bg rounded-full px-2.5 py-0.5 border border-border">
                {dict.entry_count.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-accent-secondary font-mono mb-2">{dict.year}</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {dict.description}
            </p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
