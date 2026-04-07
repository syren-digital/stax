"use client";

import { useRouter, usePathname } from "next/navigation";
import { RANGE_OPTIONS, type RangeValue } from "@/lib/ranges";

export { RANGE_OPTIONS, type RangeValue };

export function DateRangePicker({ value }: { value: RangeValue }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={value}
      onChange={(e) => router.push(`${pathname}?range=${e.target.value}`)}
      style={{
        background: "var(--bg-raised)",
        color: "var(--text)",
        border: "1px solid var(--glass-border)",
        borderRadius: "0.5rem",
        padding: "6px 12px",
        fontSize: "0.875rem",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
