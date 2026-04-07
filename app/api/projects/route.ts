import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as unknown;
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid project name" }, { status: 400 });
  }

  const clerkOrgId = orgId ?? userId;

  const organisation = await prisma.organisation.upsert({
    where: { clerkOrgId },
    update: {},
    create: { clerkOrgId, name: clerkOrgId },
  });

  const project = await prisma.project.create({
    data: { organisationId: organisation.id, name: parsed.data.name },
  });

  return Response.json({ id: project.id }, { status: 201 });
}
