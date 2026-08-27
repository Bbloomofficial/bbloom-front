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
   * The localised display price and the wording after it — "Negotiable", "$199",
   * "/month". Copy, not a figure: a tier whose price is a conversation has no
   * number to show, which is the reason these exist alongside `priceMinor`.
   * Absent (not null) when the plan has no translation in the requested
   * language, so read them with `??` rather than a truthiness check on null.
   */
  price?: string;
  cadence?: string;
  /**
   * Whether a client can buy this themselves. `false` is the negotiated tier:
   * it is advertised on the pricing page but has no checkout, and the API
   * refuses a subscription to it with a 409 regardless of what the UI does.
   *
   * A non-purchasable plan reports `priceMinor: 0`, which does **not** mean
   * free — never render it as a price.
   */
  purchasable?: boolean;
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

/** A tier whose price is agreed rather than listed. */
export function isNegotiable(plan: WebsitePlan): boolean {
  return plan.purchasable === false;
}
