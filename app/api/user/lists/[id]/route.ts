import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteUserList } from "@/lib/user-db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    deleteUserList(session.user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete list:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
