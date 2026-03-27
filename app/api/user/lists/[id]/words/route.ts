import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addWordToList, removeWordFromList, getUserDatabase } from "@/lib/user-db";

function verifyListOwnership(listId: string, userId: string): boolean {
  const db = getUserDatabase();
  const list = db.prepare(
    "SELECT id FROM user_lists WHERE id = ? AND user_id = ?"
  ).get(listId, userId);
  return !!list;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!verifyListOwnership(params.id, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { word } = await req.json();
  if (!word || typeof word !== "string") {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }
  try {
    addWordToList(params.id, word);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to add word to list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!verifyListOwnership(params.id, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const word = req.nextUrl.searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }
  try {
    removeWordFromList(params.id, word);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to remove word from list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
