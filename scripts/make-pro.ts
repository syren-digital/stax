import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // List orgs so we can find the right one
  const orgs = await prisma.organisation.findMany({
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  console.log("Organisations found:");
  orgs.forEach((o) => console.log(` - id: ${o.id}  clerkOrgId: ${o.clerkOrgId}  subscriptions: ${o.subscriptions.length}`));

  if (orgs.length === 0) {
    console.log("No organisations found.");
    return;
  }

  // Target the first org (the logged-in user's org)
  const org = orgs[0];
  console.log(`\nUpserting Pro subscription for org: ${org.id}`);

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await prisma.subscription.upsert({
    where: { id: org.subscriptions[0]?.id ?? "new" },
    update: {
      tier: "pro",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
    },
    create: {
      organisationId: org.id,
      stripeCustomerId: "manual_pro",
      stripeSubscriptionId: "manual_pro",
      stripePriceId: "manual_pro",
      tier: "pro",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
    },
  });

  console.log("Done — org is now Pro.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
