import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { dashPath } from "../../routes";
import { useSession } from "../auth";
import { updateSiteSettings } from "../api/client";
import type { AccountSite, SiteDetail, SiteFeatureFlags } from "../api/types";
import { dashboardStrings } from "../strings";
import type { FormToggleStrings } from "../strings";
import { useIsOwner } from "../site";
import { paidErrorMessage } from "../gate";

/** The feature flags this panel owns, in the order a client meets them. */
type FormFlag = "enquiryForm" | "reservations" | "newsletter";

/**
 * The switches that decide what visitors can send from the website.
 *
 * Two flags per switch, and the difference between them is the whole reason
 * this is not a one-liner. `features` is what the client chose;
 * `effectiveFeatures` is what is actually running once the plan has been
 * applied. They disagree exactly when someone switched a form on and then
 * stopped paying.
 *
 * Each switch is therefore driven by `features` and never by
 * `effectiveFeatures`: a switch that flipped itself off under them would read as
 * their setting having been thrown away, when in fact it is kept and comes back
 * when the plan does. What `effectiveFeatures` drives instead is the sentence
 * explaining why the form their switch says is on is not on their website.
 *
 * `features` is absent until the client has ever chosen, which is not the same
 * as choosing "off" — so the initial position falls back to whatever is actually
 * running, which is the template's own default.
 */
export function FormSettings({
  site,
  account,
  onSaved,
}: {
  site: SiteDetail;
  account: Pick<AccountSite, "subscription">;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale).forms;

  // Table booking is a restaurant's switch. Offering it on a shop would be
  // offering a section that template never renders — except where the flag is
  // already set, which is the server telling us this site does use it.
  const restaurant =
    (site.category ?? "").toUpperCase() === "RESTAURANT" ||
    site.features?.reservations !== undefined ||
    site.effectiveFeatures?.reservations !== undefined;

  return (
    <section className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-1 text-sm text-ink-600">{t.subtitle}</p>

      <div className="mt-5 divide-y divide-ink-100">
        <FormSwitch
          site={site}
          account={account}
          onSaved={onSaved}
          flag="enquiryForm"
          copy={t.enquiryForm}
        />
        {restaurant ? (
          <FormSwitch
            site={site}
            account={account}
            onSaved={onSaved}
            flag="reservations"
            copy={t.reservationForm}
          />
        ) : null}
        <FormSwitch
          site={site}
          account={account}
          onSaved={onSaved}
          flag="newsletter"
          copy={t.newsletterForm}
        />
      </div>
    </section>
  );
}

function FormSwitch({
  site,
  account,
  onSaved,
  flag,
  copy,
}: {
  site: SiteDetail;
  account: Pick<AccountSite, "subscription">;
  onSaved: () => void;
  flag: FormFlag;
  copy: FormToggleStrings;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale).forms;
  const { token, handleError } = useSession();

  const chosen = site.features?.[flag];
  const running = site.effectiveFeatures?.[flag] === true;
  const [on, setOn] = useState(chosen ?? running);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOn(site.features?.[flag] ?? site.effectiveFeatures?.[flag] === true);
    setError(null);
  }, [site, flag]);

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    setError(null);
    try {
      // Patch-merged on the server, so only the flag that changed is sent and
      // the other feature flags are left where the client put them.
      const features: SiteFeatureFlags = { [flag]: next };
      await updateSiteSettings(token, site.id, { features });
      onSaved();
    } catch (caught) {
      handleError(caught);
      setOn(!next);
      // Switching a paid-only feature on without a plan is refused with the
      // same codes as the other paid extras, so it gets the same two sentences.
      setError(
        paidErrorMessage(
          caught,
          account,
          { FREE_PLAN: copy.needsPlan, LAPSED: copy.lapsed },
          () => t.error,
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  const paused = on && !running;

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={copy.toggle}
          disabled={saving}
          onClick={toggle}
          className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
            on ? "bg-bloom-500" : "bg-ink-200"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              on ? "start-6" : "start-1"
            }`}
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900">
              {copy.title}
            </span>
            <span className="text-xs font-semibold text-ink-500">
              {on ? t.on : t.off}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">{copy.subtitle}</p>
          {on && running ? (
            <p className="mt-2 text-xs text-ink-400">{copy.inboxHint}</p>
          ) : null}
        </div>
      </div>

      {paused ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">{copy.pausedTitle}</p>
          <p className="mt-1 text-sm text-amber-800">{copy.pausedBody}</p>
          <PlansLink siteId={site.id} label={t.seePlans} />
        </div>
      ) : null}

      {error ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
          <PlansLink siteId={site.id} label={t.seePlans} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Where to go about it.
 *
 * Worth its own element because the refusal used to be the end of the road: the
 * paid plans were believed to be unbuyable, so the sentence had nowhere to
 * point. They are purchasable from this panel, so leaving a client holding
 * "needs a paid plan" with no route out would be us withholding the one action
 * the message is asking them to take.
 */
function PlansLink({ siteId, label }: { siteId: string; label: string }) {
  const isOwner = useIsOwner();
  // Billing is owner-only, and sending an editor to a screen that will tell
  // them so is worse than not offering the link: it reads as a permission
  // problem with the form rather than with the plan.
  if (!isOwner) return null;
  return (
    <Link
      to={dashPath(`/s/${siteId}/billing`)}
      className="mt-2 inline-block text-sm font-semibold text-tint-fg hover:underline"
    >
      {label}
    </Link>
  );
}
