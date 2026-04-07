import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  labelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  fontFamily: z.string().min(1).optional(),
  chartRange: z.enum(["5y", "3y", "2y", "1y", "6m", "3m", "1m"]).optional(),
});

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; widgetId: string }> },
) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { projectId, widgetId } = await params;
  const clerkOrgId = orgId ?? userId;

  const widget = await prisma.widget.findFirst({
    where: { id: widgetId, projectId, project: { organisation: { clerkOrgId } } },
  });
  if (!widget) return Response.json({ error: "Widget not found" }, { status: 404 });

  await prisma.widget.delete({ where: { id: widgetId } });

  return Response.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; widgetId: string }> },
) {
  const { userId, orgId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { projectId, widgetId } = await params;
  const clerkOrgId = orgId ?? userId;

  const widget = await prisma.widget.findFirst({
    where: { id: widgetId, projectId, project: { organisation: { clerkOrgId } } },
  });
  if (!widget) return Response.json({ error: "Widget not found" }, { status: 404 });

  const body = await request.json() as unknown;
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.widget.update({
    where: { id: widgetId },
    data: parsed.data,
  });

  return Response.json({ ok: true, widget: updated });
}
