'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseQuery, type QueryIntent } from '@/lib/query-parser';

interface SearchFieldProps {
  size?: 'lg' | 'md';
  placeholder?: string;
  onSubmit?: (value: string) => void;
  autoFocus?: boolean;
}

const sizeStyles: Record<string, string> = {
  lg: 'h-12 text-base rounded-xl',
  md: 'h-9 text-sm rounded-lg',
};

export default function SearchField({
  size = 'md',
  placeholder = 'Search...',
  onSubmit,
  autoFocus = false,
}: SearchFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [intent, setIntent] = useState<QueryIntent | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    // Parse intent for smart suggestions
    const parsed = parseQuery(query);
    if (parsed.type !== "word") {
      setIntent(parsed);
    } else {
      setIntent(null);
    }

    if (query.length < 2 || parsed.type !== "word") {
      setSuggestions([]);
      if (parsed.type !== "word" && query.length >= 3) {
        setShowSuggestions(true);
      } else if (query.length < 2) {
        setShowSuggestions(false);
      }
      return;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(-1);
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    fetchSuggestions(v);
  };

  const navigateIntent = (parsedIntent: QueryIntent) => {
    if (parsedIntent.type === "compare" && parsedIntent.compareWords) {
      router.push(`/compare?words=${parsedIntent.compareWords.map(encodeURIComponent).join(",")}`);
    } else if (parsedIntent.type === "search" && parsedIntent.searchParams) {
      const params = new URLSearchParams(parsedIntent.searchParams);
      router.push(`/search?${params}`);
    } else if (parsedIntent.word) {
      router.push(`/word/${encodeURIComponent(parsedIntent.word)}`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);

    // If intent suggestion is selected (index -1 means intent row when intent exists)
    if (intent && selectedIndex === -1) {
      navigateIntent(intent);
      return;
    }

    const submitValue = selectedIndex >= 0 ? suggestions[selectedIndex] : value;
    if (onSubmit) {
      onSubmit(submitValue);
    } else {
      // Default routing via query parser
      const parsed = parseQuery(submitValue);
      navigateIntent(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (intent ? 1 : 0) + suggestions.length;
    if (!showSuggestions || totalItems === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const min = intent ? -1 : 0;
        const max = suggestions.length - 1;
        return prev < max ? prev + 1 : max;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const min = intent ? -1 : 0;
        return prev > min ? prev - 1 : min;
      });
    } else if (e.key === 'Enter') {
      if (intent && selectedIndex === -1) {
        e.preventDefault();
        setShowSuggestions(false);
        navigateIntent(intent);
      } else if (selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (word: string) => {
    setValue(word);
    setShowSuggestions(false);
    if (onSubmit) {
      onSubmit(word);
    } else {
      router.push(`/word/${encodeURIComponent(word)}`);
    }
  };

  const listboxId = 'search-suggestions';
  const hasDropdown = showSuggestions && (!!intent || suggestions.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative" role="search">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <line x1="10" y1="10" x2="15" y2="15" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (suggestions.length > 0 || intent) setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          role="combobox"
          aria-expanded={hasDropdown}
          aria-controls={listboxId}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : intent && selectedIndex === -1 ? 'intent-suggestion' : undefined}
          aria-autocomplete="list"
          className={`w-full bg-surface border border-border pl-10 pr-10 focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] shadow-sm transition-all text-text-primary placeholder:text-text-muted ${sizeStyles[size]}`}
        />
        {!focused && !value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted bg-bg border border-border rounded px-1.5 py-0.5 pointer-events-none" aria-hidden="true">
            /
          </span>
        )}
      </form>

      {/* Smart suggestions dropdown */}
      {hasDropdown && (
        <ul id={listboxId} role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Intent suggestion */}
          {intent && intent.label && (
            <li
              id="intent-suggestion"
              role="option"
              aria-selected={selectedIndex === -1}
              onMouseDown={() => { setShowSuggestions(false); navigateIntent(intent); }}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-2 border-b border-border ${
                selectedIndex === -1
                  ? 'bg-accent/10 text-accent'
                  : 'text-accent hover:bg-accent/5'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="font-medium">{intent.label}</span>
              <span className="text-xs text-text-muted ml-auto">Enter</span>
            </li>
          )}
          {/* Word suggestions */}
          {suggestions.map((word, i) => (
            <li
              key={word}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              onMouseDown={() => selectSuggestion(word)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors cursor-pointer ${
                i === selectedIndex
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-primary hover:bg-surface-hover'
              }`}
            >
              {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
