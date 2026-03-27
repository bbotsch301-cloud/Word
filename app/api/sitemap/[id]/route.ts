import { NextRequest, NextResponse } from "next/server";
import { getWordChunk, getChunkCount } from "@/lib/sitemap-helpers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lexica.app";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const chunkIndex = parseInt(params.id, 10);
  if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= getChunkCount()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const words = getWordChunk(chunkIndex);

  const urls = words.map(word => `  <url>
    <loc>${SITE_URL}/word/${encodeURIComponent(word)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
