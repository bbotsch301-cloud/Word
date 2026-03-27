'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';

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
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    fetchSuggestions(v);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const submitValue = selectedIndex >= 0 ? suggestions[selectedIndex] : value;
    onSubmit?.(submitValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (word: string) => {
    setValue(word);
    setShowSuggestions(false);
    onSubmit?.(word);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
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
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <line x1="10" y1="10" x2="15" y2="15" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`w-full bg-surface border border-border pl-10 pr-10 focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] shadow-sm transition-all text-text-primary placeholder:text-text-muted ${sizeStyles[size]}`}
        />
        {!focused && !value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted bg-bg border border-border rounded px-1.5 py-0.5 pointer-events-none">
            /
          </span>
        )}
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {suggestions.map((word, i) => (
            <button
              key={word}
              type="button"
              onMouseDown={() => selectSuggestion(word)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                i === selectedIndex
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-primary hover:bg-surface-hover'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
