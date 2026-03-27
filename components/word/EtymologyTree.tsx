"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TreeData {
  root: string;
  rootLang: string;
  siblings: string[];
}

const langNames: Record<string, string> = {
  lat: "Latin", frm: "Middle French", fro: "Old French", fra: "French",
  grc: "Ancient Greek", ell: "Greek", ang: "Old English", enm: "Middle English",
  non: "Old Norse", deu: "German", goh: "Old High German", nld: "Dutch",
  ita: "Italian", spa: "Spanish", por: "Portuguese", ara: "Arabic",
  san: "Sanskrit", jpn: "Japanese", zho: "Chinese", fas: "Persian",
  heb: "Hebrew", rus: "Russian", tur: "Turkish",
};

export function EtymologyTree({ word }: { word: string }) {
  const [data, setData] = useState<TreeData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    fetch(`/api/search?action=tree&word=${encodeURIComponent(word)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (d && d.root) setData(d); })
      .catch(e => { if (e.name !== 'AbortError') setData(null); });
    return () => controller.abort();
  }, [word]);

  if (!data) return null;

  const langName = langNames[data.rootLang] || data.rootLang;

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Etymology Family Tree</h4>

      {/* Root node */}
      <div className="flex flex-col items-center">
        <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-center">
          <span className="font-serif font-semibold text-accent">{data.root}</span>
          <span className="text-xs text-text-muted ml-1.5">({langName})</span>
        </div>

        {/* Connector */}
        <div className="w-px h-4 bg-border" />

        {/* Branch line */}
        <div className="relative w-full max-w-lg">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border" style={{ width: `${Math.min(data.siblings.length * 15 + 15, 100)}%` }} />
        </div>

        {/* Children */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {/* Current word (highlighted) */}
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-border" />
            <div className="px-2.5 py-1 rounded bg-accent/20 border border-accent/40">
              <span className="text-sm font-semibold text-accent">{word}</span>
            </div>
          </div>

          {/* Siblings */}
          {data.siblings.slice(0, 12).map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-px h-3 bg-border" />
              <Link
                href={`/word/${encodeURIComponent(s)}`}
                className="px-2.5 py-1 rounded border border-border bg-surface hover:border-accent/30 transition-colors"
              >
                <span className="text-sm text-text-secondary">{s}</span>
              </Link>
            </motion.div>
          ))}
          {data.siblings.length > 12 && (
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-transparent" />
              <span className="text-xs text-text-muted px-2 py-1">
                +{data.siblings.length - 12} more
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
