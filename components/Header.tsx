'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/explore', label: 'Explore' },
  { href: '/search', label: 'Search' },
  { href: '/dictionaries', label: 'Sources' },
  { href: '/lists', label: 'My Words' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleRandom = async () => {
    try {
      const res = await fetch('/api/search?action=random');
      const data = await res.json();
      if (data?.word) router.push(`/word/${encodeURIComponent(data.word)}`);
    } catch {}
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)]"
      style={{ background: 'rgba(29,29,29,0.95)', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-ui)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-base font-bold tracking-wide"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}
        >
          LEXICA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleRandom}
            className="text-sm flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Random word"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Random
          </button>
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--text-primary)'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
          >
            Sign in
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={handleRandom}
            className="p-2 rounded text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            aria-label="Random word"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </button>
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)]" style={{ background: 'var(--bg)' }}>
          <nav className="max-w-5xl mx-auto px-6 py-3 space-y-1">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2.5 px-3 rounded text-sm transition-colors"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-muted)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="block py-2.5 px-3 rounded text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
