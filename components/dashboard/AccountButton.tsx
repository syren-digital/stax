"use client";

import { useClerk } from "@clerk/nextjs";
import { User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function AccountButton() {
  const { openUserProfile, signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10"
        style={{
          color: open ? "var(--accent)" : "var(--text-muted)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        aria-label="Account"
      >
        <User size={16} strokeWidth={1.5} />
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
            Account
          </p>

          <button
            onClick={() => { setOpen(false); openUserProfile(); }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: "var(--text)" }}
          >
            <User size={15} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            Profile settings
          </button>

          <div
            className="my-2 mx-3"
            style={{ height: "1px", background: "var(--glass-border)" }}
          />

          <p
            className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Security
          </p>

          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: "var(--text)" }}
          >
            <LogOut size={15} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
