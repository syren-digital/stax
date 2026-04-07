import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { projectId } = await params;
  const clerkOrgId = orgId ?? userId;

  const project = await prisma.project.findFirst({
    where: { id: projectId, organisation: { clerkOrgId } },
  });
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  await prisma.project.delete({ where: { id: projectId } });

  return Response.json({ ok: true });
}
