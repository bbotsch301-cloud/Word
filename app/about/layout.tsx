import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "LEXICA aggregates 27+ historical and modern English dictionaries into a single research tool. Learn about the project, our sources, and how it works.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
