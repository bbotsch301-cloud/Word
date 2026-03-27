import type { LexicaResult } from "@/types/lexica";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lexica.app";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LEXICA",
    url: SITE_URL,
    description: "Multi-source English dictionary with 800K+ words from 27+ historical and modern sources.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/word/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function definedTermJsonLd(result: LexicaResult) {
  const firstDef = result.definitions?.[0]?.definition || "";
  const ipa = result.pronunciation?.ipa || result.phonetic || "";

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: result.word,
    description: firstDef.slice(0, 300),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "LEXICA English Dictionary",
      url: SITE_URL,
    },
    ...(ipa ? { termCode: ipa } : {}),
    url: `${SITE_URL}/word/${encodeURIComponent(result.word)}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}
