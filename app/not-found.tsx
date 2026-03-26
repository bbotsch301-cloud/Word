import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="font-mono text-[9px] uppercase tracking-label text-gold mb-6">
        STRATUM NOT FOUND
      </p>
      <h1 className="font-cormorant text-5xl font-light text-parchment mb-4">
        404
      </h1>
      <p className="font-crimson text-parchment/60 text-center max-w-md mb-8">
        This layer of the excavation does not exist. Perhaps the word has been
        lost to time.
      </p>
      <Link
        href="/"
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/25 px-8 py-3 hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(200,146,10,0.15)] transition-all"
      >
        Return to Surface
      </Link>
    </div>
  );
}
