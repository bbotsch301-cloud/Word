'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex gap-1.5 font-mono text-[11px] text-text-muted uppercase tracking-wider">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-text-muted opacity-50">
                <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-accent hover:text-accent-hover transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-secondary">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
