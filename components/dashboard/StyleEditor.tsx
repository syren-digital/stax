"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FONTS = ["Inter", "Roboto", "Lato", "Poppins", "Merriweather"];
const CHART_RANGES = [
  { value: "5y", label: "5 years" },
  { value: "3y", label: "3 years" },
  { value: "2y", label: "2 years" },
  { value: "1y", label: "1 year" },
  { value: "6m", label: "6 months" },
  { value: "3m", label: "3 months" },
  { value: "1m", label: "1 month" },
];

interface StyleEditorProps {
  projectId: string;
  widgetId: string;
  widgetType: string;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
  initialLabelColor: string;
  initialFontFamily: string;
  initialChartRange: string;
}

export function StyleEditor({
  projectId,
  widgetId,
  widgetType,
  initialPrimaryColor,
  initialSecondaryColor,
  initialLabelColor,
  initialFontFamily,
  initialChartRange,
}: StyleEditorProps) {
  const router = useRouter();
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [labelColor, setLabelColor] = useState(initialLabelColor);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [chartRange, setChartRange] = useState(initialChartRange);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/projects/${projectId}/widgets/${widgetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryColor, secondaryColor, labelColor, fontFamily, chartRange }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    window.dispatchEvent(new CustomEvent("widget-saved"));
    router.refresh();
  }

  return (
    <div className="glass p-6 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Styling</h2>

      <div className="flex items-center gap-4">
        <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Primary colour</label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0"
        />
        <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{primaryColor}</span>
      </div>

      <div className="flex items-center gap-4">
        <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Secondary colour</label>
        <input
          type="color"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0"
        />
        <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{secondaryColor}</span>
      </div>

      <div className="flex items-center gap-4">
        <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Labels colour</label>
        <input
          type="color"
          value={labelColor}
          onChange={(e) => setLabelColor(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border-0"
        />
        <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{labelColor}</span>
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
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {widgetType === "share_price_chart" && (
        <div className="flex items-center gap-4">
          <label className="w-36 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Date range</label>
          <select
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text)",
            }}
          >
            {CHART_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 accent-glow"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  );
}
