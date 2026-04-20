"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchLatestAedRates,
  fetchAedRatesForDay,
  fetchAedToCurrencyHistory,
  pctChange,
  type LatestRatesResponse,
} from "@/lib/exchange-rates";
import {
  SPOTLIGHT_CODES,
  SELECTABLE_CODES,
  currencyInfo,
} from "@/lib/currencies";

const INTEGER_RESULT = new Set([
  "JPY",
  "KRW",
  "VND",
  "IDR",
  "HUF",
]);

function formatAmount(
  value: number,
  opts?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  });
}

function formatConverted(amount: number, currencyCode: string): string {
  if (INTEGER_RESULT.has(currencyCode)) {
    return Math.round(amount).toLocaleString("en-US");
  }
  return formatAmount(amount);
}

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>("1000");
  const [baseCurrency, setBaseCurrency] = useState<string>("AED");
  const [targetCurrency, setTargetCurrency] = useState<string>("USD");
  const [dateRange, setDateRange] = useState<number>(30);

  const [latest, setLatest] = useState<LatestRatesResponse | null>(null);
  const [yesterday, setYesterday] = useState<Record<string, number> | null>(
    null,
  );
  const [historicalData, setHistoricalData] = useState<
    { day: number; rate: number; isoDate: string }[]
  >([]);
  const [histLoading, setHistLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [live, prior] = await Promise.all([
          fetchLatestAedRates(),
          fetchAedRatesForDay(1),
        ]);
        if (cancelled) return;
        setLatest(live);
        setYesterday(prior);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load rates");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHist() {
      setHistLoading(true);
      try {
        const hist = await fetchAedToCurrencyHistory(targetCurrency, dateRange);
        if (!cancelled) setHistoricalData(hist);
      } finally {
        if (!cancelled) setHistLoading(false);
      }
    }

    void loadHist();
    return () => {
      cancelled = true;
    };
  }, [targetCurrency, dateRange]);

  const parsedAmount = parseFloat(amount) || 0;
  const baseMeta = currencyInfo(baseCurrency);
  const targetMeta = currencyInfo(targetCurrency);
  
  let targetRate: number | null = null;
  if (baseCurrency === "AED") {
    targetRate = latest?.rates?.[targetCurrency] ?? null;
  } else if (targetCurrency === "AED") {
    const baseRate = latest?.rates?.[baseCurrency] ?? null;
    targetRate = baseRate ? 1 / baseRate : null;
  } else {
    const baseToAed = latest?.rates?.[baseCurrency] ?? null;
    const targetToAed = latest?.rates?.[targetCurrency] ?? null;
    if (baseToAed && targetToAed) {
      targetRate = targetToAed / baseToAed;
    }
  }

  const displayRows = useMemo(() => {
    if (!latest?.rates) {
      return SPOTLIGHT_CODES.map((code) => ({
        ...currencyInfo(code),
        rate: null as number | null,
        changePct: null as number | null,
      }));
    }
    return SPOTLIGHT_CODES.map((code) => {
      const c = currencyInfo(code);
      const rate = latest.rates[code];
      const prev = yesterday?.[code.toLowerCase()];
      const next = typeof rate === "number" ? rate : null;
      const changePct =
        prev != null && next != null ? pctChange(prev, next) : null;
      return { ...c, rate: next, changePct };
    });
  }, [latest, yesterday]);

  const tableCurrencies = displayRows.slice(0, 4);

  const chartGradientId = `colorRate-${targetCurrency}`;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              د.إ
            </div>
            <span className="font-bold text-xl tracking-tight">
              dirham<span className="text-primary">.finance</span>
            </span>
          </div>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-10 h-10 transition-transform active:scale-95"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 flex flex-col gap-8 md:gap-12">
        <section className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Convert Dirhams <br className="hidden md:block" /> with Precision.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
              Live rates, historical trends, and instant conversions for UAE
              residents and travelers.
            </p>
          </div>

          <Card className="w-full relative overflow-hidden border-0 shadow-2xl bg-card/60 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <CardContent className="p-5 md:p-8 flex flex-col gap-6 md:gap-8 relative z-10">
              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6">
                <div className="flex-1 w-full space-y-2 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    You Send
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-3xl font-bold text-muted-foreground">
                      {baseMeta.flag}
                    </span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 md:pl-14 pr-14 h-14 md:h-20 text-2xl md:text-4xl font-bold font-mono bg-background/50 border-2 border-primary/20 focus-visible:ring-primary/50 rounded-2xl transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-sm md:text-lg font-bold text-muted-foreground">
                      {baseCurrency}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center md:pt-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setBaseCurrency(targetCurrency);
                      setTargetCurrency(baseCurrency);
                      setAmount("1");
                    }}
                    className="w-11 h-11 rounded-full bg-primary/10 hover:bg-primary/20 text-primary shrink-0 rotate-90 md:rotate-0 transition-colors active:scale-95"
                    title="Swap currencies"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                      You Get
                    </label>
                    <Select
                      value={targetCurrency}
                      onValueChange={setTargetCurrency}
                    >
                      <SelectTrigger className="h-9 w-full sm:w-[min(100%,220px)] rounded-lg border-border/60 text-sm">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[min(60vh,320px)]">
                        {SELECTABLE_CODES.map((code) => {
                          const ci = currencyInfo(code);
                          return (
                            <SelectItem key={code} value={code}>
                              <span className="flex items-center gap-2">
                                <span>{ci.flag}</span>
                                <span className="font-medium">{code}</span>
                                <span className="text-muted-foreground truncate max-w-[12rem]">
                                  {ci.name}
                                </span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-xl md:text-3xl font-bold text-muted-foreground">
                      {targetMeta.flag}
                    </span>
                    <div className="flex items-center pl-12 md:pl-14 pr-14 md:pr-20 h-14 md:h-20 bg-background/30 border border-border/50 rounded-2xl overflow-hidden min-h-[3.5rem] md:min-h-[5rem]">
                      {loading && targetRate == null ? (
                        <Spinner className="size-7 text-muted-foreground" />
                      ) : (
                        <span className="text-2xl md:text-4xl font-bold font-mono text-foreground truncate">
                          {targetRate != null
                            ? formatConverted(
                                parsedAmount * targetRate,
                                targetCurrency,
                              )
                            : "—"}
                        </span>
                      )}
                    </div>
                    <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-sm md:text-base font-bold text-muted-foreground">
                      {targetCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 w-full max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Live
              Rates
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                1 AED Equals
              </span>
              {latest?.time_last_update_utc && (
                <span className="text-xs text-muted-foreground">
                  {latest.time_last_update_utc}
                </span>
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
            Indicative mid-market style rates (open.er-api.com & public daily
            snapshots). Banks and cards may differ.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {displayRows.map((currency, i) => {
              const pct = currency.changePct;
              const isUp = pct != null && pct > 0;
              const showPct = pct != null && Number.isFinite(pct);
              return (
                <Card
                  key={currency.code}
                  role="button"
                  tabIndex={0}
                  onClick={() => setTargetCurrency(currency.code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setTargetCurrency(currency.code);
                    }
                  }}
                  className="cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-md animate-in fade-in zoom-in-95 fill-mode-both focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardContent className="p-3 md:p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-lg md:text-xl shrink-0">
                          {currency.flag}
                        </span>
                        <span className="font-bold text-muted-foreground text-xs truncate">
                          {currency.code}
                        </span>
                      </div>
                      <div
                        className={`flex items-center text-[10px] font-bold px-1 py-0.5 rounded-sm shrink-0 ${
                          !showPct
                            ? "text-muted-foreground bg-muted/50"
                            : isUp
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-rose-500 bg-rose-500/10"
                        }`}
                      >
                        {showPct ? (
                          <>
                            {isUp ? (
                              <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                            ) : (
                              <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                            )}
                            {Math.abs(pct).toFixed(2)}%
                          </>
                        ) : loading ? (
                          <Spinner className="size-2.5" />
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-base md:text-lg font-bold font-mono tracking-tight leading-tight">
                        {currency.rate != null ? (
                          currency.rate.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })
                        ) : loading ? (
                          <Spinner className="size-5" />
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-2 leading-tight">
                        {currency.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
            <h2 className="text-xl md:text-2xl font-bold">
              {dateRange}-Day Trend ({targetCurrency})
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "30D", value: 30 },
                { label: "90D", value: 90 },
                { label: "6M", value: 180 },
                { label: "1Y", value: 365 },
                { label: "3Y", value: 1095 },
              ].map(({ label, value }) => (
                <Button
                  key={value}
                  variant={dateRange === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(value)}
                  className="h-8 px-3 text-xs font-medium transition-all"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <Card className="w-full h-[280px] md:h-[340px] border border-border/50 shadow-md p-4 md:p-6 bg-card/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            {historicalData.length === 0 && histLoading ? (
              <div className="h-full flex items-center justify-center">
                <Spinner className="size-8 text-muted-foreground" />
              </div>
            ) : historicalData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs md:text-sm text-muted-foreground px-4 text-center">
                Chart data unavailable for {targetCurrency}. Conversion above
                uses the latest rate.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={chartGradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(val) => Number(val).toFixed(4)}
                    width={48}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow-md)",
                      color: "hsl(var(--foreground))",
                    }}
                    itemStyle={{
                      color: "hsl(var(--primary))",
                      fontWeight: "bold",
                    }}
                    formatter={(value: number) => [
                      value.toFixed(4),
                      targetCurrency,
                    ]}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    labelFormatter={(label, payload) => {
                      const iso = (
                        payload?.[0]?.payload as { isoDate?: string } | undefined
                      )?.isoDate;
                      return iso ? `${iso}` : `Day ${label}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${chartGradientId})`}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </section>

        <section className="space-y-4 w-full max-w-6xl mx-auto pb-12 md:pb-16">
          <h2 className="text-xl md:text-2xl font-bold">Quick Conversions</h2>
          <Card className="overflow-hidden border border-border/50 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                    <th className="p-3 font-semibold w-1/5">AED</th>
                    {tableCurrencies.map((c) => (
                      <th key={c.code} className="p-3 font-semibold whitespace-nowrap">
                        {c.flag} {c.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[100, 500, 1000, 5000].map((val) => (
                    <tr
                      key={val}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 font-bold font-mono">
                        {val.toLocaleString()} د.إ
                      </td>
                      {tableCurrencies.map((c) => (
                        <td
                          key={c.code}
                          className="p-3 font-mono text-muted-foreground whitespace-nowrap"
                        >
                          {c.rate != null ? (
                            formatConverted(val * c.rate, c.code)
                          ) : loading ? (
                            <Spinner className="size-4" />
                          ) : (
                            "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
