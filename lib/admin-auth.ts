import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface AdminSessionData {
  isAdmin: boolean;
}

export async function getAdminSession() {
  const session = await getIronSession<AdminSessionData>(await cookies(), {
    password: process.env.IRON_SESSION_SECRET!,
    cookieName: "admin-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  });
  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session.isAdmin) redirect("/admin/login");
  return session;
}
