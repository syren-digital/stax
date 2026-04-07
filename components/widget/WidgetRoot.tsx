import type { TickerData } from "@/lib/morningstar";
import { SharePrice } from "./SharePrice";
import { PriceChart } from "./PriceChart";
import { Announcements } from "./Announcements";
import { KeyMetrics } from "./KeyMetrics";

interface WidgetRootProps {
  data: TickerData;
  config: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    showSharePrice: boolean;
    showPriceChart: boolean;
    showAnnouncements: boolean;
    showKeyMetrics: boolean;
  };
  staxBranding?: boolean;
}

export function WidgetRoot({ data, config, staxBranding = false }: WidgetRootProps) {
  return (
    <div
      className="flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm"
      style={
        {
          "--primary": config.primaryColor,
          "--secondary": config.secondaryColor,
          fontFamily: `${config.fontFamily}, sans-serif`,
        } as React.CSSProperties
      }
    >
      {config.showSharePrice && (
        <SharePrice
          ticker={data.ticker}
          price={data.price}
          primaryColor={config.primaryColor}
        />
      )}

      {config.showPriceChart && (
        <PriceChart data={data.chart} primaryColor={config.primaryColor} />
      )}

      {config.showKeyMetrics && <KeyMetrics metrics={data.metrics} />}

      {config.showAnnouncements && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Recent Announcements
          </h3>
          <Announcements
            items={data.announcements}
            primaryColor={config.primaryColor}
          />
        </div>
      )}

      {staxBranding && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-gray-500">STAX</span>
        </p>
      )}
    </div>
  );
}
