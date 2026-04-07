import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TierUpdateForm } from "./TierUpdateForm";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const org = await prisma.organisation.findUnique({
    where: { id: userId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      projects: {
        include: {
          widgets: {
            include: {
              impressions: { orderBy: { createdAt: "desc" }, take: 10 },
            },
          },
        },
      },
    },
  });

  if (!org) notFound();

  const latestSub = org.subscriptions[0];

  const recentImpressions = org.projects
    .flatMap((p) => p.widgets.flatMap((w) => w.impressions.map((imp) => ({ ...imp, widgetId: w.id }))))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      {/* Back */}
      <Link
        href="/admin/users"
        style={{ color: "#6366f1", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 20 }}
      >
        ← Back to Users
      </Link>

      {/* Header */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: "system-ui, sans-serif" }}>
          {org.name}
        </h1>
        <p style={{ color: "#888", fontSize: 12, fontFamily: "monospace", marginBottom: 4 }}>
          Org ID: {org.id}
        </p>
        <p style={{ color: "#888", fontSize: 12, fontFamily: "monospace", marginBottom: 4 }}>
          Clerk Org ID: {org.clerkOrgId ?? "—"}
        </p>
        <p style={{ color: "#666", fontSize: 12 }}>
          Created: {new Date(org.createdAt).toLocaleString("en-AU")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Subscription */}
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Current Subscription
          </h2>
          {latestSub ? (
            <table style={{ fontSize: 13, width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Tier", latestSub.tier],
                  ["Status", latestSub.status],
                  ["Period Start", latestSub.currentPeriodStart ? new Date(latestSub.currentPeriodStart).toLocaleDateString("en-AU") : "—"],
                  ["Period End", latestSub.currentPeriodEnd ? new Date(latestSub.currentPeriodEnd).toLocaleDateString("en-AU") : "—"],
                  ["Stripe Customer", latestSub.stripeCustomerId || "—"],
                  ["Stripe Sub ID", latestSub.stripeSubscriptionId || "—"],
                  ["Cancel at Period End", latestSub.cancelAtPeriodEnd ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "8px 0", color: "#888", paddingRight: 16, whiteSpace: "nowrap" }}>{k}</td>
                    <td style={{ padding: "8px 0", color: "#fff", fontFamily: typeof v === "string" && v.startsWith("cus_") ? "monospace" : undefined, fontSize: typeof v === "string" && v.startsWith("cus_") ? 11 : 13 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#555" }}>No subscription found.</p>
          )}
        </div>

        {/* Tier Change */}
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Change Tier
          </h2>
          <TierUpdateForm orgId={org.id} currentTier={latestSub?.tier ?? "starter"} />
        </div>
      </div>

      {/* Projects & Widgets */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Projects & Widgets
        </h2>
        {org.projects.length === 0 ? (
          <p style={{ color: "#555", fontSize: 13 }}>No projects.</p>
        ) : (
          org.projects.map((project) => (
            <div key={project.id} style={{ marginBottom: 20 }}>
              <p style={{ color: "#ccc", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {project.name}{" "}
                <span style={{ color: "#555", fontFamily: "monospace", fontSize: 11, fontWeight: 400 }}>
                  ({project.id.slice(0, 10)}…)
                </span>
              </p>
              {project.widgets.length === 0 ? (
                <p style={{ color: "#555", fontSize: 12, marginLeft: 16 }}>No widgets.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      {["Widget ID", "Type", "Ticker", "Impressions"].map((col) => (
                        <th key={col} style={{ padding: "6px 12px", textAlign: "left", color: "#666", fontWeight: 500 }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {project.widgets.map((w) => (
                      <tr key={w.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                        <td style={{ padding: "8px 12px", color: "#888", fontFamily: "monospace" }}>
                          {w.id.slice(0, 12)}…
                        </td>
                        <td style={{ padding: "8px 12px", color: "#ccc" }}>{w.type}</td>
                        <td style={{ padding: "8px 12px", color: "#ccc", fontWeight: 600 }}>{w.ticker}</td>
                        <td style={{ padding: "8px 12px", color: "#6366f1", fontWeight: 600 }}>
                          {w.impressions.length >= 10 ? "10+" : w.impressions.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recent Impressions */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Recent Impressions
        </h2>
        {recentImpressions.length === 0 ? (
          <p style={{ color: "#555", fontSize: 13 }}>No impressions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                {["Widget ID", "Referrer", "Date"].map((col) => (
                  <th key={col} style={{ padding: "6px 12px", textAlign: "left", color: "#666", fontWeight: 500 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentImpressions.map((imp) => (
                <tr key={imp.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                  <td style={{ padding: "8px 12px", color: "#888", fontFamily: "monospace" }}>
                    {imp.widgetId.slice(0, 12)}…
                  </td>
                  <td style={{ padding: "8px 12px", color: "#ccc" }}>{imp.referrerDomain ?? "—"}</td>
                  <td style={{ padding: "8px 12px", color: "#666" }}>
                    {new Date(imp.createdAt).toLocaleString("en-AU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Danger Zone */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ color: "#f87171", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
          Danger Zone
        </h2>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
          Destructive actions cannot be undone.
        </p>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            disabled
            title="Coming soon"
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 500,
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            Suspend Account — coming soon
          </button>
        </div>
      </div>
    </div>
  );
}
