import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { adminPath, dashboardHome } from "../../routes";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { fetchSite, setPublished } from "../api/client";
import { formatDate, localised } from "../format";
import { StatusBadge, MutedBadge, TierBadge } from "../components/Badges";
import SettingsPanel from "../components/SettingsPanel";
import DomainsPanel from "../components/DomainsPanel";
import PaymentAccountPanel from "../components/PaymentAccountPanel";
import ClientAccountsPanel from "../components/ClientAccountsPanel";
import DangerZone from "../components/DangerZone";
import { adminStrings } from "../strings";

export default function SiteDetailPage() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const { siteId = "" } = useParams();

  const { data: site, loading, error, reload, set } = useResource(
    () => fetchSite(token, siteId),
    [token, siteId],
  );

  const [busy, setBusy] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  /** Set after a successful toggle so the change is announced, not just implied. */
  const [announced, setAnnounced] = useState<
    "published" | "unpublished" | "changes" | null
  >(null);

  useEffect(() => {
    if (!announced) return;
    const timer = window.setTimeout(() => setAnnounced(null), 8000);
    return () => window.clearTimeout(timer);
  }, [announced]);

  async function togglePublished() {
    if (!site || busy) return;
    const next = site.status !== "PUBLISHED";
    setBusy(true);
    setPublishError(null);
    try {
      set(await setPublished(token, site.id, next));
      setAnnounced(next ? "published" : "unpublished");
    } catch (caught) {
      setPublishError(
        caught instanceof ApiError ? caught.message : String(caught),
      );
    } finally {
      setBusy(false);
    }
  }

  /** Publishing an already-live site is how pending page edits go out. */
  async function publishChanges() {
    if (!site || busy) return;
    setBusy(true);
    setPublishError(null);
    try {
      set(await setPublished(token, site.id, true));
      setAnnounced("changes");
    } catch (caught) {
      setPublishError(
        caught instanceof ApiError ? caught.message : String(caught),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading && !site) return <p className="text-sm text-ink-400">{t.loading}</p>;

  if (error || !site) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-danger">
          {error?.message ?? "—"}
        </p>
        <button type="button" onClick={reload} className="btn-secondary mt-4">
          {t.retry}
        </button>
      </div>
    );
  }

  const published = site.status === "PUBLISHED";
  // In development the renderer serves a site at /site/<slug>; the primary URL
  // is the production subdomain, which only resolves once DNS is in place.
  const previewHref = `/site/${site.slug}`;
  // The address staff read out to the client, without the scheme.
  const primaryUrl =
    site.primaryUrl?.replace(/^https?:\/\//, "") ?? `${site.slug}.bbloom.ge`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={adminPath()}
          className="text-sm font-semibold text-ink-400 hover:text-bloom-600"
        >
          ← {t.detail.back}
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              {site.businessName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={site.status}
                label={t.statuses[site.status] ?? site.status}
              />
              {site.category && (
                <MutedBadge label={t.categories[site.category] ?? site.category} />
              )}
              {site.tier && <TierBadge label={t.tiers[site.tier] ?? site.tier} />}
              <span className="text-xs text-ink-400" dir="ltr">
                {site.slug}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              {t.detail.viewSite}
            </a>
            <a
              href={dashboardHome()}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              {t.detail.clientDashboard}
            </a>
            <button
              type="button"
              onClick={togglePublished}
              disabled={busy}
              className={published ? "btn-secondary" : "btn-primary"}
            >
              {published ? t.detail.unpublish : t.detail.publish}
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-ink-400">
          {published ? t.detail.unpublishHint : t.detail.publishHint}
        </p>
        {announced && (
          <p
            role="status"
            className={[
              "mt-3 rounded-2xl px-4 py-3 text-sm font-semibold",
              announced === "unpublished"
                ? "bg-ink-50 text-ink-600"
                : "bg-tint text-tint-fg",
            ].join(" ")}
          >
            {announced === "published"
              ? t.detail.justPublished(primaryUrl)
              : announced === "changes"
                ? t.detail.justPublishedChanges
                : t.detail.justUnpublished}
          </p>
        )}
        {publishError && (
          <p role="alert" className="mt-2 text-sm font-semibold text-danger">
            {publishError}
          </p>
        )}

        {/* Only meaningful on a live site: on a draft nothing is public yet,
            so pending edits are not a state anyone needs warning about. */}
        {published && site.hasUnpublishedChanges && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-tint-strong bg-tint px-4 py-3">
            <div>
              <p className="text-sm font-bold text-tint-fg">
                {t.detail.pendingTitle}
              </p>
              <p className="mt-0.5 text-xs text-ink-600">
                {t.detail.pendingHint}
              </p>
            </div>
            <button
              type="button"
              onClick={publishChanges}
              disabled={busy}
              className="btn-primary"
            >
              {t.detail.publishChanges}
            </button>
          </div>
        )}
      </div>

      <section className="card hover:border-ink-100 hover:shadow-none">
        <h2 className="text-lg font-bold text-ink-900">{t.detail.overview}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              t.detail.template,
              localised(site.templateNameKa, site.templateNameEn, locale) ||
                site.templateCode,
            ],
            [t.detail.products, String(site.productCount ?? 0)],
            [
              t.detail.languages,
              (site.languages ?? [])
                .map((language) => t.languageNames[language] ?? language)
                .join(" · ") || "—",
            ],
            [t.detail.currency, site.currency ?? "—"],
            [t.detail.created, formatDate(site.createdAt, locale)],
            [
              t.detail.published,
              site.publishedAt
                ? formatDate(site.publishedAt, locale)
                : t.detail.notPublished,
            ],
            [t.detail.updated, formatDate(site.updatedAt, locale)],
            [
              t.sites.address,
              site.primaryUrl?.replace(/^https?:\/\//, "") ?? "—",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-400">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold text-ink-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <ClientAccountsPanel site={site} />
      <SettingsPanel site={site} onSaved={set} />
      <PaymentAccountPanel site={site} />
      <DomainsPanel site={site} onChanged={reload} />
      <DangerZone site={site} />
    </div>
  );
}
