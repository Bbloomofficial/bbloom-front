import { useState } from "react";
import { Link } from "react-router-dom";
import { isSpending } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAdCampaigns, fetchAdStatus } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import {
  Budget,
  Channels,
  dotClass,
  Insight,
  StatusPill,
  toneClasses,
} from "../components/AdBits";
import type { AdCampaignStatus, AdStatus } from "../api/types";

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
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
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
    to two different places â€” a missing credential is fixed in our config, an
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
          {!currency && ` â€” ${t.budgetCeilingNoCurrency}`}
        </p>
      )}
    </section>
  );
}


const STATUS_FILTERS: AdCampaignStatus[] = [
  "ACTIVE",
  "PAUSED",
  "FAILED",
  "DELETED",
];

/**
 * Client campaigns, newest first.
 *
 * Spend, impressions and clicks come straight off the list rows rather than
 * from a request per campaign — they are cached figures the server refreshes
 * hourly. `insightsReadAt` is what makes that honest: when it is set the row
 * says when it was read, and when it is null the figures are shown as "not yet"
 * rather than as zeroes nobody has earned.
 */
function CampaignList({ currency }: { currency: string | undefined }) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads;
  const c = t.campaigns;
  const { token } = useSession();

  const [status, setStatus] = useState<AdCampaignStatus | "">("");
  const [page, setPage] = useState(0);

  const list = useResource(
    () => fetchAdCampaigns(token, { status: status || undefined, page }),
    [token, status, page],
  );

  const rows = list.data?.items ?? [];
  const totalPages = Math.max(list.data?.totalPages ?? 1, 1);

  return (
    <section className="mt-8 rounded-3xl border border-ink-100 bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink-900">{c.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{c.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {c.filterStatus}
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AdCampaignStatus | "");
                setPage(0);
              }}
              className="field"
            >
              <option value="">{c.filterAll}</option>
              {STATUS_FILTERS.map((value) => (
                <option key={value} value={value}>
                  {t.statuses[value] ?? value}
                </option>
              ))}
            </select>
          </label>
          <Link to="/ads/new" className="btn-primary">
            {c.create}
          </Link>
        </div>
      </div>

      {list.error ? (
        <div className="mt-5">
          <p className="text-sm text-ink-500">{t.loadFailed}</p>
          <button type="button" onClick={list.reload} className="btn-primary mt-3">
            {t.retry}
          </button>
        </div>
      ) : list.loading ? (
        <p className="mt-5 text-sm text-ink-400">{strings.loading}</p>
      ) : rows.length === 0 ? (
        <p className="mt-5 text-sm text-ink-500">{c.none}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="pb-2 pr-4">{c.colName}</th>
                <th className="pb-2 pr-4">{c.colSite}</th>
                <th className="pb-2 pr-4">{c.colChannels}</th>
                <th className="pb-2 pr-4">{c.colBudget}</th>
                <th className="pb-2 pr-4">{c.colSpend}</th>
                <th className="pb-2 pr-4">{c.colStatus}</th>
                <th className="pb-2">{c.colWhen}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((campaign) => (
                <tr key={campaign.id} className="align-top">
                  <td className="py-3 pr-4">
                    <Link
                      to={`/ads/${campaign.id}`}
                      className="font-semibold text-ink-900 underline-offset-2 hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    {/* A row that may still be costing money says so here
                        rather than relying on the status word, which for a
                        half-failed launch says the opposite of the truth. */}
                    {isSpending(campaign) && campaign.status !== "ACTIVE" && (
                      <span className="mt-1 block text-xs font-semibold text-danger">
                        {c.spending}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-ink-600">{campaign.siteName}</td>
                  <td className="py-3 pr-4 text-ink-600">
                    <Channels channels={campaign.channels} labels={t.channels} />
                  </td>
                  <td className="py-3 pr-4 text-ink-600" dir="ltr">
                    <Budget
                      minor={campaign.dailyBudgetMinor}
                      currency={campaign.currency ?? currency}
                      locale={locale}
                    />
                  </td>
                  <td className="py-3 pr-4 text-ink-600">
                    <Insight value={campaign.spend} notYet={c.notYet} />
                    {campaign.insightsReadAt && (
                      <span className="mt-0.5 block text-xs text-ink-400">
                        {c.asOf(formatDateTime(campaign.insightsReadAt, locale))}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusPill status={campaign.status} labels={t.statuses} />
                  </td>
                  <td className="py-3 text-ink-500">
                    {campaign.launchedAt
                      ? formatDateTime(campaign.launchedAt, locale)
                      : formatDateTime(campaign.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            {c.prev}
          </button>
          <span className="text-sm text-ink-500">
            {c.pageOf(page + 1, totalPages)}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={!list.data?.hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            {c.next}
          </button>
        </div>
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
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.subtitle}</p>
        </div>
        <Link to="/ads/tools" className="btn-secondary">
          {t.tools}
        </Link>
      </div>

      {status.data ? (
        <StatusCard status={status.data} onRefresh={status.reload} />
      ) : status.error ? (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
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

      {/* The list is given the account currency as a fallback only. A campaign
          carries the currency it was launched in, and that is the one to show:
          an old campaign billed in a currency the account has since changed
          away from must not be relabelled with today's. */}
      <CampaignList currency={status.data?.currency ?? status.data?.meta?.currency} />
    </div>
  );
}
