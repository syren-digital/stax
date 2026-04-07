import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const clerkOrgId = orgId ?? userId;
  await prisma.organisation.upsert({
    where: { clerkOrgId },
    update: {},
    create: { clerkOrgId, name: clerkOrgId },
  });

  return Response.json({ ok: true }, { status: 200 });
}
