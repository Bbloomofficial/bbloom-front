import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatMinor } from "../../api/plans";
import { useI18n } from "../../i18n";
import { dashPath } from "../../routes";
import { fetchOrderStats, fetchOrders } from "../api/client";
import { FULFILMENT_STATUSES, ORDER_STATUSES } from "../api/types";
import type { Order } from "../api/types";
import { useSession } from "../auth";
import { FulfilmentBadge, OrderStatusBadge } from "../components/Badges";
import OrderDetail from "../components/OrderDetail";
import { useResource } from "../hooks";
import { useOrdering } from "../ordering";
import { useActiveSite } from "../site";
import { dashboardStrings, formatDateTime } from "../strings";

/**
 * The shop's order list.
 *
 * A sibling of the inbox rather than a new invention: same paged list, same
 * URL-held filters, same detail pane beside it. The one structural difference
 * is that this screen can be reached by a website that cannot sell at all, so
 * it leads with the reason instead of an empty list — and it keeps that reason
 * even when the nav tab is hidden, which is the whole point of the page
 * remaining addressable.
 */

const PAGE_SIZE = 20;

function FilterPills({
  label,
  options,
  value,
  onChange,
  labels,
  allLabel,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  labels: Record<string, string>;
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      {["", ...options].map((option) => (
        <button
          key={option || "all"}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            option === value
              ? "bg-ink-900 text-canvas"
              : "border border-ink-100 bg-surface text-ink-600 hover:border-bloom-300 hover:text-bloom-600"
          }`}
        >
          {option ? (labels[option] ?? option) : allLabel}
        </button>
      ))}
    </div>
  );
}

export default function Orders() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token } = useSession();
  const site = useActiveSite();
  const siteId = site.id;
  const ordering = useOrdering();

  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const fulfilment = params.get("fulfilment") ?? "";
  const page = Math.max(0, Number(params.get("page") ?? "0") || 0);
  const selectedId = params.get("selected");

  const canSell = ordering.status?.enabled === true;

  const list = useResource(
    () =>
      canSell
        ? fetchOrders(token, siteId, {
            status: status || undefined,
            fulfilment: fulfilment || undefined,
            page,
            size: PAGE_SIZE,
          })
        : // A website that cannot sell has no orders worth asking for, and the
          // request would only spend a round trip to be told so.
          Promise.resolve(null),
    [token, siteId, canSell, status, fulfilment, page],
  );

  const stats = useResource(
    () => (canSell ? fetchOrderStats(token, siteId) : Promise.resolve(null)),
    [token, siteId, canSell],
  );

  // Patched rows are kept locally so a fulfilment change shows up without a
  // refetch that could reshuffle the page under the client.
  const [patched, setPatched] = useState<Record<string, Order>>({});
  useEffect(() => setPatched({}), [status, fulfilment, page]);

  const items = useMemo(
    () => (list.data?.items ?? []).map((item) => patched[item.id] ?? item),
    [list.data, patched],
  );

  // Only the loaded page is searched, which holds because `selected` is set by
  // clicking a row of that page and cleared whenever the filter or page moves.
  // Unlike the inbox there *is* a single-order endpoint, so this could become a
  // real deep link later; it is not one today because nothing links here.
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const update = useCallback(
    (next: Partial<Record<string, string>>) => {
      setParams(
        (current) => {
          const draft = new URLSearchParams(current);
          for (const [key, value] of Object.entries(next)) {
            if (value) draft.set(key, value);
            else draft.delete(key);
          }
          return draft;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const totalPages = list.data?.totalPages ?? 1;
  const filtered = Boolean(status || fulfilment);

  const blockedReason = ordering.status?.blockedReason;
  const blockedCopy =
    blockedReason && blockedReason in t.orders.blocked
      ? t.orders.blocked[blockedReason as keyof typeof t.orders.blocked]
      : t.orders.blockedUnknown;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.orders.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.orders.subtitle}</p>
        </div>
        {canSell && (
          <button
            type="button"
            onClick={list.reload}
            className="btn-secondary"
            disabled={list.loading}
          >
            {t.orders.refresh}
          </button>
        )}
      </div>

      {!canSell ? (
        ordering.loading ? (
          <p className="text-sm text-ink-400">{t.loading}</p>
        ) : (
          <div className="rounded-3xl border border-ink-100 bg-surface p-6">
            <p className="text-base font-bold text-ink-900">
              {t.orders.blockedTitle}
            </p>
            <p className="mt-2 text-sm text-ink-600">{blockedCopy}</p>
            {/* Only the plan reason has a screen to send someone to. The other
                two end at us: a design change and a bank connection are both
                things we do, not things the client can press a button for. */}
            {blockedReason === "FEATURE_OFF" && (
              <Link
                to={dashPath(`/s/${siteId}/billing`)}
                className="btn-secondary mt-4 inline-block"
              >
                {t.orders.seePlans}
              </Link>
            )}
          </div>
        )
      ) : (
        <>
          {stats.data && (
            <div className="rounded-3xl border border-ink-100 bg-surface p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {t.orders.statsTitle}
              </p>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  [t.orders.statTotal, String(stats.data.total)],
                  [t.orders.statNew, String(stats.data.newOrders)],
                  [t.orders.statAwaiting, String(stats.data.awaitingPayment)],
                  [t.orders.statPaid, String(stats.data.paid)],
                  [t.orders.statLast7, String(stats.data.last7Days)],
                  [t.orders.statLast30, String(stats.data.last30Days)],
                  [
                    t.orders.statTakings,
                    // The server's own sum of paid orders, in minor units.
                    // Nothing here adds anything up: the figure is the takings
                    // and a total assembled on this side would eventually
                    // disagree with the client's bank statement.
                    formatMinor(
                      stats.data.paidTotalMinor,
                      stats.data.currency,
                      locale,
                    ),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-ink-400">{label}</dt>
                    <dd
                      className="mt-1 text-lg font-extrabold text-ink-900"
                      dir="ltr"
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-ink-400">
                {t.orders.takingsHint}
              </p>
            </div>
          )}

          <div className="space-y-3 rounded-3xl border border-ink-100 bg-surface p-4 sm:p-5">
            <FilterPills
              label={t.orders.status}
              options={ORDER_STATUSES}
              value={status}
              onChange={(next) =>
                update({ status: next, page: "", selected: "" })
              }
              labels={t.orderStatuses}
              allLabel={t.orders.all}
            />
            <FilterPills
              label={t.orders.fulfilment}
              options={FULFILMENT_STATUSES}
              value={fulfilment}
              onChange={(next) =>
                update({ fulfilment: next, page: "", selected: "" })
              }
              labels={t.fulfilments}
              allLabel={t.orders.all}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-ink-100 bg-surface">
                {list.loading && !list.data ? (
                  <p className="p-6 text-sm text-ink-400">{t.loading}</p>
                ) : list.error ? (
                  <div className="p-6">
                    <p className="text-sm font-semibold text-danger">
                      {list.error.message}
                    </p>
                    <button
                      type="button"
                      onClick={list.reload}
                      className="btn-secondary mt-4"
                    >
                      {t.retry}
                    </button>
                  </div>
                ) : items.length === 0 ? (
                  <p className="p-6 text-sm text-ink-400">
                    {filtered ? t.orders.emptyFiltered : t.orders.empty}
                  </p>
                ) : (
                  <ul>
                    {items.map((order) => {
                      const active = order.id === selectedId;
                      return (
                        <li
                          key={order.id}
                          className="border-t border-ink-100 first:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => update({ selected: order.id })}
                            className={`flex w-full flex-wrap items-center gap-3 px-5 py-4 text-start transition ${
                              active ? "bg-tint" : "hover:bg-ink-50"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                order.fulfilment === "NEW"
                                  ? "bg-bloom-500"
                                  : "bg-transparent"
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-ink-900">
                                {t.orders.number(order.orderNumber)}
                                {order.customerName
                                  ? ` · ${order.customerName}`
                                  : ""}
                              </span>
                              <span className="block truncate text-xs text-ink-400">
                                {order.items
                                  .map((item) => `${item.quantity}× ${item.name}`)
                                  .join(", ")}
                              </span>
                            </span>
                            <span
                              className="text-sm font-bold text-ink-900"
                              dir="ltr"
                            >
                              {formatMinor(
                                order.amountMinor,
                                order.currency,
                                locale,
                              )}
                            </span>
                            <OrderStatusBadge status={order.status} />
                            <FulfilmentBadge fulfilment={order.fulfilment} />
                            <span className="w-full text-xs text-ink-400 sm:w-auto">
                              {formatDateTime(order.createdAt, locale)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {list.data && list.data.totalItems > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-ink-400">
                    {t.orders.results(list.data.totalItems)}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn-secondary disabled:opacity-50"
                        disabled={page === 0}
                        onClick={() =>
                          update({ page: String(page - 1), selected: "" })
                        }
                      >
                        {t.orders.prev}
                      </button>
                      <span className="text-ink-600">
                        {t.orders.page(page + 1, totalPages)}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary disabled:opacity-50"
                        disabled={!list.data.hasNext}
                        onClick={() =>
                          update({ page: String(page + 1), selected: "" })
                        }
                      >
                        {t.orders.next}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-ink-100 bg-surface">
                {selected ? (
                  <OrderDetail
                    key={selected.id}
                    order={selected}
                    onChange={(updated) => {
                      setPatched((current) => ({
                        ...current,
                        [updated.id]: updated,
                      }));
                      // A refund moves money out of the takings, so the summary
                      // above would keep claiming a sale that has been given
                      // back until the next page load.
                      stats.reload();
                    }}
                    onClose={() => update({ selected: "" })}
                  />
                ) : (
                  <p className="p-6 text-sm text-ink-400">{t.orders.select}</p>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
