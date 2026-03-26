"use client";

export default function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-10">
      <span className="font-mono text-[9px] uppercase tracking-label text-gold whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-gold/40 to-transparent" />
    </div>
  );
}
