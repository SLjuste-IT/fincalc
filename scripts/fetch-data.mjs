// Build-time refresh of the FX and CPI reference tables.
//
// WHY BUILD TIME AND NOT THE BROWSER:
//   * ExchangeRate-API's free tier is ~1,500 requests/month (~50/day). Fetching
//     per visitor exhausts that at trivial traffic — it would break precisely
//     when the site starts succeeding. This runs once per build instead, so cost
//     is flat no matter how many people visit.
//   * FRED requires an API key. A key in client-side JS is public to anyone who
//     opens devtools. Here it stays in the build environment.
//   * No runtime network dependency, no CORS, no loading state, no failure path
//     on the visitor's machine.
//
// Run daily via a Cloudflare Pages Deploy Hook (see DEPLOY.md). If a fetch fails
// or no key is present, the existing committed values are kept and the build
// still succeeds — stale-but-labelled data beats a broken deploy.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "src", "data", "reference.json");

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL", "ZAR"];

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return null;
  }
}

async function fetchFx() {
  // Open-access endpoint: no key required. Attribution is required by their terms
  // and is rendered in the Currency Converter's note.
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== "success" || !json.rates) throw new Error("FX payload malformed");
  const rates = {};
  for (const c of CURRENCIES) {
    const v = json.rates[c];
    if (typeof v !== "number" || !isFinite(v) || v <= 0) throw new Error(`FX missing/invalid rate for ${c}`);
    // Round to 4dp: the API returns ~6, which implies a precision that daily
    // reference rates do not have.
    rates[c] = Math.round(v * 10000) / 10000;
  }
  // Normalise to a plain human date — this string is rendered directly in the UI.
  const stamp = json.time_last_update_utc ? new Date(json.time_last_update_utc) : new Date();
  const asOf = stamp.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return { rates, asOf };
}

async function fetchCpi() {
  const key = process.env.FRED_API_KEY;
  if (!key) return null; // no key configured — keep whatever is committed
  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL` +
    `&api_key=${key}&file_type=json&frequency=a&aggregation_method=avg&observation_start=1980-01-01`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json.observations)) throw new Error("FRED payload malformed");
  const cpi = {};
  for (const o of json.observations) {
    const year = Number(o.date.slice(0, 4));
    const val = Number(o.value);
    // A year's annual average only exists once the year is complete; FRED marks
    // incomplete/missing points with ".". Skip them rather than invent a value.
    if (!Number.isFinite(val) || o.value === ".") continue;
    cpi[year] = Math.round(val * 10) / 10;
  }
  if (!Object.keys(cpi).length) throw new Error("FRED returned no usable observations");
  return cpi;
}

const existing = await readExisting();
const out = existing ?? {};

try {
  const fx = await fetchFx();
  out.FX = fx.rates;
  out.FX_AS_OF = fx.asOf;
  console.log(`[fetch-data] FX updated — ${Object.keys(fx.rates).length} currencies, as of ${fx.asOf}`);
} catch (e) {
  console.warn(`[fetch-data] FX refresh FAILED (${e.message}) — keeping existing values`);
  if (!out.FX) console.warn("[fetch-data]   and there are no existing values; app falls back to its built-in table");
}

try {
  const cpi = await fetchCpi();
  if (cpi) {
    out.CPI = cpi;
    const latest = Math.max(...Object.keys(cpi).map(Number));
    console.log(`[fetch-data] CPI updated — ${Object.keys(cpi).length} years, latest ${latest}`);
  } else {
    console.log("[fetch-data] CPI skipped — FRED_API_KEY not set; keeping existing values");
  }
} catch (e) {
  console.warn(`[fetch-data] CPI refresh FAILED (${e.message}) — keeping existing values`);
}

if (Object.keys(out).length) {
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[fetch-data] wrote ${OUT}`);
} else {
  console.warn("[fetch-data] nothing to write; build will use the built-in tables");
}
