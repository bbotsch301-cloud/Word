import { NextResponse } from "next/server";
import { excavateWord } from "@/lib/excavate";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

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
      { error: "Word must be 1–40 characters", code: "INVALID_WORD" },
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
    const result = await Promise.race([
      excavateWord(word),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 25_000)
      ),
    ]);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Excavation failed";

    if (message === "Request timed out") {
      return NextResponse.json(
        { error: "The excavation took too long. Please try again.", code: "TIMEOUT" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to excavate this word. Please try again.", code: "EXCAVATION_FAILED" },
      { status: 422 }
    );
  }
}
