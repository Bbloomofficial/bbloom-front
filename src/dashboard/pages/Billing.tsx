import { useCallback, useEffect, useState } from "react";
import { formatMinor } from "../../api/plans";
import { ApiError } from "../../api/http";
import { PlanCard, usePlans } from "../../components/PlanCard";
import { useI18n } from "../../i18n";
import {
  cancelSubscription,
  fetchSubscription,
  startCheckout,
} from "../api/account";
import type { CheckoutResponse, SubscriptionDetail } from "../api/types";
import { useSession } from "../auth";
import { SubscriptionBadge } from "../components/Badges";
import { useActiveSite, useIsOwner } from "../site";
import { dashboardStrings, formatDate } from "../strings";

/**
 * Plan and billing for one website.
 *
 * An editor sees all of this read-only rather than nothing: "why is my website
 * offline" is not an owner-only fact, and "ask the owner to choose a plan" is a
 * far better answer than a missing page.
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

  // A card provider answers with somewhere to go; manual transfer answers with
  // something to read. Branching on the field rather than the provider name is
  // what lets TBC and BoG arrive without touching this screen.
  useEffect(() => {
    if (result.redirectUrl) window.location.assign(result.redirectUrl);
  }, [result.redirectUrl]);

  if (result.redirectUrl) {
    return <p className="text-sm text-ink-600">{t.billing.redirecting}</p>;
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-canvas p-4">
      <p className="text-sm font-bold text-ink-900">{t.billing.bankTitle}</p>
      {result.instructions && (
        <p className="mt-2 whitespace-pre-line text-sm text-ink-600">
          {result.instructions}
        </p>
      )}
      <p className="mt-3 text-xs text-ink-400">{t.billing.bankHint}</p>
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

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(
    null,
  );
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState(1);

  const load = useCallback(() => {
    setLoadError(null);
    fetchSubscription(token, site.id).then(setSubscription).catch(setLoadError);
  }, [token, site.id]);

  useEffect(load, [load]);

  const date = (iso?: string) => formatDate(iso, locale);
  const pending = subscription?.pendingPayment ?? null;

  async function choose(planCode: string) {
    if (busy) return;
    setBusy(planCode);
    setError(null);
    try {
      const result = await startCheckout(token, site.id, planCode, periods);
      setCheckout(result);
      // The pending amount lives on the subscription, so both this screen and
      // the site list learn about it from the backend rather than from memory.
      load();
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.message
          ? caught.message
          : t.billing.checkoutStarting,
      );
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
      setError(
        caught instanceof ApiError && caught.message
          ? caught.message
          : t.billing.cancelling,
      );
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

      {/* An outstanding transfer is not a payment. The wording keeps that
          straight, because a client who believes they have paid and finds the
          site still private will assume we broke it. */}
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

          {!plans ? (
            <p className="mt-4 text-sm text-ink-400">{t.loading}</p>
          ) : (
            <div className="mt-4 grid items-start gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  featuredLabel={t.plans.featured}
                  periodLabel={
                    plan.billingPeriod === "YEARLY"
                      ? t.plans.perYear
                      : t.plans.perMonth
                  }
                  current={plan.code === subscription.planCode}
                  currentLabel={t.plans.current}
                  action={
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
                  }
                />
              ))}
            </div>
          )}

          {subscription.allowsHosting && !subscription.cancelAtPeriodEnd && (
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
