import { Link } from "react-router-dom";
import { formatCount } from "../../api/ads";
import { useI18n } from "../../i18n";
import { adminPath } from "../../routes";
import { adminStrings } from "../strings";
import { Budget, Channels, StatusPill } from "../components/AdBits";
import {
  FilterPanel,
  LoadState,
  Money,
  STATUSES,
  SyncNote,
  percent,
  useCampaigns,
} from "../campaignList";
import { costPerClick, decimalToNumber, totalCampaigns, type Bucket } from "../campaignAnalytics";
import type { AdChannel } from "../api/types";

/**
 * Campaign analytics: what the campaigns the filters leave have spent and
 * delivered, in total and broken down by status, channel and site.
 *
 * The figures are summed from the same list the campaign manager shows, with
 * the same filters in the address, so a filtered table and its figures are one
 * link apart and always describe the same campaigns.
 */

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
    <div className="rounded-2xl border border-ink-100 bg-surface p-6">
      <p className="text-sm font-medium text-ink-500">
        {label}
      </p>
      <p className="mt-1 break-words text-[44px] font-bold leading-[1.1] tracking-tight tabular-nums text-ink-900">{children}</p>
      {note && <p className="mt-1.5 text-sm text-ink-500">{note}</p>}
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
    <section className="rounded-2xl border border-ink-100 bg-surface p-5">
      <h3 className="text-sm font-bold text-ink-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-400">—</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="text-left text-[13px] font-semibold text-ink-600">
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
                          className="h-1.5 rounded-full bg-ink-800"
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

export default function AdAnalytics() {
  const { locale } = useI18n();
  const t = adminStrings(locale).ads;
  const c = t.campaigns;
  const m = t.manager;
  const a = t.analytics;
  const campaigns = useCampaigns();
  const { filtered, includeTests, list, sync, refresh, query } = campaigns;

  const totals = totalCampaigns(filtered);
  const cpc = costPerClick(totals.spend, totals.clicks);

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
          <h1 className="text-[28px] font-bold text-balance tracking-[-0.01em] text-ink-900 leading-tight">
            {a.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{a.subtitle}</p>
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
          <Link to={`${adminPath("/ads/campaigns")}${query}`} className="btn-secondary">
            {a.openManager(filtered.length)}
          </Link>
        </div>
      </div>

      <SyncNote sync={sync} />
      <FilterPanel campaigns={campaigns} />

      <LoadState list={list}>
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
      </LoadState>
    </div>
  );
}
