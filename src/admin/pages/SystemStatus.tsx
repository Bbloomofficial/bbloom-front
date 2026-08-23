import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { mailNeedsAttention, useSystemStatus } from "../system";
import { peopleWaiting } from "../components/MailAlert";
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
                  {t.system.waitingTitle(peopleWaiting(mail.recentFailures))}
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
          </section>

          <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
            {mail.recentFailures.length === 0 ? (
              <p className="text-sm text-ink-600">{t.system.noneWaiting}</p>
            ) : (
              <>
                <p className="text-sm text-ink-600">{t.system.listNote}</p>
                <p className="mt-1 text-sm text-ink-400">
                  {t.system.allShownNote}
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-start text-sm">
                    <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                      <tr>
                        <th className="px-3 py-3 text-start font-semibold">
                          {t.system.colTime}
                        </th>
                        <th className="px-3 py-3 text-start font-semibold">
                          {t.system.colRecipient}
                        </th>
                        <th className="hidden px-3 py-3 text-start font-semibold md:table-cell">
                          {t.system.colSubject}
                        </th>
                        <th className="px-3 py-3 text-start font-semibold">
                          {t.system.colReason}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Every entry, at equal weight. The list arrives most
                          recent first and the most recent is routinely a test
                          probe, while the real client sits further down —
                          rendering only the newest would show the noise and
                          hide the person. */}
                      {mail.recentFailures.map((failure, index) => (
                        <tr
                          key={`${failure.at}-${failure.recipient}-${index}`}
                          className="border-b border-ink-100 last:border-0"
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-ink-600">
                            {formatDateTime(failure.at, locale)}
                          </td>
                          <td className="px-3 py-4">
                            {/* Never masked. Working out who to apologise to
                                is the only job this screen has. */}
                            <span
                              dir="ltr"
                              className="font-semibold text-ink-900"
                            >
                              {failure.recipient}
                            </span>
                          </td>
                          <td className="hidden max-w-72 px-3 py-4 text-ink-600 md:table-cell">
                            {failure.subject}
                          </td>
                          <td className="px-3 py-4 text-danger">
                            {failure.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}

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
