"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIERS = ["starter", "growth", "pro", "enterprise"] as const;
type Tier = (typeof TIERS)[number];

export function TierUpdateForm({
  orgId,
  currentTier,
}: {
  orgId: string;
  currentTier: string;
}) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>((currentTier as Tier) ?? "starter");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${orgId}/tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        setMessage("Tier updated successfully.");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Failed to update tier.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "#888",
          marginBottom: 6,
        }}
      >
        New Tier
      </label>
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value as Tier)}
        style={{
          width: "100%",
          padding: "9px 12px",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 8,
          color: "#fff",
          fontSize: 14,
          marginBottom: 12,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {TIERS.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      {message && (
        <p
          style={{
            fontSize: 12,
            color: message.includes("success") ? "#4ade80" : "#f87171",
            marginBottom: 10,
          }}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "9px 18px",
          background: loading ? "#4a4db8" : "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Updating…" : "Update Tier"}
      </button>
    </form>
  );
}
