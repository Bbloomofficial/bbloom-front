import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { mailNeedsAttention, useSystemStatus } from "../system";
import {
  peopleOwed,
  peopleWaiting,
  peopleWaitingIsFloor,
  unlistedFailures,
  unlistedOwed,
} from "../components/MailAlert";
import FailureTable from "../components/FailureTable";
import MailTest from "../components/MailTest";
import type { MailStatus } from "../api/types";

/**
 * `OFF` is not a fault — it means no from-address is configured and mail is
 * deliberately a no-op, which is the right state on a laptop. Only the two
 * states with a person waiting behind them get the alarm treatment.
 */
function toneFor(status: MailStatus): string {
  if (mailNeedsAttention(status)) {
    return "border-danger/30 bg-danger/10 dark:bg-danger/15";
  }
  if (status === "OFF") return "border-ink-100 bg-ink-50";
  return "border-success-border bg-success-soft";
}

function dotFor(status: MailStatus): string {
  if (mailNeedsAttention(status)) return "bg-danger";
  if (status === "OFF") return "bg-ink-400";
  return "bg-success";
}

export default function SystemStatus() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { status, forbidden, reload } = useSystemStatus();

  if (forbidden) return null;

  const mail = status?.mail;
  const hidden = mail ? unlistedFailures(mail) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.system.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.system.subtitle}</p>
        </div>
        <button type="button" onClick={reload} className="btn-secondary">
          {t.system.refresh}
        </button>
      </div>

      {!status && <p className="mt-8 text-sm text-ink-400">{t.loading}</p>}

      {mail && (
        <>
          <section
            className={`mt-6 rounded-3xl border p-6 sm:p-7 ${toneFor(mail.status)}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-ink-900">
                {t.system.mailTitle}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-surface px-2.5 py-1 text-xs font-semibold text-ink-900">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${dotFor(mail.status)}`}
                />
                {t.system.mailStatuses[mail.status] ?? mail.status}
              </span>
              {mail.consecutiveFailures > 0 && (
                <span className="text-xs font-semibold text-danger">
                  {t.system.consecutive(mail.consecutiveFailures)}
                </span>
              )}
            </div>

            {mail.status === "OFF" && (
              <p className="mt-3 text-sm text-ink-600">{t.system.offNote}</p>
            )}
            {mail.status === "OK" && (
              <p className="mt-3 text-sm text-ink-600">{t.system.okNote}</p>
            )}
            {mailNeedsAttention(mail.status) && (
              <>
                <p className="mt-3 text-sm font-bold text-danger">
                  {peopleWaitingIsFloor(mail)
                    ? t.system.waitingAtLeastTitle(peopleWaiting(mail))
                    : t.system.waitingTitle(peopleWaiting(mail))}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  {t.system.waitingBody}
                </p>
              </>
            )}

            <p className="mt-4 text-xs text-ink-400">
              {t.system.lastSuccess}:{" "}
              {/* Absent means the process restarted and has not sent yet.
                  That is "we do not know", not "it has never worked" — and
                  the difference matters when you are deciding whether to
                  panic after a deploy. */}
              {mail.lastSuccessAt
                ? formatDateTime(mail.lastSuccessAt, locale)
                : t.system.unknown}
            </p>

            {/* The newest failure, which the table cannot show: it keeps the
                earliest entries, so every visible reason is frozen at the
                start of the outage. Without this an admin fixes the problem
                the outage began with rather than the one it is on now. */}
            {mail.lastFailureReason && (
              <p className="mt-1 text-xs text-ink-400">
                {t.system.latestFailure}:{" "}
                {mail.lastFailureAt
                  ? `${formatDateTime(mail.lastFailureAt, locale)} — `
                  : ""}
                <span className="text-danger">{mail.lastFailureReason}</span>
              </p>
            )}
          </section>

          <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
            {mail.recentFailures.length === 0 ? (
              <p className="text-sm text-ink-600">{t.system.noneWaiting}</p>
            ) : (
              <>
                <p className="text-sm text-ink-600">{t.system.listNote}</p>
                <p className="mt-1 text-sm text-ink-400">
                  {hidden > 0
                    ? t.system.truncatedNote(mail.recentFailures.length, hidden)
                    : t.system.allShownNote}
                </p>

                <FailureTable rows={mail.recentFailures} />
              </>
            )}
          </section>

          {/* The people still owed an email, which is a different question
              from whether mail is broken — and the only one still answerable
              after the fix. It has to render regardless of `status`, because
              the successful send that turns the light green is usually the
              admin's own test probe, fired the moment they came looking. */}
          {mail.unresolved && mail.unresolved.length > 0 && (
            <section className="mt-6 rounded-3xl border border-amber-300/60 bg-amber-50 p-6 sm:p-7 dark:border-amber-900/60 dark:bg-amber-950/25">
              <h2 className="text-lg font-bold text-ink-900">
                {t.system.owedTitle(peopleOwed(mail))}
              </h2>
              <p className="mt-2 text-sm text-ink-600">{t.system.owedBody}</p>
              <p className="mt-1 text-sm text-ink-400">
                {unlistedOwed(mail) > 0
                  ? t.system.owedTruncatedNote(
                      mail.unresolved.length,
                      unlistedOwed(mail),
                    )
                  : t.system.owedAllShownNote}
              </p>
              <p className="mt-1 text-sm text-ink-400">{t.system.owedLimit}</p>

              <FailureTable rows={mail.unresolved} />
            </section>
          )}
        </>
      )}

      {/* Rendered whether or not a reading arrived. A failed poll is one of the
          moments an admin most wants to ask the question directly, and hiding
          the only active diagnostic behind the passive one that just failed
          would take the tool away exactly when it is needed. */}
      <MailTest />

      <p className="mt-6 text-xs text-ink-400">
        {status && (
          <>
            {t.system.checkedAt}: {formatDateTime(status.checkedAt, locale)}
            {" · "}
          </>
        )}
        {t.system.snapshotNote}
      </p>
    </div>
  );
}
