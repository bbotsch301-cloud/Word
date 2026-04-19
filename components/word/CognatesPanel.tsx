'use client';

import { motion } from 'framer-motion';
import type { CognateData } from '@/types/lexica';

interface CognatesPanelProps {
  cognates: CognateData;
  word: string;
}

const FLAGS: Record<string, string> = {
  deu: '🇩🇪', ger: '🇩🇪',
  fra: '🇫🇷', fre: '🇫🇷',
  spa: '🇪🇸',
  ita: '🇮🇹',
  por: '🇵🇹',
  nld: '🇳🇱', dut: '🇳🇱',
  swe: '🇸🇪',
  nor: '🇳🇴', nob: '🇳🇴',
  dan: '🇩🇰',
  isl: '🇮🇸', ice: '🇮🇸',
  rus: '🇷🇺',
  pol: '🇵🇱',
  ces: '🇨🇿', cze: '🇨🇿',
  ukr: '🇺🇦',
  ron: '🇷🇴', rum: '🇷🇴',
  cat: '🏴',
  ell: '🇬🇷', gre: '🇬🇷', grc: '🇬🇷',
  lat: '🏛️',
  san: '🇮🇳',
  hin: '🇮🇳',
  fas: '🇮🇷', per: '🇮🇷',
  ara: '🇸🇦',
  heb: '🇮🇱',
  jpn: '🇯🇵',
  kor: '🇰🇷',
  zho: '🇨🇳', chi: '🇨🇳',
  tur: '🇹🇷',
  fin: '🇫🇮',
  hun: '🇭🇺',
  gle: '🇮🇪', iri: '🇮🇪',
  cym: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', wel: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  ang: '📜',
  enm: '📜',
  goh: '📜',
};

function flagFor(code: string): string {
  return FLAGS[code.toLowerCase()] || '🌐';
}

export default function CognatesPanel({ cognates, word }: CognatesPanelProps) {
  const list = cognates?.cognates || [];
  if (list.length === 0) return null;

  // Group by language
  const byLang = new Map<string, typeof list>();
  list.forEach(c => {
    const arr = byLang.get(c.languageName) || [];
    arr.push(c);
    byLang.set(c.languageName, arr);
  });

  const ancestor = list[0]?.sharedAncestor;
  const ancestorLang = list[0]?.ancestorLang;

  return (
    <div className="mt-6">
      <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
        Cognates &middot; Same Root, Different Tongues
      </p>

      {ancestor && (
        <div className="mb-4 p-3 rounded-lg border border-accent/30 bg-accent-muted/40">
          <p className="text-[10px] font-mono uppercase tracking-wider text-accent mb-1">
            Shared ancestor
          </p>
          <p className="font-serif text-base text-text-primary">
            <span className="italic font-semibold">{ancestor}</span>
            {ancestorLang && (
              <span className="text-text-muted text-sm ml-2">({ancestorLang})</span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from(byLang.entries()).slice(0, 12).map(([langName, items], i) => {
          const code = items[0].language;
          const wordsToShow = items.slice(0, 3);
          return (
            <motion.div
              key={langName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="cognate-card"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base leading-none">{flagFor(code)}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted truncate">
                  {langName}
                </span>
              </div>
              <div className="space-y-0.5">
                {wordsToShow.map(c => (
                  <p key={c.word} className="font-serif text-sm text-text-primary italic truncate" title={c.word}>
                    {c.word}
                  </p>
                ))}
                {items.length > 3 && (
                  <p className="text-[10px] text-text-muted font-mono">
                    +{items.length - 3} more
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted font-mono mt-3 text-center">
        {list.length} cognates across {byLang.size} languages
      </p>
    </div>
  );
}
