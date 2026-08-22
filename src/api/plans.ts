import { request } from "./http";

/**
 * The hosting plans a client can buy. Public and already localised by the
 * backend, so the marketing pricing page and the in-panel checkout render the
 * exact same list from the exact same source.
 */

export type WebsitePlan = {
  code: string;
  name: string;
  summary?: string;
  features?: string[];
  cta?: string;
  /**
   * Minor units — 2900 is 29.00 GEL. This is the only billable number in the
   * payload; the copy above it must never be parsed for a price, and no price
   * may be hardcoded in the UI, because these change.
   */
  priceMinor: number;
  currency: string;
  billingPeriod?: string;
  featured?: boolean;
};

/**
 * The plan copy is localised by a `lang` query parameter. An `Accept-Language`
 * header is ignored by the API, so it is not enough to set one.
 */
export function fetchWebsitePlans(lang: string): Promise<WebsitePlan[]> {
  return request<WebsitePlan[]>(
    `/plans/website?lang=${encodeURIComponent(lang)}`,
  );
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Renders a minor-unit amount as money. Whole amounts lose the decimals, since
 * "29 ₾" reads as a price and "29.00 ₾" reads as an invoice line.
 */
export function formatMinor(
  amountMinor: number,
  currency: string,
  locale: string,
): string {
  const amount = amountMinor / 100;
  const digits = Number.isInteger(amount) ? 0 : 2;
  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(amount);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  // Georgian writes the lari after the amount; English puts the symbol first.
  return locale === "ka" ? `${number} ${symbol}` : `${symbol}${number}`;
}

export function formatPlanPrice(plan: WebsitePlan, locale: string): string {
  return formatMinor(plan.priceMinor, plan.currency, locale);
}
