import { NextResponse } from "next/server";
import { excavateWord } from "@/lib/excavate";

export async function POST(request: Request) {
  let body: { word?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const word = body.word?.trim().toLowerCase();

  if (!word || word.length === 0 || word.length > 40) {
    return NextResponse.json(
      { error: "Word must be 1-40 characters", code: "INVALID_WORD" },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z-]+$/.test(word)) {
    return NextResponse.json(
      { error: "Word must contain only letters and hyphens", code: "INVALID_CHARS" },
      { status: 400 }
    );
  }

  try {
    const result = await excavateWord(word);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Excavation failed";

    if (message.includes("not found")) {
      return NextResponse.json(
        { error: `Word "${word}" not found in our dictionary.`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to excavate this word. Please try again.", code: "EXCAVATION_FAILED" },
      { status: 422 }
    );
  }
}
