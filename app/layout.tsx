import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WordListProvider } from "@/components/WordListProvider";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

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
  title: "LEXICA — Multi-Source English Dictionary",
  description:
    "Search 800K+ words across 7 historical dictionaries. Definitions, etymology, word frequency, and more.",
  openGraph: {
    title: "LEXICA — Multi-Source English Dictionary",
    description:
      "Search 800K+ words across 7 historical dictionaries.",
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
