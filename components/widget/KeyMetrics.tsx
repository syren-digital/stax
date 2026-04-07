import type { Metrics } from "@/lib/morningstar";

interface KeyMetricsProps {
  metrics: Metrics;
}

export function KeyMetrics({ metrics }: KeyMetricsProps) {
  const items: Array<{ label: string; value: string }> = [
    { label: "Market Cap", value: metrics.marketCap },
    { label: "P/E Ratio", value: metrics.pe },
    { label: "Volume", value: metrics.volume },
    { label: "52W High", value: metrics.week52High },
    { label: "52W Low", value: metrics.week52Low },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs text-gray-500">{label}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-gray-900">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
