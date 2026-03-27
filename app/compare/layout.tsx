import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Words",
  description: "Compare definitions, etymologies, and histories of words side by side.",
  openGraph: {
    title: "Compare Words — LEXICA",
    description: "Compare definitions, etymologies, and histories of words side by side.",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
