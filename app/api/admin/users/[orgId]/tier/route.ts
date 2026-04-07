import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_TIERS = ["starter", "growth", "pro", "enterprise"] as const;
type Tier = (typeof VALID_TIERS)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const body = await req.json();
    const { tier } = body as { tier: string };

    if (!VALID_TIERS.includes(tier as Tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Find latest subscription for the org
    const latestSub = await prisma.subscription.findFirst({
      where: { organisationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    if (!latestSub) {
      return NextResponse.json({ error: "No subscription found for this organisation" }, { status: 404 });
    }

    await prisma.subscription.update({
      where: { id: latestSub.id },
      data: { tier: tier as Tier },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/tier]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
