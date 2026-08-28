import { useState } from "react";
import { ApiError } from "../../api/http";
import { placeOrder } from "../api/client";
import type { PublicProduct } from "../api/types";
import { useSite } from "../context";
import { formatMinorMoney } from "../utils/money";
import { EMAIL, Honeypot } from "./enquiry";
import { SiteButton } from "./SiteButton";

/**
 * Buying one item.
 *
 * Deliberately not a cart. A basket is a promise that the shop can hold state
 * across a browse, reprice it, and survive the customer leaving for the bank and
 * coming back — three separate places to lose someone's money's worth of trust,
 * for shops that sell a handful of things. One product, one quantity, one trip
 * to the bank: the order exists on the server before the customer leaves the
 * page, so there is nothing left here that needs to survive the round trip
 * except the token to read it back with.
 *
 * The prices shown are the catalogue's, and they are shown only. The request
 * carries product ids and quantities and nothing else; the total the customer
 * is charged is the one the server works out. Anything printed here that
 * disagrees with it is a display bug, not a discount.
 */

/** Where the bank sends the customer back to. */
function returnUrlFor(): string {
  // No token in here, and none needed: the order is committed before the
  // gateway is called, so the server appends `?order=<token>` to this url once
  // it has validated that it belongs to the site. That is also why it must not
  // be built with a fragment or a hand-rolled query string — the server handles
  // both, but there is nothing here worth making it handle.
  const base = window.location.pathname.replace(/\/p\/[^/]+\/?$/, "");
  return `${window.location.origin}${base.replace(/\/$/, "")}/order`;
}

const STORAGE_PREFIX = "bbloom.order.";

/**
 * Remembers the order across the trip to the bank.
 *
 * A fallback rather than the mechanism: the token comes back on the url the
 * server appended it to, and this only covers a return that lost its query
 * string. It cannot be the primary, because the case that matters most is a
 * customer who pays in their bank's own app and lands back in a different
 * browser context — charged, and with nothing in this store at all.
 *
 * `localStorage` rather than `sessionStorage` for the same reason: a session
 * store that quietly emptied itself would leave a paying customer on a page
 * claiming their order does not exist. Stale entries are harmless — the token
 * is only a handle, and it grants nothing beyond reading one order back.
 */
export function rememberOrder(ref: string, token: string) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + ref, token);
  } catch {
    // Private browsing, or storage that is full. Losing the token costs the
    // customer their status page, not their order, so it is not worth failing
    // the purchase over.
  }
}

export function recallOrder(ref: string): string | null {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + ref);
  } catch {
    return null;
  }
}

export function forgetOrder(ref: string) {
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + ref);
  } catch {
    /* see rememberOrder */
  }
}

export function BuyNow({ product }: { product: PublicProduct }) {
  const { ref, locale, t, canOrder, preview, meta } = useSite();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A product with no price cannot be sold: the server prices from the
  // catalogue and would refuse the line, so offering the button would only
  // produce a refusal after the customer had filled the form in.
  const sellable = canOrder && product.available && product.price !== null;
  if (!sellable) return null;

  const unitMinor = Math.round((product.price ?? 0) * 100);
  const total = formatMinorMoney(unitMinor * quantity, meta.currency, locale);

  function describe(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.status === 429) return t.buy.rateLimited;
      switch (caught.code) {
        // One message for every reason a shop cannot sell right now, and no
        // attempt to work out which. The vagueness is the point: a stranger
        // walking the slug space must not be able to read off which shops are
        // unpaid or have no bank account. A tripped honeypot arrives as
        // `ORDERING_UNAVAILABLE` too — byte-identical to a genuine refusal, so
        // there is no second response for a script to compare against.
        case "ORDERING_UNAVAILABLE":
        case "PAYMENT_UNAVAILABLE":
          return caught.message || t.buy.unavailable;
        case "PRODUCT_UNAVAILABLE":
          return t.buy.productUnavailable;
        case "PRODUCT_NOT_PRICED":
          return t.buy.productNotPriced;
        case "EMPTY_ORDER":
          return t.buy.emptyOrder;
        case "ORDER_TOO_LARGE":
          return t.buy.tooLarge;
        default:
          break;
      }
    }
    return t.errorGeneric;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    // The editor renders this from the draft payload, which reports what the
    // client wants rather than what the server would accept. Nothing may be
    // bought from inside the editor, so the guard is here rather than in the
    // gate above: the client still needs to see the button they are designing.
    if (preview) {
      setError(t.buy.previewOnly);
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) return setError(t.requiredName);
    if (!trimmedEmail && !trimmedPhone) return setError(t.requiredContact);
    if (trimmedEmail && !EMAIL.test(trimmedEmail))
      return setError(t.invalidEmail);

    setError(null);
    setSending(true);
    try {
      const created = await placeOrder(ref, {
        items: [{ productId: product.id, quantity }],
        name: trimmedName,
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
        note: note.trim() || undefined,
        locale,
        returnUrl: returnUrlFor(),
        // Sent raw and unconditionally, including when it is empty.
        //
        // The honeypot that matters is the server's: a script posting straight
        // at the endpoint never runs any of this, so a check made here and only
        // here would be a check on the one population that was never the
        // problem. Trimming the value away, or omitting the field when it looks
        // empty, would leave the server unable to tell a filled trap from a
        // client that has never heard of one — which is the same as switching
        // it off.
        website: trap,
      });

      // Written before the navigation, not after: once `assign` runs this page
      // is gone. Belt and braces beside the server's `?order=` — a customer who
      // returns without the query string still has somewhere to look.
      rememberOrder(ref, created.token);
      window.location.assign(created.redirectUrl);
    } catch (caught) {
      setSending(false);
      setError(describe(caught));
    }
  }

  if (!open) {
    return (
      <SiteButton type="button" onClick={() => setOpen(true)}>
        {t.buy.now}
      </SiteButton>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-site border border-site-border p-4 sm:p-5"
      onSubmit={submit}
      noValidate
    >
      <Honeypot value={trap} onChange={setTrap} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm text-site-muted">{t.buy.quantity}</span>
          <input
            className="site-field w-24"
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={1}
            max={999}
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              // Clamped rather than validated on submit: the same 1..999 the
              // server enforces, so the field cannot reach a state the shop
              // would have to refuse after the customer filled everything in.
              setQuantity(
                Number.isFinite(next)
                  ? Math.min(999, Math.max(1, Math.floor(next)))
                  : 1,
              );
            }}
          />
        </label>
        {total ? (
          <span className="text-sm text-site-muted">
            {t.buy.total}:{" "}
            <span className="site-heading text-site-text" dir="ltr">
              {total}
            </span>
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="site-hide">{t.name}</span>
          <input
            className="site-field"
            value={name}
            placeholder={t.namePlaceholder}
            autoComplete="name"
            maxLength={160}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="site-hide">{t.phone}</span>
          <input
            className="site-field"
            type="tel"
            dir="ltr"
            value={phone}
            placeholder={t.phone}
            autoComplete="tel"
            maxLength={40}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="site-hide">{t.email}</span>
        <input
          className="site-field"
          type="email"
          dir="ltr"
          value={email}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          maxLength={190}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="site-hide">{t.message}</span>
        <textarea
          className="site-field min-h-20 resize-y"
          rows={2}
          value={note}
          placeholder={t.buy.notePlaceholder}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <p className="text-xs text-site-muted">{t.buy.redirectNote}</p>

      {error ? (
        <p className="text-sm text-site-primary" role="alert">
          {error}
        </p>
      ) : null}

      <SiteButton type="submit" className="self-start" disabled={sending}>
        {sending ? t.buy.paying : t.buy.pay}
      </SiteButton>
    </form>
  );
}
