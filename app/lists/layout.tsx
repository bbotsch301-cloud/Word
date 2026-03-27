import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Words",
  robots: { index: false, follow: false },
};

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
