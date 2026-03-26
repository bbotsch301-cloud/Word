"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-text-muted text-center max-w-md mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
