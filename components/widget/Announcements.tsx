"use client";

import { useState } from "react";
import type { Announcement } from "@/lib/morningstar";

const PAGE_SIZE = 10;

interface AnnouncementsProps {
  items: Announcement[];
  primaryColor: string;
}

export function Announcements({ items, primaryColor }: AnnouncementsProps) {
  const years = Array.from(
    new Set(items.map((a) => new Date(a.date).getFullYear())),
  ).sort((a, b) => b - a);

  const [activeYear, setActiveYear] = useState(years[0] ?? new Date().getFullYear());
  const [page, setPage] = useState(0);

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">No recent announcements</p>;
  }

  const yearItems = items.filter((a) => new Date(a.date).getFullYear() === activeYear);
  const totalPages = Math.ceil(yearItems.length / PAGE_SIZE);
  const pageItems = yearItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function selectYear(year: number) {
    setActiveYear(year);
    setPage(0);
  }

  return (
    <div>
      {/* Year tabs */}
      <div className="mb-4 flex flex-wrap gap-1">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => selectYear(year)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
            style={
              activeYear === year
                ? { background: primaryColor, color: "#fff" }
                : { background: "rgba(0,0,0,0.06)", color: "#6b7280" }
            }
          >
            {year}
          </button>
        ))}
      </div>

      {/* Announcements list */}
      <ul className="space-y-3">
        {pageItems.map((item, i) => (
          <li key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              {item.headline}
            </a>
            <time className="mt-0.5 block text-xs text-gray-400">
              {new Date(item.date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all disabled:opacity-30"
            style={{ background: "rgba(0,0,0,0.06)", color: "#6b7280" }}
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all disabled:opacity-30"
            style={{ background: "rgba(0,0,0,0.06)", color: "#6b7280" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
