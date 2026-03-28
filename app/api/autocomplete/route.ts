import { NextRequest, NextResponse } from "next/server";
import { queryAll } from "@/lib/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q || q.length < 2 || q.length > 40) {
    return NextResponse.json([]);
  }

  try {
    const rows = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM words WHERE word LIKE ? ORDER BY LENGTH(word), word LIMIT 8",
      `${q}%`
    );
    return NextResponse.json(rows.map(r => r.word), {
      headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
    });
  } catch (err) {
    console.error("Autocomplete error:", err);
    return NextResponse.json({ error: "Autocomplete failed" }, { status: 500 });
  }
}
