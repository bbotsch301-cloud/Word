"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  initialValue?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export default function SearchInput({
  initialValue = "",
  compact = false,
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const submit = useCallback(() => {
    const word = value.trim().toLowerCase();
    if (!word || !/^[a-zA-Z-]+$/.test(word)) return;
    setLoading(true);
    router.push(`/word/${encodeURIComponent(word)}`);
  }, [value, router]);

  useEffect(() => {
    if (compact) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [compact]);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") {
              setValue("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Excavate another word…"
          className="flex-1 bg-transparent border-b border-gold/25 font-cormorant text-lg font-light tracking-subtle text-parchment placeholder:italic placeholder:text-gold/30 focus:outline-none focus:border-gold focus:shadow-[0_1px_8px_rgba(200,146,10,0.15)] py-2 transition-all"
          aria-label="Search for a word"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold border border-gold/25 px-4 py-2 hover:bg-gold/10 transition-all whitespace-nowrap"
          aria-label="Begin excavation"
        >
          {loading ? "…" : "DIG"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <label className="block font-mono text-[9px] uppercase tracking-label text-gold mb-3">
        Enter a word
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setValue("");
            inputRef.current?.blur();
          }
        }}
        placeholder="salary, disaster, silly…"
        autoFocus={autoFocus}
        className="w-full bg-transparent border-b-2 border-l border-gold border-l-gold/25 font-cormorant text-[2rem] font-light tracking-subtle text-parchment placeholder:italic placeholder:text-gold/30 focus:outline-none focus:shadow-[0_2px_20px_rgba(200,146,10,0.12)] pl-4 pb-3 transition-all"
        aria-label="Enter a word to excavate"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-6 bg-transparent border border-gold/25 text-gold/80 font-mono text-[10px] uppercase tracking-[0.35em] py-4 hover:bg-gold/10 hover:text-gold hover:shadow-[0_0_20px_rgba(200,146,10,0.12)] transition-all"
        aria-label="Begin excavation"
      >
        {loading ? "Excavating…" : "Begin Excavation"}
      </button>
    </div>
  );
}
