import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateLocalData } from "@/lib/user-db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookmarks, lists } = body;

  if (!Array.isArray(bookmarks) || !Array.isArray(lists)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  // Limit payload size to prevent abuse
  if (bookmarks.length > 10000 || lists.length > 1000) {
    return NextResponse.json({ error: "Data too large" }, { status: 400 });
  }

  // Validate content types
  if (!bookmarks.every((b: unknown) => typeof b === "string") ||
      !lists.every((l: unknown) => typeof l === "object" && l !== null && typeof (l as Record<string, unknown>).name === "string")) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  try {
    migrateLocalData(session.user.id, { bookmarks, lists });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to migrate data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
