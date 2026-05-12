'use client';

import { ReactNode } from 'react';

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
  const base = 'bg-surface border border-border rounded-lg p-4';
  const hoverClass = hover ? 'cursor-pointer hover:bg-surface-hover transition-colors' : '';
  const classes = `${base} ${hoverClass} ${className}`.trim();

  const style: React.CSSProperties | undefined = accentColor
    ? { borderTopWidth: '2px', borderTopColor: accentColor }
    : undefined;

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
