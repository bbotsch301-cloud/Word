'use client';

import { Stratum } from '@/types/lexica';
import EtymologyRow from '@/components/word/EtymologyRow';

interface EtymologyChainProps {
  strata: Stratum[];
}

export default function EtymologyChain({ strata }: EtymologyChainProps) {
  if (strata.length === 0) {
    return (
      <p className="text-sm text-text-muted">No etymology data available.</p>
    );
  }

  return (
    <div className="border-l-2 border-border pl-4 ml-2">
      {strata.map((stratum, index) => (
        <div key={index} className="relative">
          <div
            className="absolute -left-[1.35rem] top-5 h-2 w-2 rounded-full bg-border"
            aria-hidden="true"
          />
          <EtymologyRow stratum={stratum} isLast={index === strata.length - 1} />
        </div>
      ))}
    </div>
  );
}
