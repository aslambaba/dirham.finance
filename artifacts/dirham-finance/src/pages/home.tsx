import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MOCK_RATES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 0.272 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 0.254 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 0.217 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", rate: 22.65 },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰", rate: 75.80 },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", rate: 15.34 },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", rate: 13.05 },
  { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩", rate: 29.85 },
];

const HISTORICAL_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  rate: 0.272 + (Math.random() * 0.002 - 0.001),
}));

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>("1000");

  useEffect(() => setMounted(true), []);

  const parsedAmount = parseFloat(amount) || 0;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              د.إ
            </div>
            <span className="font-bold text-xl tracking-tight">dirham<span className="text-primary">.finance</span></span>
          </div>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-10 h-10 transition-transform active:scale-95"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex flex-col gap-12 md:gap-20">
        
        {/* Hero / Converter */}
        <section className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Convert Dirhams <br className="hidden md:block"/> with Precision.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
              Live rates, historical trends, and instant conversions for UAE residents and travelers.
            </p>
          </div>

          <Card className="w-full relative overflow-hidden border-0 shadow-2xl bg-card/60 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <CardContent className="p-6 md:p-10 flex flex-col gap-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div className="flex-1 w-full space-y-3">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">You Send</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-bold text-muted-foreground">🇦🇪</span>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-16 pr-16 h-16 md:h-20 text-3xl md:text-5xl font-bold font-mono bg-background/50 border-2 border-primary/20 focus-visible:ring-primary/50 rounded-2xl transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">AED</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 rotate-90 md:rotate-0 mt-6 md:mt-10">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div className="flex-1 w-full space-y-3">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">You Get (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl md:text-4xl font-bold text-muted-foreground">🇺🇸</span>
                    <div className="flex items-center pl-16 pr-16 h-16 md:h-20 bg-background/30 border border-border/50 rounded-2xl overflow-hidden">
                      <span className="text-3xl md:text-5xl font-bold font-mono text-foreground">
                        {(parsedAmount * 0.272).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">USD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rate Cards Grid */}
        <section className="space-y-6 w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Live Rates
            </h2>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">1 AED Equals</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_RATES.map((currency, i) => {
              const change = (Math.random() * 0.5 - 0.2).toFixed(2);
              const isUp = parseFloat(change) > 0;
              return (
                <Card 
                  key={currency.code} 
                  className="hover:-translate-y-1 transition-all duration-300 hover:shadow-lg animate-in fade-in zoom-in-95 fill-mode-both"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.flag}</span>
                        <span className="font-bold text-muted-foreground">{currency.code}</span>
                      </div>
                      <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-sm ${isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {Math.abs(parseFloat(change))}%
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono tracking-tight">
                        {currency.rate.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1 truncate">{currency.name}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Rate History Chart */}
        <section className="space-y-6 w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">30-Day Trend (USD)</h2>
          </div>
          <Card className="w-full h-[400px] border border-border/50 shadow-md p-6 bg-card/40 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORICAL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `Day ${val}`} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => val.toFixed(4)} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: 'var(--shadow-md)', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    formatter={(value: number) => [value.toFixed(4), 'Rate']}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
          </Card>
        </section>

        {/* Popular Conversions Table */}
        <section className="space-y-6 w-full max-w-6xl mx-auto pb-20">
          <h2 className="text-2xl md:text-3xl font-bold">Quick Conversions</h2>
          <Card className="overflow-hidden border border-border/50 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                    <th className="p-4 font-semibold w-1/4">AED</th>
                    {MOCK_RATES.slice(0,4).map(c => (
                      <th key={c.code} className="p-4 font-semibold">{c.flag} {c.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[100, 500, 1000, 5000].map(val => (
                    <tr key={val} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-bold font-mono">{val.toLocaleString()} د.إ</td>
                      {MOCK_RATES.slice(0,4).map(c => (
                        <td key={c.code} className="p-4 font-mono text-muted-foreground">
                          {(val * c.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
