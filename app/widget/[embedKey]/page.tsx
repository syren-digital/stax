import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTickerData } from "@/lib/morningstar";
import { SharePrice } from "@/components/widget/SharePrice";
import { PriceChart } from "@/components/widget/PriceChart";
import { Announcements } from "@/components/widget/Announcements";

interface Props {
  params: Promise<{ embedKey: string }>;
}

export default async function WidgetPage({ params }: Props) {
  const { embedKey } = await params;

  const widget = await prisma.widget.findUnique({
    where: { embedKey },
    include: {
      project: {
        include: {
          organisation: {
            include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!widget) notFound();

  void prisma.widgetImpression
    .create({ data: { widgetId: widget.id } })
    .catch(() => undefined);

  const data = await getTickerData(widget.ticker, widget.chartRange);

  const subscription = widget.project.organisation.subscriptions[0];
  const showStaxBranding = !subscription || subscription.tier === "starter";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{widget.ticker} — STAX Widget</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(widget.fontFamily)}:wght@400;600;700&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body className="bg-transparent p-3">
        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ fontFamily: `${widget.fontFamily}, sans-serif` }}
        >
          {widget.type === "share_price_number" && (
            <SharePrice ticker={widget.ticker} price={data.price} primaryColor={widget.primaryColor} />
          )}

          {widget.type === "share_price_chart" && (
            <div className="space-y-3">
              <SharePrice ticker={widget.ticker} price={data.price} primaryColor={widget.primaryColor} />
              <PriceChart data={data.chart} primaryColor={widget.primaryColor} labelColor={widget.labelColor} />
            </div>
          )}

          {widget.type === "announcements" && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: widget.primaryColor }}>
                {widget.ticker} — Recent Announcements
              </p>
              <Announcements items={data.announcements} primaryColor={widget.primaryColor} />
            </div>
          )}

          {showStaxBranding && (
            <p className="mt-4 text-center text-xs text-gray-400">
              Powered by <span className="font-semibold">STAX</span>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
