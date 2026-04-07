import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTickerData } from "@/lib/morningstar";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Rate limits per tier (requests per minute)
const RATE_LIMITS: Record<string, number> = {
  starter: 0,   // JSON endpoint not available on Starter
  growth: 60,
  pro: 300,
  enterprise: 0, // unlimited — handled separately
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ embedKey: string }> },
) {
  const { embedKey } = await params;

  const widget = await prisma.widget.findUnique({
    where: { embedKey },
    include: {
      project: {
        include: {
          organisation: {
            include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!widget) {
    return Response.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
  }

  const subscription = widget.project.organisation.subscriptions[0];
  const tier = subscription?.tier ?? "starter";

  if (tier === "starter" || subscription?.status !== "active") {
    return Response.json(
      { error: "The JSON endpoint requires a Growth plan or above. Upgrade at app.stax.id.au" },
      { status: 403, headers: CORS_HEADERS },
    );
  }

  void RATE_LIMITS[tier];

  const data = await getTickerData(widget.ticker);

  return Response.json(data, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
