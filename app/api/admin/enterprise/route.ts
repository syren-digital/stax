import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      contactEmail,
      monthlyPrice,
      maxProjects,
      contractStart,
      contractEnd,
      notes,
    } = body as {
      companyName: string;
      contactName: string;
      contactEmail: string;
      monthlyPrice?: string;
      maxProjects?: string;
      contractStart?: string;
      contractEnd?: string;
      notes?: string;
    };

    if (!companyName || !contactName || !contactEmail) {
      return NextResponse.json({ error: "Company name, contact name and email are required" }, { status: 400 });
    }

    const clerkOrgId = `enterprise_${generateId()}`;

    const org = await prisma.organisation.create({
      data: {
        name: companyName,
        clerkOrgId,
        subscriptions: {
          create: {
            tier: "enterprise",
            status: "active",
            stripeCustomerId: `manual_${generateId()}`,
            currentPeriodStart: contractStart ? new Date(contractStart) : new Date(),
            currentPeriodEnd: contractEnd ? new Date(contractEnd) : null,
          },
        },
      },
    });

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        organisationId: org.id,
        action: "admin_enterprise_created",
        metadata: {
          contactName,
          contactEmail,
          monthlyPrice: monthlyPrice ? Number(monthlyPrice) : null,
          maxProjects: maxProjects ? Number(maxProjects) : null,
          notes: notes ?? null,
        },
      },
    });

    return NextResponse.json({ orgId: org.id });
  } catch (err) {
    console.error("[admin/enterprise]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
