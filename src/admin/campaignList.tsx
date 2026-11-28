import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AD_CHANNELS } from "../api/ads";
import { useI18n } from "../i18n";
import { useSession } from "./auth";
import { useResource } from "./hooks";
import { fetchAdCampaigns, fetchAdTestCampaigns, syncAdCampaigns } from "./api/client";
import { adminStrings } from "./strings";
import {
  META_NOT_READ,
  metaDelivery,
  filterCampaigns,
  formatDecimal,
  type CampaignFilters,
  type MoneyTotals,
} from "./campaignAnalytics";
import type { AdCampaignDto, AdCampaignStatus, AdChannel } from "./api/types";

/**
 * What the campaign manager and the analytics page share: every campaign
 * loaded at once, and the filters that narrow them.
 *
 * Everything is loaded and worked on in the browser rather than asked of the
 * server, for two reasons. The list endpoint filters only by site, status and
 * the test flag; and Meta's figures are strings on the server too, so it cannot
 * sort or total by spend. At the number of campaigns one ad account carries,
 * loading them all is a few requests — and it means the figures always describe
 * exactly the rows the filters leave.
 *
 * Test campaigns are left out unless the toggle is on, and the toggle reaches
 * the figures as well as the list. A test is our money, not a client's, and a
 * total that quietly included them would overstate what clients bought.
 *
 * Filters live in the address, in the same form on both pages, so a filtered
 * view can be bookmarked, sent to a colleague, or carried from the table to its
 * figures and back.
 */

export const STATUSES: AdCampaignStatus[] = ["ACTIVE", "PAUSED", "FAILED", "DELETED"];
/** The server's page size here; well under Spring's 2000 ceiling. */
const FETCH_SIZE = 200;
/** A safety stop, not a limit anyone should meet: 10,000 campaigns. */
const MAX_FETCH_PAGES = 50;

async function loadCampaigns(token: string, includeTests: boolean): Promise<AdCampaignDto[]> {
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

/**
 * The switches staff set once and expect to stay set: whether tests are
 * included, "only what may be spending", and the table's page size. Kept in
 * this browser, so the pages open the way they were left. The address still
 * wins when it says otherwise, so a link someone sends opens exactly the view
 * they meant.
 */
const PREFS_KEY = "bbloom.admin.campaigns.prefs";
export type Prefs = { tests?: boolean; spending?: boolean; size?: number };

export function readPrefs(): Prefs {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Prefs) : {};
  } catch {
    return {};
  }
}

export function writePrefs(changes: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ ...readPrefs(), ...changes }));
  } catch {
    // Private browsing or a full quota: the switch still works for this visit.
  }
}

/** A switch from the address when it is there, else from what was left last time. */
function flag(params: URLSearchParams, key: "tests" | "spending", prefs: Prefs): boolean {
  return params.has(key) ? params.get(key) === "1" : Boolean(prefs[key]);
}

function readFilters(params: URLSearchParams, prefs: Prefs): CampaignFilters {
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
    spendingOnly: flag(params, "spending", prefs),
    metaStatus: params.get("meta") ?? "",
  };
}

/** The filter parameters, so a link to the other page can carry them. */
const FILTER_KEYS = ["q", "status", "channel", "site", "from", "to", "spending", "meta", "tests"];

export function filterQuery(params: URLSearchParams): string {
  const kept = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value !== null) kept.set(key, value);
  }
  const text = kept.toString();
  return text ? `?${text}` : "";
}

/**
 * Every campaign, the filters from the address, and what they leave.
 *
 * `onFilterChange` runs whenever a filter changes, so the table can go back to
 * its first page.
 */
export function useCampaigns(onFilterChange?: () => void) {
  const { locale } = useI18n();
  const m = adminStrings(locale).ads.manager;
  const { token } = useSession();
  const [params, setParams] = useSearchParams();

  const prefs = readPrefs();
  const includeTests = flag(params, "tests", prefs);
  const filters = readFilters(params, prefs);

  const list = useResource(() => loadCampaigns(token, includeTests), [token, includeTests]);
  const all = list.data ?? [];

  /** Changes some of the address's parameters, dropping empty ones. */
  function update(changes: Record<string, string | null>) {
    if ("tests" in changes) writePrefs({ tests: changes.tests === "1" });
    if ("spending" in changes) writePrefs({ spending: changes.spending === "1" });
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
    onFilterChange?.();
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

  // Meta's states as they occur in this list, so the filter offers only what
  // can match — and still offers a state Meta added that we have no name for.
  const metaStates = useMemo(() => {
    const seen = new Set<string>();
    for (const row of all) seen.add(metaDelivery(row) ?? META_NOT_READ);
    return [...seen].sort();
  }, [all]);

  const filtered = useMemo(
    () => filterCampaigns(all, filters),
    // The filters are read from the address, so the address is the dependency.
    [all, params.toString(), filters.spendingOnly],
  );

  const [sync, setSync] = useState<{ busy: boolean; note?: string; failed?: boolean }>({
    busy: false,
  });

  /**
   * Refresh asks Meta first, then reloads. Without that it would only re-read
   * what the hourly sweep last stored, and "In review" would sit on screen for
   * up to an hour after Meta approved the ad.
   */
  async function refresh() {
    setSync({ busy: true });
    try {
      const result = await syncAdCampaigns(token);
      setSync({ busy: false, note: m.synced(result.read, result.tried) });
    } catch {
      setSync({ busy: false, note: m.syncFailed, failed: true });
    }
    list.reload();
  }

  return {
    params,
    includeTests,
    filters,
    list,
    all,
    filtered,
    sites,
    metaStates,
    update,
    sync,
    refresh,
    /** The current filters as a query string, for a link to the other page. */
    query: filterQuery(params),
  };
}

export type Campaigns = ReturnType<typeof useCampaigns>;

/** The note under the header after a refresh. */
export function SyncNote({ sync }: { sync: Campaigns["sync"] }) {
  if (!sync.note) return null;
  return (
    <p
      className={`mt-3 text-sm ${sync.failed ? "font-semibold text-danger" : "text-ink-500"}`}
      role="status"
    >
      {sync.note}
    </p>
  );
}

/** The load error and the first load, which both pages show the same way. */
export function LoadState({
  list,
  children,
}: {
  list: Campaigns["list"];
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  if (list.error) {
    return (
      <div className="mt-6 rounded-2xl border border-ink-100 bg-surface p-6">
        <p className="text-sm text-ink-500">{strings.ads.loadFailed}</p>
        <button type="button" onClick={list.reload} className="btn-primary mt-3">
          {strings.ads.retry}
        </button>
      </div>
    );
  }
  if (list.loading && !list.data) {
    return <p className="mt-8 text-sm text-ink-400">{strings.loading}</p>;
  }
  return <>{children}</>;
}

/** Money totals in each currency, Meta's figures summed exactly. */
export function Money({ totals }: { totals: MoneyTotals }) {
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

export function percent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

/** The filter panel, the same on both pages. */
export function FilterPanel({ campaigns }: { campaigns: Campaigns }) {
  const { locale } = useI18n();
  const strings = adminStrings(locale);
  const t = strings.ads;
  const m = t.manager;
  const { filters, includeTests, sites, metaStates, update } = campaigns;

  const anyFilter =
    filters.query ||
    filters.statuses.length ||
    filters.channel ||
    filters.siteId ||
    filters.from ||
    filters.to ||
    filters.spendingOnly ||
    filters.metaStatus;

  function toggleStatus(status: AdCampaignStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    update({ status: next.join(",") || null });
  }

  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-surface p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          role="switch"
          checked={includeTests}
          onChange={(event) => update({ tests: event.target.checked ? "1" : null })}
          className="mt-1 h-4 w-4 accent-ink-900"
        />
        <span>
          <span className="block text-sm font-bold text-ink-900">{m.includeTests}</span>
          <span className="block text-xs text-ink-500">{m.includeTestsHint}</span>
        </span>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block text-[13px] font-semibold text-ink-600">
            {m.search}
          </span>
          <input
            autoComplete="off"
            type="search"
            value={filters.query}
            placeholder={m.searchPlaceholder}
            onChange={(event) => update({ q: event.target.value || null })}
            className="field w-full"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[13px] font-semibold text-ink-600">
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
          <span className="mb-1 block text-[13px] font-semibold text-ink-600">
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
          <span className="mb-1 block text-[13px] font-semibold text-ink-600">
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
          <span className="text-[13px] font-semibold text-ink-600">
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
                className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold ${
                  on
                    ? "border-ink-900 bg-ink-900 text-canvas"
                    : "border-ink-200 bg-control font-medium text-ink-800 hover:border-ink-400"
                }`}
              >
                {t.statuses[status] ?? status}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[13px] font-semibold text-ink-600">
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
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[13px] font-semibold text-ink-600">
            {m.metaFilter}
          </span>
          <select
            value={filters.metaStatus}
            onChange={(event) => update({ meta: event.target.value || null })}
            className="field"
          >
            <option value="">{strings.list.all}</option>
            {metaStates.map((state) => (
              <option key={state} value={state}>
                {t.metaStatuses[state] ?? state}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-700">
          <input
            type="checkbox"
            checked={filters.spendingOnly}
            onChange={(event) => update({ spending: event.target.checked ? "1" : null })}
            className="h-4 w-4 accent-ink-900"
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
                meta: null,
              })
            }
            className="ms-auto text-sm font-semibold text-ink-900 hover:underline"
          >
            {m.clear}
          </button>
        ) : null}
      </div>
    </section>
  );
}
