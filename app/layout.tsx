import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Crimson_Pro } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-crimson-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEXICA — Excavate the buried history of words",
  description:
    "An AI-powered word etymology excavation experience. Enter any English word and unearth its deepest linguistic roots, cultural moments, and truest meaning.",
  openGraph: {
    title: "LEXICA — Excavate the buried history of words",
    description:
      "An AI-powered word etymology excavation experience. Unearth the deepest linguistic roots of any English word.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${ibmPlexMono.variable} ${crimsonPro.variable}`}
    >
      <body className="antialiased bg-ink text-parchment min-h-screen">{children}</body>
    </html>
  );
}
