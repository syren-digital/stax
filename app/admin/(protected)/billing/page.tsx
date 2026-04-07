import { prisma } from "@/lib/prisma";

const TIER_PRICE: Record<string, number> = {
  starter: 50,
  growth: 80,
  pro: 120,
  enterprise: 0,
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active"
      ? "#4ade80"
      : status === "trialing"
      ? "#facc15"
      : status === "canceled"
      ? "#f87171"
      : "#888";

  return (
    <span style={{ color, fontSize: 12, fontWeight: 600 }}>{status}</span>
  );
}

export default async function AdminBillingPage() {
  const subs = await prisma.subscription.findMany({
    include: { organisation: true },
    orderBy: { createdAt: "desc" },
  });

  const activeSubs = subs.filter((s) => s.status === "active");
  const churnedCount = subs.filter((s) => s.status === "canceled").length;
  const mrr = activeSubs.reduce((acc, s) => acc + (TIER_PRICE[s.tier] ?? 0), 0);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: "system-ui, sans-serif" }}>
        Billing
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
        Subscription overview — Connect Stripe for full billing data
      </p>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Active Subscriptions
          </p>
          <p style={{ fontSize: 36, fontWeight: 700, color: "#4ade80" }}>{activeSubs.length}</p>
        </div>
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Estimated MRR
          </p>
          <p style={{ fontSize: 36, fontWeight: 700, color: "#6366f1" }}>
            ${mrr.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "#555", marginTop: 4 }}>AUD · based on tier pricing</p>
        </div>
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Churned
          </p>
          <p style={{ fontSize: 36, fontWeight: 700, color: "#f87171" }}>{churnedCount}</p>
          <p style={{ fontSize: 11, color: "#555", marginTop: 4 }}>canceled subscriptions</p>
        </div>
      </div>

      {/* Notice */}
      <div
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 20,
          color: "#818cf8",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Connect Stripe for live MRR, payment history, and invoice data.
      </div>

      {/* Table */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
              {["Org Name", "Org ID", "Tier", "Status", "Period Start", "Period End", "Stripe Sub ID", "Est. MRR"].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#888",
                      fontWeight: 500,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {subs.map((sub, i) => (
              <tr
                key={sub.id}
                style={{
                  background: i % 2 === 0 ? "#1a1a1a" : "#161616",
                  borderBottom: "1px solid #222",
                }}
              >
                <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500 }}>
                  {sub.organisation.name}
                </td>
                <td style={{ padding: "12px 16px", color: "#666", fontFamily: "monospace", fontSize: 11 }}>
                  {sub.organisationId.slice(0, 12)}…
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      background:
                        sub.tier === "enterprise"
                          ? "rgba(99,102,241,0.15)"
                          : sub.tier === "pro"
                          ? "rgba(168,85,247,0.15)"
                          : sub.tier === "growth"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(100,100,100,0.15)",
                      color:
                        sub.tier === "enterprise"
                          ? "#818cf8"
                          : sub.tier === "pro"
                          ? "#c084fc"
                          : sub.tier === "growth"
                          ? "#4ade80"
                          : "#888",
                    }}
                  >
                    {sub.tier}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={sub.status} />
                </td>
                <td style={{ padding: "12px 16px", color: "#666", fontSize: 12 }}>
                  {sub.currentPeriodStart
                    ? new Date(sub.currentPeriodStart).toLocaleDateString("en-AU")
                    : "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "#666", fontSize: 12 }}>
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-AU")
                    : "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "#555", fontFamily: "monospace", fontSize: 11 }}>
                  {sub.stripeSubscriptionId ? `${sub.stripeSubscriptionId.slice(0, 16)}…` : "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "#ccc", fontWeight: 600 }}>
                  {sub.status === "active" ? `$${TIER_PRICE[sub.tier] ?? 0}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subs.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#555" }}>
            No subscriptions found.
          </div>
        )}
      </div>
    </div>
  );
}
