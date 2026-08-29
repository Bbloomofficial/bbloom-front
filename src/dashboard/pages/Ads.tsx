import { useState } from "react";
import { formatCount, isOverAllowance, isUnlimited } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useActiveSite } from "../site";
import { useResource } from "../hooks";
import { fetchMyAdAllowance, fetchMyAdCampaigns } from "../api/client";
import { dashboardStrings, formatDateTime } from "../strings";
import type { AdAllowance } from "../../api/ads";

/**
 * The client's view of the advertising we run for them.
 *
 * Read-only, and not as a limitation we are apologising for: campaigns come out
 * of one bbloom ad account shared across every client, so a create button here
 * would be a button that spends money in a place the client cannot be given
 * access to. What they get instead is the thing they actually asked for — what
 * is running, what it cost, and how much of their month is left.
 *
 * Meta's figures are strings and stay strings, and an absent one is "not yet"
 * rather than zero. A client shown a confident 0 next to a campaign that has
 * been quietly spending since this morning would be right to stop trusting the
 * whole screen.
 */

function Figure({
  label,
  value,
  notYet,
}: {
  label: string;
  value: string | null | undefined;
  notYet: string;
}) {
  const text = value === null || value === undefined || value === "" ? null : value;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink-800">
        {text === null ? (
          <span className="text-ink-400">{notYet}</span>
        ) : (
          <span dir="ltr" className="tabular-nums">
            {text}
          </span>
        )}
      </dd>
    </div>
  );
}

function Allowance({ allowance }: { allowance: AdAllowance }) {
  const { locale } = useI18n();
  const strings = dashboardStrings(locale);
  const t = strings.ads;

  const used = formatCount(allowance.impressionsUsed, locale);
  const impressions = isUnlimited(allowance.impressionLimit)
    ? t.allowanceImpressionsUnmetered(used)
    : t.allowanceImpressions(
        used,
        formatCount(allowance.impressionLimit as number, locale),
      );
  const channels = (allowance.channels ?? [])
    .map((channel) => t.channels[channel] ?? channel)
    .join(", ");
  /*
    An overshoot has to be read from used-against-limit rather than from
    `impressionsRemaining`, which the server clamps at zero: landing exactly on
    the ceiling and running past it both arrive as a remaining of nought. The
    client is shown the same sentence either way — that they are at the end of
    what the plan includes — because the difference is ours to explain, not
    theirs to discover as an accusation.
  */
  const spent =
    isOverAllowance(allowance) ||
    (!isUnlimited(allowance.impressionsRemaining) &&
      allowance.impressionsRemaining === 0);

  return (
    <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {t.allowanceTitle}
      </h2>
      <p className="mt-2 text-sm text-ink-800">
        {impressions}
        {channels ? `. ${t.allowanceChannels(channels)}` : ""}.
      </p>
      {/* Said before they run out rather than after, because the answer — move
          up a plan — takes a conversation and time to act on. */}
      {spent && (
        <p className="mt-2 text-sm font-semibold text-ink-900">
          {t.allowanceSpent}
        </p>
      )}
      {!isUnlimited(allowance.impressionLimit) && (
        <p className="mt-2 text-xs text-ink-500">{t.allowanceStale}</p>
      )}
      <p className="mt-3 text-xs text-ink-500">{t.managed}</p>
    </section>
  );
}

/**
 * What a client without advertising sees.
 *
 * `allowed: false` is not an error here. Most clients have never bought ads, so
 * the ordinary case for this screen is somebody who could and has not — and the
 * honest response to that is an offer, not a refusal notice.
 */
function Upsell() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale).ads;
  return (
    <section className="mt-6 rounded-3xl border border-bloom-200 bg-bloom-50 p-6">
      <h2 className="text-lg font-bold text-ink-900">{t.upsellTitle}</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-700">{t.upsellBody}</p>
      <a href="mailto:hello@bbloom.ge" className="btn-primary mt-4 inline-flex">
        {t.upsellCta}
      </a>
    </section>
  );
}

export default function Ads() {
  const { locale } = useI18n();
  const strings = dashboardStrings(locale);
  const t = strings.ads;
  const { token } = useSession();
  const siteId = useActiveSite().id;

  const [page, setPage] = useState(0);

  /*
    The two reads are deliberately separate. The allowance is what decides
    whether this screen is a report or an offer, and it answers for a client on
    a plan without advertising — so a failed campaign list must not turn somebody
    who simply has not bought advertising into an error message.
  */
  const allowanceState = useResource(
    () => fetchMyAdAllowance(token, siteId),
    [token, siteId],
  );
  const list = useResource(
    () => fetchMyAdCampaigns(token, siteId, { page }),
    [token, siteId, page],
  );

  const allowance = allowanceState.data;
  const campaigns = list.data;
  const rows = campaigns?.items ?? [];
  const totalPages = Math.max(campaigns?.totalPages ?? 1, 1);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
        {t.title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">{t.subtitle}</p>

      {list.error && <p className="mt-6 text-sm text-ink-500">{t.loadFailed}</p>}

      {allowance &&
        (allowance.allowed ? <Allowance allowance={allowance} /> : <Upsell />)}

      {allowance?.allowed && !list.loading && !list.error && rows.length === 0 && (
        <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
          <h2 className="text-lg font-bold text-ink-900">{t.empty}</h2>
          <p className="mt-2 text-sm text-ink-600">{t.emptyBody}</p>
        </section>
      )}

      {rows.length > 0 && (
        <>
          <ul className="mt-6 space-y-4">
            {rows.map((campaign) => (
              <li
                key={campaign.id}
                className="rounded-3xl border border-ink-100 bg-surface p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-ink-900">
                    {campaign.name}
                  </h2>
                  <span className="text-sm font-semibold text-ink-600">
                    {t.statuses[campaign.status] ?? campaign.status}
                  </span>
                </div>
                {campaign.headline && (
                  <p className="mt-1 text-sm text-ink-700">{campaign.headline}</p>
                )}
                <dl className="mt-4 grid gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {t.colChannels}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink-800">
                      {(campaign.channels ?? [])
                        .map((channel) => t.channels[channel] ?? channel)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {t.colBudget}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink-800" dir="ltr">
                      {(campaign.dailyBudgetMinor / 100).toFixed(2)}{" "}
                      {campaign.currency}
                    </dd>
                  </div>
                  <Figure
                    label={t.colSpend}
                    value={campaign.spend}
                    notYet={t.notYet}
                  />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {t.colWhen}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink-800">
                      {campaign.launchedAt
                        ? formatDateTime(campaign.launchedAt, locale)
                        : formatDateTime(campaign.createdAt, locale)}
                    </dd>
                  </div>
                </dl>
                {campaign.insightsReadAt && (
                  <p className="mt-3 text-xs text-ink-500">
                    {t.asOf(formatDateTime(campaign.insightsReadAt, locale))} —{" "}
                    {t.cached}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-secondary"
                disabled={page === 0}
                onClick={() =>
                  setPage((current) => Math.max(current - 1, 0))
                }
              >
                {t.prev}
              </button>
              <span className="text-sm text-ink-500">
                {t.page(page + 1, totalPages)}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={!campaigns?.hasNext}
                onClick={() => setPage((current) => current + 1)}
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
