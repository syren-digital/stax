"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 16,
          padding: "40px 36px",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.1em",
            }}
          >
            STAX ADMIN
          </span>
          <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
            Internal admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 13,
                color: "#aaa",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#333")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 13,
                color: "#aaa",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#333")}
            />
          </div>

          {/* Error */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              background: loading ? "#4a4db8" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
