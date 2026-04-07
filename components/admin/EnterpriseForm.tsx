"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function EnterpriseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fields, setFields] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    monthlyPrice: "",
    maxProjects: "",
    contractStart: "",
    contractEnd: "",
    notes: "",
  });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        router.push("/admin/enterprise");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create account.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "#111",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    fontWeight: 500,
  };

  const fieldWrap: React.CSSProperties = { marginBottom: 16 };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Company Name *</label>
          <input type="text" required value={fields.companyName} onChange={set("companyName")} style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Contact Name *</label>
          <input type="text" required value={fields.contactName} onChange={set("contactName")} style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Contact Email *</label>
          <input type="email" required value={fields.contactEmail} onChange={set("contactEmail")} style={inputStyle} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Monthly Price AUD</label>
          <input type="number" min="0" value={fields.monthlyPrice} onChange={set("monthlyPrice")} style={inputStyle} placeholder="0" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Max Projects</label>
          <input type="number" min="1" value={fields.maxProjects} onChange={set("maxProjects")} style={inputStyle} placeholder="Unlimited" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Contract Start *</label>
          <input type="date" required value={fields.contractStart} onChange={set("contractStart")} style={{ ...inputStyle, colorScheme: "dark" }} />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Contract End (optional)</label>
          <input type="date" value={fields.contractEnd} onChange={set("contractEnd")} style={{ ...inputStyle, colorScheme: "dark" }} />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={fields.notes}
          onChange={set("notes")}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Internal notes about this enterprise account…"
        />
      </div>

      {/* Warning banner */}
      <div
        style={{
          background: "rgba(250,204,21,0.08)",
          border: "1px solid rgba(250,204,21,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#fbbf24",
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        Invite email flow not yet configured. The account will be created but no email will be sent.
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#f87171",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 24px",
          background: loading ? "#4a4db8" : "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating…" : "Create Account (invite email coming soon)"}
      </button>
    </form>
  );
}
