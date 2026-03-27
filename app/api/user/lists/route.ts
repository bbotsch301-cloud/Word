import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserLists, createUserList } from "@/lib/user-db";

async function getSession() {
  return getServerSession(authOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const lists = getUserLists(session.user.id);
    return NextResponse.json({ lists });
  } catch (err) {
    console.error("Failed to fetch lists:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "List name is required" }, { status: 400 });
  }
  try {
    const id = createUserList(session.user.id, name.trim());
    return NextResponse.json({ id });
  } catch (err) {
    console.error("Failed to create list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
