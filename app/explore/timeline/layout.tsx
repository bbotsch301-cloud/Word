import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etymology Timeline",
  description: "Trace words through centuries of English language evolution.",
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
