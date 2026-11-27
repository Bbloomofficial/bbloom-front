import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAccounts } from "../api/client";
import { formatDate } from "../format";
import { adminStrings } from "../strings";
import { adminPath } from "../../routes";
import { instant, loadAllPages, matchesQuery, pageOf, sortRows } from "../listTools";
import {
  FilterSelect,
  ListToolbar,
  Pager,
  SortTh,
  useListParams,
} from "../components/ListTools";

const PAGE_SIZE = 25;
const FILTERS = ["email", "signin", "free"] as const;
const SORTS = ["email", "name", "created", "lastLogin", "free"] as const;

export default function Accounts() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const list = useListParams(FILTERS, SORTS, { sort: "created", direction: "desc" });

  const { data, loading, error, reload } = useResource(
    () => loadAllPages((page, size) => fetchAccounts(token, { page, size })),
    [token],
  );
  const all = data ?? [];

  const filtered = useMemo(() => {
    const { email, signin, free } = list.filters;
    return all.filter((account) => {
      if (email === "verified" && !account.emailVerified) return false;
      if (email === "unverified" && account.emailVerified) return false;
      if (signin === "yes" && !account.lastLoginAt) return false;
      if (signin === "never" && account.lastLoginAt) return false;
      if (free === "limit" && !account.atFreeLimit) return false;
      // Website names are searched too: staff on a call hear "it's about
      // Marita", not the client's address.
      return matchesQuery(
        [account.email, account.fullName, ...(account.sites ?? []).map((s) => s.businessName)],
        list.query,
      );
    });
  }, [all, list.query, JSON.stringify(list.filters)]);

  const sorted = useMemo(
    () =>
      sortRows(
        filtered,
        (account) => {
          switch (list.sort) {
            case "email":
              return account.email;
            case "name":
              return account.fullName;
            case "created":
              return instant(account.createdAt);
            case "lastLogin":
              return instant(account.lastLoginAt);
            case "free":
              return account.freeSitesUsed;
          }
        },
        list.direction,
        locale,
      ),
    [filtered, list.sort, list.direction, locale],
  );
  const view = pageOf(sorted, list.page, PAGE_SIZE);
  const accounts = view.rows;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {t.accounts.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.accounts.subtitle}</p>
      </div>

      <ListToolbar
        query={list.query}
        onQuery={(value) => list.update({ q: value || null })}
        placeholder={t.accounts.searchPlaceholder}
        shown={filtered.length}
        total={all.length}
        narrowed={list.narrowed}
        onClear={list.clear}
      >
        <FilterSelect
          label={t.accounts.emailStatus}
          value={list.filters.email}
          onChange={(value) => list.update({ email: value || null })}
          options={[
            { value: "verified", label: t.accounts.verified },
            { value: "unverified", label: t.accounts.unverified },
          ]}
        />
        <FilterSelect
          label={t.listFilters.accountSignIn}
          value={list.filters.signin}
          onChange={(value) => list.update({ signin: value || null })}
          options={[
            { value: "yes", label: t.listFilters.accountSignedIn },
            { value: "never", label: t.listFilters.accountNeverSignedIn },
          ]}
        />
        <FilterSelect
          label={t.listFilters.accountFreeSites}
          value={list.filters.free}
          onChange={(value) => list.update({ free: value || null })}
          options={[{ value: "limit", label: t.listFilters.accountAtLimit }]}
        />
      </ListToolbar>

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
          {all.length === 0 ? t.accounts.empty : t.list.noneMatching}
        </p>
      )}

      {accounts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <SortTh column="email" label={t.accounts.email} list={list} />
                <SortTh
                  column="name"
                  label={t.accounts.fullName}
                  list={list}
                  className="hidden md:table-cell"
                />
                <SortTh
                  column="created"
                  label={t.accounts.created}
                  list={list}
                  first="desc"
                  className="hidden sm:table-cell"
                />
                <SortTh
                  column="lastLogin"
                  label={t.accounts.lastLogin}
                  list={list}
                  first="desc"
                  className="hidden lg:table-cell"
                />
                <th className="px-5 py-3 text-start font-semibold">
                  {t.accounts.emailStatus}
                </th>
                <SortTh column="free" label={t.accounts.freeUsage} list={list} first="desc" />
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

      <Pager page={view.page} pages={view.pages} onPage={list.setPage} />
    </div>
  );
}
