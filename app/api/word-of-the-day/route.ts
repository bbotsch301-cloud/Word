import { NextResponse } from "next/server";
import { getWordOfTheDay } from "@/lib/database";

export async function GET() {
  try {
    const wotd = getWordOfTheDay();
    if (!wotd) {
      return NextResponse.json({ error: "No word of the day available" }, { status: 404 });
    }
    return NextResponse.json(wotd);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
