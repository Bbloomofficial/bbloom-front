import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "../../api/http";
import { formatMinor } from "../../api/plans";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import { recordRefund, updateOrder } from "../api/client";
import { FULFILMENT_STATUSES } from "../api/types";
import type { Order } from "../api/types";
import { useSession } from "../auth";
import { useActiveSite } from "../site";
import { dashboardStrings, formatDateTime } from "../strings";
import { FulfilmentBadge, OrderStatusBadge } from "./Badges";

/**
 * One order, and the two things a shop is allowed to change about it.
 *
 * The payment status is read-only here and there is no control that could
 * change it, because the API has no field for one. That is not an omission to
 * be worked around: a shop able to mark its own orders paid is a shop that can
 * be talked into it by a customer on the phone.
 */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-ink-800">{children}</div>
    </div>
  );
}

export default function OrderDetail({
  order,
  onChange,
  onClose,
  /**
   * Whether to offer the refund control at all. Recording a refund is staff-only
   * on the API, so showing it to a shop owner would be a button that answers
   * 403 every time — worse than absent, because it implies the panel can undo a
   * payment and it cannot.
   */
  canRefund = false,
}: {
  order: Order;
  onChange: (updated: Order) => void;
  onClose: () => void;
  canRefund?: boolean;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, handleError } = useSession();
  const site = useActiveSite();

  const [note, setNote] = useState(order.internalNote ?? "");
  // Kept apart from the note above. The API *appends* a refund note to the
  // internal note, so reusing that box would send the shop's existing note back
  // and write it into the order twice.
  const [refundNote, setRefundNote] = useState("");
  const [busy, setBusy] = useState<"fulfilment" | "note" | "refund" | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const root = useRef<HTMLDivElement>(null);

  // On narrow screens the detail sits below the list, so bring it into view.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [order.id]);

  useEffect(() => {
    setNote(order.internalNote ?? "");
    setRefundNote("");
    setSaved(false);
    setError(null);
  }, [order.id]);

  async function patch(
    changes: { fulfilment?: string; internalNote?: string },
    kind: "fulfilment" | "note",
  ) {
    setBusy(kind);
    setError(null);
    try {
      onChange(await updateOrder(token, site.id, order.id, changes));
      if (kind === "note") setSaved(true);
    } catch (caught) {
      handleError(caught);
      // The API refuses to move an unpaid order into preparation. Surfacing it
      // as "we couldn't save that" would read as a network hiccup and invite a
      // retry; it is a rule, and the shop needs to know which one. Matched on
      // the code, because the sentence behind it is English.
      if (caught instanceof ApiError && caught.code === "ORDER_NOT_PAID") {
        setError(t.orders.detail.notPaidYet);
      } else {
        setError(describeProblem(caught, t.errors, t.orders.detail.saveFailed));
      }
    } finally {
      setBusy(null);
    }
  }

  async function refund() {
    if (busy || !window.confirm(t.orders.detail.refundConfirm)) return;
    setBusy("refund");
    setError(null);
    try {
      onChange(
        await recordRefund(token, site.id, order.id, refundNote.trim() || undefined),
      );
    } catch (caught) {
      handleError(caught);
      // Its own code now, rather than the one the fulfilment rule uses: a
      // refund is refused because the order was never paid *or* has already
      // been refunded, which is a different sentence from "you cannot start
      // preparing something nobody has paid for".
      if (caught instanceof ApiError && caught.code === "ORDER_NOT_REFUNDABLE") {
        setError(t.orders.detail.refundNotPaid);
      } else {
        setError(
          describeProblem(caught, t.errors, t.orders.detail.refundFailed),
        );
      }
    } finally {
      setBusy(null);
    }
  }

  const money = (minor: number) => formatMinor(minor, order.currency, locale);

  return (
    <div ref={root} className="space-y-6 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <FulfilmentBadge fulfilment={order.fulfilment} />
          </div>
          <h2 className="mt-3 truncate text-xl font-extrabold tracking-tight text-ink-900">
            {t.orders.number(order.orderNumber)}
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            {t.orders.detail.placed} · {formatDateTime(order.createdAt, locale)}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            {order.paidAt
              ? `${t.orders.detail.paid} · ${formatDateTime(order.paidAt, locale)}`
              : t.orders.detail.notPaid}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="icon-button shrink-0 lg:hidden"
          aria-label={t.orders.detail.close}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <Field label={t.orders.detail.items}>
        <ul className="divide-y divide-ink-100">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${item.sku ?? ""}`}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink-900">
                  {item.name}
                </span>
                <span className="block text-xs text-ink-400" dir="ltr">
                  {t.orders.detail.quantity} {item.quantity} ·{" "}
                  {money(item.unitPriceMinor)}
                </span>
              </span>
              {/* The server's own line total, rendered as sent. Multiplying it
                  back out here would agree today and diverge silently the first
                  time a line carries anything this screen cannot see. */}
              <span className="shrink-0 font-semibold text-ink-900" dir="ltr">
                {money(item.lineTotalMinor)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-ink-100 pt-3">
          <span className="text-sm font-semibold text-ink-600">
            {t.orders.detail.total}
          </span>
          <span className="text-base font-extrabold text-ink-900" dir="ltr">
            {money(order.amountMinor)}
          </span>
        </div>
      </Field>

      <Field label={t.orders.detail.customer}>
        {order.customerName || order.customerEmail || order.customerPhone ? (
          <div className="space-y-1">
            {order.customerName && (
              <p className="font-semibold text-ink-900">{order.customerName}</p>
            )}
            <div className="flex flex-wrap items-center gap-3" dir="ltr">
              {order.customerEmail && (
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="font-semibold text-tint-fg hover:underline"
                >
                  {order.customerEmail}
                </a>
              )}
              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone.replace(/\s+/g, "")}`}
                  className="font-semibold text-tint-fg hover:underline"
                >
                  {order.customerPhone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-ink-400">{t.orders.detail.noCustomer}</p>
        )}
      </Field>

      {order.customerNote && (
        <Field label={t.orders.detail.customerNote}>
          <p className="whitespace-pre-wrap text-ink-600">
            {order.customerNote}
          </p>
        </Field>
      )}

      <div className="border-t border-ink-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {t.orders.fulfilment}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FULFILMENT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy !== null || status === order.fulfilment}
              onClick={() => void patch({ fulfilment: status }, "fulfilment")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                status === order.fulfilment
                  ? "bg-bloom-600 text-white"
                  : "border border-ink-100 bg-surface text-ink-600 hover:border-bloom-300 hover:text-bloom-600"
              } disabled:opacity-60`}
            >
              {t.fulfilments[status]}
            </button>
          ))}
        </div>
        {/* Said before the refusal rather than after it, because the refusal
            arrives at the end of a click somebody has already committed to. */}
        {order.status === "AWAITING_PAYMENT" && (
          <p className="mt-2 text-xs text-ink-400">
            {t.orders.detail.notPaidYet}
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="order-note">
          {t.orders.detail.internalNote}
        </label>
        <textarea
          id="order-note"
          rows={3}
          className="field resize-y"
          placeholder={t.orders.detail.notePlaceholder}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setSaved(false);
          }}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary disabled:opacity-60"
            disabled={busy !== null || note === (order.internalNote ?? "")}
            onClick={() => void patch({ internalNote: note }, "note")}
          >
            {busy === "note" ? t.orders.detail.saving : t.orders.detail.save}
          </button>
          {saved && (
            <span className="text-xs font-semibold text-success">
              {t.orders.detail.saved}
            </span>
          )}
        </div>
      </div>

      {canRefund && order.status === "PAID" && (
        <div className="rounded-2xl border border-ink-100 bg-sunken p-4">
          <p className="text-sm font-bold text-ink-900">
            {t.orders.detail.refund}
          </p>
          <p className="mt-1 text-xs text-ink-600">
            {t.orders.detail.refundHint}
          </p>
          <input
            className="field mt-3"
            placeholder={t.orders.detail.refundNotePlaceholder}
            maxLength={300}
            value={refundNote}
            onChange={(event) => setRefundNote(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void refund()}
            disabled={busy !== null}
            className="mt-3 text-sm font-semibold text-danger hover:underline disabled:opacity-50"
          >
            {busy === "refund"
              ? t.orders.detail.refunding
              : t.orders.detail.refund}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 border-t border-ink-100 pt-5 text-xs text-ink-400">
        {order.provider && (
          <div>
            <dt>{t.orders.detail.provider}</dt>
            <dd className="mt-0.5 font-semibold text-ink-600" dir="ltr">
              {order.provider}
            </dd>
          </div>
        )}
        {order.language && (
          <div>
            <dt>{t.orders.detail.language}</dt>
            <dd className="mt-0.5 font-semibold text-ink-600">
              {order.language}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
