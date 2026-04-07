"use client";

export interface WidgetSeries {
  widgetId: string;
  label: string;
  color: string;
  data: { date: string; count: number }[];
}

interface AnalyticsChartProps {
  series: WidgetSeries[];
  dates: string[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

const W = 800;
const H = 280;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const CHART_W = W - PAD_LEFT - PAD_RIGHT;
const CHART_H = H - PAD_TOP - PAD_BOTTOM;

export function AnalyticsChart({ series, dates }: AnalyticsChartProps) {
  if (dates.length === 0 || series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        No impression data yet
      </div>
    );
  }

  const allCounts = series.flatMap((s) => s.data.map((d) => d.count));
  const maxCount = Math.max(...allCounts, 1);
  const n = dates.length;

  function xOf(i: number) {
    return PAD_LEFT + (n === 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W);
  }
  function yOf(count: number) {
    return PAD_TOP + CHART_H - (count / maxCount) * CHART_H;
  }

  // Y-axis labels: 0, mid, max
  const yLabels = [
    { value: maxCount, y: yOf(maxCount) },
    { value: Math.round(maxCount / 2), y: yOf(maxCount / 2) },
    { value: 0, y: yOf(0) },
  ];

  // X-axis labels: first, middle, last
  const xLabels = [
    { i: 0, label: fmtDate(dates[0]) },
    { i: Math.floor((n - 1) / 2), label: fmtDate(dates[Math.floor((n - 1) / 2)]) },
    { i: n - 1, label: fmtDate(dates[n - 1]) },
  ];

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Widget impressions chart">
        {/* Grid lines */}
        {yLabels.map(({ value, y }) => (
          <line key={value} x1={PAD_LEFT} x2={PAD_LEFT + CHART_W} y1={y} y2={y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
        ))}

        {/* Y-axis labels */}
        {yLabels.map(({ value, y }) => (
          <text key={value} x={PAD_LEFT - 6} y={y + 4} textAnchor="end"
            style={{ fontSize: 13, fill: "currentColor", opacity: 0.4, fontFamily: "sans-serif" }}>
            {value}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ i, label }) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            style={{ fontSize: 13, fill: "currentColor", opacity: 0.4, fontFamily: "sans-serif" }}>
            {label}
          </text>
        ))}

        {/* Series lines */}
        {series.map((s) => {
          const countByDate = Object.fromEntries(s.data.map((d) => [d.date, d.count]));
          const points = dates.map((d, i) => `${xOf(i)},${yOf(countByDate[d] ?? 0)}`).join(" ");
          return (
            <polyline key={s.widgetId} points={points} fill="none"
              stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          );
        })}

        {/* Dots on data points */}
        {series.map((s) => {
          const countByDate = Object.fromEntries(s.data.map((d) => [d.date, d.count]));
          return dates.map((d, i) => {
            const count = countByDate[d] ?? 0;
            if (count === 0) return null;
            return (
              <circle key={`${s.widgetId}-${d}`} cx={xOf(i)} cy={yOf(count)} r="6"
                fill={s.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {series.map((s) => (
          <div key={s.widgetId} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
