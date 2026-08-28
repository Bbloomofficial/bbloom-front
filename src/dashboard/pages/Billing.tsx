import { useCallback, useEffect, useState } from "react";
import { formatMinor, isComingSoon } from "../../api/plans";
import { contact } from "../../data/contact";
import { describeProblem } from "../../api/problem";
import { ApiError } from "../../api/http";
import { PlanCard, usePlans } from "../../components/PlanCard";
import { useI18n } from "../../i18n";
import {
  cancelSubscription,
  fetchSubscription,
  quoteCheckout,
  startCheckout,
} from "../api/account";
import type {
  CheckoutQuote,
  CheckoutResponse,
  SubscriptionDetail,
} from "../api/types";
import { useSession } from "../auth";
import { SubscriptionBadge } from "../components/Badges";
import { paidBlock } from "../gate";
import { useActiveSite, useIsOwner } from "../site";
import { dashboardStrings, formatDate } from "../strings";

/**
 * Plan and billing for one website.
 *
 * An editor sees all of this read-only rather than nothing: what a website's
 * plan does and does not include is not an owner-only fact, and "ask the owner"
 * is a far better answer than a missing page.
 */

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-ink-100 py-3 first:border-t-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

/** The bank details, or the redirect, depending on which the provider sent. */
function CheckoutResult({ result }: { result: CheckoutResponse }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);

  // `available` is asked first and on its own. It is not the same question as
  // "did a redirect arrive": bank transfer has no redirect either, and reading
  // the absence of one as "you cannot pay yet" would replace working transfer
  // instructions with an apology. When card payment is off, the instructions
  // below are still the way to buy, so they stay.
  const unavailable = result.available === false;

  // A card provider answers with somewhere to go; manual transfer answers with
  // something to read. Branching on the field rather than the provider name is
  // what lets TBC and BoG arrive without touching this screen.
  useEffect(() => {
    if (!unavailable && result.redirectUrl)
      window.location.assign(result.redirectUrl);
  }, [unavailable, result.redirectUrl]);

  if (!unavailable && result.redirectUrl) {
    return <p className="text-sm text-ink-600">{t.billing.redirecting}</p>;
  }

  return (
    <div className="space-y-3">
      {unavailable && (
        <div className="rounded-2xl border border-ink-100 bg-sunken p-4">
          <p className="text-sm font-bold text-ink-900">
            {t.billing.comingSoonTitle}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            {t.billing.comingSoonBody}
          </p>
          <a
            className="mt-3 inline-block text-sm font-semibold text-bloom-600 hover:underline"
            href={`mailto:${contact.email}`}
          >
            {t.billing.comingSoonContact} · {contact.email}
          </a>
        </div>
      )}
      {(!unavailable || result.instructions) && (
        <div className="rounded-2xl border border-ink-100 bg-sunken p-4">
          <p className="text-sm font-bold text-ink-900">{t.billing.bankTitle}</p>
          {result.instructions && (
            <p className="mt-2 whitespace-pre-line text-sm text-ink-600">
              {result.instructions}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-400">{t.billing.bankHint}</p>
        </div>
      )}
    </div>
  );
}

/**
 * What this plan costs for the chosen number of periods, straight from the API.
 *
 * Rendered even when nothing is discounted, because the card above it shows a
 * per-period price and the client is about to be charged for several. Silent
 * while the quote is in flight rather than showing a figure that then changes.
 */
function QuoteLine({
  quote,
  locale,
  totalLabel,
  savingLabel,
  firstPurchaseLabel,
}: {
  quote?: CheckoutQuote;
  locale: string;
  totalLabel: string;
  savingLabel: (amount: string) => string;
  firstPurchaseLabel: (percent: number) => string;
}) {
  if (!quote) return null;
  const discounted = quote.discountMinor > 0;
  // Explained only when it covers less than the client is buying. On a single
  // period the offer and an ordinary sale are indistinguishable in the figures,
  // and "the rest are at the usual price" would be pointing at nothing.
  const partial =
    discounted &&
    quote.discountSource === "FIRST_PURCHASE" &&
    quote.discountPercent !== undefined &&
    (quote.discountPeriods ?? quote.periods) < quote.periods;
  return (
    <div className="rounded-2xl bg-sunken px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-ink-400">{totalLabel}</span>
        <span className="flex items-baseline gap-2">
          {discounted && (
            <span className="text-sm text-ink-400 line-through" dir="ltr">
              {formatMinor(quote.listAmountMinor, quote.currency, locale)}
            </span>
          )}
          <span className="text-base font-extrabold text-ink-900" dir="ltr">
            {formatMinor(quote.amountMinor, quote.currency, locale)}
          </span>
        </span>
      </div>
      {discounted && (
        <p className="mt-1 text-end text-xs font-semibold text-success">
          {savingLabel(
            formatMinor(quote.discountMinor, quote.currency, locale),
          )}
        </p>
      )}
      {partial && (
        <p className="mt-1 text-xs text-ink-400">
          {firstPurchaseLabel(quote.discountPercent as number)}
        </p>
      )}
    </div>
  );
}

export default function Billing() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, refresh } = useSession();
  const site = useActiveSite();
  const isOwner = useIsOwner();
  const { plans } = usePlans();
  // The public plan list now carries advertised-but-negotiated tiers too. The
  // API refuses a subscription to one with a 409, so offering it a "Choose"
  // button here would be a checkout that cannot complete.
  const shownPlans = plans?.filter((plan) => plan.purchasable !== false) ?? null;
  // Coming-soon tiers are shown but never quoted or bought: /quote refuses them
  // with the same 409 /checkout would, so asking would spend a request per plan
  // per keystroke to be told what the flag already said.
  const buyablePlans = shownPlans?.filter((plan) => !isComingSoon(plan)) ?? null;

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(
    null,
  );
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState(1);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [promoProblem, setPromoProblem] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, CheckoutQuote>>({});

  // Joined rather than passed as an array so the effect below does not re-run on
  // every render just because `filter` handed it a new array with the same
  // contents in it.
  const buyableCodes = buyablePlans?.map((plan) => plan.code).join(",") ?? "";

  // Every price shown next to a "Choose" button is quoted by the API, including
  // the undiscounted ones. Nothing here multiplies, rounds or subtracts: a
  // multi-period purchase is discounted once on the total rather than per
  // period, and arithmetic done on this side would disagree with the invoice.
  useEffect(() => {
    if (!buyableCodes) {
      setQuotes({});
      return;
    }
    let cancelled = false;
    Promise.all(
      buyableCodes.split(",").map((code) =>
        quoteCheckout(token, site.id, code, periods, promo ?? undefined)
          .then((quote) => [code, quote] as const)
          // A code restricted to other plans is refused for this one. That is
          // not a failure of the screen — the card just shows its list price.
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, CheckoutQuote> = {};
      for (const entry of results) if (entry) next[entry[0]] = entry[1];
      setQuotes(next);
    });
    return () => {
      cancelled = true;
    };
  }, [token, site.id, buyableCodes, periods, promo]);

  async function applyPromo() {
    const typed = promoInput.trim();
    if (!typed || !buyablePlans?.length) return;
    setCheckingPromo(true);
    setPromoProblem(null);
    try {
      // Asked of every buyable plan, because a code restricted to one of them
      // is refused for the rest: "is this code any good" is only answerable by
      // asking about all of them. Quoting spends nothing.
      const results = await Promise.allSettled(
        buyablePlans.map((plan) =>
          quoteCheckout(token, site.id, plan.code, periods, typed),
        ),
      );
      const accepted = results.find((result) => result.status === "fulfilled");
      if (!accepted) {
        setPromoProblem(
          describeProblem(
            (results[0] as PromiseRejectedResult).reason,
            t.errors,
            t.billing.checkoutFailed,
          ),
        );
        return;
      }
      // Codes are stored upper-cased and trimmed, so the canonical form comes
      // back from the API rather than from what was typed.
      setPromo(accepted.value.promoCode ?? typed.toUpperCase());
    } finally {
      setCheckingPromo(false);
    }
  }

  function clearPromo() {
    setPromo(null);
    setPromoInput("");
    setPromoProblem(null);
  }

  const load = useCallback(() => {
    setLoadError(null);
    fetchSubscription(token, site.id).then(setSubscription).catch(setLoadError);
  }, [token, site.id]);

  useEffect(load, [load]);

  const date = (iso?: string) => formatDate(iso, locale);
  const pending = subscription?.pendingPayment ?? null;
  // Read off the freshly fetched subscription rather than the summary in the
  // session, so a client who just paid does not sit looking at an upgrade
  // pitch for a plan they already own.
  const paid = subscription ? paidBlock({ subscription }) : null;

  async function choose(planCode: string) {
    if (busy) return;
    setBusy(planCode);
    setError(null);
    try {
      const result = await startCheckout(
        token,
        site.id,
        planCode,
        periods,
        promo ?? undefined,
      );
      setCheckout(result);
      // The pending amount lives on the subscription, so both this screen and
      // the site list learn about it from the backend rather than from memory.
      load();
      await refresh();
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.billing.checkoutFailed));
      // A code that passed on the grid can still be refused here: the last
      // redemption goes to whoever reaches checkout first, and an outstanding
      // checkout holds one. Drop it rather than leave the cards quoting a
      // discount that no longer exists.
      if (caught instanceof ApiError && caught.code?.startsWith("PROMO_CODE_")) {
        setPromo(null);
      }
    } finally {
      setBusy(null);
    }
  }

  async function stopRenewing() {
    if (busy) return;
    if (!window.confirm(t.billing.cancelConfirm)) return;
    setBusy("cancel");
    setError(null);
    try {
      setSubscription(await cancelSubscription(token, site.id));
      await refresh();
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.billing.cancelFailed));
    } finally {
      setBusy(null);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-surface p-6">
        <p className="text-sm text-ink-600">{loadError.message}</p>
        <button type="button" onClick={load} className="btn-secondary mt-4">
          {t.retry}
        </button>
      </div>
    );
  }

  if (!subscription) {
    return <p className="text-sm text-ink-400">{t.loading}</p>;
  }

  const currentPlan = plans?.find(
    (plan) => plan.code === subscription.planCode,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.billing.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.billing.subtitle}</p>
      </div>

      <section className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        <Row
          label={t.billing.status}
          value={<SubscriptionBadge status={subscription.status} />}
        />
        <Row
          label={t.billing.plan}
          value={currentPlan?.name ?? subscription.planCode ?? t.billing.noPlan}
        />
        {subscription.status === "TRIALING" && subscription.trialEndsAt && (
          <Row label={t.billing.trialEnds} value={date(subscription.trialEndsAt)} />
        )}
        {subscription.status === "GRACE" && subscription.graceUntil && (
          <Row label={t.billing.graceEnds} value={date(subscription.graceUntil)} />
        )}
        {subscription.currentPeriodEnd && subscription.status !== "GRACE" && (
          <Row
            label={
              subscription.cancelAtPeriodEnd
                ? t.billing.cancelAtPeriodEnd
                : t.billing.renews
            }
            value={date(subscription.currentPeriodEnd)}
          />
        )}
        {subscription.provider && (
          <Row label={t.billing.provider} value={subscription.provider} />
        )}

        {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
          <p className="mt-3 rounded-2xl bg-tint px-4 py-3 text-sm text-tint-fg">
            {t.billing.cancelAtPeriodEndOn(date(subscription.currentPeriodEnd))}
          </p>
        )}
      </section>

      {/* What money actually buys, said plainly and to everyone — including
          editors, who cannot buy it but will be the ones asked why the badge is
          there. The lapsed wording leads with the reassurance because "expired"
          otherwise reads as "my shop is down", and it is not: nothing about a
          bbloom.ge address is withdrawn for billing reasons. */}
      {paid && (
        <section className="rounded-3xl border border-ink-100 bg-sunken p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink-900">
            {t.billing.paidTitle[paid]}
          </h2>
          <p className="mt-1 text-sm text-ink-600">{t.billing.paidBody[paid]}</p>
          <ul className="mt-3 space-y-1.5">
            {t.billing.paidPerks.map((perk) => (
              <li key={perk} className="flex gap-2 text-sm text-ink-600">
                <span aria-hidden className="text-accent">
                  ✓
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* An outstanding transfer is not a payment. The wording keeps that
          straight, because a client who believes they have paid and finds the
          badge still on their pages will assume we broke it. */}
      {pending && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="font-bold text-amber-900 dark:text-amber-100">
            {t.billing.pendingTitle}
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
            {t.billing.pendingBody(
              formatMinor(
                pending.amountMinor ?? 0,
                pending.currency ?? "GEL",
                locale,
              ),
              plans?.find((plan) => plan.code === pending.planCode)?.name ??
                pending.planCode ??
                "",
            )}
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
            {t.billing.pendingNotPaid}
          </p>
          {pending.note && (
            <p className="mt-3 whitespace-pre-line rounded-2xl bg-white/70 p-3 text-sm text-amber-900 dark:bg-black/20 dark:text-amber-100">
              {pending.note}
            </p>
          )}
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300/80">
            {pending.createdAt ? `${t.billing.pendingSince(date(pending.createdAt))} · ` : ""}
            {t.billing.pendingReplace}
          </p>
        </section>
      )}

      {checkout && (
        <section className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink-900">
            {t.billing.checkoutTitle}
          </h2>
          <div className="mt-3">
            <CheckoutResult result={checkout} />
          </div>
        </section>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      {isOwner ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-ink-900">
              {subscription.planCode ? t.billing.changePlan : t.billing.choosePlan}
            </h2>
            <label className="text-sm text-ink-600">
              {t.billing.periods}{" "}
              <select
                className="ms-2 rounded-xl border border-ink-100 bg-surface px-2 py-1 text-sm font-semibold"
                value={periods}
                onChange={(event) => setPeriods(Number(event.target.value))}
              >
                {[1, 3, 6, 12].map((count) => (
                  <option key={count} value={count}>
                    {t.billing.period(count)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* One code for the whole grid rather than one per card: a client has
              a code, not a code for a plan they have not chosen yet. */}
          <div className="mt-4 rounded-2xl border border-ink-100 bg-sunken p-4">
            <label
              className="text-sm font-semibold text-ink-900"
              htmlFor="promo-code"
            >
              {t.billing.promoLabel}
            </label>
            {promo ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
                  {t.billing.promoOn(promo)}
                </span>
                <button
                  type="button"
                  onClick={clearPromo}
                  className="text-sm font-semibold text-ink-600 underline"
                >
                  {t.billing.promoClear}
                </button>
              </div>
            ) : (
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void applyPromo();
                }}
              >
                <input
                  id="promo-code"
                  className="field max-w-56 flex-1"
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value)}
                  placeholder={t.billing.promoPlaceholder}
                  autoComplete="off"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={checkingPromo || promoInput.trim() === ""}
                >
                  {checkingPromo
                    ? t.billing.promoChecking
                    : t.billing.promoApply}
                </button>
              </form>
            )}
            {promoProblem && (
              <p role="alert" className="mt-2 text-sm font-semibold text-danger">
                {promoProblem}
              </p>
            )}
            {/* A code that lost to a better sale price is not an error: it was
                not refused and it has not been spent. Saying "invalid" here
                would be both wrong and alarming. */}
            {promo &&
              Object.values(quotes).some(
                (quote) => quote.promoCode && !quote.promoCodeApplied,
              ) && (
                <p className="mt-2 text-sm text-ink-600">
                  {t.billing.promoBeaten}
                </p>
              )}
          </div>

          {!shownPlans ? (
            <p className="mt-4 text-sm text-ink-400">{t.loading}</p>
          ) : (
            <div className="mt-4 grid items-start gap-6 lg:grid-cols-3">
              {shownPlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  featuredLabel={t.plans.featured}
                  comingSoonLabel={t.plans.comingSoon}
                  periodLabel={
                    plan.billingPeriod === "YEARLY"
                      ? t.plans.perYear
                      : t.plans.perMonth
                  }
                  current={plan.code === subscription.planCode}
                  currentLabel={t.plans.current}
                  action={
                    isComingSoon(plan) ? (
                      // No quote line above it either: there is no quote, and an
                      // empty gap where every other card shows a total reads as
                      // a price that failed to load rather than as one that does
                      // not exist yet.
                      <button
                        type="button"
                        disabled
                        className="btn btn-secondary w-full"
                      >
                        {t.plans.comingSoonCta}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <QuoteLine
                          quote={quotes[plan.code]}
                          locale={locale}
                          totalLabel={t.billing.quoteTotal}
                          savingLabel={t.billing.quoteSaving}
                          firstPurchaseLabel={t.billing.quoteFirstPurchase}
                        />
                        <button
                          type="button"
                          onClick={() => void choose(plan.code)}
                          disabled={busy !== null}
                          className={`w-full disabled:opacity-60 ${
                            plan.featured ? "btn-primary" : "btn-secondary"
                          }`}
                        >
                          {busy === plan.code
                            ? t.billing.checkoutStarting
                            : t.plans.choose}
                        </button>
                      </div>
                    )
                  }
                />
              ))}
            </div>
          )}

          {/* Only offer to stop something that is actually running. This used
              to read `allowsHosting`, which is now true for everyone, so it
              would have offered to cancel a free trial that costs nothing and
              has nothing to stop. */}
          {subscription.allowsPaidFeatures && !subscription.cancelAtPeriodEnd && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void stopRenewing()}
                disabled={busy !== null}
                className="rounded-xl border border-ink-100 bg-surface px-4 py-2 text-sm font-semibold text-danger transition hover:border-danger disabled:opacity-60"
              >
                {busy === "cancel" ? t.billing.cancelling : t.billing.cancelPlan}
              </button>
              <span className="text-xs text-ink-400">{t.billing.cancelHint}</span>
            </div>
          )}
        </section>
      ) : (
        <p className="rounded-2xl bg-tint px-4 py-3 text-sm text-tint-fg">
          {t.billing.ownerOnly}
        </p>
      )}

      <section className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-bold text-ink-900">{t.billing.payments}</h2>
        {!subscription.payments || subscription.payments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">{t.billing.noPayments}</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {subscription.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <span className="text-sm text-ink-600">
                  {date(payment.paidAt ?? payment.createdAt)}
                  {payment.planCode ? ` · ${payment.planCode}` : ""}
                  {payment.promoCode ? ` · ${payment.promoCode}` : ""}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink-900" dir="ltr">
                    {formatMinor(
                      payment.amountMinor ?? 0,
                      payment.currency ?? "GEL",
                      locale,
                    )}
                  </span>
                  <span className="text-xs font-semibold text-ink-400">
                    {payment.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
