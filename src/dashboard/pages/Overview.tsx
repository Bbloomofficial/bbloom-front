import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { describeProblem } from "../../api/problem";
import { useSession } from "../auth";
import {
  fetchEnquiries,
  fetchEnquiryStats,
  fetchSiteDetail,
  setPublished,
} from "../api/client";
import { ENQUIRY_TYPES } from "../api/types";
import type { SiteDetail } from "../api/types";
import { useResource } from "../hooks";
import { dashboardStrings, formatDate, formatDateTime } from "../strings";
import { SiteStatusBadge, StatusBadge, TypeBadge } from "../components/Badges";
import { ContactSettings } from "../components/ContactSettings";
import { EnquiryFormSettings } from "../components/EnquiryFormSettings";
import { useActiveSite, useIsOwner } from "../site";
import {
  canPublish,
  publishBlocks,
  publishErrorMessage,
  publishNeedsPlan,
} from "../gate";
import { dashPath } from "../../routes";

/** `MODERN` / `shop-modern` read better as words in a client-facing UI. */
function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5 border-t border-ink-100 py-3 first:border-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-36 shrink-0 text-sm font-semibold text-ink-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm text-ink-800">{value}</dd>
    </div>
  );
}

export default function Overview() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user, handleError, refresh } = useSession();
  const active = useActiveSite();
  const isOwner = useIsOwner();
  const siteId = active.id;

  const site = useResource<SiteDetail>(
    () => fetchSiteDetail(token, siteId),
    [token, siteId],
  );
  const stats = useResource(
    () => fetchEnquiryStats(token, siteId),
    [token, siteId],
  );
  const recent = useResource(
    () => fetchEnquiries(token, siteId, { size: 5 }),
    [token, siteId],
  );

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const reloadSite = site.reload;

  const togglePublished = useCallback(
    async (next: boolean) => {
      setPublishing(true);
      setPublishError(null);
      try {
        await setPublished(token, siteId, next);
        reloadSite();
        // Publishing changes the site's status, which the switcher and the
        // site list read from the profile rather than from this screen.
        await refresh();
      } catch (error) {
        handleError(error);
        // A refusal is a 409 with an English, deliberately actionable message.
        // Known reasons are re-said in the client's own language.
        setPublishError(
          publishErrorMessage(
            error,
            active,
            user.emailVerified,
            t.gate.blocked,
            () => describeProblem(error, t.errors, t.overview.publishFailed),
          ),
        );
      } finally {
        setPublishing(false);
      }
    },
    [token, siteId, handleError, reloadSite, refresh, active, user.emailVerified, t],
  );

  const detail = site.data;
  const published = detail?.status === "PUBLISHED";
  const blocks = publishBlocks(active, user.emailVerified);
  const publishable = canPublish(active, user.emailVerified);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {t.overview.greeting(user.fullName || active.businessName)}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.overview.subtitle}</p>
      </div>

      <section className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {t.overview.siteTitle}
            </h2>
            <p className="mt-1 text-sm text-ink-600">{active.businessName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {detail && <SiteStatusBadge status={detail.status} />}
            <a
              href={active.publicUrl ?? `/site/${active.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              {t.viewSite}
            </a>
            {/* Publishing is free now, so the button is only ever missing for
                an unconfirmed email — never a button that exists only to
                fail. */}
            {isOwner && detail && (published || publishable) && (
              <button
                type="button"
                onClick={() => void togglePublished(!published)}
                disabled={publishing}
                className={
                  published
                    ? "btn-secondary disabled:opacity-60"
                    : "btn-primary disabled:opacity-60"
                }
              >
                {published ? t.overview.unpublish : t.overview.publish}
              </button>
            )}
          </div>
        </div>

        {!published && blocks.length > 0 && (
          <div className="mt-5 rounded-2xl border border-ink-100 bg-sunken p-4">
            <p className="text-sm font-bold text-ink-900">{t.gate.title}</p>
            <ul className="mt-2 space-y-1">
              {blocks.map((block) => (
                <li key={block} className="text-sm text-ink-600">
                  {t.gate.blocked[block]}
                </li>
              ))}
            </ul>
            {/* The confirmation box itself is in the banner at the top of every
                dashboard page, so there is nothing to link to — saying it twice
                here and sending them upwards would be the detour. */}
          </div>
        )}

        {!published && blocks.length === 0 && publishNeedsPlan(active) && (
          <div className="mt-5 rounded-2xl border border-ink-100 bg-sunken p-4">
            <p className="text-sm font-bold text-ink-900">{t.gate.title}</p>
            <p className="mt-2 text-sm text-ink-600">
              {t.gate.blocked.ADDITIONAL_SITE_REQUIRES_PLAN}
            </p>
            {/* The publish button stays enabled above. This warns without
                disarming: the flag describes the account's *other* websites, so
                it can go stale in a long-open tab, and a client who has just
                freed the slot must not be left with a dead button. */}
          </div>
        )}

        {publishError && (
          <p role="alert" className="mt-4 text-sm font-semibold text-danger">
            {publishError}
          </p>
        )}

        {site.loading && !detail ? (
          <p className="mt-6 text-sm text-ink-400">{t.loading}</p>
        ) : detail ? (
          <dl className="mt-6">
            <Row
              label={t.overview.template}
              value={
                (locale === "en"
                  ? detail.templateNameEn
                  : detail.templateNameKa) ??
                detail.templateName ??
                titleCase(detail.templateCode)
              }
            />
            <Row
              label={t.overview.plan}
              value={detail.tier ? titleCase(detail.tier) : undefined}
            />
            <Row label={t.overview.products} value={detail.productCount} />
            <Row
              label={t.overview.languages}
              value={detail.languages?.join(", ").toUpperCase()}
            />
            <Row label={t.overview.currency} value={detail.currency} />
            <Row
              label={t.overview.address}
              value={
                locale === "ka"
                  ? (detail.contactAddressKa ?? detail.contactAddressEn)
                  : (detail.contactAddressEn ?? detail.contactAddressKa)
              }
            />
            <Row
              label={t.overview.domains}
              value={
                detail.domains?.length ? (
                  <span className="flex flex-wrap gap-2" dir="ltr">
                    {detail.domains.map((domain) => (
                      <span
                        key={domain.id}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          domain.verified
                            ? "bg-success-soft text-success"
                            : "bg-ink-50 text-ink-600"
                        }`}
                      >
                        {domain.hostname}
                      </span>
                    ))}
                  </span>
                ) : (
                  t.overview.noDomains
                )
              }
            />
            <Row
              label={t.overview.published}
              value={formatDate(detail.publishedAt, locale)}
            />
            <Row
              label={t.overview.created}
              value={formatDate(detail.createdAt, locale)}
            />
          </dl>
        ) : null}

        {isOwner && (
          <p className="mt-4 text-xs text-ink-400">{t.overview.publishHint}</p>
        )}
      </section>

      {detail ? (
        <ContactSettings site={detail} onSaved={() => reloadSite()} />
      ) : null}

      {detail ? (
        <EnquiryFormSettings
          site={detail}
          account={active}
          onSaved={() => reloadSite()}
        />
      ) : null}

      <section>
        <h2 className="text-lg font-bold text-ink-900">
          {t.overview.statsTitle}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label={t.overview.unread} value={stats.data?.newEnquiries ?? 0} />
          <Stat label={t.overview.last7} value={stats.data?.last7Days ?? 0} />
          <Stat label={t.overview.last30} value={stats.data?.last30Days ?? 0} />
          <Stat label={t.overview.total} value={stats.data?.total ?? 0} />
        </div>

        {stats.data && stats.data.total > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.overview.byType}
            </span>
            {ENQUIRY_TYPES.filter(
              (type) => (stats.data?.byType?.[type] ?? 0) > 0,
            ).map((type) => (
              <Link
                key={type}
                to={dashPath(`/s/${siteId}/inbox?type=${type}`)}
                className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-control px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
              >
                {t.types[type]}
                <span className="text-ink-400">{stats.data?.byType[type]}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-bold text-ink-900">{t.overview.recent}</h2>
          <Link
            to={dashPath(`/s/${siteId}/inbox`)}
            className="text-sm font-semibold text-tint-fg hover:underline"
          >
            {t.overview.viewAll}
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
          {recent.loading && !recent.data ? (
            <p className="p-6 text-sm text-ink-400">{t.loading}</p>
          ) : recent.data?.items.length ? (
            <ul>
              {recent.data.items.map((enquiry) => (
                <li key={enquiry.id} className="border-t border-ink-100 first:border-0">
                  <Link
                    to={dashPath(`/s/${siteId}/inbox?selected=${enquiry.id}`)}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-ink-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {enquiry.name ?? enquiry.email ?? "—"}
                      </span>
                      <span className="block truncate text-xs text-ink-400">
                        {enquiry.subject ??
                          enquiry.message ??
                          (enquiry.name ? enquiry.email : "")}
                      </span>
                    </span>
                    <TypeBadge type={enquiry.type} />
                    <StatusBadge status={enquiry.status} />
                    <span className="w-full text-xs text-ink-400 sm:w-auto">
                      {formatDateTime(enquiry.createdAt, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-ink-400">{t.overview.empty}</p>
          )}
        </div>
      </section>
    </div>
  );
}
