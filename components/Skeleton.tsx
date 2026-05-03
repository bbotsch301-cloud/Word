'use client';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-surface animate-pulse rounded-md ${className}`} />
  );
}
