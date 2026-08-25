import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import type { AccountSite } from "../api/types";
import { sitesOf, useSession } from "../auth";
import { RoleBadge, SiteStatusBadge } from "../components/Badges";
import { dashboardStrings, formatDate } from "../strings";
import { publishNeedsPlan } from "../gate";
import { dashPath } from "../../routes";

/**
 * The account home. It is a list even for someone with one website, because
 * "which website" is now a real question and hiding it would make the second
 * one feel like a mode rather than a thing they own.
 */

function SubscriptionLine({ site }: { site: AccountSite }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const subscription = site.subscription;
  if (!subscription) return null;

  const date = (iso?: string) => formatDate(iso, locale);

  // Only the fact that matters next is shown: when it lapses, when it renews,
  // or when the trial that is keeping it offline runs out.
  let line: string | null = null;
  if (subscription.status === "GRACE" && subscription.graceUntil) {
    line = t.sites.graceUntil(date(subscription.graceUntil));
  } else if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
    line = t.sites.endsOn(date(subscription.currentPeriodEnd));
  } else if (subscription.status === "ACTIVE" && subscription.currentPeriodEnd) {
    line = t.sites.renewsOn(date(subscription.currentPeriodEnd));
  } else if (subscription.status === "TRIALING" && subscription.trialEndsAt) {
    line = t.sites.trialEnds(date(subscription.trialEndsAt));
  }

  return (
    <p className="mt-1 text-xs text-ink-400">
      {t.subscriptionStatuses[subscription.status] ?? subscription.status}
      {line ? ` · ${line}` : ""}
    </p>
  );
}

function SiteCard({ site }: { site: AccountSite }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);

  return (
    <Link
      to={dashPath(`/s/${site.id}`)}
      className="block rounded-3xl border border-ink-100 bg-surface p-5 transition hover:border-bloom-300 hover:shadow-lg hover:shadow-bloom-600/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink-900">
            {site.businessName}
          </p>
          <p className="truncate text-xs text-ink-400" dir="ltr">
            {site.primaryDomain ?? site.slug}
          </p>
        </div>
        <SiteStatusBadge status={site.status} />
      </div>

      <SubscriptionLine site={site} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <RoleBadge role={site.role} />
        {site.hasDraftChanges && (
          <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-tint-fg">
            {t.sites.draftChanges}
          </span>
        )}
        {/* Guarded on status as well as the flag. A site holding the slot
            reports false while it is up, so the two should never disagree —
            but if they ever did, telling someone their live website needs
            paying for to go online is the worse failure, and this is the
            cheaper side to be wrong on. */}
        {site.status !== "PUBLISHED" && publishNeedsPlan(site) && (
          <span className="rounded-full border border-ink-100 bg-canvas px-2.5 py-1 text-xs font-semibold text-ink-600">
            {t.sites.needsPlan}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Sites() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user } = useSession();
  const sites = sitesOf(user);

  if (sites.length === 0) {
    return (
      <div className="rounded-3xl border border-ink-100 bg-surface p-8 text-center sm:p-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.sites.emptyTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-600">
          {t.sites.emptyBody}
        </p>
        <Link to={dashPath("/new")} className="btn-primary mt-6 inline-flex">
          {t.sites.create}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {t.sites.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.sites.subtitle}</p>
        </div>
        <Link to={dashPath("/new")} className="btn-secondary">
          {t.sites.addAnother}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}
