import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { deletePromoCode, fetchPromoCodes } from "../api/client";
import { adminStrings } from "../strings";
import { formatEndDay } from "../datetime";
import { adminPath } from "../../routes";
import { instant, matchesQuery, sortRows } from "../listTools";
import { FilterSelect, ListToolbar, SortTh, useListParams } from "../components/ListTools";

const FILTERS = ["status", "plan"] as const;
const SORTS = ["code", "percent", "used", "status", "created"] as const;

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

  const list = useListParams(FILTERS, SORTS, { sort: "created", direction: "desc" });
  const all = data ?? [];
  const planCodes = useMemo(
    () => [...new Set(all.flatMap((promo) => promo.planCodes))].sort(),
    [all],
  );

  const filtered = useMemo(
    () =>
      all.filter((promo) => {
        if (list.filters.status === "usable" && !promo.usable) return false;
        if (list.filters.status === "unusable" && promo.usable) return false;
        // A code with no plan restriction applies to every plan, this one too.
        if (
          list.filters.plan &&
          promo.planCodes.length > 0 &&
          !promo.planCodes.includes(list.filters.plan)
        ) {
          return false;
        }
        return matchesQuery([promo.code, ...promo.planCodes], list.query);
      }),
    [all, list.query, JSON.stringify(list.filters)],
  );
  const codes = useMemo(
    () =>
      sortRows(
        filtered,
        (promo) => {
          switch (list.sort) {
            case "code":
              return promo.code;
            case "percent":
              return promo.percentOff;
            case "used":
              return promo.redemptions;
            case "status":
              return promo.usable ? 0 : 1;
            case "created":
              return instant(promo.createdAt);
          }
        },
        list.direction,
        locale,
      ),
    [filtered, list.sort, list.direction, locale],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
            {t.promoCodes.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.promoCodes.subtitle}</p>
        </div>
        <Link to={adminPath("/promo-codes/new")} className="btn-primary">
          {t.promoCodes.create}
        </Link>
      </div>

      <ListToolbar
        query={list.query}
        onQuery={(value) => list.update({ q: value || null })}
        placeholder={t.promoCodes.code}
        shown={filtered.length}
        total={all.length}
        narrowed={list.narrowed}
        onClear={list.clear}
      >
        <FilterSelect
          label={t.promoCodes.status}
          value={list.filters.status}
          onChange={(value) => list.update({ status: value || null })}
          options={[
            { value: "usable", label: t.promoCodes.usable },
            { value: "unusable", label: t.promoCodes.notUsable },
          ]}
        />
        <FilterSelect
          label={t.promoCodes.appliesTo}
          value={list.filters.plan}
          onChange={(value) => list.update({ plan: value || null })}
          options={planCodes.map((code) => ({ value: code, label: code }))}
        />
      </ListToolbar>

      {error && (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-surface p-6 text-center">
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
        <p className="mt-8 rounded-2xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {all.length === 0 ? t.promoCodes.empty : t.list.noneMatching}
        </p>
      )}

      {codes.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-[13px] text-ink-600 font-semibold">
              <tr>
                <SortTh column="code" label={t.promoCodes.code} list={list} />
                <SortTh
                  column="percent"
                  label={t.promoCodes.percentOff}
                  list={list}
                  first="desc"
                />
                <SortTh
                  column="used"
                  label={t.promoCodes.used}
                  list={list}
                  first="desc"
                  className="hidden sm:table-cell"
                />
                <th className="hidden px-5 py-3 text-start font-semibold md:table-cell">
                  {t.promoCodes.appliesTo}
                </th>
                <SortTh column="status" label={t.promoCodes.status} list={list} />
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
                      className="font-semibold text-ink-900 hover:underline"
                      dir="ltr" translate="no"
                    >
                      {promo.code}
                    </Link>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-ink-900" dir="ltr">
                    −{promo.percentOff}%
                  </td>
                  <td
                    className="hidden px-5 py-4 tabular-nums text-ink-600 sm:table-cell"
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
                        className="text-sm font-semibold text-ink-600 hover:text-ink-900"
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
