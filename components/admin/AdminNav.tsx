"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/enterprise", label: "Enterprise" },
  { href: "/admin/broadcast", label: "Broadcast" },
];

export function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "0 0 24px 0",
      }}
    >
      {/* Nav links */}
      <div style={{ flex: 1, padding: "8px 12px" }}>
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "9px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#6366f1" : "#888",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout button */}
      <div style={{ padding: "0 12px" }}>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "9px 14px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 400,
            color: "#666",
            background: "transparent",
            border: "1px solid #2a2a2a",
            cursor: "pointer",
            textAlign: "left",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = "#f87171";
            (e.target as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = "#666";
            (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a";
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
