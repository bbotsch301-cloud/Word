import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WordListProvider } from "@/components/WordListProvider";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import { websiteJsonLd } from "@/lib/json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lexica.app";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LEXICA — Multi-Source English Dictionary",
    template: "%s — LEXICA",
  },
  description:
    "Search 800K+ words across 27+ historical and modern dictionaries. Definitions, etymology, pronunciation, word frequency, and more.",
  openGraph: {
    type: "website",
    siteName: "LEXICA",
    title: "LEXICA — Multi-Source English Dictionary",
    description: "Search 800K+ words across 27+ historical and modern dictionaries.",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "LEXICA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LEXICA — Multi-Source English Dictionary",
    description: "Search 800K+ words across 27+ historical and modern dictionaries.",
    images: ["/opengraph.jpg"],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-bg text-text-primary min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <WordListProvider>
              <Header />
              {children}
            </WordListProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
