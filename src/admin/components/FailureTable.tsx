import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import type { MailFailure } from "../api/types";

/**
 * The same table wherever a list of undelivered emails appears: the failures in
 * the current outage, the people still owed one after it ended, and the rows a
 * staff test send has just cleared.
 *
 * Rows render in the order the server sends them — oldest first — so the top
 * row is the person who has been waiting longest and an admin can work straight
 * down.
 */
export default function FailureTable({ rows }: { rows: MailFailure[] }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);

  return (
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
          {rows.map((failure, index) => (
            <tr
              key={`${failure.at}-${failure.recipient}-${index}`}
              className="border-b border-ink-100 last:border-0"
            >
              <td className="whitespace-nowrap px-3 py-4 text-ink-600">
                {formatDateTime(failure.at, locale)}
              </td>
              <td className="px-3 py-4">
                {/* Never masked. Working out who to apologise to is the only
                    job this screen has. */}
                <span dir="ltr" className="font-semibold text-ink-900">
                  {failure.recipient}
                </span>
              </td>
              <td className="hidden max-w-72 px-3 py-4 text-ink-600 md:table-cell">
                {failure.subject}
              </td>
              <td className="px-3 py-4 text-danger">{failure.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
