import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST() {
  const session = await getAdminSession();
  session.destroy();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
}
