import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateLocalData } from "@/lib/user-db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookmarks, lists } = await req.json();

  if (!Array.isArray(bookmarks) || !Array.isArray(lists)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  migrateLocalData(session.user.id, { bookmarks, lists });
  return NextResponse.json({ ok: true });
}
