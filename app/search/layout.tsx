import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Search",
  description: "Search 800K+ words by pattern, origin language, century, part of speech, and more.",
  openGraph: {
    title: "Advanced Search — LEXICA",
    description: "Search 800K+ words by pattern, origin language, century, part of speech, and more.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
