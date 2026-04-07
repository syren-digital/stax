"use client";

import { useEffect, useState } from "react";
import { StaxLogo } from "./StaxLogo";
import { PillNav } from "./NavLink";
import { AccountButton } from "./AccountButton";
import { SettingsDropdown } from "./SettingsDropdown";

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div
          style={{
            background: scrolled ? "var(--bg-raised)" : "transparent",
            borderTop: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
            borderRight: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
            borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
            borderLeft: "none",
            borderRadius: "0px 50px 50px 0px",
            padding: scrolled ? "10px 16px 10px 0" : "10px 0",
            transition: "background 0.3s, border-color 0.3s, padding 0.3s",
          }}
        >
          <StaxLogo style={{ height: 24, width: "auto", color: "var(--text)" }} />
        </div>

        <PillNav />

        <div className="flex items-center gap-2">
          <SettingsDropdown />
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
