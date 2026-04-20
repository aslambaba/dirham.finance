/** Display metadata for fiat currencies (1 AED = X units). */

export type CurrencyInfo = { code: string; name: string; flag: string };

export const CURRENCY_META: Record<string, { name: string; flag: string }> = {
  AED: { name: "UAE Dirham", flag: "🇦🇪" },
  USD: { name: "US Dollar", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  GBP: { name: "British Pound", flag: "🇬🇧" },
  SAR: { name: "Saudi Riyal", flag: "🇸🇦" },
  INR: { name: "Indian Rupee", flag: "🇮🇳" },
  PKR: { name: "Pakistani Rupee", flag: "🇵🇰" },
  PHP: { name: "Philippine Peso", flag: "🇵🇭" },
  EGP: { name: "Egyptian Pound", flag: "🇪🇬" },
  BDT: { name: "Bangladeshi Taka", flag: "🇧🇩" },
  TRY: { name: "Turkish Lira", flag: "🇹🇷" },
  CAD: { name: "Canadian Dollar", flag: "🇨🇦" },
  AUD: { name: "Australian Dollar", flag: "🇦🇺" },
  CHF: { name: "Swiss Franc", flag: "🇨🇭" },
  JPY: { name: "Japanese Yen", flag: "🇯🇵" },
  CNY: { name: "Chinese Yuan", flag: "🇨🇳" },
  SGD: { name: "Singapore Dollar", flag: "🇸🇬" },
  HKD: { name: "Hong Kong Dollar", flag: "🇭🇰" },
  KRW: { name: "South Korean Won", flag: "🇰🇷" },
  THB: { name: "Thai Baht", flag: "🇹🇭" },
  NOK: { name: "Norwegian Krone", flag: "🇳🇴" },
  SEK: { name: "Swedish Krona", flag: "🇸🇪" },
  NZD: { name: "New Zealand Dollar", flag: "🇳🇿" },
  ZAR: { name: "South African Rand", flag: "🇿🇦" },
  MXN: { name: "Mexican Peso", flag: "🇲🇽" },
  BRL: { name: "Brazilian Real", flag: "🇧🇷" },
  PLN: { name: "Polish Złoty", flag: "🇵🇱" },
  QAR: { name: "Qatari Riyal", flag: "🇶🇦" },
  KWD: { name: "Kuwaiti Dinar", flag: "🇰🇼" },
  OMR: { name: "Omani Rial", flag: "🇴🇲" },
  BHD: { name: "Bahraini Dinar", flag: "🇧🇭" },
  JOD: { name: "Jordanian Dinar", flag: "🇯🇴" },
  LBP: { name: "Lebanese Pound", flag: "🇱🇧" },
  IDR: { name: "Indonesian Rupiah", flag: "🇮🇩" },
  MYR: { name: "Malaysian Ringgit", flag: "🇲🇾" },
  VND: { name: "Vietnamese Dong", flag: "🇻🇳" },
  RUB: { name: "Russian Ruble", flag: "🇷🇺" },
  UAH: { name: "Ukrainian Hryvnia", flag: "🇺🇦" },
  CZK: { name: "Czech Koruna", flag: "🇨🇿" },
  HUF: { name: "Hungarian Forint", flag: "🇭🇺" },
  RON: { name: "Romanian Leu", flag: "🇷🇴" },
  DKK: { name: "Danish Krone", flag: "🇩🇰" },
  ILS: { name: "Israeli Shekel", flag: "🇮🇱" },
  TWD: { name: "Taiwan Dollar", flag: "🇹🇼" },
};

/** Shown as compact tiles (6) — same visual weight as before, fewer rows. */
export const SPOTLIGHT_CODES: readonly string[] = [
  "USD",
  "EUR",
  "GBP",
  "SAR",
  "INR",
  "PKR",
];

/** All currencies available in the converter dropdown (alphabetical by code). */
export const SELECTABLE_CODES: readonly string[] = Object.keys(
  CURRENCY_META,
).sort();

export function currencyInfo(code: string): CurrencyInfo {
  const m = CURRENCY_META[code];
  if (m) return { code, name: m.name, flag: m.flag };
  return { code, name: code, flag: "💱" };
}
