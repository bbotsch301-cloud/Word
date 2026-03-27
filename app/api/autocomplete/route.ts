import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const db = getDatabase();
    const rows = db.prepare(
      "SELECT DISTINCT word FROM words WHERE word LIKE ? ORDER BY LENGTH(word), word LIMIT 8"
    ).all(`${q}%`) as { word: string }[];
    return NextResponse.json(rows.map(r => r.word));
  } catch {
    return NextResponse.json([]);
  }
}
