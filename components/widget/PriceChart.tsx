"use client";

import type { OhlcBar } from "@/lib/morningstar";

interface PriceChartProps {
  data: OhlcBar[];
  primaryColor: string;
  labelColor?: string;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function niceStep(range: number): number {
  const rough = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 2.5) return 2.5 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

export function PriceChart({ data, primaryColor, labelColor = "#6b7280" }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        No chart data available
      </div>
    );
  }

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  // Layout
  const totalWidth = 600;
  const totalHeight = 180;
  const padLeft = 56;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 24;

  const chartW = totalWidth - padLeft - padRight;
  const chartH = totalHeight - padTop - padBottom;

  function xOf(i: number) {
    return padLeft + (i / (data.length - 1)) * chartW;
  }
  function yOf(close: number) {
    return padTop + ((max - close) / range) * chartH;
  }

  const points = data.map((d, i) => `${xOf(i)},${yOf(d.close)}`).join(" ");
  const firstX = xOf(0);
  const lastX = xOf(data.length - 1);
  const areaPoints = `${firstX},${padTop + chartH} ${points} ${lastX},${padTop + chartH}`;

  // 8 evenly distributed date labels
  const DATE_COUNT = 8;
  const dateLabels = Array.from({ length: DATE_COUNT }, (_, i) => {
    const idx = Math.round((i * (data.length - 1)) / (DATE_COUNT - 1));
    return { i: idx, label: fmtDate(data[idx].date) };
  });

  // 5 round-number price labels
  const step = niceStep(range);
  const firstTick = Math.ceil(min / step) * step;
  const priceLabels: { value: number; y: number }[] = [];
  for (let i = 0; priceLabels.length < 7; i++) {
    const value = parseFloat((firstTick + i * step).toFixed(10));
    if (value > max + step * 0.01) break;
    const y = yOf(value);
    if (y >= padTop - 1 && y <= padTop + chartH + 1) {
      priceLabels.push({ value, y });
    }
  }

  const labelStyle = { fontSize: 8, fill: labelColor, fontFamily: "sans-serif" };

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full"
        aria-label="Price chart"
        role="img"
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {priceLabels.map(({ value, y }) => (
          <line
            key={value}
            x1={padLeft}
            x2={padLeft + chartW}
            y1={y}
            y2={y}
            stroke={labelColor}
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#chartFill)" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Y-axis price labels */}
        {priceLabels.map(({ value, y }) => (
          <text
            key={value}
            x={padLeft - 5}
            y={y + 4}
            textAnchor="end"
            style={labelStyle}
          >
            {fmtPrice(value)}
          </text>
        ))}

        {/* X-axis date labels */}
        {dateLabels.map(({ i, label }) => (
          <text
            key={i}
            x={xOf(i)}
            y={totalHeight - 4}
            textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            style={labelStyle}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
