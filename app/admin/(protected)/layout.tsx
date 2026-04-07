import { requireAdminSession } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#121212",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          minWidth: 220,
          background: "#0f0f0f",
          borderRight: "1px solid #1e1e1e",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.1em",
            }}
          >
            STAX ADMIN
          </span>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflow: "auto", paddingTop: 12 }}>
          <AdminNav />
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 220,
          background: "#121212",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
