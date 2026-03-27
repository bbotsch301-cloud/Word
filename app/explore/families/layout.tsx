import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language Families",
  description: "Explore how English borrows from Latin, Greek, French, Germanic, and dozens of other language families.",
};

export default function FamiliesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
