"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, BarChart2, CreditCard } from "lucide-react";

const NAV = [
  { href: "/dashboard",            label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stax",       label: "Stax",      icon: FolderKanban },
  { href: "/dashboard/analytics",  label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/profile",    label: "Billing",   icon: CreditCard },
];

export function PillNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 px-2 py-2 rounded-full" style={{ background: "var(--bg-raised)", border: "1px solid var(--glass-border)" }}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all uppercase tracking-wider"
            style={{
              fontFamily: '"roboto-mono", monospace',
              ...(isActive
                ? { background: "rgba(181,249,120,0.15)", color: "var(--accent)" }
                : { color: "var(--text-muted)" }),
            }}
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
