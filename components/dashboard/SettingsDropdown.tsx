"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, Sun, Moon } from "lucide-react";

export function SettingsDropdown() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const ref = useRef<HTMLDivElement>(null);

  // Initialise from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("light", stored === "light");
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    localStorage.setItem("theme", next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10"
        style={{
          color: open ? "var(--accent)" : "var(--text-muted)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        aria-label="Settings"
      >
        <Settings size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-xl z-50"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="px-3 pt-1 pb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Settings
          </p>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: "var(--text)" }}
          >
            <span className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Moon size={15} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              ) : (
                <Sun size={15} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              )}
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            {/* Pill toggle */}
            <div
              className="relative h-5 w-9 rounded-full transition-all"
              style={{ background: theme === "dark" ? "var(--accent)" : "rgba(255,255,255,0.15)" }}
            >
              <div
                className="absolute top-0.5 h-4 w-4 rounded-full transition-all"
                style={{
                  background: theme === "dark" ? "var(--bg)" : "var(--text-muted)",
                  left: theme === "dark" ? "calc(100% - 1.125rem)" : "0.125rem",
                }}
              />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
