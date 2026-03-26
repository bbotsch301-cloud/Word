'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';

interface SearchFieldProps {
  size?: 'lg' | 'md';
  placeholder?: string;
  onSubmit?: (value: string) => void;
  autoFocus?: boolean;
}

const sizeStyles: Record<string, string> = {
  lg: 'h-12 text-base rounded-lg',
  md: 'h-9 text-sm rounded-md',
};

export default function SearchField({
  size = 'md',
  placeholder = 'Search...',
  onSubmit,
  autoFocus = false,
}: SearchFieldProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6.5" cy="6.5" r="5" />
        <line x1="10" y1="10" x2="15" y2="15" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-surface border border-border pl-10 pr-4 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-colors text-text-primary placeholder:text-text-muted ${sizeStyles[size]}`}
      />
    </form>
  );
}
