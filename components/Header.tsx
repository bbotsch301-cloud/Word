'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-serif text-xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
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
      {/* Gradient bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </header>
  );
}
