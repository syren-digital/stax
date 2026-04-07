import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateTicker } from "@/lib/morningstar";

const BodySchema = z.object({
  type: z.enum(["share_price_number", "share_price_chart", "announcements"]),
  ticker: z.string().min(2).max(6).toUpperCase(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  labelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  fontFamily: z.string().min(1).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorised" }, { status: 401 });

    const { projectId } = await params;
    const clerkOrgId = orgId ?? userId;

    const project = await prisma.project.findFirst({
      where: { id: projectId, organisation: { clerkOrgId } },
    });
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    const body = await request.json() as unknown;
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { type, ticker, primaryColor, secondaryColor, labelColor, fontFamily } = parsed.data;

    const eohdConfigured =
      process.env.EODHD_API_KEY &&
      process.env.EODHD_API_KEY !== "placeholder";
    if (eohdConfigured) {
      const isValid = await validateTicker(ticker);
      if (!isValid) {
        return Response.json({ error: `Ticker "${ticker}" not found on ASX` }, { status: 422 });
      }
    }

    const widget = await prisma.widget.create({
      data: {
        projectId,
        type,
        ticker,
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(labelColor && { labelColor }),
        ...(fontFamily && { fontFamily }),
      },
    });

    return Response.json({ id: widget.id, embedKey: widget.embedKey }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/[projectId]/widgets]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
