'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/explore', label: 'Explore', title: 'Browse words by century, language, and family' },
  { href: '/spells', label: 'Spells', title: 'Discover hidden word connections' },
  { href: '/search', label: 'Search', title: 'Filter by pattern, origin, and more' },
  { href: '/dictionaries', label: 'Dictionaries', title: 'Browse 27+ historical sources' },
  { href: '/lists', label: 'My Words', title: 'Your bookmarks and word lists' },
];

function UserMenu({ onToggle }: { onToggle?: () => void }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        close();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = (session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase();

  const handleToggle = () => {
    setOpen(!open);
    onToggle?.();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-8 h-8 rounded-full bg-accent/20 text-accent font-medium text-sm flex items-center justify-center hover:bg-accent/30 transition-colors"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {initial}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            {session.user.name && (
              <p className="text-sm font-medium text-text-primary truncate">{session.user.name}</p>
            )}
            <p className="text-xs text-text-muted truncate">{session.user.email}</p>
          </div>
          <Link
            href="/lists"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
          >
            My Words
          </Link>
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-red-500 hover:bg-bg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu when user menu opens (prevents overlap)
  const handleUserMenuToggle = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
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
          <UserMenu />
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <UserMenu onToggle={handleUserMenuToggle} />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
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
                  className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${
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
      <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </header>
  );
}
