import type { SiteLanguage } from "../api/types";

const SYMBOLS: Record<string, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/** Prices arrive as plain numbers; currency comes from the site metadata. */
export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale: SiteLanguage,
): string | undefined {
  if (amount === null || amount === undefined || !Number.isFinite(amount))
    return undefined;

  const code = (currency ?? "GEL").toUpperCase();
  const symbol = SYMBOLS[code];
  const value = new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return symbol ? `${value} ${symbol}` : `${value} ${code}`;
}
