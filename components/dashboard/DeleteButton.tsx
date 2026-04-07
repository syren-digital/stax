"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  name: string;
  deleteUrl: string;
  redirectTo?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DeleteButton({ name, deleteUrl, redirectTo, label, className, style }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(deleteUrl, { method: "DELETE" });
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={className}
        style={style}
        title={`Delete ${name}`}
      >
        <Trash2 size={15} strokeWidth={1.5} />
        {label && <span className="ml-1.5">{label}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="glass mx-4 w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Are you sure?
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text)" }}>{name}</strong>? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
