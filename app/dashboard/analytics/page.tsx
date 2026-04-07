import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnalyticsChart, type WidgetSeries } from "@/components/dashboard/AnalyticsChart";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { RANGE_OPTIONS, type RangeValue } from "@/lib/ranges";
import { BarChart2, Lock } from "lucide-react";

const SERIES_COLORS = [
  "#b5f978", "#60a5fa", "#f472b6", "#fb923c",
  "#a78bfa", "#34d399", "#fbbf24", "#f87171",
];

const TYPE_LABELS: Record<string, string> = {
  share_price_number: "Share Price",
  share_price_chart:  "Price Chart",
  announcements:      "Announcements",
};

const RANGE_DAYS: Record<RangeValue, number> = {
  "5y": 365 * 5,
  "3y": 365 * 3,
  "2y": 365 * 2,
  "1y": 365,
  "6m": 180,
  "3m": 90,
  "1m": 30,
};

function sinceFromRange(range: RangeValue): Date {
  const d = new Date();
  d.setDate(d.getDate() - RANGE_DAYS[range]);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const { range: rawRange } = await searchParams;
  const validValues = RANGE_OPTIONS.map((o) => o.value) as string[];
  const range: RangeValue =
    typeof rawRange === "string" && validValues.includes(rawRange)
      ? (rawRange as RangeValue)
      : "1m";

  const clerkOrgId = orgId ?? userId;

  const organisation = await prisma.organisation.findUnique({
    where: { clerkOrgId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const subscription = organisation?.subscriptions[0];
  const isPro =
    (subscription?.status === "active" || subscription?.status === "trialing") &&
    (subscription.tier === "pro" || subscription.tier === "enterprise");

  // --- Pro gate ---
  if (!isPro) {
    return (
      <div className="px-6 pb-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="pt-2 pb-4">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Analytics</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Widget impression data</p>
          </div>
          <div className="glass flex flex-col items-center justify-center py-24 text-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.1)" }}
            >
              <Lock size={22} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: "var(--text)" }}>Pro feature</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Upgrade to Pro to access analytics and impression data
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 accent-glow"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              View plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Data for pro users ---
  const since = sinceFromRange(range);
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "30 days";

  const widgets = await prisma.widget.findMany({
    where: { project: { organisation: { clerkOrgId } } },
    include: {
      impressions: {
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Build date array from first impression (or range start) to today
  const allImpressionDates = widgets.flatMap((w) =>
    w.impressions.map((imp) => imp.createdAt.toISOString().slice(0, 10))
  );
  const earliestDate = allImpressionDates.length > 0
    ? allImpressionDates.reduce((a, b) => (a < b ? a : b))
    : since.toISOString().slice(0, 10);

  const startDate = new Date(earliestDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= today) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Build series per widget
  const series: WidgetSeries[] = widgets.map((w, idx) => {
    const countByDate: Record<string, number> = {};
    for (const imp of w.impressions) {
      const day = imp.createdAt.toISOString().slice(0, 10);
      countByDate[day] = (countByDate[day] ?? 0) + 1;
    }
    return {
      widgetId: w.id,
      label: `${w.ticker} — ${TYPE_LABELS[w.type] ?? w.type}`,
      color: SERIES_COLORS[idx % SERIES_COLORS.length],
      data: Object.entries(countByDate).map(([date, count]) => ({ date, count })),
    };
  });

  // Stat cards
  const totalImpressions = widgets.reduce((acc, w) => acc + w.impressions.length, 0);
  const topWidget = widgets.reduce(
    (top, w) => (w.impressions.length > (top?.impressions.length ?? -1) ? w : top),
    widgets[0],
  );

  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex items-center justify-between pt-2 pb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Analytics</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Last {rangeLabel}</p>
          </div>
          <DateRangePicker value={range} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass p-6 flex flex-col justify-between min-h-[140px]">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.12)" }}
            >
              <BarChart2 size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-4xl font-bold" style={{ color: "var(--text)" }}>{totalImpressions}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Total impressions</p>
            </div>
          </div>

          <div className="glass p-6 flex flex-col justify-between min-h-[140px]">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.12)" }}
            >
              <BarChart2 size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-4xl font-bold" style={{ color: "var(--text)" }}>{widgets.length}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Active widgets</p>
            </div>
          </div>

          <div className="glass p-6 flex flex-col justify-between min-h-[140px]">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(181,249,120,0.12)" }}
            >
              <BarChart2 size={18} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-lg font-bold truncate" style={{ color: "var(--text)" }}>
                {topWidget ? `${topWidget.ticker} — ${TYPE_LABELS[topWidget.type]}` : "—"}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Top widget</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Impressions over time
          </h2>
          <AnalyticsChart series={series} dates={dates} />
        </div>

        {/* Per-widget table */}
        <div className="glass p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Per widget
          </h2>
          <div className="space-y-2">
            {widgets.map((w, idx) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ background: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {w.ticker} — {TYPE_LABELS[w.type] ?? w.type}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  {w.impressions.length} views
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
