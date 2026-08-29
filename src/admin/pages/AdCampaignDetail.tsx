import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adErrorMessage, figure, isSpending, metaFailure } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  deleteAdCampaign,
  fetchAdCampaign,
  fetchAdInsights,
  pauseAdCampaign,
  resumeAdCampaign,
} from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { Budget, Channels, Insight, StatusPill } from "../components/AdBits";
import type { AdCampaignDto } from "../api/types";

/**
 * One campaign, in full.
 *
 * Two things here are not obvious from the API. The first is that a `FAILED`
 * campaign carrying a `metaCampaignId` is still running and still spending, so
 * the loudest thing on this page is a warning that contradicts the status word
 * next to it. The second is that the figures are read from Meta on a schedule
 * rather than live, so they are labelled with when they were read: a number
 * with no timestamp beside it gets believed as of now.
 */

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink-100 py-2 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </dt>
      <dd className="text-sm text-ink-800">{children}</dd>
    </div>
  );
}

/**
 * The live read, which carries three figures the list rows do not: reach, click
 * rate and cost per click. Opening it also writes the figures through on the
 * server, so a deliberate look at one campaign refreshes what the list shows
 * for it.
 */
function InsightsPanel({ campaign }: { campaign: AdCampaignDto }) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads.insights;
  const { token } = useSession();

  const launched = Boolean(campaign.metaCampaignId);
  const insights = useResource(
    () =>
      launched
        ? fetchAdInsights(token, campaign.id)
        : Promise.resolve(null),
    [token, campaign.id, launched],
  );

  const data = insights.data;
  /*
    `reported` is whether Meta returned a data row, and it is deliberately not
    derived from `readAt`: on this endpoint `readAt` is stamped when we ask, so
    it is always set and says nothing about whether there was an answer. False
    here is the ordinary new-campaign case and is not an error.
  */
  const reported = Boolean(data?.reported);
  /*
    A dead token is not this campaign's problem — it stops every read and every
    launch across the whole account — so it is worth naming even on a screen
    about one campaign.
  */
  const tokenDead = metaFailure(insights.error) === "META_TOKEN_INVALID";
  /*
    The two empty states that look identical on screen and are not. No row at
    all is a campaign Meta has not delivered on yet. A row that came back with
    every field null is a row we could not read — for anything that has plainly
    been running for hours that means we asked Meta for field names it does not
    have. Both render as "not yet" per figure, so without this the second is
    indistinguishable from a quiet campaign and would never surface on its own.
  */
  const emptyReport =
    reported &&
    [data?.impressions, data?.reach, data?.clicks, data?.spend].every(
      (value) => figure(value) === null,
    );

  return (
    <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
        {launched && (
          <button
            type="button"
            onClick={insights.reload}
            className="btn-secondary"
          >
            {t.refresh}
          </button>
        )}
      </div>

      {!launched ? (
        <p className="mt-3 text-sm text-ink-500">{t.notLaunched}</p>
      ) : insights.error ? (
        /*
          A failed read is the one state with no trace anywhere else. The refresh
          job catches per campaign and moves on, leaving the row's figures and
          timestamp exactly as they were — so a campaign whose fetch has been
          failing since launch looks identical in the list to a quiet one, and
          quietly contributes nothing to the site's impression count. Pressing
          this page is the only way anybody finds out, which is why the reason is
          named here rather than reduced to "could not read".

          Alarmed on two counts: a dead token is always urgent because it stops
          every campaign at once, and a campaign that has never been read
          successfully is the failing-since-launch case rather than a blip over
          good cached figures.
        */
        <div
          className={
            tokenDead || !campaign.insightsReadAt
              ? "mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 dark:bg-danger/15"
              : "mt-3"
          }
        >
          <p className="text-sm text-ink-700">
            {adErrorMessage(
              insights.error,
              strings.ads.refusals,
              () => t.loadFailed,
            )}
          </p>
          {!campaign.insightsReadAt && (
            <p className="mt-1 text-sm text-ink-700">{t.loadFailedNeverRead}</p>
          )}
        </div>
      ) : insights.loading ? (
        <p className="mt-3 text-sm text-ink-400">{strings.loading}</p>
      ) : (
        <>
          {!reported && (
            <div className="mt-3 rounded-2xl border border-ink-100 bg-ink-50 p-4">
              <p className="text-sm font-semibold text-ink-800">{t.notYet}</p>
              <p className="mt-1 text-sm text-ink-600">{t.notYetBody}</p>
            </div>
          )}
          {emptyReport && (
            <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 dark:bg-danger/15">
              <p className="text-sm text-ink-700">{t.emptyReport}</p>
            </div>
          )}
          <dl className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <Row label={t.impressions}>
              <Insight value={data?.impressions} notYet={t.notYet} />
            </Row>
            <Row label={t.reach}>
              <Insight value={data?.reach} notYet={t.notYet} />
            </Row>
            <Row label={t.clicks}>
              <Insight value={data?.clicks} notYet={t.notYet} />
            </Row>
            <Row label={t.ctr}>
              <Insight value={data?.ctr} notYet={t.notYet} />
            </Row>
            <Row label={t.cpc}>
              <Insight value={data?.cpc} notYet={t.notYet} />
            </Row>
            <Row label={t.spend}>
              <Insight value={data?.spend} notYet={t.notYet} />
              {data?.currency ? (
                <span className="ms-1 text-ink-500">{data.currency}</span>
              ) : null}
            </Row>
          </dl>
          {data?.readAt && (
            <p className="mt-3 text-xs text-ink-500">
              {t.asOf(formatDateTime(data.readAt, locale))} — {t.cached}
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function AdCampaignDetail() {
  const { campaignId = "" } = useParams();
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads;
  const d = t.detail;
  const { token, handleError } = useSession();

  const campaign = useResource(
    () => fetchAdCampaign(token, campaignId),
    [token, campaignId],
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    Pause, resume and delete all answer with the campaign in its new state, so
    the row is replaced from the response rather than refetched. That matters
    most for delete: a delete Meta refuses comes back as a campaign carrying a
    `failureReason`, which a 204 and a refetch would have thrown away.
  */
  async function act(
    confirmText: string,
    call: () => Promise<AdCampaignDto>,
  ) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      campaign.set(await call());
    } catch (caught) {
      handleError(caught);
      setError(adErrorMessage(caught, t.refusals, () => d.actionFailed));
    } finally {
      setBusy(false);
    }
  }

  if (campaign.error) {
    return (
      <div>
        <p className="text-sm text-ink-500">{d.notFound}</p>
        <Link to="/ads" className="btn-secondary mt-4 inline-flex">
          {t.backToCampaigns}
        </Link>
      </div>
    );
  }

  const data = campaign.data;
  if (!data) return <p className="text-sm text-ink-400">{strings.loading}</p>;

  const spending = isSpending(data);
  const canPause = data.status === "ACTIVE";
  const canResume = data.status === "PAUSED";
  const canDelete = !data.deletedAt && Boolean(data.metaCampaignId);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {data.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusPill status={data.status} labels={t.statuses} />
            <span className="text-sm text-ink-500">{data.siteName}</span>
          </div>
        </div>
        <Link to="/ads" className="btn-secondary">
          {t.backToCampaigns}
        </Link>
      </div>

      {/* Louder than anything else on the page, and deliberately placed above
          the record rather than inside it: a half-failed launch is running,
          costing money, and says "Stopped" three lines further down. */}
      {spending && data.status !== "ACTIVE" && (
        <div className="mt-6 rounded-3xl border border-danger/30 bg-danger/10 p-5 dark:bg-danger/15">
          <p className="text-sm font-bold text-danger">{d.spendingTitle}</p>
          <p className="mt-1 text-sm text-ink-700">{d.spendingBody}</p>
        </div>
      )}

      {data.status === "FAILED" && !data.metaCampaignId && (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-ink-50 p-5">
          <p className="text-sm text-ink-700">{d.notLaunched}</p>
        </div>
      )}

      {data.failureReason && (
        <p className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
          {data.failureReason}
        </p>
      )}

      <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <Row label={d.budget}>
            <span dir="ltr">
              <Budget
                minor={data.dailyBudgetMinor}
                currency={data.currency}
                locale={locale}
              />
            </span>
          </Row>
          <Row label={t.campaigns.colChannels}>
            <Channels channels={data.channels} labels={t.channels} />
          </Row>
          <Row label={d.destination}>
            {data.destinationUrl ? (
              <a
                href={data.destinationUrl}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="underline underline-offset-2"
              >
                {data.destinationUrl}
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label={d.audience}>
            {[
              data.country,
              data.cityKey,
              data.ageMin !== undefined && data.ageMax !== undefined
                ? d.ages(data.ageMin, data.ageMax)
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </Row>
          <Row label={d.headline}>{data.headline || "—"}</Row>
          <Row label={d.primaryText}>{data.primaryText || "—"}</Row>
          <Row label={d.createdBy}>{data.createdByEmail || "—"}</Row>
          <Row label={d.created}>{formatDateTime(data.createdAt, locale)}</Row>
          <Row label={d.launched}>
            {data.launchedAt ? formatDateTime(data.launchedAt, locale) : "—"}
          </Row>
          <Row label={d.paused}>
            {data.pausedAt ? formatDateTime(data.pausedAt, locale) : "—"}
          </Row>
          <Row label={d.deletedAt}>
            {data.deletedAt ? formatDateTime(data.deletedAt, locale) : "—"}
          </Row>
        </dl>
      </section>

      <InsightsPanel campaign={data} />

      <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
        <h2 className="text-lg font-bold text-ink-900">{d.metaTitle}</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <Row label={d.metaCampaign}>
            <span dir="ltr">{data.metaCampaignId || "—"}</span>
          </Row>
          <Row label={d.metaAdSet}>
            <span dir="ltr">{data.metaAdSetId || "—"}</span>
          </Row>
          <Row label={d.metaCreative}>
            <span dir="ltr">{data.metaCreativeId || "—"}</span>
          </Row>
          <Row label={d.metaAd}>
            <span dir="ltr">{data.metaAdId || "—"}</span>
          </Row>
        </dl>
      </section>

      {error && <p className="mt-4 text-sm font-semibold text-danger">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {canPause && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void act(d.pauseConfirm, () => pauseAdCampaign(token, data.id))
            }
            className="btn-secondary disabled:opacity-50"
          >
            {busy ? d.pausing : d.pause}
          </button>
        )}
        {canResume && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void act(d.resumeConfirm, () => resumeAdCampaign(token, data.id))
            }
            className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            {busy ? d.resuming : d.resume}
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void act(d.deleteConfirm, () => deleteAdCampaign(token, data.id))
            }
            className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            {busy ? d.deleting : d.delete}
          </button>
        )}
      </div>
    </div>
  );
}
