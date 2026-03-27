import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description: "Explore the English language through timelines, language families, and word constellations.",
  openGraph: {
    title: "Explore — LEXICA",
    description: "Explore the English language through timelines, language families, and word constellations.",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
