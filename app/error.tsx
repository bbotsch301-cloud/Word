"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
        EXCAVATION FAILED
      </p>
      <h1 className="font-cormorant text-4xl font-light text-parchment mb-4">
        Something went wrong
      </h1>
      <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
        {error.message || "An unexpected error occurred during the excavation."}
      </p>
      <button
        onClick={reset}
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(200,146,10,0.15)] transition-all"
        aria-label="Try again"
      >
        Try Again
      </button>
    </div>
  );
}
