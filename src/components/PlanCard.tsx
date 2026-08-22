import { useEffect, useState } from "react";
import { fetchWebsitePlans, formatPlanPrice } from "../api/plans";
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
  periodLabel,
  action,
  current,
  currentLabel,
}: {
  plan: WebsitePlan;
  featuredLabel: string;
  periodLabel: string;
  action: React.ReactNode;
  current?: boolean;
  currentLabel?: string;
}) {
  const { locale } = useI18n();

  return (
    <div
      className={`relative flex min-w-0 flex-col break-words rounded-[2rem] border bg-surface p-6 sm:p-8 ${
        plan.featured
          ? "border-bloom-200 shadow-2xl shadow-bloom-600/10 dark:border-bloom-700 lg:-mt-4"
          : "border-ink-100"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 start-6 rounded-full bg-bloom-600 px-3 py-1 text-xs font-bold text-white sm:start-8">
          {featuredLabel}
        </span>
      )}
      {current && currentLabel && (
        <span className="absolute -top-3 end-6 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success sm:end-8">
          {currentLabel}
        </span>
      )}

      <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
      {plan.summary && <p className="mt-1 text-sm text-ink-600">{plan.summary}</p>}

      <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-extrabold tracking-tight text-ink-900" dir="ltr">
          {formatPlanPrice(plan, locale)}
        </span>
        <span className="text-sm font-semibold text-ink-400">{periodLabel}</span>
      </p>

      {plan.features && plan.features.length > 0 && (
        <ul className="mt-7 flex-1 space-y-3 border-t border-ink-100 pt-7">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-ink-600"
            >
              <Check />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">{action}</div>
    </div>
  );
}
