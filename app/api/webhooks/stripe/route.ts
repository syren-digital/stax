import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { SubscriptionTier, SubscriptionStatus } from "@/app/generated/prisma/enums";
import type Stripe from "stripe";

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_PRICE_ID_STARTER ?? ""]: "starter",
  [process.env.STRIPE_PRICE_ID_GROWTH ?? ""]: "growth",
  [process.env.STRIPE_PRICE_ID_PRO ?? ""]: "pro",
};

function tierFromPriceId(priceId: string): SubscriptionTier {
  return PRICE_TO_TIER[priceId] ?? "starter";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const item = sub.items.data[0];
      const priceId = item?.price.id ?? "";
      // current_period_start/end moved to subscription item in 2026 API
      const periodStart = item?.current_period_start
        ? new Date(item.current_period_start * 1000)
        : null;
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null;

      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.id },
        update: {
          tier: tierFromPriceId(priceId),
          status: sub.status as SubscriptionStatus,
          stripePriceId: priceId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
        create: {
          stripeCustomerId: String(sub.customer),
          stripeSubscriptionId: sub.id,
          tier: tierFromPriceId(priceId),
          status: sub.status as SubscriptionStatus,
          stripePriceId: priceId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          organisation: {
            connectOrCreate: {
              where: { clerkOrgId: String(sub.customer) },
              create: { clerkOrgId: String(sub.customer), name: String(sub.customer) },
            },
          },
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled" },
      });
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
