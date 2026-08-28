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
   *
   * **This is the price after any live sale** — what the client will actually
   * be charged. The name is unchanged on purpose, so anything that reads it
   * knowing nothing about sales still quotes the right figure.
   */
  priceMinor: number;
  /**
   * The sale, present only while one is running.
   *
   * Their *presence* is the signal — `originalPriceMinor !== undefined` is the
   * test for "strike a price through", not a comparison against `priceMinor`,
   * which would miss a 0% edge and read as a sale that isn't one.
   *
   * `discountEndsAt` is absent for an open-ended sale even while it is running,
   * so it says when a sale stops, never whether one is on.
   */
  originalPriceMinor?: number;
  discountPercent?: number;
  discountEndsAt?: string;
  /**
   * The new-customer offer: a percentage off the client's **first billing
   * period** of their **first** purchase, once per account ever.
   *
   * It advertises the offer and says nothing about who is eligible — this is a
   * public payload with no account behind it, so it is the same for a returning
   * client who cannot have it as for a visitor who can. Present only while the
   * offer is switched on and the plan can actually take it, so its presence is
   * the signal to badge the card, in the same style as `originalPriceMinor`.
   *
   * It is deliberately **not** folded into `priceMinor`. That figure is what
   * this plan costs, and eligibility is not knowable here; a card that quotes
   * half price to everyone and then charges some of them full price at checkout
   * is the one mistake a pricing page must not make. Whether a signed-in client
   * actually gets it is answered by the checkout quote, which comes back with
   * `discountSource: "FIRST_PURCHASE"`.
   */
  firstPurchasePercent?: number;
  /**
   * What one billing period costs with the new-customer offer applied.
   *
   * Sent rather than derived, for the same reason `originalPriceMinor` is. It
   * is computed off the **list** price, so it is not a percentage off
   * `priceMinor` on a plan that is also on sale — the two discounts are rivals,
   * not layers.
   *
   * Present exactly when `firstPurchasePercent` is, and both are withheld when
   * a live sale matches or beats the offer over a single period. So its
   * presence means the offer wins and this is the settlement figure for a
   * one-period first purchase.
   */
  firstPurchasePriceMinor?: number;
  currency: string;
  billingPeriod?: string;
  featured?: boolean;
  /**
   * Announced but not open yet. The plan is advertised in full — price, features,
   * everything — and simply cannot be bought today.
   *
   * Deliberately **not** `purchasable: false`, which is the negotiated tier and
   * means something else entirely: that price is a conversation, and it reports
   * `priceMinor: 0`. This one has a real price we want read. The two can both be
   * set, and coming-soon wins whatever it is paired with.
   *
   * The API refuses a checkout for one of these with a `PLAN_COMING_SOON` 409,
   * which is the actual control — the plan's code sits in a public payload, so a
   * disabled button stops nobody who is not using the button.
   */
  comingSoon?: boolean;
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

/**
 * A tier that is advertised but not open for business yet.
 *
 * Read as `=== true` rather than for truthiness so that a payload which omits
 * the field entirely — an older backend, or a Jackson `non_null` build that
 * drops `false` — reads as "on sale now" rather than as coming soon. The
 * failure that matters is the one that hides a plan people can buy.
 */
export function isComingSoon(plan: WebsitePlan): boolean {
  return plan.comingSoon === true;
}

/** Whether a sale is running on this plan right now. */
export function isDiscounted(plan: WebsitePlan): boolean {
  return plan.originalPriceMinor !== undefined;
}

/**
 * The new-customer offer advertised on this plan, or `null` when there is none.
 *
 * An *advertisement*, not an entitlement: the caller is telling visitors the
 * offer exists, not promising this particular client will get it. Only the
 * checkout quote knows that.
 */
export function firstPurchasePercent(plan: WebsitePlan): number | null {
  return plan.firstPurchasePercent ?? null;
}

/**
 * What the first period costs under the new-customer offer, formatted, or
 * `null` when the API has not sent a figure.
 *
 * Read, never derived. The API suppresses this — and the percentage with it —
 * whenever a live sale matches or beats the offer over a single period, so its
 * presence already means the offer wins and the figure is what a one-period
 * first purchase settles at. Absence means there is no first-month story on
 * this card and the sale stands alone.
 *
 * Working it out here instead would get the *base* wrong, not just the
 * rounding: the offer comes off the list price, so half of `priceMinor` on a
 * plan that is already on sale is a number nobody is ever charged.
 */
export function formatFirstPurchasePrice(
  plan: WebsitePlan,
  locale: string,
): string | null {
  if (plan.firstPurchasePriceMinor === undefined) return null;
  return formatMinor(plan.firstPurchasePriceMinor, plan.currency, locale);
}

/**
 * The price to strike through, or `null` when there is nothing to strike.
 *
 * Both figures come from the API rather than from a percentage applied here:
 * the discount is rounded server-side, and a page that does its own arithmetic
 * will disagree with the invoice by a cent on some percentages.
 */
export function formatPlanWasPrice(
  plan: WebsitePlan,
  locale: string,
): string | null {
  if (plan.originalPriceMinor === undefined) return null;
  return formatMinor(plan.originalPriceMinor, plan.currency, locale);
}
