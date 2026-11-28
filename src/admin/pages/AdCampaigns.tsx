import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adErrorMessage, isSpending } from "../../api/ads";
import { useI18n } from "../../i18n";
import { adminPath } from "../../routes";
import { useSession } from "../auth";
import { deleteAdCampaign, pauseAdCampaign, resumeAdCampaign } from "../api/client";
import { adminStrings } from "../strings";
import { formatDateTime } from "../format";
import { Budget, Channels, DeliveryStatus, Insight, PostLinks } from "../components/AdBits";
import {
  FilterPanel,
  LoadState,
  SyncNote,
  percent,
  readPrefs,
  useCampaigns,
  writePrefs,
} from "../campaignList";
import {
  afterOwnChange,
  SORT_KEYS,
  campaignsToCsv,
  rowCtr,
  sortCampaigns,
  type SortDirection,
  type SortKey,
} from "../campaignAnalytics";
import type { AdCampaignDto } from "../api/types";

/**
 * The campaign manager: every campaign in one table, to find, sort and act on.
 * The figures for the same campaigns are on the analytics page, one link away
 * with the same filters.
 *
 * The layout gives this page the full width of the window: the table has more
 * columns than the usual page width holds.
 */

const PAGE_SIZES = [25, 50, 100];

/** Which rows an action applies to. The same rules as the campaign page's buttons. */
const canPause = (row: AdCampaignDto) => row.status === "ACTIVE";
const canResume = (row: AdCampaignDto) => row.status === "PAUSED";
const canDelete = (row: AdCampaignDto) =>
  row.status !== "DELETED" && !row.deletedAt && Boolean(row.metaCampaignId);

type Action = "pause" | "resume" | "delete";

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
  const d = t.detail;
  const { token, handleError } = useSession();
  const [page, setPage] = useState(0);
  const campaigns = useCampaigns(() => setPage(0));
  const { params, all, filtered, list, sync, refresh, update, query } = campaigns;

  const prefs = readPrefs();
  const sortKey: SortKey = SORT_KEYS.includes(params.get("sort") as SortKey)
    ? (params.get("sort") as SortKey)
    : "date";
  const direction: SortDirection = params.get("dir") === "asc" ? "asc" : "desc";
  const [pageSize, setPageSize] = useState(() =>
    PAGE_SIZES.includes(prefs.size ?? 0) ? (prefs.size as number) : PAGE_SIZES[0],
  );
  /** Ticked rows, by id. Rows a filter hides are never acted on. */
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  /** Rows with a call to Meta in flight, so their buttons cannot be pressed twice. */
  const [busy, setBusy] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outcome, setOutcome] = useState<{ text: string; failures: string[] } | null>(null);

  const sorted = useMemo(
    () => sortCampaigns(filtered, sortKey, direction),
    [filtered, sortKey, direction],
  );

  const pages = Math.max(Math.ceil(sorted.length / pageSize), 1);
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * pageSize, (current + 1) * pageSize);

  // Only what is ticked *and* still in view: a filter changed after ticking
  // must not leave hidden rows to be paused or deleted unseen.
  const chosen = sorted.filter((row) => selected.has(row.id));
  const toPause = chosen.filter(canPause);
  const toResume = chosen.filter(canResume);
  const toDelete = chosen.filter(canDelete);
  const allVisibleChosen = visible.length > 0 && visible.every((row) => selected.has(row.id));

  function toggleRow(id: string) {
    setSelected((now) => {
      const next = new Set(now);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((now) => {
      const next = new Set(now);
      for (const row of visible) {
        if (allVisibleChosen) next.delete(row.id);
        else next.add(row.id);
      }
      return next;
    });
  }

  /**
   * Runs one action over some rows, one call at a time.
   *
   * Sequential on purpose: each call spends or stops real money at Meta, and a
   * burst of them in parallel is how an ad account meets its rate limit halfway
   * through, with no clear picture of which half went through. Each row is
   * replaced from the server's answer, as the campaign page does, so a delete
   * Meta refused comes back showing why.
   */
  async function run(action: Action, rows: AdCampaignDto[], confirmText: string) {
    if (!rows.length || !window.confirm(confirmText)) return;
    const call =
      action === "pause"
        ? pauseAdCampaign
        : action === "resume"
          ? resumeAdCampaign
          : deleteAdCampaign;
    setBusy(new Set(rows.map((row) => row.id)));
    setOutcome(null);
    const updated = new Map<string, AdCampaignDto>();
    const failures: string[] = [];
    for (const [index, row] of rows.entries()) {
      if (rows.length > 1) setProgress({ done: index, total: rows.length });
      try {
        const answer = await call(token, row.id);
        updated.set(row.id, action === "delete" ? answer : afterOwnChange(answer));
      } catch (caught) {
        handleError(caught);
        failures.push(`${row.name}: ${adErrorMessage(caught, t.refusals, () => d.actionFailed)}`);
      }
    }
    list.set(all.map((row) => updated.get(row.id) ?? row));
    setSelected((now) => {
      const next = new Set(now);
      for (const id of updated.keys()) next.delete(id);
      return next;
    });
    setBusy(new Set());
    setProgress(null);
    if (rows.length > 1 || failures.length) {
      setOutcome({ text: m.bulkDone(updated.size, rows.length), failures });
    }
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
          className={`inline-flex items-center gap-1 hover:text-ink-900 ${
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
            {m.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{m.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={sync.busy}
            className="btn-secondary disabled:opacity-60"
          >
            {sync.busy ? m.syncing : m.refresh}
          </button>
          <Link to={`${adminPath("/ads/analytics")}${query}`} className="btn-secondary">
            {m.openAnalytics}
          </Link>
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

      <SyncNote sync={sync} />
      <FilterPanel campaigns={campaigns} />

      <LoadState list={list}>
          {/* The list */}
          <section className="mt-6 rounded-2xl border border-ink-100 bg-surface p-6">
            <h2 className="text-lg font-bold text-ink-900">
              {m.listTitle(sorted.length, all.length)}
            </h2>
            {all.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">{m.none}</p>
            ) : sorted.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">{m.noneMatching}</p>
            ) : (
              <>
                {chosen.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 bg-ink-50 px-4 py-3">
                    <span className="me-2 text-sm font-semibold text-ink-900">
                      {m.selected(chosen.length)}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={!toPause.length || busy.size > 0}
                      onClick={() => void run("pause", toPause, m.bulkPauseConfirm(toPause.length))}
                    >
                      {m.bulkPause(toPause.length)}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={!toResume.length || busy.size > 0}
                      onClick={() =>
                        void run("resume", toResume, m.bulkResumeConfirm(toResume.length))
                      }
                    >
                      {m.bulkResume(toResume.length)}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-danger"
                      disabled={!toDelete.length || busy.size > 0}
                      onClick={() =>
                        void run("delete", toDelete, m.bulkDeleteConfirm(toDelete.length))
                      }
                    >
                      {m.bulkDelete(toDelete.length)}
                    </button>
                    <button
                      type="button"
                      className="ms-auto text-sm font-semibold text-ink-600 hover:underline"
                      disabled={busy.size > 0}
                      onClick={() => setSelected(new Set())}
                    >
                      {m.clearSelection}
                    </button>
                  </div>
                )}
                {(progress || outcome) && (
                  <div className="mt-3 text-sm" role="status">
                    {progress ? (
                      <p className="text-ink-500">{m.bulkWorking(progress.done, progress.total)}</p>
                    ) : outcome ? (
                      <>
                        <p
                          className={
                            outcome.failures.length ? "font-semibold text-danger" : "text-ink-500"
                          }
                        >
                          {outcome.text}
                        </p>
                        {outcome.failures.length > 0 && (
                          <ul className="mt-1 list-disc ps-5 text-danger">
                            {outcome.failures.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[72rem] text-sm">
                  <thead>
                    <tr className="text-left text-[13px] font-semibold text-ink-600">
                      <th className="w-8 pb-2 pr-3">
                        <input
                          type="checkbox"
                          aria-label={m.selectAll}
                          title={m.selectAll}
                          checked={allVisibleChosen}
                          onChange={toggleVisible}
                          className="h-4 w-4 accent-ink-900"
                        />
                      </th>
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
                      <th className="pb-2 pl-4">{m.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {visible.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className={`align-top ${selected.has(campaign.id) ? "bg-ink-50" : ""}`}
                      >
                        <td className="py-3 pr-3">
                          <input
                            type="checkbox"
                            aria-label={m.selectRow(campaign.name)}
                            checked={selected.has(campaign.id)}
                            onChange={() => toggleRow(campaign.id)}
                            className="mt-0.5 h-4 w-4 accent-ink-900"
                          />
                        </td>
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
                          <DeliveryStatus
                            campaign={campaign}
                            labels={t.statuses}
                            metaLabels={t.metaStatuses}
                            pausedReasons={t.pausedReasons}
                          />
                        </td>
                        <td className="py-3 pr-4 text-ink-600">
                          <Channels channels={campaign.channels} labels={t.channels} />
                          <div className="mt-1">
                            <PostLinks campaign={campaign} labels={t.posts} compact />
                          </div>
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
                        <td className="py-3 pl-4">
                          <div className="flex flex-col items-start gap-1 text-xs font-semibold">
                            {canPause(campaign) && (
                              <button
                                type="button"
                                className="text-ink-700 hover:underline disabled:opacity-50"
                                disabled={busy.size > 0}
                                onClick={() => void run("pause", [campaign], d.pauseConfirm)}
                              >
                                {busy.has(campaign.id) ? d.pausing : d.pause}
                              </button>
                            )}
                            {canResume(campaign) && (
                              <button
                                type="button"
                                className="text-ink-700 hover:underline disabled:opacity-50"
                                disabled={busy.size > 0}
                                onClick={() => void run("resume", [campaign], d.resumeConfirm)}
                              >
                                {busy.has(campaign.id) ? d.resuming : d.resume}
                              </button>
                            )}
                            {canDelete(campaign) && (
                              <button
                                type="button"
                                className="whitespace-nowrap text-danger hover:underline disabled:opacity-50"
                                disabled={busy.size > 0}
                                onClick={() => void run("delete", [campaign], d.deleteConfirm)}
                              >
                                {d.delete}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}

            {sorted.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-ink-500">
                  {m.pageSize}
                  <select
                    className="field w-auto"
                    value={pageSize}
                    onChange={(event) => {
                      const size = Number(event.target.value);
                      setPageSize(size);
                      writePrefs({ size });
                      setPage(0);
                    }}
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                {pages > 1 && (
                <div className="flex items-center gap-3">
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
              </div>
            )}
          </section>
      </LoadState>
    </div>
  );
}
