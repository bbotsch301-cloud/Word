import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold text-text-primary mb-2">404</h1>
      <p className="text-text-muted text-center max-w-md mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
