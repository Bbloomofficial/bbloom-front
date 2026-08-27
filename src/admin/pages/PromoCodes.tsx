import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { deletePromoCode, fetchPromoCodes } from "../api/client";
import { adminStrings } from "../strings";
import { formatEndDay } from "../datetime";
import { adminPath } from "../../routes";

/**
 * Promo codes staff hand out, and how much of each has been used.
 *
 * The usage figure is the reason this screen leads with a table rather than
 * cards: "3 of 50" and "expires Friday" are what somebody checks before
 * promising a code to a client, and both change without anyone editing a thing.
 */
export default function PromoCodes() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const { data, loading, error, reload } = useResource(
    () => fetchPromoCodes(token),
    [token],
  );

  const [removing, setRemoving] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function remove(promoId: number) {
    if (!window.confirm(t.promoCodes.deleteConfirm)) return;
    setProblem(null);
    setRemoving(promoId);
    try {
      await deletePromoCode(token, promoId);
      reload();
    } catch (cause) {
      // Refused once a payment names the code. The API's wording is more
      // specific than ours, so prefer it.
      setProblem((cause as Error).message || t.promoCodes.deleteBlocked);
    } finally {
      setRemoving(null);
    }
  }

  const codes = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.promoCodes.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.promoCodes.subtitle}</p>
        </div>
        <Link to={adminPath("/promo-codes/new")} className="btn-primary">
          {t.promoCodes.create}
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

      {loading && !data && (
        <p className="mt-8 text-sm text-ink-400">{t.loading}</p>
      )}

      {problem && (
        <p className="mt-6 text-sm font-semibold text-danger">{problem}</p>
      )}

      {data && codes.length === 0 && (
        <p className="mt-8 rounded-3xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {t.promoCodes.empty}
        </p>
      )}

      {codes.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.promoCodes.code}
                </th>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.promoCodes.percentOff}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold sm:table-cell">
                  {t.promoCodes.used}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold md:table-cell">
                  {t.promoCodes.appliesTo}
                </th>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.promoCodes.status}
                </th>
                <th className="px-5 py-3 text-end font-semibold">
                  <span className="sr-only">{t.promoCodes.edit}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {codes.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={adminPath(`/promo-codes/${promo.id}`)}
                      className="font-semibold text-ink-900 hover:text-bloom-600"
                      dir="ltr"
                    >
                      {promo.code}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-ink-900" dir="ltr">
                    −{promo.percentOff}%
                  </td>
                  <td
                    className="hidden px-5 py-4 text-ink-600 sm:table-cell"
                    dir="ltr"
                  >
                    {/* No limit is the common case and reads as a bare count
                        rather than as "3 of ∞". */}
                    {promo.maxRedemptions === undefined
                      ? promo.redemptions
                      : `${promo.redemptions} / ${promo.maxRedemptions}`}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-600 md:table-cell">
                    {/* An empty restriction list means every plan, not none. */}
                    {promo.planCodes.length === 0
                      ? t.promoCodes.allPlans
                      : promo.planCodes.join(", ")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold ${
                        promo.usable ? "text-success" : "text-ink-400"
                      }`}
                    >
                      {promo.usable
                        ? t.promoCodes.usable
                        : t.promoCodes.notUsable}
                    </span>
                    {promo.expiresAt && (
                      <p className="mt-0.5 text-xs text-ink-400">
                        {t.promoCodes.expires}{" "}
                        {formatEndDay(promo.expiresAt, locale)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={adminPath(`/promo-codes/${promo.id}`)}
                        className="text-sm font-semibold text-ink-600 hover:text-bloom-600"
                      >
                        {t.promoCodes.edit}
                      </Link>
                      <button
                        type="button"
                        onClick={() => void remove(promo.id)}
                        disabled={removing !== null}
                        className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                      >
                        {removing === promo.id
                          ? t.promoCodes.deleting
                          : t.promoCodes.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
