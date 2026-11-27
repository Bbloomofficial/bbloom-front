import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AD_CHANNELS, formatCount, isSpending } from "../../api/ads";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchAdCampaigns, fetchAdTestCampaigns } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { Budget, Channels, Insight, StatusPill } from "../components/AdBits";
import {
  SORT_KEYS,
  campaignsToCsv,
  costPerClick,
  decimalToNumber,
  filterCampaigns,
  formatDecimal,
  rowCtr,
  sortCampaigns,
  totalCampaigns,
  type Bucket,
  type CampaignFilters,
  type MoneyTotals,
  type SortDirection,
  type SortKey,
} from "../campaignAnalytics";
import type { AdCampaignDto, AdCampaignStatus, AdChannel } from "../api/types";

/**
 * The campaign manager: every campaign at once, filtered, sorted and totalled.
 *
 * Everything is loaded and worked on here rather than asked of the server, for
 * two reasons. The list endpoint filters only by site, status and the test
 * flag; and Meta's figures are strings on the server too, so it cannot sort or
 * total by spend. At the number of campaigns one ad account carries, loading
 * them all is a few requests — and it means the totals always describe exactly
 * the rows on screen.
 *
 * Test campaigns are left out unless the toggle is on, and the toggle reaches
 * the figures as well as the list. A test is our money, not a client's, and a
 * total that quietly included them would overstate what clients bought.
 *
 * Filters live in the address, so a filtered view can be bookmarked or sent to
 * a colleague.
 */

const STATUSES: AdCampaignStatus[] = ["ACTIVE", "PAUSED", "FAILED", "DELETED"];
const PAGE_SIZE = 25;
/** The server's page size here; well under Spring's 2000 ceiling. */
const FETCH_SIZE = 200;
/** A safety stop, not a limit anyone should meet: 10,000 campaigns. */
const MAX_FETCH_PAGES = 50;

async function loadCampaigns(
  token: string,
  includeTests: boolean,
): Promise<AdCampaignDto[]> {
  const rows: AdCampaignDto[] = [];
  for (let page = 0; page < MAX_FETCH_PAGES; page += 1) {
    const result = await fetchAdCampaigns(token, { page, size: FETCH_SIZE });
    rows.push(...result.items);
    if (!result.hasNext) break;
  }
  if (includeTests) rows.push(...(await fetchAdTestCampaigns(token)));
  const seen = new Set<string>();
  return rows.filter((row) => (seen.has(row.id) ? false : (seen.add(row.id), true)));
}

function readFilters(params: URLSearchParams): CampaignFilters {
  const statuses = (params.get("status") ?? "")
    .split(",")
    .filter((s): s is AdCampaignStatus => STATUSES.includes(s as AdCampaignStatus));
  const channel = params.get("channel") ?? "";
  return {
    query: params.get("q") ?? "",
    statuses,
    channel: AD_CHANNELS.includes(channel as AdChannel) ? (channel as AdChannel) : "",
    siteId: params.get("site") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    spendingOnly: params.get("spending") === "1",
  };
}

/** Money totals in each currency, Meta's figures summed exactly. */
function Money({ totals }: { totals: MoneyTotals }) {
  const entries = Object.entries(totals);
  if (!entries.length) return <>—</>;
  return (
    <span dir="ltr" className="tabular-nums">
      {entries
        .map(([currency, amount]) =>
          `${formatDecimal(amount)}${currency === "?" ? "" : ` ${currency}`}`,
        )
        .join(" · ")}
    </span>
  );
}

function percent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

function Tile({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-extrabold text-ink-900">{children}</p>
      {note && <p className="mt-1 text-xs text-ink-500">{note}</p>}
    </div>
  );
}

/**
 * A breakdown table. The bar is the row's share of the largest row on the
 * chosen measure, drawn in one hue — it is a magnitude, not an identity, and
 * the number beside it is the figure; the bar only makes the ranking visible.
 */
function Breakdown({
  title,
  rows,
  labels,
}: {
  title: string;
  rows: Array<{ key: string; label: React.ReactNode; bucket: Bucket }>;
  labels: {
    campaigns: string;
    impressions: string;
    clicks: string;
    spend: string;
  };
}) {
  const { locale } = useI18n();
  // Bars by spend when everything is in one currency, by impressions otherwise:
  // two currencies have no common length.
  const currencies = new Set(rows.flatMap((r) => Object.keys(r.bucket.spend)));
  const bySpend = currencies.size === 1;
  const [currency] = currencies;
  const measure = (b: Bucket) =>
    bySpend ? (b.spend[currency] ? decimalToNumber(b.spend[currency]) : 0) : b.impressions;
  const max = Math.max(...rows.map((r) => measure(r.bucket)), 0);

  return (
    <section className="rounded-3xl border border-ink-100 bg-surface p-5">
      <h3 className="text-sm font-bold text-ink-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-400">—</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <th className="pb-2 pr-3" />
                <th className="pb-2 pr-3 text-right">{labels.campaigns}</th>
                <th className="pb-2 pr-3 text-right">{labels.impressions}</th>
                <th className="pb-2 pr-3 text-right">{labels.clicks}</th>
                <th className="pb-2 text-right">{labels.spend}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map(({ key, label, bucket }) => {
                const share = max > 0 ? (measure(bucket) / max) * 100 : 0;
                return (
                  <tr key={key}>
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-ink-900">{label}</div>
                      <div
                        aria-hidden
                        className="mt-1 h-1.5 rounded-full bg-ink-100"
                      >
                        <div
                          className="h-1.5 rounded-full bg-bloom-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-ink-600">
                      {bucket.campaigns}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-ink-600">
                      {formatCount(bucket.impressions, locale)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-ink-600">
                      {formatCount(bucket.clicks, locale)}
                    </td>
                    <td className="py-2 text-right text-ink-600">
                      <Money totals={bucket.spend} />
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

function download(filename: string, text: string) {
  // The byte-order mark is for Excel, which otherwise reads Georgian as noise.
  const blob = new Blob(["﻿", text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdCampaigns() {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads;
  const c = t.campaigns;
  const m = t.manager;
  const { token } = useSession();
  const [params, setParams] = useSearchParams();

  const includeTests = params.get("tests") === "1";
  const filters = readFilters(params);
  const sortKey: SortKey = SORT_KEYS.includes(params.get("sort") as SortKey)
    ? (params.get("sort") as SortKey)
    : "date";
  const direction: SortDirection = params.get("dir") === "asc" ? "asc" : "desc";
  const [page, setPage] = useState(0);

  const list = useResource(
    () => loadCampaigns(token, includeTests),
    [token, includeTests],
  );
  const all = list.data ?? [];

  /** Changes some of the address's parameters, dropping empty ones. */
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
    setPage(0);
  }

  const sites = useMemo(() => {
    const names = new Map<string, string>();
    for (const row of all) {
      if (row.siteId && !names.has(row.siteId)) {
        names.set(row.siteId, row.siteName ?? m.unknownSite);
      }
    }
    return [...names.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [all, m.unknownSite]);

  const filtered = useMemo(
    () => filterCampaigns(all, filters),
    // The filters are read from the address, so the address is the dependency.
    [all, params.toString()],
  );
  const sorted = useMemo(
    () => sortCampaigns(filtered, sortKey, direction),
    [filtered, sortKey, direction],
  );
  const totals = useMemo(() => totalCampaigns(filtered), [filtered]);
  const cpc = costPerClick(totals.spend, totals.clicks);

  const pages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1);
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const anyFilter =
    filters.query ||
    filters.statuses.length ||
    filters.channel ||
    filters.siteId ||
    filters.from ||
    filters.to ||
    filters.spendingOnly;

  function toggleStatus(status: AdCampaignStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    update({ status: next.join(",") || null });
  }

  function sortBy(key: SortKey) {
    // Text columns start A→Z; figures start with the largest.
    const textual = key === "name" || key === "site" || key === "status";
    const dir =
      key === sortKey ? (direction === "asc" ? "desc" : "asc") : textual ? "asc" : "desc";
    update({ sort: key, dir });
  }

  function SortHeader({
    column,
    label,
    align = "left",
  }: {
    column: SortKey;
    label: string;
    align?: "left" | "right";
  }) {
    const active = sortKey === column;
    return (
      <th
        aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
        className={`pb-2 pr-4 ${align === "right" ? "text-right" : ""}`}
      >
        <button
          type="button"
          onClick={() => sortBy(column)}
          className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink-900 ${
            active ? "text-ink-900" : ""
          }`}
        >
          {label}
          <span aria-hidden className="text-[10px]">
            {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  const breakdownLabels = {
    campaigns: m.colCampaigns,
    impressions: m.colImpressions,
    clicks: m.colClicks,
    spend: c.colSpend,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {m.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{m.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={list.reload} className="btn-secondary">
            {m.refresh}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={!sorted.length}
            onClick={() =>
              download(
                `campaigns-${new Date().toISOString().slice(0, 10)}.csv`,
                campaignsToCsv(sorted, m.csvHeaders),
              )
            }
          >
            {m.exportCsv}
          </button>
          <Link to="/ads/new" className="btn-primary">
            {c.create}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            role="switch"
            checked={includeTests}
            onChange={(event) => update({ tests: event.target.checked ? "1" : null })}
            className="mt-1 h-4 w-4 accent-bloom-600"
          />
          <span>
            <span className="block text-sm font-bold text-ink-900">{m.includeTests}</span>
            <span className="block text-xs text-ink-500">{m.includeTestsHint}</span>
          </span>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm lg:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.search}
            </span>
            <input
              type="search"
              value={filters.query}
              placeholder={m.searchPlaceholder}
              onChange={(event) => update({ q: event.target.value || null })}
              className="field w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.site}
            </span>
            <select
              value={filters.siteId}
              onChange={(event) => update({ site: event.target.value || null })}
              className="field w-full"
            >
              <option value="">{m.allSites}</option>
              {sites.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.from}
            </span>
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => update({ from: event.target.value || null })}
              className="field w-full"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.to}
            </span>
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => update({ to: event.target.value || null })}
              className="field w-full"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={m.status}>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.status}
            </span>
            {STATUSES.map((status) => {
              const on = filters.statuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleStatus(status)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    on
                      ? "border-ink-900 bg-contrast text-canvas"
                      : "border-ink-200 bg-surface text-ink-600 hover:border-ink-400"
                  }`}
                >
                  {t.statuses[status] ?? status}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {m.channel}
            </span>
            <select
              value={filters.channel}
              onChange={(event) => update({ channel: event.target.value || null })}
              className="field"
            >
              <option value="">{m.allChannels}</option>
              {AD_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {t.channels[channel] ?? channel}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700">
            <input
              type="checkbox"
              checked={filters.spendingOnly}
              onChange={(event) => update({ spending: event.target.checked ? "1" : null })}
              className="h-4 w-4 accent-bloom-600"
            />
            {m.spendingOnly}
          </label>
          {anyFilter ? (
            <button
              type="button"
              onClick={() =>
                update({
                  q: null,
                  status: null,
                  channel: null,
                  site: null,
                  from: null,
                  to: null,
                  spending: null,
                })
              }
              className="ms-auto text-sm font-semibold text-tint-fg hover:underline"
            >
              {m.clear}
            </button>
          ) : null}
        </div>
      </section>

      {list.error ? (
        <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
          <p className="text-sm text-ink-500">{t.loadFailed}</p>
          <button type="button" onClick={list.reload} className="btn-primary mt-3">
            {t.retry}
          </button>
        </div>
      ) : list.loading && !list.data ? (
        <p className="mt-8 text-sm text-ink-400">{strings.loading}</p>
      ) : (
        <>
          {/* Analytics */}
          <section className="mt-6">
            <h2 className="text-lg font-bold text-ink-900">{m.analyticsTitle}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile
                label={m.kpiCampaigns}
                note={[
                  m.kpiLive(totals.live),
                  includeTests && totals.test ? m.kpiTests(totals.test) : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              >
                {formatCount(totals.campaigns, locale)}
              </Tile>
              <Tile label={m.kpiLiveBudget} note={m.kpiLiveBudgetHint}>
                {Object.keys(totals.liveDailyBudgetMinor).length ? (
                  <span dir="ltr">
                    {Object.entries(totals.liveDailyBudgetMinor).map(([cur, minor], i) => (
                      <span key={cur}>
                        {i > 0 && " · "}
                        <Budget
                          minor={minor}
                          currency={cur === "?" ? undefined : cur}
                          locale={locale}
                        />
                      </span>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </Tile>
              <Tile label={m.kpiSpend}>
                <Money totals={totals.spend} />
              </Tile>
              <Tile label={m.kpiImpressions}>
                {formatCount(totals.impressions, locale)}
              </Tile>
              <Tile label={m.kpiClicks}>{formatCount(totals.clicks, locale)}</Tile>
              <Tile label={m.kpiCtr} note={m.calculated}>
                <span dir="ltr">{percent(totals.ctr)}</span>
              </Tile>
              <Tile label={m.kpiCpc} note={m.calculated}>
                {Object.keys(cpc).length ? (
                  <span dir="ltr" className="tabular-nums">
                    {Object.entries(cpc)
                      .map(([cur, value]) => `${value.toFixed(2)}${cur === "?" ? "" : ` ${cur}`}`)
                      .join(" · ")}
                  </span>
                ) : (
                  "—"
                )}
              </Tile>
            </div>
            {totals.unreported > 0 && (
              <p className="mt-3 text-xs text-ink-500">{m.unreported(totals.unreported)}</p>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Breakdown
                title={m.byStatus}
                labels={breakdownLabels}
                rows={STATUSES.filter((s) => totals.byStatus[s]).map((s) => ({
                  key: s,
                  label: <StatusPill status={s} labels={t.statuses} />,
                  bucket: totals.byStatus[s],
                }))}
              />
              <Breakdown
                title={m.byChannel}
                labels={breakdownLabels}
                rows={Object.entries(totals.byChannel).map(([key, bucket]) => ({
                  key,
                  label: (
                    <Channels
                      channels={key.split("+") as AdChannel[]}
                      labels={t.channels}
                    />
                  ),
                  bucket,
                }))}
              />
            </div>
            <div className="mt-4">
              <Breakdown
                title={m.bySite}
                labels={breakdownLabels}
                rows={totals.bySite.slice(0, 10).map((site) => ({
                  key: site.siteId || "none",
                  label: site.siteName ?? m.unknownSite,
                  bucket: site,
                }))}
              />
            </div>
          </section>

          {/* The list */}
          <section className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6">
            <h2 className="text-lg font-bold text-ink-900">
              {m.listTitle(sorted.length, all.length)}
            </h2>
            {all.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">{m.none}</p>
            ) : sorted.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">{m.noneMatching}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[64rem] text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <SortHeader column="name" label={c.colName} />
                      <SortHeader column="site" label={c.colSite} />
                      <SortHeader column="status" label={c.colStatus} />
                      <th className="pb-2 pr-4">{c.colChannels}</th>
                      <SortHeader column="budget" label={c.colBudget} align="right" />
                      <SortHeader column="spend" label={c.colSpend} align="right" />
                      <SortHeader column="impressions" label={m.colImpressions} align="right" />
                      <SortHeader column="clicks" label={m.colClicks} align="right" />
                      <SortHeader column="ctr" label={m.colCtr} align="right" />
                      <SortHeader column="date" label={c.colWhen} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {visible.map((campaign) => (
                      <tr key={campaign.id} className="align-top">
                        <td className="py-3 pr-4">
                          <Link
                            to={`/ads/${campaign.id}`}
                            className="font-semibold text-ink-900 underline-offset-2 hover:underline"
                          >
                            {campaign.name}
                          </Link>
                          {campaign.test && (
                            <span className="ms-2 inline-flex rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                              {m.testTag}
                            </span>
                          )}
                          {/* The status word is wrong about money for a
                              half-failed launch, so this says it directly. */}
                          {isSpending(campaign) && campaign.status !== "ACTIVE" && (
                            <span className="mt-1 block text-xs font-semibold text-danger">
                              {c.spending}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-ink-600">
                          {campaign.siteName ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusPill status={campaign.status} labels={t.statuses} />
                        </td>
                        <td className="py-3 pr-4 text-ink-600">
                          <Channels channels={campaign.channels} labels={t.channels} />
                        </td>
                        <td className="py-3 pr-4 text-right text-ink-600" dir="ltr">
                          <Budget
                            minor={campaign.dailyBudgetMinor}
                            currency={campaign.currency}
                            locale={locale}
                          />
                        </td>
                        <td className="py-3 pr-4 text-right text-ink-600">
                          <Insight value={campaign.spend} notYet={c.notYet} />
                          {campaign.spend && campaign.currency && (
                            <span className="text-ink-400"> {campaign.currency}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-ink-600">
                          <Insight value={campaign.impressions} notYet={c.notYet} />
                        </td>
                        <td className="py-3 pr-4 text-right text-ink-600">
                          <Insight value={campaign.clicks} notYet={c.notYet} />
                        </td>
                        <td className="py-3 pr-4 text-right text-ink-600" dir="ltr">
                          {percent(rowCtr(campaign))}
                        </td>
                        <td className="py-3 text-ink-500">
                          {formatDateTime(campaign.launchedAt ?? campaign.createdAt, locale)}
                          {campaign.insightsReadAt && (
                            <span className="mt-0.5 block text-xs text-ink-400">
                              {c.asOf(formatDateTime(campaign.insightsReadAt, locale))}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  {c.prev}
                </button>
                <span className="text-sm text-ink-500">{c.pageOf(current + 1, pages)}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={current >= pages - 1}
                  onClick={() => setPage(current + 1)}
                >
                  {c.next}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

