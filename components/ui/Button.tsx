'use client';

import Link from 'next/link';
import { ReactNode, MouseEventHandler, ButtonHTMLAttributes } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

const variantStyles: Record<string, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'border border-border text-text-secondary hover:border-border-hover hover:bg-surface',
  ghost: 'text-text-muted hover:text-text-primary hover:bg-surface',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  href,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const base = 'rounded-md font-medium transition-colors inline-flex items-center justify-center';
  const disabledStyle = disabled ? 'opacity-50 pointer-events-none' : '';
  const classes = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
