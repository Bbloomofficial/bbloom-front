import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAccounts } from "../api/client";
import { formatDate } from "../format";
import { adminStrings } from "../strings";
import { adminPath } from "../../routes";

const PAGE_SIZE = 20;

export default function Accounts() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useResource(
    () => fetchAccounts(token, { q: query, page, size: PAGE_SIZE }),
    [token, query, page],
  );

  const accounts = data?.items ?? [];
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {t.accounts.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.accounts.subtitle}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">
          <label className="sr-only" htmlFor="account-search">
            {t.accounts.search}
          </label>
          <input
            id="account-search"
            type="search"
            className="field"
            placeholder={t.accounts.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {data && (
          <span className="text-sm text-ink-400">
            {t.accounts.results(data.totalItems)}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 text-center">
          <p className="text-sm font-semibold text-danger">{error.message}</p>
          <button type="button" onClick={reload} className="btn-secondary mt-4">
            {t.retry}
          </button>
        </div>
      )}

      {loading && !data && (
        <p className="mt-8 text-sm text-ink-400">{t.loading}</p>
      )}

      {data && accounts.length === 0 && (
        <p className="mt-8 rounded-3xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {query ? t.accounts.emptyFiltered : t.accounts.empty}
        </p>
      )}

      {accounts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.accounts.email}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold md:table-cell">
                  {t.accounts.fullName}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold sm:table-cell">
                  {t.accounts.created}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold lg:table-cell">
                  {t.accounts.lastLogin}
                </th>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.accounts.emailStatus}
                </th>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.accounts.freeUsage}
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={adminPath("/accounts/" + account.id)}
                      className="font-semibold text-ink-900 hover:text-bloom-600"
                    >
                      {account.email}
                    </Link>
                    {/* The search matches website names too, so a row found by
                        `q=marita` would otherwise be an unfamiliar email with
                        nothing on screen explaining why it came back. This is
                        also the identifier staff actually have on a phone call:
                        the client says "it's about Marita", not their address. */}
                    {account.sites?.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-ink-400">
                        {account.sites
                          .slice(0, 3)
                          .map((site) => site.businessName)
                          .join(", ")}
                        {account.sites.length > 3 &&
                          ` +${account.sites.length - 3}`}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-600 md:table-cell">
                    {account.fullName}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-600 sm:table-cell">
                    {formatDate(account.createdAt, locale)}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-600 lg:table-cell">
                    {account.lastLoginAt
                      ? formatDate(account.lastLoginAt, locale)
                      : t.accounts.never}
                  </td>
                  <td className="px-5 py-4">
                    {account.emailVerified ? (
                      <span className="text-xs font-semibold text-success">
                        {t.accounts.verified}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-warning">
                        {t.accounts.unverified}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-ink-600">
                      {account.freeSitesUsed} / {account.freeSiteAllowance}
                    </span>
                    {account.atFreeLimit && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                        {t.accounts.atLimit}
                      </span>
                    )}
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
            className="btn-secondary disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            {t.accounts.prev}
          </button>
          <span className="text-sm text-ink-400">
            {t.accounts.page(page + 1, totalPages)}
          </span>
          <button
            type="button"
            className="btn-secondary disabled:opacity-50"
            disabled={!data?.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            {t.accounts.next}
          </button>
        </div>
      )}
    </div>
  );
}
