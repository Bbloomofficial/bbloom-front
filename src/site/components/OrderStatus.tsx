import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/http";
import { fetchPublicOrder } from "../api/client";
import type { PublicOrder } from "../api/types";
import { useSite } from "../context";
import { formatMinorMoney } from "../utils/money";
import { forgetOrder, recallOrder, rememberOrder } from "./BuyNow";
import { SiteButton } from "./SiteButton";

/**
 * Where the customer lands after the bank.
 *
 * Settlement is not synchronous. The bank redirects the browser back as soon as
 * the card is authorised, but the order only becomes `PAID` once our side has
 * asked the bank what happened — and a background job reconciles anything that
 * slips through. So arriving here and seeing `AWAITING_PAYMENT` is the *normal*
 * case for the first few seconds, and a page that announced failure on the
 * first read would be telling paying customers their payment had bounced.
 *
 * Hence the poll. It backs off, and it stops: an unbounded poll on a public
 * page is a request amplifier pointed at our own API by anyone who leaves a tab
 * open. When it gives up it says so honestly rather than deciding the payment
 * failed, because we genuinely do not know that.
 */

/** Milliseconds between reads. Roughly half a minute in total, then it stops. */
const BACKOFF = [1500, 2000, 3000, 4000, 6000, 8000, 12000];

/** States the bank has finished with; nothing will change by asking again. */
const SETTLED = new Set(["PAID", "FAILED", "EXPIRED", "CANCELLED", "REFUNDED"]);

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-site-muted">{label}</span>
      <span className="text-sm font-semibold text-site-text" dir="ltr">
        {value}
      </span>
    </div>
  );
}

export function OrderStatus({
  token,
  onClose,
}: {
  token?: string;
  onClose: () => void;
}) {
  const { ref, locale, t } = useSite();
  const [search] = useSearchParams();

  /*
    Three ways to arrive, in order of how much they can be trusted.

    A token in the path is someone deliberately opening a link they kept. The
    `?order=` parameter is the bank's return, appended server-side to the
    validated return url — the storefront cannot supply it, because the token
    does not exist yet when the redirect target is chosen. Storage is the last
    resort and only covers a return that lost its query string.

    The stored copy used to be the primary, which broke the case worth caring
    about most: a customer who pays in their bank's app and lands back in a
    different browser context has been charged and has no stored token, so a
    page keyed on storage alone could show them nothing at all.
  */
  const fromQuery = search.get("order");
  const resolved = token ?? fromQuery ?? recallOrder(ref) ?? null;

  // Kept, so a reload of the bare return url still finds the order after the
  // query string has been navigated away from.
  useEffect(() => {
    if (fromQuery) rememberOrder(ref, fromQuery);
  }, [ref, fromQuery]);

  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const attempt = useRef(0);

  useEffect(() => {
    if (!resolved) {
      setError(t.buy.notFound);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    async function read() {
      try {
        const next = await fetchPublicOrder(resolved as string);
        if (cancelled) return;
        setOrder(next);
        setError(null);

        if (SETTLED.has(next.status)) {
          // The order has reached a state the bank will not change. Drop the
          // stored token so the next visit to a bare `/order` does not reopen
          // a purchase the customer has already finished with.
          forgetOrder(ref);
          return;
        }

        const wait = BACKOFF[attempt.current];
        if (wait === undefined) {
          setExhausted(true);
          return;
        }
        attempt.current += 1;
        timer = window.setTimeout(read, wait);
      } catch (caught) {
        if (cancelled) return;
        // A 404 here means the token is wrong or has been cleared, which is a
        // dead end rather than something to keep asking about.
        if (caught instanceof ApiError && caught.status === 404) {
          setError(t.buy.notFound);
          return;
        }
        setError(t.errorGeneric);
      }
    }

    read();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [resolved, ref, t]);

  const heading = (() => {
    if (error) return { title: t.buy.notFound, body: "" };
    if (!order) return { title: t.buy.confirming, body: t.buy.confirmingBody };
    switch (order.status) {
      case "PAID":
        return { title: t.buy.paid, body: t.buy.paidBody };
      case "FAILED":
      case "EXPIRED":
        return { title: t.buy.failed, body: t.buy.failedBody };
      case "CANCELLED":
        return { title: t.buy.cancelled, body: t.buy.cancelledBody };
      case "REFUNDED":
        return { title: t.buy.refunded, body: t.buy.refundedBody };
      default:
        return {
          title: t.buy.confirming,
          body: exhausted ? t.buy.stillConfirming : t.buy.confirmingBody,
        };
    }
  })();

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="site-fade-up max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-site-lg border border-site-border p-6 sm:p-8"
        style={{ backgroundColor: "var(--site-surface)" }}
      >
        <p className="site-eyebrow">
          {order ? t.buy.orderTitle(order.orderNumber) : ""}
        </p>
        <h2 className="site-heading site-h3 mt-1 text-site-text">
          {heading.title}
        </h2>
        {heading.body ? (
          <p className="mt-2 text-sm text-site-muted">{heading.body}</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-site-muted">{error}</p>
        ) : null}

        {order ? (
          <div className="mt-5 flex flex-col gap-2 border-t border-site-border pt-4">
            {order.items.map((item) => (
              <Line
                key={`${item.productId}-${item.sku ?? ""}`}
                label={`${item.quantity} × ${item.name}`}
                // The server's own line total, printed as sent. Multiplying the
                // unit price here would eventually disagree with what the bank
                // charged, and the customer would believe this page.
                value={
                  formatMinorMoney(
                    item.lineTotalMinor,
                    order.currency,
                    locale,
                  ) ?? ""
                }
              />
            ))}
            <div className="mt-2 border-t border-site-border pt-2">
              <Line
                label={t.buy.total}
                value={
                  formatMinorMoney(
                    order.amountMinor,
                    order.currency,
                    locale,
                  ) ?? ""
                }
              />
            </div>
          </div>
        ) : null}

        <SiteButton type="button" className="mt-6" onClick={onClose}>
          {t.buy.backToSite}
        </SiteButton>
      </div>
    </div>
  );
}
