'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/explore', label: 'Explore', title: 'Browse words by century, language, and family' },
  { href: '/spells', label: 'Spells', title: 'Discover hidden word connections' },
  { href: '/search', label: 'Search', title: 'Filter by pattern, origin, and more' },
  { href: '/dictionaries', label: 'Dictionaries', title: 'Browse 27+ historical sources' },
  { href: '/lists', label: 'My Words', title: 'Your bookmarks and word lists' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-6">
        <Link href="/" className="font-serif text-xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
          LEXICA
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-accent font-medium'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface active:scale-95 transition-all"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-bg/98 backdrop-blur-sm">
          <nav className="max-w-5xl mx-auto px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.title}
                  className={`block py-3 px-4 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-accent bg-accent/10 font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Gradient bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
    </header>
  );
}
