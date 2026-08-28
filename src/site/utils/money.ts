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

/**
 * The same formatting for amounts that arrive as whole minor units.
 *
 * Orders are quoted in minor units end to end — 2500 is 25.00 GEL — because a
 * decimal that survives a JSON round trip and a currency conversion is a
 * rounding bug waiting for a large enough basket. The division by 100 here is
 * the *only* place that number becomes a decimal, and it happens on its way to
 * being printed, never on its way into another sum.
 */
export function formatMinorMoney(
  minor: number | null | undefined,
  currency: string | null | undefined,
  locale: SiteLanguage,
): string | undefined {
  if (minor === null || minor === undefined || !Number.isFinite(minor))
    return undefined;
  return formatMoney(minor / 100, currency, locale);
}
