'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accentColor?: string;
}

export default function Card({
  children,
  className = '',
  hover = false,
  accentColor,
}: CardProps) {
  const base = 'bg-surface border border-border rounded-lg p-4 shadow-sm';
  const classes = `${base} ${className}`.trim();

  const style: React.CSSProperties | undefined = accentColor
    ? { borderTopWidth: '2px', borderTopColor: accentColor }
    : undefined;

  if (hover) {
    return (
      <motion.div
        className={`${classes} cursor-pointer`}
        style={style}
        whileHover={{ y: -2, boxShadow: '0 8px 25px var(--glow)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
