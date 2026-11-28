import { useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { useAuth, useSession } from "../auth";
import { dismissOwedMail } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { mailNeedsAttention, useSystemStatus } from "../system";
import { unlistedOwed } from "../components/MailAlert";
import { instant, matchesQuery, sortRows } from "../listTools";
import { FilterSelect, ListToolbar, SortTh, useListParams } from "../components/ListTools";

const FILTERS = ["outage"] as const;
const SORTS = ["recipient", "subject", "when"] as const;

/** Lower-cased and trimmed, the way the server compares addresses. */
function normalise(recipient: string): string {
  return recipient.trim().toLowerCase();
}

/**
 * Who is still owed an email we could not send, and a way to take them off the
 * list once staff have dealt with them another way.
 *
 * Reads the same system status the banner does, from the shell's poll, and
 * writes the answer of a dismissal straight back into it — so the banner on
 * every screen changes the moment the list does, not on the next poll.
 *
 * Dismissing sends nobody anything. The copy says so at the point of the click,
 * because "dismiss" next to an email address reads very like "resend".
 */
export default function Emails() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const e = t.emails;
  const { token } = useSession();
  const { handleError } = useAuth();
  const { status, reload, applyMail } = useSystemStatus();
  const list = useListParams(FILTERS, SORTS, { sort: "when", direction: "desc" });

  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const mail = status?.mail;
  const all = mail?.unresolved ?? [];
  const inOutage = useMemo(
    () => new Set((mail?.recentFailures ?? []).map((f) => normalise(f.recipient))),
    [mail],
  );

  const filtered = useMemo(
    () =>
      all.filter((row) => {
        if (list.filters.outage === "yes" && !inOutage.has(normalise(row.recipient))) {
          return false;
        }
        return matchesQuery([row.recipient, row.subject, row.reason], list.query);
      }),
    [all, inOutage, list.query, list.filters.outage],
  );
  const rows = useMemo(
    () =>
      sortRows(
        filtered,
        (row) => {
          switch (list.sort) {
            case "recipient":
              return row.recipient;
            case "subject":
              return row.subject;
            case "when":
              return instant(row.at);
          }
        },
        list.direction,
        locale,
      ),
    [filtered, list.sort, list.direction, locale],
  );

  async function dismiss(recipient?: string) {
    const confirmText = recipient
      ? e.dismissConfirm(recipient)
      : e.dismissAllConfirm(mail?.owedTotal ?? all.length);
    if (!window.confirm(confirmText)) return;
    setProblem(null);
    setBusy(recipient ?? "*");
    try {
      const next = await dismissOwedMail(token, recipient);
      applyMail(next.mail);
    } catch (cause) {
      handleError(cause);
      setProblem((cause as Error).message || e.dismissFailed);
    } finally {
      setBusy(null);
    }
  }

  const unlisted = mail ? unlistedOwed(mail) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
            {e.title}
          </h1>
          <p className="mt-1 max-w-3xl text-base text-ink-600">{e.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reload} className="btn-secondary">
            {t.ads.manager.refresh}
          </button>
          {all.length > 0 && (
            <button
              type="button"
              onClick={() => void dismiss()}
              disabled={busy !== null}
              className="btn-secondary text-danger disabled:opacity-50"
            >
              {busy === "*" ? e.dismissing : e.dismissAll}
            </button>
          )}
        </div>
      </div>

      {!mail ? (
        <p className="mt-8 text-sm text-ink-400">{t.loading}</p>
      ) : (
        <>
          {(mailNeedsAttention(mail.status) || mail.status === "LAST_FAILED") && (
            <p className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger dark:bg-danger/15">
              {t.system.mailTitle}: {t.system.mailStatuses[mail.status] ?? mail.status}.{" "}
              <span className="font-normal text-ink-600">{e.notWorking}</span>
            </p>
          )}

          <ListToolbar
            query={list.query}
            onQuery={(value) => list.update({ q: value || null })}
            placeholder={e.searchPlaceholder}
            shown={filtered.length}
            total={all.length}
            narrowed={list.narrowed}
            onClear={list.clear}
          >
            <FilterSelect
              label={e.filterOutage}
              value={list.filters.outage}
              onChange={(value) => list.update({ outage: value || null })}
              options={[{ value: "yes", label: e.outageOnly }]}
            />
          </ListToolbar>

          {problem && <p role="alert" className="mt-4 text-sm font-semibold text-danger">{problem}</p>}

          {all.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
              {e.owedEmpty}
            </p>
          ) : rows.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
              {t.list.noneMatching}
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-surface">
              <table className="w-full min-w-[48rem] text-start text-[15px]">
                <thead className="border-b border-ink-100 bg-ink-50 text-[13px] text-ink-600 font-semibold">
                  <tr>
                    <SortTh column="recipient" label={e.colRecipient} list={list} />
                    <SortTh column="subject" label={e.colSubject} list={list} />
                    <th className="px-5 py-3 text-start font-semibold">{e.colReason}</th>
                    <SortTh column="when" label={e.colWhen} list={list} first="desc" />
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={normalise(row.recipient)}
                      className="border-b border-ink-100 align-top last:border-0 hover:bg-ink-50"
                    >
                      <td className="px-5 py-4">
                        <span dir="ltr" translate="no" className="font-semibold wrap-anywhere text-ink-900">
                          {row.recipient}
                        </span>
                        {inOutage.has(normalise(row.recipient)) && (
                          <span className="mt-1 block text-xs font-semibold text-danger">
                            {e.inOutage}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-ink-600">{row.subject}</td>
                      <td className="max-w-80 px-5 py-4 text-xs wrap-anywhere text-ink-500" dir="ltr">
                        {row.reason}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-ink-600">
                        {formatDateTime(row.at, locale)}
                      </td>
                      <td className="px-5 py-4 text-end">
                        <button
                          type="button"
                          onClick={() => void dismiss(row.recipient)}
                          disabled={busy !== null}
                          className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                        >
                          {busy === row.recipient ? e.dismissing : e.dismiss}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {unlisted > 0 && <p className="mt-3 text-xs text-ink-500">{e.unlisted(unlisted)}</p>}
          <p className="mt-3 text-xs text-ink-400">{e.memoryNote}</p>
        </>
      )}
    </div>
  );
}
