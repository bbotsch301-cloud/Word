import { NextResponse } from "next/server";
import { getChunkCount } from "@/lib/sitemap-helpers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lexica.app";

export async function GET() {
  const chunkCount = getChunkCount();

  const sitemaps = [
    `  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
  </sitemap>`,
  ];

  for (let i = 0; i < chunkCount; i++) {
    sitemaps.push(`  <sitemap>
    <loc>${SITE_URL}/api/sitemap/${i}</loc>
  </sitemap>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
