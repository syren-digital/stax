import Link from "next/link";
import { EnterpriseForm } from "@/components/admin/EnterpriseForm";

export default function AdminEnterpriseNewPage() {
  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <Link
        href="/admin/enterprise"
        style={{ color: "#6366f1", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 20 }}
      >
        ← Back to Enterprise
      </Link>

      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: "system-ui, sans-serif" }}>
        Create Enterprise Account
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
        Manually provision an enterprise organisation. Invite email flow is not yet configured.
      </p>

      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 28,
        }}
      >
        <EnterpriseForm />
      </div>
    </div>
  );
}
