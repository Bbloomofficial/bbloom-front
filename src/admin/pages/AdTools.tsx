import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/http";
import { AD_CHANNELS, adErrorMessage, isSpending } from "../../api/ads";
import type { AdChannel } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import {
  deleteAdTestCampaign,
  fetchAdStatus,
  fetchAdTestCampaigns,
  runAdTest,
} from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { Budget, toneClasses } from "../components/AdBits";
import type { Tone } from "../components/AdBits";
import type { AdCampaignDto, AdStatus, AdTestResult } from "../api/types";

/**
 * The test tools, on their own route.
 *
 * They are kept off the campaigns screen because of what they are: a button
 * that spends bbloom's own money at Meta, and a list of things it has left
 * running. Sitting beside real client campaigns they read as part of the day's
 * work; on their own they read as what they are, an engineering tool with a
 * bill attached.
 */
function TestTool({
  status,
  onLaunched,
}: {
  status: AdStatus | null;
  onLaunched: () => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale).ads.test;
  const refusals = adminStrings(locale).ads.refusals;
  const labels = adminStrings(locale).ads.channels;
  const { token, handleError } = useSession();

  const [channels, setChannels] = useState<AdChannel[]>(["FACEBOOK"]);
  const [destination, setDestination] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AdTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Instagram cannot be tested when no account is connected, so the checkbox is
  // disabled rather than left to produce an INSTAGRAM_NOT_CONFIGURED refusal
  // that a real client's campaign would also hit.
  const instagramAvailable = status?.instagramConfigured === true;

  function toggle(channel: AdChannel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (channels.length === 0) {
      setError(t.pickChannel);
      return;
    }
    const url = destination.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError(t.badUrl);
      return;
    }
    // Spending money is not something to do on a mis-click, and the browser's
    // own dialog is the one thing on the page a tired admin cannot skim past.
    if (!window.confirm(t.confirm)) return;

    // The previous answer goes before the new attempt starts, so a stale
    // "launched" cannot sit reassuringly on screen while this one is running.
    setResult(null);
    setError(null);
    setPending(true);
    try {
      const next = await runAdTest(token, {
        channels,
        ...(url ? { destinationUrl: url } : {}),
      });
      setResult(next);
      // A launch — successful or half-failed — changes both the live counters
      // and the list below, and the list is where the delete button lives.
      onLaunched();
    } catch (caught) {
      setError(describe(caught));
      // A dead token belongs on the sign-in screen; a 403 does not. This
      // endpoint answers 403 to a valid non-admin staff token, and signing
      // someone out over a button they may not press is the wrong answer.
      if (caught instanceof ApiError && caught.status === 401) {
        handleError(caught);
      }
    } finally {
      setPending(false);
    }
  }

  function describe(caught: unknown): string {
    if (!(caught instanceof ApiError)) return t.requestFailed;
    if (caught.status === 429) {
      /*
        Read from the problem body, not the `Retry-After` header: our HTTP
        layer parses the JSON problem and never looks at response headers, so
        a header-only value is invisible here. Presence-checked rather than
        assumed, exactly as the mail test does — "try again at undefined" is
        worse than the vague sentence.
      */
      const until = caught.problem.retryAfter;
      if (typeof until === "string" && until) {
        return `${t.rateLimited} ${t.rateLimitedUntil(
          formatDateTime(until, locale),
        )}`;
      }
      return t.rateLimited;
    }
    if (caught.status === 403) return t.notPermitted;
    /*
      No Meta branch here on purpose. This endpoint answers 200 even when the
      launch fails, because the failure *is* the result being asked for and an
      error response would throw away the campaign id the delete button needs —
      so Meta's verdict arrives as `failureCode` on the result below, and an
      exception on this path means the request never got that far.
    */
    return t.requestFailed;
  }

  const outcome = result?.outcome;
  const tone: Tone =
    outcome === "LAUNCHED" ? "good" : outcome === "FAILED" ? "bad" : "neutral";

  return (
    <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-2 text-sm text-ink-600">{t.body}</p>

      {/* Not a footnote. This is the difference between this button and every
          other test button in the panel, so it is stated before the form and
          in the alarm colour rather than under it in grey. */}
      <p className="mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger dark:bg-danger/15">
        {t.warning}
      </p>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:max-w-lg">
        <div>
          <span className="text-sm font-semibold text-ink-900">
            {t.channelLabel}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {AD_CHANNELS.map((channel) => {
              const disabled = channel === "INSTAGRAM" && !instagramAvailable;
              const on = channels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => toggle(channel)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                    on
                      ? "border-bloom-600 bg-bloom-600 text-white"
                      : "border-ink-100 bg-surface text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {labels[channel] ?? channel}
                </button>
              );
            })}
          </div>
          {!instagramAvailable && (
            <span className="mt-1.5 block text-xs text-ink-400">
              {t.instagramUnavailable}
            </span>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-ink-900">
            {t.destinationLabel}
          </span>
          <input
            type="url"
            dir="ltr"
            value={destination}
            placeholder="https://…"
            onChange={(event) => setDestination(event.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-ink-100 bg-surface px-4 py-3 text-sm text-ink-900 outline-none focus:border-bloom-400"
          />
          <span className="mt-1.5 block text-xs text-ink-400">
            {t.destinationHint}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || channels.length === 0}
            className="rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            {pending ? t.launching : t.launch}
          </button>
          {pending && (
            <span className="text-xs text-ink-400">{t.launchingNote}</span>
          )}
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger dark:bg-danger/15"
        >
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={`mt-5 rounded-2xl border p-5 ${toneClasses(tone)}`}
        >
          <p className="text-sm font-bold text-ink-900">
            {outcome === "LAUNCHED" && t.launchedTitle}
            {outcome === "FAILED" && t.failedTitle}
            {outcome === "NOT_CONFIGURED" && t.notConfiguredTitle}
            {/* An outcome this build has never heard of. Rendering it as either
                a success or a failure would be inventing an answer — and one of
                those inventions says "nothing is spending" about something that
                is. Shown raw, left for a human. */}
            {outcome !== "LAUNCHED" &&
              outcome !== "FAILED" &&
              outcome !== "NOT_CONFIGURED" &&
              outcome}
          </p>
          <p className="mt-1.5 text-sm text-ink-600">
            {outcome === "LAUNCHED" && t.launchedBody}
            {outcome === "FAILED" && t.failedBody}
            {outcome === "NOT_CONFIGURED" && t.notConfiguredBody}
          </p>

          {/*
            Meta's verdict, in our words, above Meta's own. This button exists to
            answer "do our credentials work", so it is the one place in the panel
            that most needs to be able to say "the credentials are the problem"
            rather than handing over English prose about an object id and leaving
            the reader to infer it.
          */}
          {result.failureCode && (
            <p className="mt-2 text-sm font-semibold text-ink-900">
              {refusals[result.failureCode] ?? result.failureCode}
            </p>
          )}

          {result.failureReason && (
            <p className="mt-2 text-sm font-semibold text-danger">
              {result.failureReason}
            </p>
          )}

          {/* The reassuring half, and worth saying out loud: a dead token means
              the request never got far enough to create anything, so unlike most
              failures on this screen there is nothing live to go and delete. */}
          {result.failureCode === "META_TOKEN_INVALID" &&
            !result.stillSpending && (
              <p className="mt-2 text-sm text-ink-600">{t.tokenDeadNoSpend}</p>
            )}

          {/* The case the outcome alone gets wrong: a FAILED that got far
              enough to create the campaign is spending money while reading as
              though nothing happened. */}
          {result.stillSpending && (
            <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 dark:bg-danger/15">
              <p className="text-sm font-bold text-danger">
                {t.stillSpendingTitle}
              </p>
              <p className="mt-1.5 text-sm text-ink-600">
                {t.stillSpendingBody}
              </p>
            </div>
          )}

          <p className="mt-3 text-sm text-ink-600">
            {result.name && (
              <span dir="ltr" className="font-semibold text-ink-900">
                {result.name}
              </span>
            )}
            {result.dailyBudgetMinor !== undefined && (
              <>
                {result.name ? " · " : ""}
                {t.budget}:{" "}
                <Budget
                  minor={result.dailyBudgetMinor}
                  currency={result.currency}
                  locale={locale}
                />
              </>
            )}
            {result.attemptedAt && (
              <>
                {" · "}
                {t.attemptedAt}: {formatDateTime(result.attemptedAt, locale)}
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
}

function TestCampaigns({
  campaigns,
  onChanged,
}: {
  campaigns: AdCampaignDto[];
  onChanged: (updated: AdCampaignDto) => void;
}) {
  const { locale } = useI18n();
  const strings = adminStrings(locale).ads;
  const t = strings.testList;
  const { token, handleError } = useSession();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(campaign: AdCampaignDto) {
    if (!window.confirm(t.deleteConfirm)) return;
    setBusyId(campaign.id);
    setError(null);
    try {
      onChanged(await deleteAdTestCampaign(token, campaign.id));
    } catch (caught) {
      handleError(caught);
      /*
        Worth naming Meta here rather than saying "could not delete": a test
        campaign that will not delete is one that is still spending our money,
        so whether the obstacle is a dead token or Meta refusing the object
        decides whether anybody can do anything about it right now.
      */
      setError(adErrorMessage(caught, strings.refusals, () => t.deleteFailed));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-2 text-sm text-ink-600">{t.body}</p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger dark:bg-danger/15"
        >
          {error}
        </p>
      )}

      {campaigns.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">{t.empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-start text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="py-2 text-start font-semibold">{t.colWhen}</th>
                <th className="py-2 text-start font-semibold">{t.colName}</th>
                <th className="py-2 text-start font-semibold">
                  {t.colChannels}
                </th>
                <th className="py-2 text-start font-semibold">{t.colBudget}</th>
                <th className="py-2 text-start font-semibold">{t.colStatus}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {campaigns.map((campaign) => {
                const spending = isSpending(campaign);
                return (
                  <tr key={campaign.id}>
                    <td className="py-3 text-ink-600">
                      {formatDateTime(
                        campaign.launchedAt ?? campaign.createdAt,
                        locale,
                      )}
                    </td>
                    <td className="py-3 font-semibold text-ink-900" dir="ltr">
                      {campaign.name}
                    </td>
                    <td className="py-3 text-ink-600">
                      {campaign.channels
                        .map((item) => strings.channels[item] ?? item)
                        .join(", ")}
                    </td>
                    <td className="py-3 text-ink-600">
                      <Budget
                        minor={campaign.dailyBudgetMinor}
                        currency={campaign.currency}
                        locale={locale}
                      />
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-ink-900">
                        {strings.statuses[campaign.status] ?? campaign.status}
                      </span>
                      {spending && (
                        <span className="ms-2 inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">
                          {t.spending}
                        </span>
                      )}
                      {campaign.failureReason && (
                        <span className="mt-1 block text-xs text-danger">
                          {campaign.failureReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-end">
                      {/* Only a row that can still cost money gets the button.
                          A deleted one has nothing left to stop, and offering
                          the action anyway invites somebody to press it and
                          read the refusal as a failure to clean up. */}
                      {spending && (
                        <button
                          type="button"
                          onClick={() => void remove(campaign)}
                          disabled={busyId === campaign.id}
                          className="rounded-xl bg-danger px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40"
                        >
                          {busyId === campaign.id ? t.deleting : t.delete}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


export default function AdTools() {
  const { locale } = useI18n();
  const t = adminStrings(locale).ads;
  const { token } = useSession();

  const status = useResource(() => fetchAdStatus(token), [token]);
  const tests = useResource(() => fetchAdTestCampaigns(token), [token]);

  /*
    A launch or a delete moves both of these: the counters the status route
    shows and the rows here. Status is refetched rather than patched, because
    `liveCampaigns` is a server-side count this screen cannot derive � it covers
    client campaigns the test list never shows.
  */
  function reloadBoth() {
    status.reload();
    tests.reload();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.tools}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.test.body}</p>
        </div>
        <Link to="/ads" className="btn-secondary">
          {t.backToCampaigns}
        </Link>
      </div>

      <TestTool status={status.data} onLaunched={reloadBoth} />

      {/* The list renders whatever it has, including nothing. A failed read
          must not take the tool above it with it: being unable to see the test
          campaigns is exactly when somebody most needs to launch one. */}
      <TestCampaigns
        campaigns={tests.data ?? []}
        onChanged={(updated) => {
          tests.set(
            (tests.data ?? []).map((item) =>
              item.id === updated.id ? updated : item,
            ),
          );
          status.reload();
        }}
      />
    </div>
  );
}
