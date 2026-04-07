import type { Price } from "@/lib/morningstar";

interface SharePriceProps {
  ticker: string;
  price: Price;
  primaryColor: string;
}

export function SharePrice({ ticker, price, primaryColor }: SharePriceProps) {
  const isPositive = price.change >= 0;
  const sign = isPositive ? "+" : "";
  const arrow = isPositive ? "▲" : "▼";
  const changeColor = isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center justify-between">
      <div>
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          {ticker}
        </span>
        <p className="text-3xl font-bold text-gray-900">
          ${price.current.toFixed(2)}{" "}
          <span className="text-sm font-normal text-gray-500">
            {price.currency}
          </span>
        </p>
      </div>
      <div className={`text-right text-sm font-medium ${changeColor}`}>
        <p>
          {arrow} {sign}
          {price.change.toFixed(2)}
        </p>
        <p>
          {sign}
          {price.changePercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
