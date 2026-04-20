/** Live AED cross-rates (1 AED = X foreign) from open.er-api.com (no API key). */

export type LatestRatesResponse = {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
};

const OPEN_ER_LATEST = "https://open.er-api.com/v6/latest/AED";

export async function fetchLatestAedRates(): Promise<LatestRatesResponse> {
  const res = await fetch(OPEN_ER_LATEST, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Rates request failed (${res.status})`);
  }
  const data = (await res.json()) as LatestRatesResponse;
  if (data.result !== "success" || !data.rates) {
    throw new Error("Unexpected rates response");
  }
  return data;
}

type CurrencyApiDay = {
  date?: string;
  aed?: Record<string, number>;
};

function isoDateUtcDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** Yesterday’s 1 AED → * rates (lowercase keys, e.g. `usd`) for % change vs today. */
export async function fetchAedRatesForDay(
  daysAgo: number,
): Promise<Record<string, number> | null> {
  const iso = isoDateUtcDaysAgo(daysAgo);
  const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${iso}/v1/currencies/aed.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as CurrencyApiDay;
    return json.aed ?? null;
  } catch {
    return null;
  }
}

/** Historical 1 AED → `currencyCode` for chart (jsDelivr daily snapshots). */
export async function fetchAedToCurrencyHistory(
  currencyCode: string,
  numDays: number,
): Promise<{ day: number; rate: number; isoDate: string }[]> {
  const key = currencyCode.toLowerCase();
  const offsets = Array.from({ length: numDays }, (_, i) => numDays - 1 - i);
  const rows: { rate: number; isoDate: string }[] = [];

  await Promise.all(
    offsets.map(async (daysAgo) => {
      const iso = isoDateUtcDaysAgo(daysAgo);
      const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${iso}/v1/currencies/aed.json`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as CurrencyApiDay;
        const rate = json.aed?.[key];
        if (typeof rate === "number" && rate > 0) {
          rows.push({ rate, isoDate: json.date ?? iso });
        }
      } catch {
        /* skip */
      }
    }),
  );

  rows.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  return rows.map((r, i) => ({ day: i + 1, rate: r.rate, isoDate: r.isoDate }));
}

export function pctChange(prev: number, next: number): number | null {
  if (!(prev > 0) || !(next > 0)) return null;
  return ((next - prev) / prev) * 100;
}
