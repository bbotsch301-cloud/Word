'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'muted' | 'colored';
  color?: string;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface text-text-secondary border border-border',
  accent: 'bg-accent-muted text-accent border border-accent-subtle',
  muted: 'bg-surface text-text-muted',
  colored: '',
};

export default function Badge({
  children,
  variant = 'default',
  color,
  className = '',
}: BadgeProps) {
  const base = 'rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center';
  const classes = `${base} ${variantStyles[variant]} ${className}`.trim();

  const style: React.CSSProperties | undefined =
    variant === 'colored' && color
      ? {
          color: color,
          backgroundColor: color + '15',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: color + '40',
        }
      : undefined;

  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
}
