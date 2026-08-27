import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { deletePlan, fetchPlans } from "../api/client";
import { formatMinor } from "../../api/plans";
import { ApiError } from "../../api/http";
import { adminStrings } from "../strings";
import { adminPath } from "../../routes";

/**
 * Every plan, including the ones the public pricing page will not show. Staff
 * come here to change a price, so the billable figure is what the row leads
 * with — the display copy is one edit away and lives on the detail screen.
 */
export default function Plans() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const { data, loading, error, reload } = useResource(
    () => fetchPlans(token),
    [token],
  );

  const [removing, setRemoving] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function remove(planId: number) {
    if (!window.confirm(t.plans.deleteConfirm)) return;
    setProblem(null);
    setRemoving(planId);
    try {
      await deletePlan(token, planId);
      reload();
    } catch (cause) {
      // `PLAN_IN_USE` also covers payments left behind by subscriptions that
      // have since been cancelled, so the server's "in use" is broader than it
      // sounds and its English is not what a Georgian admin should be reading.
      // Anything else keeps the server's wording, which is more specific.
      setProblem(
        cause instanceof ApiError && cause.code === "PLAN_IN_USE"
          ? t.plans.deleteBlocked
          : (cause as Error).message || t.plans.deleteBlocked,
      );
    } finally {
      setRemoving(null);
    }
  }

  const plans = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.plans.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.plans.subtitle}</p>
        </div>
        <Link to={adminPath("/plans/new")} className="btn-primary">
          {t.plans.create}
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 text-center">
          <p className="text-sm font-semibold text-danger">{error.message}</p>
          <button type="button" onClick={reload} className="btn-secondary mt-4">
            {t.retry}
          </button>
        </div>
      )}

      {loading && !data && <p className="mt-8 text-sm text-ink-400">{t.loading}</p>}

      {problem && (
        <p className="mt-6 text-sm font-semibold text-danger">{problem}</p>
      )}

      {data && plans.length === 0 && (
        <p className="mt-8 rounded-3xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {t.plans.empty}
        </p>
      )}

      {plans.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">{t.plans.name}</th>
                <th className="hidden px-5 py-3 text-start font-semibold sm:table-cell">
                  {t.plans.code}
                </th>
                <th className="px-5 py-3 text-start font-semibold">{t.plans.price}</th>
                <th className="hidden px-5 py-3 text-start font-semibold md:table-cell">
                  {t.plans.billingPeriod}
                </th>
                <th className="px-5 py-3 text-start font-semibold">{t.plans.status}</th>
                <th className="px-5 py-3 text-end font-semibold">
                  <span className="sr-only">{t.plans.edit}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                // Staff read this screen in their own language; a plan without
                // that translation still has to be identifiable, so the code is
                // the fallback rather than an empty cell.
                const copy =
                  plan.translations.find((item) => item.language === locale) ??
                  plan.translations[0];
                return (
                  <tr
                    key={plan.id}
                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={adminPath(`/plans/${plan.id}`)}
                        className="font-semibold text-ink-900 hover:text-bloom-600"
                      >
                        {copy?.name || plan.code}
                      </Link>
                      {plan.featured && (
                        <span className="ms-2 inline-flex items-center rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-tint-fg">
                          {t.plans.featured}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-5 py-4 text-ink-600 sm:table-cell">
                      {plan.code}
                    </td>
                    <td className="px-5 py-4 text-ink-900" dir="ltr">
                      {/* `effectivePriceMinor` rather than a sum worked out
                          here: the price staff read on this row and the price a
                          client is charged must come from the same place. */}
                      {plan.discountLive ? (
                        <>
                          <span className="text-ink-400 line-through">
                            {formatMinor(plan.priceMinor, plan.currency, locale)}
                          </span>{" "}
                          <span className="font-semibold">
                            {formatMinor(
                              plan.effectivePriceMinor,
                              plan.currency,
                              locale,
                            )}
                          </span>
                          <span className="ms-2 inline-flex items-center rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-tint-fg">
                            −{plan.discountPercent}%
                          </span>
                        </>
                      ) : (
                        formatMinor(plan.priceMinor, plan.currency, locale)
                      )}
                    </td>
                    <td className="hidden px-5 py-4 text-ink-600 md:table-cell">
                      {t.plans.periods[plan.billingPeriod] ?? plan.billingPeriod}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-semibold ${
                          plan.active ? "text-success" : "text-ink-400"
                        }`}
                      >
                        {plan.active ? t.plans.active : t.accounts.disabled}
                      </span>
                      {!plan.purchasable && (
                        <p className="mt-0.5 text-xs text-ink-400">
                          {t.plans.purchasable}: {t.no}
                        </p>
                      )}
                      {plan.comingSoon && (
                        <p className="mt-0.5 text-xs font-semibold text-ink-500">
                          {t.plans.comingSoon}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={adminPath(`/plans/${plan.id}`)}
                          className="text-sm font-semibold text-ink-600 hover:text-bloom-600"
                        >
                          {t.plans.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() => void remove(plan.id)}
                          disabled={removing !== null}
                          className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                        >
                          {removing === plan.id ? t.plans.deleting : t.plans.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
