import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchSites, fetchTemplates } from "../api/client";
import { formatDate, localised } from "../format";
import {
  StatusBadge,
  TierBadge,
  MutedBadge,
  PendingBadge,
} from "../components/Badges";
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
const FILTERS = ["status", "tier", "kind", "changes"] as const;
const SORTS = ["business", "template", "status", "address", "updated"] as const;

export default function Sites() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const list = useListParams(FILTERS, SORTS, { sort: "updated", direction: "desc" });

  // Every site at once, so the search, the filters and every column's sort
  // work on all of them rather than on the page the server happened to send.
  const { data, loading, error, reload } = useResource(
    () => loadAllPages((page, size) => fetchSites(token, { page, size })),
    [token],
  );
  const all = data ?? [];

  // The backend provisions a showcase site per template, and they sit in this
  // list next to real clients. Match them against the catalog's own demoSlugs
  // rather than sniffing the `demo-` prefix, which a client could also use.
  const [demoSlugs, setDemoSlugs] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    fetchTemplates()
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
  }, []);

  const templateName = (site: (typeof all)[number]) =>
    localised(site.templateNameKa, site.templateNameEn, locale) || site.templateCode;

  const filtered = useMemo(() => {
    const { status, tier, kind, changes } = list.filters;
    return all.filter((site) => {
      if (status && site.status !== status) return false;
      if (tier && site.tier !== tier) return false;
      if (kind === "demo" && !demoSlugs.has(site.slug)) return false;
      if (kind === "client" && demoSlugs.has(site.slug)) return false;
      if (
        changes === "pending" &&
        !(site.status === "PUBLISHED" && site.hasUnpublishedChanges)
      ) {
        return false;
      }
      return matchesQuery(
        [site.businessName, site.slug, site.primaryUrl, templateName(site)],
        list.query,
      );
    });
    // `list` is rebuilt every render; its contents are what matter.
  }, [all, demoSlugs, list.query, JSON.stringify(list.filters), locale]);

  const sorted = useMemo(
    () =>
      sortRows(
        filtered,
        (site) => {
          switch (list.sort) {
            case "business":
              return site.businessName;
            case "template":
              return templateName(site);
            case "status":
              return t.statuses[site.status] ?? site.status;
            case "address":
              return site.primaryUrl?.replace(/^https?:\/\//, "");
            case "updated":
              return instant(site.updatedAt);
          }
        },
        list.direction,
        locale,
      ),
    [filtered, list.sort, list.direction, locale],
  );
  const view = pageOf(sorted, list.page, PAGE_SIZE);
  const sites = view.rows;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.sites.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.sites.subtitle}</p>
        </div>
        <Link to={adminPath("/sites/new")} className="btn-primary">
          {t.sites.create}
        </Link>
      </div>

      <ListToolbar
        query={list.query}
        onQuery={(value) => list.update({ q: value || null })}
        placeholder={t.sites.searchPlaceholder}
        shown={filtered.length}
        total={all.length}
        narrowed={list.narrowed}
        onClear={list.clear}
      >
        <FilterSelect
          label={t.sites.status}
          value={list.filters.status}
          onChange={(value) => list.update({ status: value || null })}
          options={Object.entries(t.statuses).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          label={t.listFilters.siteDesign}
          value={list.filters.tier}
          onChange={(value) => list.update({ tier: value || null })}
          options={Object.entries(t.tiers).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          label={t.listFilters.siteKind}
          value={list.filters.kind}
          onChange={(value) => list.update({ kind: value || null })}
          options={[
            { value: "client", label: t.listFilters.siteKindClient },
            { value: "demo", label: t.listFilters.siteKindDemo },
          ]}
        />
        <FilterSelect
          label={t.listFilters.siteChanges}
          value={list.filters.changes}
          onChange={(value) => list.update({ changes: value || null })}
          options={[{ value: "pending", label: t.listFilters.siteChangesPending }]}
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

      {loading && !data && <p className="mt-8 text-sm text-ink-400">{t.loading}</p>}

      {data && sites.length === 0 && (
        <p className="mt-8 rounded-3xl border border-ink-100 bg-surface p-8 text-center text-sm text-ink-600">
          {all.length === 0 ? t.sites.empty : t.list.noneMatching}
        </p>
      )}

      {sites.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <SortTh column="business" label={t.sites.business} list={list} />
                <SortTh
                  column="template"
                  label={t.sites.template}
                  list={list}
                  className="hidden md:table-cell"
                />
                <SortTh column="status" label={t.sites.status} list={list} />
                <SortTh
                  column="address"
                  label={t.sites.address}
                  list={list}
                  className="hidden lg:table-cell"
                />
                <SortTh
                  column="updated"
                  label={t.sites.updated}
                  list={list}
                  first="desc"
                  className="hidden sm:table-cell"
                />
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
                      to={adminPath(`/sites/${site.id}`)}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={site.status}
                        label={t.statuses[site.status] ?? site.status}
                      />
                      {/* Only a live site can diverge from what visitors see;
                          on a draft there is nothing public to be behind. */}
                      {site.status === "PUBLISHED" &&
                        site.hasUnpublishedChanges && (
                          <span title={t.sites.pendingHint}>
                            <PendingBadge label={t.sites.pending} />
                          </span>
                        )}
                    </div>
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
                      to={adminPath(`/sites/${site.id}`)}
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

      <Pager page={view.page} pages={view.pages} onPage={list.setPage} />
    </div>
  );
}
