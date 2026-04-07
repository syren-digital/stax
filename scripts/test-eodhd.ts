/**
 * EODHD API validation script
 * Tests four endpoints against BHP and CBA to confirm data quality before
 * committing to EODHD as the STAX market data provider.
 *
 * Run: npx tsx scripts/test-eodhd.ts
 */

import "dotenv/config";

const API_KEY = process.env.EODHD_API_KEY;
if (!API_KEY) {
  console.error("EODHD_API_KEY is not set in .env");
  process.exit(1);
}

const TICKERS = ["BHP", "CBA"];
const FROM_DATE = "2024-04-07";

// ─── Field trackers ───────────────────────────────────────────────────────────

const FIELDS = [
  "current_price",
  "price_change_dollar",
  "price_change_percent",
  "market_cap",
  "pe_ratio",
  "52_week_high",
  "52_week_low",
  "daily_volume",
  "historical_ohlc_array",
  "announcement_headline",
  "announcement_date",
  "announcement_url",
] as const;

type Field = (typeof FIELDS)[number];

const found = new Set<Field>();
const missing = new Set<Field>(FIELDS);

function mark(field: Field, value: unknown) {
  const present = value !== null && value !== undefined && value !== "" && value !== 0;
  if (present) {
    found.add(field);
    missing.delete(field);
  }
  return present;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchJson(url: string): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const res = await fetch(url);
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, data: null, error: String(err) };
  }
}

function sep(title: string) {
  console.log("\n" + "═".repeat(70));
  console.log(`  ${title}`);
  console.log("═".repeat(70));
}

function check(label: string, value: unknown) {
  const present = value !== null && value !== undefined && value !== "" && value !== 0;
  const tag = present ? "✔" : "✘";
  console.log(`  ${tag}  ${label}: ${present ? JSON.stringify(value) : "MISSING / NULL"}`);
}

// ─── 1. Real-time / delayed price ─────────────────────────────────────────────

async function testRealTime(ticker: string) {
  sep(`[1] REAL-TIME PRICE — ${ticker}.AU`);
  const url = `https://eodhd.com/api/real-time/${ticker}.AU?api_token=${API_KEY}&fmt=json`;
  console.log(`  URL: ${url.replace(API_KEY!, "***")}\n`);

  const { ok, data, error } = await fetchJson(url);
  console.log(`  Status: ${ok ? "✔ SUCCESS" : "✘ FAILED"}${error ? " — " + error : ""}`);
  console.log("\n  Raw response:");
  console.log(JSON.stringify(data, null, 2));

  if (ok && data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    console.log("\n  STAX field extraction:");
    check("current_price  (close)", d.close);
    check("price_change_$  (change)", d.change);
    check("price_change_%  (change_p)", d.change_p);
    check("daily_volume  (volume)", d.volume);

    mark("current_price", d.close);
    mark("price_change_dollar", d.change);
    mark("price_change_percent", d.change_p);
    mark("daily_volume", d.volume);
  }
}

// ─── 2. Historical OHLC ───────────────────────────────────────────────────────

async function testHistorical(ticker: string) {
  sep(`[2] HISTORICAL OHLC (12-month) — ${ticker}.AU`);
  const url = `https://eodhd.com/api/eod/${ticker}.AU?api_token=${API_KEY}&from=${FROM_DATE}&fmt=json`;
  console.log(`  URL: ${url.replace(API_KEY!, "***")}\n`);

  const { ok, data, error } = await fetchJson(url);
  console.log(`  Status: ${ok ? "✔ SUCCESS" : "✘ FAILED"}${error ? " — " + error : ""}`);

  if (ok && Array.isArray(data)) {
    console.log(`\n  Array length: ${data.length} candles`);
    console.log("\n  First record:");
    console.log(JSON.stringify(data[0], null, 2));
    console.log("\n  Last record:");
    console.log(JSON.stringify(data[data.length - 1], null, 2));

    const first = data[0] as Record<string, unknown> | undefined;
    console.log("\n  STAX field extraction:");
    check("historical_ohlc_array  (array present)", data.length > 0);
    check("  → date", first?.date);
    check("  → open", first?.open);
    check("  → high", first?.high);
    check("  → low", first?.low);
    check("  → close", first?.close);
    check("  → volume", first?.volume);

    mark("historical_ohlc_array", data.length > 0 ? data : null);
  } else {
    console.log("\n  Raw response:");
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── 3. Fundamentals ─────────────────────────────────────────────────────────

async function testFundamentals(ticker: string) {
  sep(`[3] FUNDAMENTALS — ${ticker}.AU`);
  const url = `https://eodhd.com/api/fundamentals/${ticker}.AU?api_token=${API_KEY}&filter=General,Highlights,Technicals`;
  console.log(`  URL: ${url.replace(API_KEY!, "***")}\n`);

  const { ok, data, error } = await fetchJson(url);
  console.log(`  Status: ${ok ? "✔ SUCCESS" : "✘ FAILED"}${error ? " — " + error : ""}`);
  console.log("\n  Raw response:");
  console.log(JSON.stringify(data, null, 2));

  if (ok && data && typeof data === "object") {
    const d = data as Record<string, Record<string, unknown>>;
    const h = d.Highlights ?? {};
    const t = d.Technicals ?? {};

    console.log("\n  STAX field extraction:");
    check("market_cap  (Highlights.MarketCapitalization)", h.MarketCapitalization);
    check("pe_ratio  (Highlights.PERatio)", h.PERatio);
    check("52_week_high  (Technicals.52WeekHigh)", t["52WeekHigh"]);
    check("52_week_low   (Technicals.52WeekLow)", t["52WeekLow"]);

    mark("market_cap", h.MarketCapitalization);
    mark("pe_ratio", h.PERatio);
    mark("52_week_high", t["52WeekHigh"]);
    mark("52_week_low", t["52WeekLow"]);
  }
}

// ─── 4. News / Announcements ──────────────────────────────────────────────────

async function testNews(ticker: string) {
  sep(`[4] NEWS / ANNOUNCEMENTS — ${ticker}.AU`);
  const url = `https://eodhd.com/api/news?s=${ticker}.AU&api_token=${API_KEY}&limit=5`;
  console.log(`  URL: ${url.replace(API_KEY!, "***")}\n`);

  const { ok, data, error } = await fetchJson(url);
  console.log(`  Status: ${ok ? "✔ SUCCESS" : "✘ FAILED"}${error ? " — " + error : ""}`);
  console.log("\n  Raw response:");
  console.log(JSON.stringify(data, null, 2));

  if (ok && Array.isArray(data) && data.length > 0) {
    const item = data[0] as Record<string, unknown>;
    console.log("\n  STAX field extraction (first item):");
    check("announcement_headline  (title)", item.title);
    check("announcement_date      (date)", item.date);
    check("announcement_url       (link)", item.link);

    mark("announcement_headline", item.title);
    mark("announcement_date", item.date);
    mark("announcement_url", item.link);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║           EODHD API VALIDATION — STAX DATA QUALITY CHECK            ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log(`  Tickers: ${TICKERS.join(", ")}`);
  console.log(`  Historical from: ${FROM_DATE}`);
  console.log(`  API key: ***${API_KEY!.slice(-6)}`);

  for (const ticker of TICKERS) {
    console.log("\n\n" + "▓".repeat(70));
    console.log(`▓▓  TICKER: ${ticker}`);
    console.log("▓".repeat(70));

    await testRealTime(ticker);
    await testHistorical(ticker);
    await testFundamentals(ticker);
    await testNews(ticker);
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  sep("SUMMARY");

  const foundList = [...found];
  const missingList = [...missing];

  console.log("\n  FOUND:");
  if (foundList.length === 0) {
    console.log("    (none)");
  } else {
    for (const f of foundList) console.log(`    ✔  ${f}`);
  }

  console.log("\n  MISSING:");
  if (missingList.length === 0) {
    console.log("    (none — all fields confirmed)");
  } else {
    for (const f of missingList) console.log(`    ✘  ${f}`);
  }

  const gaps: string[] = [];
  if (missingList.length > 0) {
    gaps.push(...missingList.map((f) => `${f} not returned by EODHD — will need supplemental source`));
  }
  if (!found.has("announcement_url")) {
    gaps.push("Announcement URLs may need ASX company announcements API as fallback");
  }

  console.log("\n  GAPS:");
  if (gaps.length === 0) {
    console.log("    None — EODHD covers all required STAX fields.");
  } else {
    for (const g of gaps) console.log(`    ⚠  ${g}`);
  }

  console.log("\n" + "═".repeat(70) + "\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
