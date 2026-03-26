'use client';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-surface via-surface-hover to-surface bg-[length:200%_100%] animate-shimmer rounded-md ${className}`}
    />
  );
}
