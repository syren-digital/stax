/**
 * Market data provider: EODHD (free tier)
 *
 * Live endpoints used:
 *   Real-time price  — https://eodhd.com/api/real-time/{TICKER}.AU
 *   Historical OHLC  — https://eodhd.com/api/eod/{TICKER}.AU
 *   Announcements    — https://www.asx.com.au/asx/1/company/{TICKER}/announcements (free, unrestricted)
 *
 * Fundamentals are stubbed — the EODHD free tier blocks /api/fundamentals.
 * TODO: Remove stub when EODHD paid plan is active and replace with live /api/fundamentals calls.
 */

import { z } from "zod";
import {
  getCached,
  setCached,
  tickerCacheKey,
  tickerCacheTtl,
} from "./cache";

const EODHD_BASE = "https://eodhd.com/api";
const ASX_BASE = "https://www.asx.com.au/asx/1/company";

// ---------------------------------------------------------------------------
// Zod schemas (unchanged — widget components depend on this shape)
// ---------------------------------------------------------------------------

export const PriceSchema = z.object({
  current: z.number(),
  change: z.number(),
  changePercent: z.number(),
  currency: z.string().default("AUD"),
});

export const OhlcBarSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

export const AnnouncementSchema = z.object({
  headline: z.string(),
  date: z.string(),
  url: z.string(),
});

export const MetricsSchema = z.object({
  marketCap: z.string(),
  pe: z.string(),
  volume: z.string(),
  week52High: z.string(),
  week52Low: z.string(),
});

export const TickerDataSchema = z.object({
  ticker: z.string(),
  price: PriceSchema,
  chart: z.array(OhlcBarSchema),
  announcements: z.array(AnnouncementSchema),
  metrics: MetricsSchema,
  lastUpdated: z.string(),
});

export type TickerData = z.infer<typeof TickerDataSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type OhlcBar = z.infer<typeof OhlcBarSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function apiKey(): string {
  return process.env.EODHD_API_KEY ?? "";
}

/** Compute the YYYY-MM-DD `from` date for a given chart range. */
function fromDate(range: string): string {
  const days: Record<string, number> = {
    "5y": 1825,
    "3y": 1095,
    "2y": 730,
    "1y": 365,
    "6m": 180,
    "3m": 90,
    "1m": 30,
  };
  const d = new Date();
  d.setDate(d.getDate() - (days[range] ?? 365));
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// EODHD fetch helpers
// ---------------------------------------------------------------------------

async function eohdGet<T>(path: string): Promise<T> {
  const res = await fetch(`${EODHD_BASE}${path}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`EODHD error: ${res.status} — ${path}`);
  }
  return res.json() as Promise<T>;
}

interface EodhdRealTime {
  close: number;
  change: number;
  change_p: number;
  volume: number;
}

interface EodhdOhlcBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchRealTime(ticker: string): Promise<EodhdRealTime> {
  return eohdGet<EodhdRealTime>(
    `/real-time/${ticker}.AU?api_token=${apiKey()}&fmt=json`,
  );
}

async function fetchHistory(ticker: string, range: string): Promise<EodhdOhlcBar[]> {
  return eohdGet<EodhdOhlcBar[]>(
    `/eod/${ticker}.AU?api_token=${apiKey()}&from=${fromDate(range)}&fmt=json`,
  );
}

// ---------------------------------------------------------------------------
// ASX announcements (free, unrestricted public endpoint)
// ---------------------------------------------------------------------------

interface AsxAnnouncement {
  header?: string;
  document_date?: string;
  url?: string;
}

interface AsxAnnouncementsResponse {
  data?: AsxAnnouncement[];
}

async function fetchAsxAnnouncements(ticker: string): Promise<Announcement[]> {
  try {
    const res = await fetch(
      `${ASX_BASE}/${ticker.toUpperCase()}/announcements?count=20&market_sensitive=false`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      },
    );
    if (!res.ok) return [];

    const json = (await res.json()) as AsxAnnouncementsResponse;
    const items = json.data ?? [];

    return items
      .filter((a) => a.header && a.document_date)
      .map((a) => ({
        headline: a.header!,
        date: a.document_date!.slice(0, 10),
        url: a.url ?? `https://www.asx.com.au/asx/1/company/${ticker.toUpperCase()}/announcements`,
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// validateTicker — used when creating a new widget
// ---------------------------------------------------------------------------

export async function validateTicker(ticker: string): Promise<boolean> {
  try {
    const data = await fetchRealTime(ticker);
    return typeof data.close === "number" && data.close > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Mock data — used when EODHD_API_KEY is absent or set to "placeholder"
// ---------------------------------------------------------------------------

const RANGE_BARS: Record<string, number> = {
  "5y": 260, "3y": 156, "2y": 104, "1y": 52, "6m": 26, "3m": 13, "1m": 30,
};

function mockTickerData(ticker: string, range = "1y"): TickerData {
  const base = 40 + Math.random() * 20;
  const bars = RANGE_BARS[range] ?? 52;
  const intervalMs = range === "1m" ? 86400000 : 7 * 86400000;
  return {
    ticker: ticker.toUpperCase(),
    price: { current: parseFloat(base.toFixed(2)), change: 0.45, changePercent: 1.01, currency: "AUD" },
    chart: Array.from({ length: bars }, (_, i) => ({
      date: new Date(Date.now() - (bars - 1 - i) * intervalMs).toISOString().slice(0, 10),
      open: parseFloat((base + Math.random() * 4 - 2).toFixed(2)),
      high: parseFloat((base + Math.random() * 4).toFixed(2)),
      low: parseFloat((base - Math.random() * 4).toFixed(2)),
      close: parseFloat((base + Math.random() * 4 - 2).toFixed(2)),
    })),
    announcements: [
      { headline: "FY2026 Half Year Results", date: "2026-02-20", url: "#" },
      { headline: "Quarterly Activities Report — Q1 2026", date: "2026-01-15", url: "#" },
      { headline: "FY2025 Full Year Results — Record NPAT of $2.1B", date: "2025-08-22", url: "#" },
      { headline: "Quarterly Activities Report — Q3 2025", date: "2025-07-18", url: "#" },
      { headline: "Investor Day Presentation", date: "2025-06-10", url: "#" },
      { headline: "Half Year Results FY2025", date: "2025-02-19", url: "#" },
      { headline: "Quarterly Activities Report — Q1 2025", date: "2025-01-14", url: "#" },
      { headline: "FY2024 Full Year Results", date: "2024-08-21", url: "#" },
      { headline: "Quarterly Activities Report — Q3 2024", date: "2024-07-17", url: "#" },
      { headline: "Investor Day Presentation 2024", date: "2024-06-05", url: "#" },
      { headline: "Half Year Results FY2024", date: "2024-02-21", url: "#" },
      { headline: "Quarterly Activities Report — Q1 2024", date: "2024-01-16", url: "#" },
      { headline: "FY2023 Full Year Results", date: "2023-08-23", url: "#" },
      { headline: "Quarterly Activities Report — Q3 2023", date: "2023-07-19", url: "#" },
      { headline: "Half Year Results FY2023", date: "2023-02-22", url: "#" },
    ],
    metrics: {
      marketCap: "$245.3B",
      pe: "14.2",
      volume: "12,450,000",
      week52High: "$48.90",
      week52Low: "$38.20",
    },
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// getTickerData — main entry point called by widget routes
// ---------------------------------------------------------------------------

export async function getTickerData(ticker: string, range = "1y"): Promise<TickerData> {
  const key = apiKey();
  if (!key || key === "placeholder") {
    return mockTickerData(ticker, range);
  }

  const cacheKey = tickerCacheKey(ticker, `eodhd-${range}`);
  const ttl = tickerCacheTtl();

  const cached = await getCached<TickerData>(cacheKey);
  if (cached) return cached;

  const [realTime, history, announcements] = await Promise.all([
    fetchRealTime(ticker),
    fetchHistory(ticker, range),
    fetchAsxAnnouncements(ticker),
  ]);

  // TODO: Remove stub when EODHD paid plan is active and replace with live
  // /api/fundamentals/{TICKER}.AU?api_token={KEY}&filter=Highlights,Technicals calls.
  const fundamentalsStub = {
    marketCap: "Unavailable (upgrade plan)",
    pe: "--",
    week52High: "--",
    week52Low: "--",
  };

  const data: TickerData = {
    ticker: ticker.toUpperCase(),
    price: {
      current: realTime.close,
      change: realTime.change,
      changePercent: realTime.change_p,
      currency: "AUD",
    },
    chart: history.map((bar) => ({
      date: bar.date,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    })),
    announcements,
    metrics: {
      ...fundamentalsStub,
      volume: realTime.volume.toLocaleString("en-AU"),
    },
    lastUpdated: new Date().toISOString(),
  };

  await setCached(cacheKey, data, ttl);
  return data;
}
