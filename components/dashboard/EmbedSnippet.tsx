"use client";

import { useState } from "react";

interface EmbedSnippetProps {
  embedKey: string;
  widgetType: string;
}

export function EmbedSnippet({ embedKey, widgetType }: EmbedSnippetProps) {
  const [copied, setCopied] = useState<"iframe" | "json" | null>(null);
  const [tab, setTab] = useState<"iframe" | "json">("iframe");

  const iframeHeight = widgetType === "share_price_number" ? 200 : 600;
  const iframeSnippet = `<iframe src="https://widget.stax.id.au/${embedKey}" width="100%" height="${iframeHeight}" frameborder="0" scrolling="no"></iframe>`;
  const jsonEndpoint = `https://api.stax.id.au/v1/data/${embedKey}`;

  async function copy(type: "iframe" | "json") {
    await navigator.clipboard.writeText(type === "iframe" ? iframeSnippet : jsonEndpoint);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="glass p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Embed</h2>

      <div className="flex gap-1 p-1 rounded-full w-fit" style={{ background: "rgba(255,255,255,0.06)" }}>
        {(["iframe", "json"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
            style={
              tab === t
                ? { background: "var(--accent)", color: "var(--bg)" }
                : { color: "var(--text-muted)" }
            }
          >
            {t === "iframe" ? "iFrame" : "JSON API"}
          </button>
        ))}
      </div>

      <div className="relative">
        <code
          className="block rounded-xl p-4 text-xs break-all whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.3)", color: "var(--text-muted)" }}
        >
          {tab === "iframe" ? iframeSnippet : jsonEndpoint}
        </code>
        <button
          onClick={() => copy(tab)}
          className="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: "rgba(255,255,255,0.1)", color: "var(--text)" }}
        >
          {copied === tab ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
