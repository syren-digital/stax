"use client";

import { useState } from "react";

const RECIPIENT_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export default function AdminBroadcastPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("all");

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

  return (
    <div style={{ padding: 32, maxWidth: 700, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        Broadcast
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 28 }}>
        Send an email to a segment of your users.
      </p>

      {/* Not configured banner */}
      <div
        style={{
          background: "rgba(250,204,21,0.08)",
          border: "1px solid rgba(250,204,21,0.2)",
          borderRadius: 8,
          padding: "12px 16px",
          color: "#fbbf24",
          fontSize: 13,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>⚠</span>
        Email provider not configured — sending is disabled. Connect an email provider (e.g., Resend, SendGrid) to enable broadcasts.
      </div>

      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 28,
        }}
      >
        {/* Recipients */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Recipients</label>
          <select
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer", colorScheme: "dark" }}
          >
            {RECIPIENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New feature: Share price charts"
            style={inputStyle}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Message Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Write your email message here…"
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
            Plain text. HTML support requires email provider configuration.
          </p>
        </div>

        {/* Preview */}
        {(subject || body) && (
          <div
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <p style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Preview
            </p>
            <p style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
              <strong style={{ color: "#aaa" }}>To:</strong>{" "}
              {RECIPIENT_OPTIONS.find((o) => o.value === recipients)?.label ?? "All Users"}
            </p>
            {subject && (
              <p style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
                <strong style={{ color: "#aaa" }}>Subject:</strong> {subject}
              </p>
            )}
            {body && (
              <p style={{ color: "#ccc", fontSize: 13, whiteSpace: "pre-wrap" }}>{body}</p>
            )}
          </div>
        )}

        {/* Send button */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            disabled
            title="Email provider not configured"
            style={{
              padding: "10px 24px",
              background: "rgba(99,102,241,0.2)",
              color: "#6366f1",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.6,
            }}
          >
            Send Broadcast — Email provider not configured
          </button>
        </div>
      </div>
    </div>
  );
}
