import { useEffect, useState } from "react";
import {
  fetchWebsitePlans,
  firstPurchasePercent,
  formatFirstPurchasePrice,
  formatPlanPrice,
  formatPlanWasPrice,
  isComingSoon,
  isNegotiable,
} from "../api/plans";
import type { WebsitePlan } from "../api/plans";
import { useI18n } from "../i18n";

/**
 * The hosting plans, rendered from the API rather than from anything we ship.
 * The prices are placeholders today and will change, so no number here may ever
 * be hardcoded — `priceMinor` is the only source of a price, and the marketing
 * copy beside it is never parsed for one.
 *
 * The same component serves the public pricing page and in-panel checkout, so a
 * client is never quoted one price in one place and another somewhere else.
 */

export function usePlans() {
  const { locale } = useI18n();
  const [plans, setPlans] = useState<WebsitePlan[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    // Localised by a query parameter; an Accept-Language header is ignored.
    fetchWebsitePlans(locale)
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((cause: Error) => {
        if (!cancelled) setError(cause);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return { plans, error };
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 shrink-0 text-bloom-500"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

export function PlanCard({
  plan,
  featuredLabel,
  comingSoonLabel,
  firstPurchase,
  periodLabel,
  action,
  current,
  currentLabel,
}: {
  plan: WebsitePlan;
  featuredLabel: string;
  comingSoonLabel?: string;
  /**
   * Copy for the new-customer offer. Optional: a caller with nothing sensible
   * to say about a first purchase — the client is already paying for this very
   * plan, say — leaves it out and the note is dropped rather than shown in
   * English.
   *
   * Two shapes because there are two things to say. With a figure from the API
   * the note reads like a sale — `prefix`, the usual price struck through, the
   * discounted one — and `fallback` covers the case where the API has sent a
   * percentage but no figure, where naming a number would mean working it out
   * ourselves.
   */
  firstPurchase?: { prefix: string; fallback: (percent: number) => string };
  periodLabel: string;
  action: React.ReactNode;
  current?: boolean;
  currentLabel?: string;
}) {
  const { locale } = useI18n();

  // A negotiated tier reports `priceMinor: 0`, so formatting it would advertise
  // the plan as free. Its price is the copy the backend localised for it, and
  // the period label is dropped: "per month" under "Negotiable" promises a
  // cadence nobody has agreed to yet.
  const negotiable = isNegotiable(plan);
  const price = negotiable
    ? (plan.price ?? plan.name)
    : formatPlanPrice(plan, locale);
  const period = negotiable ? (plan.cadence ?? "") : periodLabel;
  // The struck-through figure comes from the API too. Working it back out from
  // a percentage here would disagree with the invoice by a cent on some of
  // them, and the one number a pricing page must never get wrong is the price.
  const was = negotiable ? null : formatPlanWasPrice(plan, locale);

  // Both badges want the same corner, so one has to yield, and "most popular"
  // is the one that should: a tier nobody can buy yet cannot be the popular
  // choice, and the claim would be read as a lie rather than as a leftover
  // setting. The raised, shadowed treatment goes with it for the same reason —
  // the eye should not be steered towards the one card that refuses the click.
  const soon = isComingSoon(plan);
  const featured = plan.featured && !soon;

  // Advertised, not promised. The backend already withholds this from tiers that
  // cannot take it; the negotiable guard is here because a "50% off" line under
  // a price that is a conversation would be discounting nothing.
  const firstPurchaseOff = negotiable ? null : firstPurchasePercent(plan);
  // The discounted figure comes from the API for the same reason the struck
  // price does. Null until it sends one, which is what the fallback copy is
  // for: deriving it from `priceMinor` here would be our arithmetic against
  // their invoice.
  const firstPurchasePrice = formatFirstPurchasePrice(plan, locale);

  return (
    <div
      className={`relative flex min-w-0 flex-col break-words rounded-[2rem] border bg-surface p-6 ${
        featured
          ? "border-bloom-200 shadow-2xl shadow-bloom-600/10 dark:border-bloom-700 lg:-mt-4"
          : soon
            // Dashed reads as provisional at a glance, before any label is
            // read, and does it without dimming a price we want people to see.
            ? "border-dashed border-ink-300"
            : "border-ink-100"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 start-6 rounded-full bg-bloom-600 px-3 py-1 text-xs font-bold text-white sm:start-8">
          {featuredLabel}
        </span>
      )}
      {soon && comingSoonLabel && (
        <span className="absolute -top-3 start-6 rounded-full bg-ink-800 px-3 py-1 text-xs font-bold text-surface sm:start-8">
          {comingSoonLabel}
        </span>
      )}
      {current && currentLabel && (
        <span className="absolute -top-3 end-6 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success sm:end-8">
          {currentLabel}
        </span>
      )}

      <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
      {plan.summary && <p className="mt-1 text-sm text-ink-600">{plan.summary}</p>}

      {/* The old price and the badge sit on their own line above the new one.
          Inline, four items of unpredictable width wrapped into a three-line
          jumble in the narrow columns a four-tier grid produces. */}
      <div className="mt-6">
        {was && (
          <p className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-ink-400 line-through" dir="ltr">
              {was}
            </span>
            {plan.discountPercent !== undefined && (
              <span
                className="rounded-full bg-bloom-600 px-2 py-0.5 text-xs font-bold text-white"
                dir="ltr"
              >
                −{plan.discountPercent}%
              </span>
            )}
          </p>
        )}
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={`font-extrabold tracking-tight text-ink-900 ${
              negotiable ? "text-2xl" : "text-3xl sm:text-4xl"
            }`}
            dir={negotiable ? undefined : "ltr"}
          >
            {price}
          </span>
          {period && (
            <span className="text-sm font-semibold text-ink-400">{period}</span>
          )}
        </p>
        {/* Under the price rather than in a corner badge: both corners are
            already spoken for by "most popular" and "coming soon", and this is
            a sentence with a condition in it — "your first month" — which a
            badge has no room to carry and would turn into a half-price promise
            we do not mean.

            Struck price beside the discounted one, the same way a sale reads
            higher up the card, so the offer is a figure rather than a sum the
            reader has to do. The headline price above stays what it is on
            purpose: this is one period off a first purchase, and renewals are
            full price. */}
        {firstPurchaseOff !== null && firstPurchase && (
          <p className="mt-2 inline-flex flex-wrap items-baseline gap-x-1.5 rounded-full bg-tint px-3 py-1 text-xs font-bold text-tint-fg">
            {firstPurchasePrice ? (
              <>
                <span>{firstPurchase.prefix}</span>
                <span className="font-semibold opacity-60 line-through" dir="ltr">
                  {price}
                </span>
                <span dir="ltr">{firstPurchasePrice}</span>
              </>
            ) : (
              <span>{firstPurchase.fallback(firstPurchaseOff)}</span>
            )}
          </p>
        )}
      </div>

      {plan.features && plan.features.length > 0 && (
        <ul className="mt-6 flex-1 space-y-2.5 border-t border-ink-100 pt-6">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm leading-snug text-ink-600"
            >
              <Check />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-7">{action}</div>
    </div>
  );
}
