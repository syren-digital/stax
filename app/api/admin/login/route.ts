import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 });
    }

    const emailMatch = email.toLowerCase() === adminEmail.toLowerCase();
    const passwordMatch = password === adminPassword;

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getAdminSession();
    session.isAdmin = true;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/login] CAUGHT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
