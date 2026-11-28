import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAdStatus } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { Budget, dotClass, toneClasses } from "../components/AdBits";
import type { AdStatus } from "../api/types";

/**
 * Facebook and Instagram advertising, from the staff side.
 *
 * The screen is shaped by one fact: everything on it spends money the instant
 * it is pressed. There is no draft campaign and no paused-first step at Meta,
 * so the usual "create it, look at it, then turn it on" safety net does not
 * exist and cannot be added here. What replaces it is being explicit — the
 * launch button says what it does, confirms first, and every row that might
 * still be costing money says so in its own words.
 *
 * The second shaping fact is that money spent by the *test* tool is ours. A
 * client's campaign costing money is the product working; a test campaign
 * costing money is a mistake nobody has noticed yet, which is why
 * `liveTestCampaigns` gets an alarm and `liveCampaigns` does not — and why the
 * tools live on their own route rather than beside real client work.
 */

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 py-1.5">
      <dt className="text-[13px] font-semibold text-ink-600">
        {label}
      </dt>
      <dd dir="ltr" className="text-sm font-semibold text-ink-900">
        {value}
      </dd>
    </div>
  );
}

/** Whether Meta's own account status is the one healthy value. */
function accountHealthy(status: AdStatus): boolean {
  return status.meta?.accountStatus === 1;
}
function StatusCard({
  status,
  onRefresh,
}: {
  status: AdStatus;
  onRefresh: () => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale).ads.status;

  /*
    Two questions, two answers, deliberately not merged into one light.

    `configured` asks whether our own settings are complete; `meta.reachable`
    asks whether Meta answered. They fail independently and they send someone
    to two different places — a missing credential is fixed in our config, an
    unreachable account is fixed at Meta or not at all. Reducing them to a
    single "advertising is broken" would send whoever is on call to the wrong
    one roughly half the time.
  */
  const meta = status.meta ?? null;
  const reachable = meta?.reachable === true;
  const healthy = accountHealthy(status);

  // The currency the budget ceiling is denominated in. Top level first: `meta`
  // is absent exactly when we are unconfigured or unreachable, which is when a
  // bare number is most likely to be misread.
  const currency = status.currency ?? meta?.currency;

  const accountStatusText =
    meta?.accountStatus !== undefined
      ? (t.accountStatuses[String(meta.accountStatus)] ??
        meta.accountStatusLabel ??
        t.accountStatusUnknown)
      : (meta?.accountStatusLabel ?? t.accountStatusUnknown);

  return (
    <section
      className={`mt-6 rounded-3xl border p-6 sm:p-7 ${toneClasses(
        status.configured && reachable && healthy ? "good" : "bad",
      )}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-surface px-2.5 py-1 text-xs font-semibold text-ink-900">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${dotClass(status.configured)}`}
          />
          {status.configured ? t.configured : t.notConfigured}
        </span>
        {status.configured && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-surface px-2.5 py-1 text-xs font-semibold text-ink-900">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${dotClass(reachable)}`}
            />
            {reachable ? t.reachable : t.unreachable}
          </span>
        )}
        <span className="inline-flex items-center rounded-full border border-ink-100 bg-surface px-2.5 py-1 text-xs font-semibold text-ink-600">
          {status.instagramConfigured ? t.instagramOn : t.instagramOff}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="btn-secondary ms-auto"
        >
          {t.refresh}
        </button>
      </div>

      {!status.configured && (
        <p className="mt-3 text-sm text-ink-600">{t.notConfiguredNote}</p>
      )}
      {status.configured && !status.enabled && (
        <p className="mt-3 text-sm text-ink-600">{t.disabledNote}</p>
      )}
      {status.configured && status.enabled && (
        <p className="mt-3 text-sm text-ink-600">{t.configuredNote}</p>
      )}
      {status.configured && !reachable && (
        <p className="mt-2 text-sm font-semibold text-danger">
          {t.unreachableNote}
        </p>
      )}
      {!status.configured && (
        <p className="mt-2 text-sm text-ink-400">{t.unaskedNote}</p>
      )}
      {meta?.failureReason && (
        <p className="mt-2 text-sm font-semibold text-danger">
          {meta.failureReason}
        </p>
      )}

      {/* The spend counters. `liveCampaigns` is a fact; `liveTestCampaigns`
          above zero is a fault, so it is broken out rather than shown as a
          second number in the same sentence. */}
      <div className="mt-4 rounded-2xl border border-ink-100 bg-surface p-4">
        <p className="text-sm font-bold text-ink-900">
          {status.liveCampaigns > 0
            ? t.liveCampaigns(status.liveCampaigns)
            : t.noneLive}
        </p>
      </div>

      {status.liveTestCampaigns > 0 && (
        <div
          role="alert"
          className="mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 dark:bg-danger/15"
        >
          <p className="text-sm font-bold text-danger">
            {t.liveTestTitle(status.liveTestCampaigns)}
          </p>
          <p className="mt-1.5 text-sm text-ink-600">{t.liveTestBody}</p>
        </div>
      )}

      <dl className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
        {meta?.accountStatus !== undefined || meta?.accountStatusLabel ? (
          <div className="py-1.5">
            <StatusRow label={t.accountStatus} value={accountStatusText} />
            {!healthy && (
              <p className="text-xs font-semibold text-danger">
                {t.accountStatusNote}
              </p>
            )}
          </div>
        ) : null}
        {meta?.adAccountName && (
          <StatusRow label={t.adAccount} value={meta.adAccountName} />
        )}
        {status.adAccountId && (
          <StatusRow label={t.adAccount} value={status.adAccountId} />
        )}
        {meta?.pageName && <StatusRow label={t.page} value={meta.pageName} />}
        {meta?.instagramUsername && (
          <StatusRow label={t.instagram} value={`@${meta.instagramUsername}`} />
        )}
        {meta?.tokenOwner && (
          <StatusRow label={t.tokenOwner} value={meta.tokenOwner} />
        )}
        {meta?.timezone && (
          <StatusRow label={t.timezone} value={meta.timezone} />
        )}
        {status.apiVersion && (
          <StatusRow label={t.apiVersion} value={status.apiVersion} />
        )}
        {status.checkedAt && (
          <StatusRow
            label={t.checkedAt}
            value={formatDateTime(status.checkedAt, locale)}
          />
        )}
      </dl>

      {status.maxDailyBudgetMinor !== undefined && (
        <p className="mt-3 text-xs text-ink-400">
          {t.budgetCeiling}:{" "}
          <Budget
            minor={status.maxDailyBudgetMinor}
            currency={currency}
            locale={locale}
          />
          {!currency && ` — ${t.budgetCeilingNoCurrency}`}
        </p>
      )}
    </section>
  );
}



export default function Ads() {
  const { locale } = useI18n();
  const t = adminStrings(locale).ads;
  const { token } = useSession();

  const status = useResource(() => fetchAdStatus(token), [token]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.subtitle}</p>
        </div>
      </div>

      {status.data ? (
        <StatusCard status={status.data} onRefresh={status.reload} />
      ) : status.error ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-surface p-6">
          <p className="text-sm text-ink-500">{t.loadFailed}</p>
          <button
            type="button"
            onClick={status.reload}
            className="btn-primary mt-3"
          >
            {t.retry}
          </button>
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-400">{adminStrings(locale).loading}</p>
      )}

    </div>
  );
}
