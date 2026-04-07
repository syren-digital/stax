import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <p style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: accent ? "#6366f1" : "#fff",
          lineHeight: 1,
          marginBottom: sub ? 8 : 0,
        }}
      >
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#666" }}>{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const sub7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sub30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrgs,
    subscriptionsByTier,
    recentOrgs7,
    recentOrgs30,
    widgetCount,
    activeWidgetCount,
    totalImpressions,
    impressions30,
  ] = await Promise.all([
    prisma.organisation.count(),
    prisma.subscription.groupBy({ by: ["tier", "status"], _count: true }),
    prisma.organisation.count({ where: { createdAt: { gte: sub7 } } }),
    prisma.organisation.count({ where: { createdAt: { gte: sub30 } } }),
    prisma.widget.count(),
    prisma.widget.count({ where: { impressions: { some: {} } } }),
    prisma.widgetImpression.count(),
    prisma.widgetImpression.count({ where: { createdAt: { gte: sub30 } } }),
  ]);

  const activeCount = subscriptionsByTier
    .filter((s) => s.status === "active")
    .reduce((acc, s) => acc + s._count, 0);

  // MRR from Stripe
  let mrrCents = 0;
  try {
    if (!stripe) throw new Error("Stripe not configured");
    const stripeSubs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    mrrCents = stripeSubs.data.reduce((acc, s) => {
      const amount = s.items.data[0]?.price?.unit_amount ?? 0;
      return acc + amount;
    }, 0);
  } catch {
    // Stripe not configured or errored — leave as 0
  }

  const mrrDisplay = mrrCents > 0 ? `$${(mrrCents / 100).toFixed(0)}` : "—";

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
        Dashboard
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>
        Platform overview — {now.toLocaleDateString("en-AU", { dateStyle: "long" })}
      </p>

      {/* Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatCard label="Total Orgs" value={totalOrgs} />
        <StatCard label="Active Subscriptions" value={activeCount} accent />
        <StatCard label="New (7 days)" value={recentOrgs7} sub={`${recentOrgs30} in last 30 days`} />
        <StatCard label="MRR (Stripe)" value={mrrDisplay} sub="Active subscriptions only" />
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard label="Total Widgets" value={widgetCount} />
        <StatCard label="Active Widgets" value={activeWidgetCount} sub="With at least 1 impression" />
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} />
        <StatCard label="Impressions (30d)" value={impressions30.toLocaleString()} accent />
      </div>

      {/* Breakdown by tier */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Subscriptions by Tier
        </h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {subscriptionsByTier.map((row) => (
            <div
              key={`${row.tier}-${row.status}`}
              style={{
                background: "#111",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "12px 20px",
                minWidth: 120,
              }}
            >
              <p style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {row.tier}
              </p>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{row._count}</p>
              <p
                style={{
                  fontSize: 11,
                  color:
                    row.status === "active"
                      ? "#4ade80"
                      : row.status === "trialing"
                      ? "#facc15"
                      : row.status === "canceled"
                      ? "#f87171"
                      : "#888",
                  marginTop: 2,
                }}
              >
                {row.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
