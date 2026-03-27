import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBookmarks, addBookmark, removeBookmark } from "@/lib/user-db";

async function getSession() {
  return getServerSession(authOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const bookmarks = getUserBookmarks(session.user.id);
    return NextResponse.json({ bookmarks });
  } catch (err) {
    console.error("Failed to fetch bookmarks:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { word } = await req.json();
  if (!word || typeof word !== "string") {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }
  try {
    addBookmark(session.user.id, word);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to add bookmark:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const word = req.nextUrl.searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }
  try {
    removeBookmark(session.user.id, word);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to remove bookmark:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
