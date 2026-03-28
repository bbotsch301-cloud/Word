import { NextRequest, NextResponse } from "next/server";
import { getWordChunk, getChunkCount } from "@/lib/sitemap-helpers";
import { SITE_URL } from "@/lib/config";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const chunkIndex = parseInt(params.id, 10);
  const totalChunks = await getChunkCount();
  if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= totalChunks) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const words = await getWordChunk(chunkIndex);

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
