import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { dashPath } from "../../routes";
import { useSession } from "../auth";
import { updateSiteSettings } from "../api/client";
import type { AccountSite, SiteDetail } from "../api/types";
import { dashboardStrings } from "../strings";
import { useIsOwner } from "../site";
import { paidErrorMessage } from "../gate";

/**
 * The switch that decides whether visitors get a message form on the website.
 *
 * Two flags, and the difference between them is the whole reason this is not a
 * one-liner. `features` is what the client chose; `effectiveFeatures` is what is
 * actually running once the plan has been applied. They disagree exactly when
 * someone switched the form on and then stopped paying.
 *
 * The switch is therefore driven by `features` and never by `effectiveFeatures`:
 * a switch that flipped itself off under them would read as their setting having
 * been thrown away, when in fact it is kept and comes back when the plan does.
 * What `effectiveFeatures` drives instead is the sentence explaining why the
 * form their switch says is on is not on their website.
 *
 * `features` is absent until the client has ever chosen, which is not the same
 * as choosing "off" — so the initial position falls back to whatever is actually
 * running, which is the template's own default.
 */
export function EnquiryFormSettings({
  site,
  account,
  onSaved,
}: {
  site: SiteDetail;
  account: Pick<AccountSite, "subscription">;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale).enquiryForm;
  const { token, handleError } = useSession();

  const chosen = site.features?.enquiryForm;
  const running = site.effectiveFeatures?.enquiryForm === true;
  const [on, setOn] = useState(chosen ?? running);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOn(
      site.features?.enquiryForm ?? site.effectiveFeatures?.enquiryForm === true,
    );
    setError(null);
  }, [site]);

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    setError(null);
    try {
      // Patch-merged on the server, so only the flag that changed is sent and
      // the other feature flags are left where the client put them.
      await updateSiteSettings(token, site.id, {
        features: { enquiryForm: next },
      });
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
          { FREE_PLAN: t.needsPlan, LAPSED: t.lapsed },
          () => t.error,
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  const paused = on && !running;

  return (
    <section className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-1 text-sm text-ink-600">{t.subtitle}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={t.toggle}
          disabled={saving}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
            on ? "bg-bloom-500" : "bg-ink-200"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              on ? "start-6" : "start-1"
            }`}
          />
        </button>
        <span className="text-sm font-semibold text-ink-900">{t.toggle}</span>
        <span className="text-xs font-semibold text-ink-500">
          {on ? t.on : t.off}
        </span>
      </div>

      {on && running ? (
        <p className="mt-3 text-xs text-ink-400">{t.inboxHint}</p>
      ) : null}

      {paused ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">{t.pausedTitle}</p>
          <p className="mt-1 text-sm text-amber-800">{t.pausedBody}</p>
          <PlansLink siteId={site.id} label={t.seePlans} />
        </div>
      ) : null}

      {error ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
          <PlansLink siteId={site.id} label={t.seePlans} />
        </div>
      ) : null}
    </section>
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
