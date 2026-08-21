import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchSites, fetchTemplates } from "../api/client";
import { formatDate, localised } from "../format";
import { StatusBadge, TierBadge, MutedBadge } from "../components/Badges";
import { adminStrings } from "../strings";

const PAGE_SIZE = 20;

export default function Sites() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useResource(
    () => fetchSites(token, { q: query, page, size: PAGE_SIZE }),
    [token, query, page],
  );

  const sites = data?.items ?? [];
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  // The backend provisions a showcase site per template, and they sit in this
  // list next to real clients. Match them against the catalog's own demoSlugs
  // rather than sniffing the `demo-` prefix, which a client could also use.
  const [demoSlugs, setDemoSlugs] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    fetchTemplates(locale)
      .then((templates) => {
        if (cancelled) return;
        setDemoSlugs(
          new Set(
            templates
              .map((template) => template.demoSlug)
              .filter((slug): slug is string => Boolean(slug)),
          ),
        );
      })
      // Only a label is at stake, so a failure here must not disturb the list.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.sites.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.sites.subtitle}</p>
        </div>
        <Link to="/admin/sites/new" className="btn-primary">
          {t.sites.create}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="min-w-60 flex-1">
          <label className="sr-only" htmlFor="site-search">
            {t.sites.search}
          </label>
          <input
            id="site-search"
            type="search"
            className="field"
            placeholder={t.sites.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {data && (
          <span className="text-sm text-ink-400">
            {t.sites.results(data.totalItems)}
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

      {loading && !data && <p className="mt-8 text-sm text-ink-400">{t.loading}</p>}

      {data && sites.length === 0 && (
        <p className="mt-8 rounded-3xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {query ? t.sites.emptyFiltered : t.sites.empty}
        </p>
      )}

      {sites.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.sites.business}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold md:table-cell">
                  {t.sites.template}
                </th>
                <th className="px-5 py-3 text-start font-semibold">
                  {t.sites.status}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold lg:table-cell">
                  {t.sites.address}
                </th>
                <th className="hidden px-5 py-3 text-start font-semibold sm:table-cell">
                  {t.sites.updated}
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr
                  key={site.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/admin/sites/${site.id}`}
                      className="font-semibold text-ink-900 hover:text-bloom-600"
                    >
                      {site.businessName}
                    </Link>
                    <div
                      className="flex flex-wrap items-center gap-2 text-xs text-ink-400"
                      dir="ltr"
                    >
                      <span>{site.slug}</span>
                      {demoSlugs.has(site.slug) && (
                        <span title={t.sites.demoHint}>
                          <MutedBadge label={t.sites.demo} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-ink-600">
                        {localised(
                          site.templateNameKa,
                          site.templateNameEn,
                          locale,
                        ) || site.templateCode}
                      </span>
                      {site.tier && (
                        <TierBadge label={t.tiers[site.tier] ?? site.tier} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={site.status}
                      label={t.statuses[site.status] ?? site.status}
                    />
                  </td>
                  <td className="hidden max-w-56 truncate px-5 py-4 lg:table-cell">
                    {site.primaryUrl ? (
                      <a
                        href={site.primaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        dir="ltr"
                        className="text-ink-600 hover:text-bloom-600"
                      >
                        {site.primaryUrl.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-600 sm:table-cell">
                    {formatDate(site.updatedAt, locale)}
                  </td>
                  <td className="px-5 py-4 text-end">
                    <Link
                      to={`/admin/sites/${site.id}`}
                      className="text-sm font-semibold text-bloom-600 hover:text-bloom-700"
                    >
                      {t.sites.open}
                    </Link>
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
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            {t.sites.prev}
          </button>
          <span className="text-sm text-ink-400">
            {t.sites.page(page + 1, totalPages)}
          </span>
          <button
            type="button"
            className="btn-secondary disabled:opacity-50"
            disabled={!data?.hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            {t.sites.next}
          </button>
        </div>
      )}
    </div>
  );
}
