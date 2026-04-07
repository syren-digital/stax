import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await prisma.organisation.findMany({
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      projects: {
        include: {
          widgets: {
            include: { _count: { select: { impressions: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
            Users
          </h1>
          <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
            {users.length} organisation{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Search note */}
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 16,
          color: "#666",
          fontSize: 13,
        }}
      >
        Search coming soon — use browser Ctrl+F to find in the table below.
      </div>

      <style>{`
        .admin-user-row:hover { background: #222 !important; }
      `}</style>

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
              {["Org ID", "Name", "Clerk Org ID", "Tier", "Status", "Projects", "Widgets", "Impressions", "Created"].map(
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
            {users.map((org, i) => {
              const sub = org.subscriptions[0];
              const projectCount = org.projects.length;
              const widgetCount = org.projects.reduce((a, p) => a + p.widgets.length, 0);
              const impressionCount = org.projects.reduce(
                (a, p) => a + p.widgets.reduce((b, w) => b + w._count.impressions, 0),
                0
              );

              return (
                <tr
                  key={org.id}
                  className="admin-user-row"
                  style={{
                    background: i % 2 === 0 ? "#1a1a1a" : "#161616",
                    borderBottom: "1px solid #222",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "#6366f1", fontFamily: "monospace", fontSize: 12 }}>
                    <Link
                      href={`/admin/users/${org.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {org.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500 }}>
                    <Link
                      href={`/admin/users/${org.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666", fontFamily: "monospace", fontSize: 12 }}>
                    {org.clerkOrgId ? `${org.clerkOrgId.slice(0, 14)}…` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {sub ? (
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
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
                    ) : (
                      <span style={{ color: "#444" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {sub ? (
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color:
                            sub.status === "active"
                              ? "#4ade80"
                              : sub.status === "trialing"
                              ? "#facc15"
                              : sub.status === "canceled"
                              ? "#f87171"
                              : "#888",
                        }}
                      >
                        {sub.status}
                      </span>
                    ) : (
                      <span style={{ color: "#444" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#ccc", textAlign: "center" }}>
                    {projectCount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#ccc", textAlign: "center" }}>
                    {widgetCount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#ccc", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {impressionCount.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666", fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(org.createdAt).toLocaleDateString("en-AU")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#555" }}>
            No organisations found.
          </div>
        )}
      </div>
    </div>
  );
}
