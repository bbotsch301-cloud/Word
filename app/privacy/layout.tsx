import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LEXICA collects, uses, and protects your personal information.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
