import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminEnterprisePage() {
  const enterprises = await prisma.subscription.findMany({
    where: { tier: "enterprise" },
    include: {
      organisation: {
        include: {
          projects: {
            include: { _count: { select: { widgets: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
            Enterprise
          </h1>
          <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
            {enterprises.length} enterprise account{enterprises.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/enterprise/new"
          style={{
            padding: "9px 18px",
            background: "#6366f1",
            color: "#fff",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + Create Enterprise Account
        </Link>
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
              {["Organisation", "Status", "Period Start", "Period End", "Projects", "Notes", "Actions"].map(
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
            {enterprises.map((sub, i) => {
              const org = sub.organisation;
              const projectCount = org.projects.length;

              return (
                <tr
                  key={sub.id}
                  style={{
                    background: i % 2 === 0 ? "#1a1a1a" : "#161616",
                    borderBottom: "1px solid #222",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ color: "#fff", fontWeight: 500 }}>{org.name}</p>
                    <p style={{ color: "#555", fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>
                      {org.id.slice(0, 14)}…
                    </p>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        color:
                          sub.status === "active"
                            ? "#4ade80"
                            : sub.status === "trialing"
                            ? "#facc15"
                            : "#f87171",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {sub.status}
                    </span>
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
                  <td style={{ padding: "12px 16px", color: "#ccc", textAlign: "center" }}>
                    {projectCount}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555", fontSize: 12 }}>—</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link
                      href={`/admin/users/${org.id}`}
                      style={{
                        color: "#6366f1",
                        fontSize: 12,
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {enterprises.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#555" }}>
            No enterprise accounts yet.{" "}
            <Link href="/admin/enterprise/new" style={{ color: "#6366f1" }}>
              Create one →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
