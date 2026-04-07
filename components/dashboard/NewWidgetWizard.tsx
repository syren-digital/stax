"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WIDGET_TYPES = [
  {
    value: "share_price_number" as const,
    label: "Share Price",
    description: "Live price with daily change",
    icon: "💲",
  },
  {
    value: "share_price_chart" as const,
    label: "Price Chart",
    description: "12-month line chart",
    icon: "📈",
  },
  {
    value: "announcements" as const,
    label: "Announcements",
    description: "Latest ASX announcements",
    icon: "📢",
  },
];

const FONTS = ["Inter", "Roboto", "Lato", "Poppins", "Merriweather"];

type WidgetType = "share_price_number" | "share_price_chart" | "announcements";

interface NewWidgetWizardProps {
  projectId: string;
}

export function NewWidgetWizard({ projectId }: NewWidgetWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<WidgetType | null>(null);
  const [ticker, setTicker] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1a56db");
  const [secondaryColor, setSecondaryColor] = useState("#e1effe");
  const [labelColor, setLabelColor] = useState("#6b7280");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeSelect(t: WidgetType) {
    setType(t);
    setStep(2);
  }

  function handleTickerNext(e: React.FormEvent) {
    e.preventDefault();
    if (ticker.trim().length >= 2) setStep(3);
  }

  async function handleCreate() {
    if (!type) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/widgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ticker: ticker.trim().toUpperCase(),
          primaryColor,
          secondaryColor,
          labelColor,
          fontFamily,
        }),
      });

      const text = await res.text();
      const body = text ? JSON.parse(text) as Record<string, unknown> : {};

      if (!res.ok) {
        setError((body.error as string) ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/stax/${projectId}/widgets/${body.id as string}`);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all"
              style={
                step >= s
                  ? { background: "var(--accent)", color: "var(--bg)" }
                  : { background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }
              }
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className="h-px w-8 transition-all"
                style={{ background: step > s ? "var(--accent)" : "rgba(255,255,255,0.12)" }}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm" style={{ color: "var(--text-muted)" }}>
          {step === 1 ? "Widget type" : step === 2 ? "Ticker" : "Styling"}
        </span>
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WIDGET_TYPES.map((wt) => (
            <button
              key={wt.value}
              onClick={() => handleTypeSelect(wt.value)}
              className="glass-sm p-6 text-left transition-all hover:border-white/25"
            >
              <span className="text-3xl">{wt.icon}</span>
              <p className="mt-3 font-semibold" style={{ color: "var(--text)" }}>{wt.label}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{wt.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Ticker */}
      {step === 2 && (
        <form onSubmit={handleTickerNext} className="max-w-sm space-y-5">
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>
              ASX Ticker
            </label>
            <input
              id="ticker"
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. BHP"
              maxLength={6}
              required
              className="block w-full rounded-xl px-4 py-2.5 text-sm uppercase tracking-widest focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={ticker.trim().length < 2}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 accent-glow"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-muted)" }}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Styling */}
      {step === 3 && (
        <div className="max-w-md space-y-5">
          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Primary colour</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border-0"
            />
            <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>{primaryColor}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Secondary colour</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border-0"
            />
            <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>{secondaryColor}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Labels colour</label>
            <input
              type="color"
              value={labelColor}
              onChange={(e) => setLabelColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border-0"
            />
            <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>{labelColor}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--text)",
              }}
            >
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {error && (
            <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "rgba(255,80,80,0.12)", color: "#ff8080" }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 accent-glow"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              {loading ? "Creating…" : "Create widget"}
            </button>
            <button
              onClick={() => setStep(2)}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-muted)" }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
