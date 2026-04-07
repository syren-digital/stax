"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const body = await res.json() as { error?: string };
      setError(body.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const { id } = await res.json() as { id: string };
    router.push(`/dashboard/stax/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          Stax name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. BHP Investor Relations"
          required
          maxLength={100}
          className="block w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "var(--text)",
          }}
        />
      </div>

      {error && (
        <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "rgba(255,80,80,0.12)", color: "#ff8080" }}>{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || name.trim().length === 0}
          className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 accent-glow"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          {loading ? "Creating…" : "Create Stax"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:bg-white/10"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
