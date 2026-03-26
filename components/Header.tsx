'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-sans text-lg font-bold text-text-primary">
          LEXICA
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/dictionaries"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Dictionaries
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
