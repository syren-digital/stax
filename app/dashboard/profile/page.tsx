import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Tier = "starter" | "growth" | "pro" | "enterprise" | "none";

const PLANS = [
  {
    tier: "starter" as Tier,
    name: "Starter",
    price: "$50",
    description: "1 project, get started with widgets",
  },
  {
    tier: "growth" as Tier,
    name: "Growth",
    price: "$80",
    description: "3 projects, full branding",
  },
  {
    tier: "pro" as Tier,
    name: "Pro",
    price: "$120",
    description: "6 projects, analytics and priority support",
  },
];

const FEATURES: { label: string; tiers: Tier[] }[] = [
  { label: "iFrame embed",             tiers: ["starter", "growth", "pro", "enterprise"] },
  { label: "1 project",                tiers: ["starter"] },
  { label: "3 projects",               tiers: ["growth"] },
  { label: "6 projects",               tiers: ["pro", "enterprise"] },
  { label: "Share price widget",       tiers: ["starter", "growth", "pro", "enterprise"] },
  { label: "Price chart widget",       tiers: ["starter", "growth", "pro", "enterprise"] },
  { label: "Announcements widget",     tiers: ["starter", "growth", "pro", "enterprise"] },
  { label: "Full brand customisation", tiers: ["growth", "pro", "enterprise"] },
  { label: "Remove STAX branding",     tiers: ["growth", "pro", "enterprise"] },
  { label: "JSON API endpoint",        tiers: ["growth", "pro", "enterprise"] },
  { label: "Analytics dashboard",      tiers: ["pro", "enterprise"] },
];

function TickIcon() {
  return (
    <svg className="h-5 w-5" style={{ color: "var(--accent)" }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="h-5 w-5" style={{ color: "rgba(242,242,240,0.2)" }} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default async function ProfilePage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkOrgId = orgId ?? userId;

  const organisation = await prisma.organisation.findUnique({
    where: { clerkOrgId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const subscription = organisation?.subscriptions[0];
  const currentTier: Tier =
    subscription?.status === "active" || subscription?.status === "trialing"
      ? (subscription.tier as Tier)
      : "none";

  const displayTier = currentTier === "none" ? "starter" : currentTier;

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Billing</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Manage your plan</p>
        </div>

        {/* Current plan banner */}
        <div className="glass p-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Current plan</p>
          <div className="mt-2 flex items-center gap-4">
            <h2 className="text-3xl font-bold capitalize" style={{ color: "var(--text)" }}>{displayTier}</h2>
            {currentTier === "none" && (
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(255,200,0,0.15)", color: "#ffc800" }}>
                Free trial
              </span>
            )}
            {currentTier !== "none" && subscription?.status === "active" && (
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(181,249,120,0.15)", color: "var(--accent)" }}>
                Active
              </span>
            )}
          </div>
          {subscription?.currentPeriodEnd && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Renews{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-AU", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Plan comparison */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Plans</h2>
          <div className="glass" style={{ overflow: "visible" }}>

            {/* Plan headers */}
            <div className="grid grid-cols-4 mt-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="p-6" />
              {PLANS.map((plan) => {
                const isCurrent = displayTier === plan.tier;
                return (
                  <div
                    key={plan.tier}
                    className="relative p-6 text-center"
                    style={isCurrent ? { background: "rgba(181,249,120,0.06)" } : {}}
                  >
                    <p className="font-bold" style={{ color: "var(--text)" }}>{plan.name}</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
                      {plan.price}
                      <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/mo +GST</span>
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{plan.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Feature rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className="grid grid-cols-4"
                style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center px-6 py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  {feature.label}
                </div>
                {PLANS.map((plan) => {
                  const isCurrent = displayTier === plan.tier;
                  const included = feature.tiers.includes(plan.tier);
                  return (
                    <div
                      key={plan.tier}
                      className="flex items-center justify-center py-3"
                      style={isCurrent ? { background: "rgba(181,249,120,0.04)" } : {}}
                    >
                      {included ? <TickIcon /> : <CrossIcon />}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Upgrade CTAs */}
            <div className="grid grid-cols-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="p-6" />
              {PLANS.map((plan) => {
                const isCurrent = displayTier === plan.tier;
                const isDowngrade =
                  (displayTier === "pro" && (plan.tier === "starter" || plan.tier === "growth")) ||
                  (displayTier === "growth" && plan.tier === "starter");

                return (
                  <div key={plan.tier} className="p-4 text-center" style={isCurrent ? { background: "rgba(181,249,120,0.04)" } : {}}>
                    {isCurrent ? (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>Your plan</span>
                    ) : isDowngrade ? (
                      <button
                        disabled
                        className="w-full rounded-full px-4 py-2 text-sm font-medium cursor-not-allowed"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", opacity: 0.4 }}
                      >
                        Downgrade
                      </button>
                    ) : (
                      <a
                        href="mailto:hello@stax.id.au?subject=Upgrade enquiry"
                        className="block w-full rounded-full px-4 py-2 text-center text-sm font-semibold transition-all hover:opacity-90 accent-glow"
                        style={{ background: "var(--accent)", color: "var(--bg)" }}
                      >
                        Upgrade
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Enterprise */}
        <div className="glass p-8 text-center" style={{ borderStyle: "dashed" }}>
          <h3 className="font-semibold" style={{ color: "var(--text)" }}>Enterprise</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Custom pricing, unlimited projects, dedicated support, and SLA.
          </p>
          <a
            href="mailto:hello@stax.id.au?subject=Enterprise enquiry"
            className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.2)", color: "var(--text)" }}
          >
            Contact sales
          </a>
        </div>

      </div>
    </div>
  );
}
