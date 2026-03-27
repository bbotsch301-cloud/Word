import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getUserByEmail, createUser } from "@/lib/user-db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(email, name, passwordHash);

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
