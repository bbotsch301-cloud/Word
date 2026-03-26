'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
    >
      {theme === 'dark' ? (
        <span className="text-lg leading-none" aria-hidden="true">&#9788;</span>
      ) : (
        <span className="text-lg leading-none" aria-hidden="true">&#9790;</span>
      )}
    </button>
  );
}
