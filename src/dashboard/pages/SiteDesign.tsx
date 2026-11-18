import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { describeProblem } from "../../api/problem";
import type { SiteTemplate } from "../../api/templates";
import {
  fetchTemplates,
  groupByCategory,
  isTierUnlocked,
} from "../../api/templates";
import { useSession } from "../auth";
import {
  fetchOrderingStatus,
  fetchSiteDetail,
  previewTemplateSwitch,
  switchTemplate,
} from "../api/client";
import type {
  SiteDetail,
  TemplateSwitchImpact,
  TemplateSwitchPreview,
} from "../api/types";
import {
  ceilingOf,
  losesOnlineOrdering,
  switchImpact,
  useTemplateCeiling,
} from "../api/templateAccess";
import { useResource } from "../hooks";
import { dashboardStrings } from "../strings";
import type { DashboardStrings } from "../strings";
import TemplateCard from "../components/TemplateCard";
import { useActiveSite } from "../site";
import { dashPath } from "../../routes";

/**
 * Naming a list of section types for a client.
 *
 * Known types are named; anything this build has no copy for is *counted*
 * rather than printed. A section type is an internal word — showing `hero_v2`
 * to someone deciding whether to keep their website is both meaningless and
 * alarming, while "and 2 more sections" is neither, and is still true.
 */
function sectionList(types: string[], t: DashboardStrings): string {
  const named: string[] = [];
  let unknown = 0;
  for (const type of types) {
    const label = t.design.sections[type];
    if (label) named.push(label);
    else unknown += 1;
  }
  if (unknown > 0) named.push(t.design.moreSections(unknown));
  return named.join(", ");
}

/** Same rule for feature keys: named if we have copy, generic otherwise. */
function featureList(keys: string[], t: DashboardStrings) {
  const named: string[] = [];
  let unknown = 0;
  for (const key of keys) {
    const label = t.design.featureNames[key];
    if (label) named.push(label);
    else unknown += 1;
  }
  return { named, hasUnknown: unknown > 0 };
}

/**
 * Changing an existing website's design.
 *
 * A screen of its own rather than a control on the overview, because this is
 * the only action in the dashboard that is immediate, irreversible and can
 * destroy work a client has done. It is deliberately three steps — choose, read
 * what it costs, confirm — and the middle one is not skippable.
 *
 * Designs above the account's plan are shown, and shown off: they are what the
 * next plan buys. They cannot be chosen, and the server is asked again before
 * anything is written.
 */
export default function SiteDesign() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, refresh } = useSession();
  const active = useActiveSite();
  const siteId = active.id;

  const detailState = useResource<SiteDetail>(
    () => fetchSiteDetail(token, siteId),
    [token, siteId],
  );
  const templatesState = useResource(() => fetchTemplates(), []);
  // Only ever read as a fallback, when the server does not report the ordering
  // loss itself. Failing to load it must not block the screen, so its error is
  // deliberately unused — the flag is the primary source.
  const orderingState = useResource(
    () => fetchOrderingStatus(token, siteId),
    [token, siteId],
  );

  const detail = detailState.data;
  const templates = useMemo(
    () => templatesState.data ?? [],
    [templatesState.data],
  );
  const groups = useMemo(() => groupByCategory(templates), [templates]);

  const profileCeiling = useTemplateCeiling();
  const ceiling = ceilingOf(detail, profileCeiling);

  const [pending, setPending] = useState<SiteTemplate | null>(null);
  const [preview, setPreview] = useState<TemplateSwitchPreview | null>(null);
  const [checking, setChecking] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<TemplateSwitchImpact | null>(null);

  const currentCode = detail?.templateCode ?? "";
  // The same name the overview shows, chosen the same way: the backend sends
  // both languages, and the code is only ever a last resort.
  const currentName =
    (locale === "en" ? detail?.templateNameEn : detail?.templateNameKa) ??
    detail?.templateName ??
    currentCode;
  const plansHref = dashPath(`/s/${siteId}/billing`);

  function reset() {
    setPending(null);
    setPreview(null);
    setAcknowledged(false);
    setError(null);
  }

  /**
   * Asks the server what this change would do. Nothing is written, so it is
   * safe to run the moment a design is picked — and it has to be, because the
   * confirmation cannot be written without the answer.
   */
  async function choose(template: SiteTemplate) {
    if (switching) return;
    reset();
    setDone(null);
    setPending(template);
    setChecking(true);
    try {
      setPreview(await previewTemplateSwitch(token, siteId, template.code));
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.design.checkFailed));
    } finally {
      setChecking(false);
    }
  }

  async function confirm() {
    if (!pending || switching) return;
    setSwitching(true);
    setError(null);
    try {
      const result = await switchTemplate(token, siteId, pending.code);
      setDone(switchImpact(result));
      reset();
      // The design shows on the overview and in the site switcher, so both the
      // site payload and the profile are stale the moment this returns.
      detailState.reload();
      await refresh();
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.design.failed));
    } finally {
      setSwitching(false);
    }
  }

  const impact = preview ? switchImpact(preview) : null;
  const losesOrdering =
    impact !== null &&
    losesOnlineOrdering(
      impact,
      orderingState.data,
      detail?.tier,
      pending?.tier,
    );
  const lostFeatures = featureList(impact?.losesFeatures ?? [], t);
  const dropped = Object.entries(impact?.droppedFields ?? {}).filter(
    ([, fields]) => fields.length > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.design.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.design.subtitle}</p>
        <Link
          to={dashPath(`/s/${siteId}`)}
          className="mt-2 inline-block text-xs font-bold text-bloom-600 hover:underline"
        >
          {t.design.back}
        </Link>
      </div>

      {done && <DonePanel impact={done} t={t} siteId={siteId} />}

      {/* The confirmation, in the order it has to be read: what stops working,
          then who sees it, then that it cannot be undone, then the detail. A
          client who reads only the first line must still have been told the
          most expensive thing. */}
      {pending && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t.design.confirmTitle(
            currentName,
            pending.name,
          )}
          className="rounded-3xl border-2 border-bloom-500 bg-surface p-5 sm:p-6"
        >
          <h2 className="text-lg font-extrabold text-ink-900">
            {t.design.confirmTitle(
              currentName,
              pending.name,
            )}
          </h2>

          {checking && (
            <p className="mt-3 text-sm text-ink-400">{t.design.checking}</p>
          )}

          {/* The server's own answer, and preferred over the local comparison:
              it can say no without a refusal, so a design the plan does not
              cover is an offer here rather than an error. */}
          {preview && !preview.allowed && (
            <div className="mt-4 rounded-2xl bg-tint p-4">
              <p className="text-sm font-semibold text-ink-900">
                {t.errors.templateTierRequiresPlan}
              </p>
              <Link to={plansHref} className="btn-primary mt-3 inline-flex">
                {t.design.seePlans}
              </Link>
            </div>
          )}

          {preview && preview.allowed && (
            <div className="mt-4 space-y-4">
              {losesOrdering && (
                <div className="rounded-2xl bg-danger-soft p-4">
                  <p className="text-sm font-extrabold text-danger">
                    {t.design.ordersHeadline}
                  </p>
                  <p className="mt-1 text-sm text-ink-800">
                    {t.design.ordersBody}
                  </p>
                </div>
              )}

              <p className="text-sm font-semibold text-ink-900">
                {preview.published
                  ? t.design.publishedWarning
                  : t.design.draftWarning}
              </p>
              <p className="text-sm text-ink-800">{t.design.irreversible}</p>

              {impact && impact.removed.length > 0 ? (
                <p className="text-sm text-ink-800">
                  <span className="font-bold">{t.design.removes}:</span>{" "}
                  {sectionList(impact.removed, t)}
                </p>
              ) : (
                !losesOrdering &&
                dropped.length === 0 &&
                lostFeatures.named.length === 0 &&
                !lostFeatures.hasUnknown && (
                  <p className="text-sm text-ink-800">{t.design.nothingLost}</p>
                )
              )}

              {(lostFeatures.named.length > 0 || lostFeatures.hasUnknown) && (
                <p className="text-sm text-ink-800">
                  <span className="font-bold">{t.design.featuresLost}:</span>{" "}
                  {lostFeatures.named.join(", ")}
                  {lostFeatures.hasUnknown && (
                    <span className="block">
                      {t.design.featuresLostGeneric}
                    </span>
                  )}
                </p>
              )}

              {dropped.length > 0 && (
                <div className="text-sm text-ink-800">
                  <p className="font-bold">{t.design.drops}:</p>
                  <ul className="mt-1 list-disc space-y-0.5 ps-5">
                    {dropped.map(([section, fields]) => (
                      <li key={section}>
                        {t.design.dropsField(
                          t.design.sections[section] ??
                            sectionList([section], t),
                          fields.length,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {impact && impact.carriedOver.length > 0 && (
                <p className="text-sm text-ink-500">
                  <span className="font-bold">{t.design.keeps}:</span>{" "}
                  {sectionList(impact.carriedOver, t)}
                </p>
              )}

              {/* Unticked every time the dialog opens, so the tick always
                  belongs to the change actually in front of the client. */}
              <label className="flex items-start gap-2 text-sm font-semibold text-ink-900">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5"
                />
                {t.design.acknowledge}
              </label>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {preview && preview.allowed && (
              <button
                type="button"
                onClick={confirm}
                disabled={!acknowledged || switching}
                className="btn-primary disabled:opacity-60"
              >
                {switching ? t.design.switching : t.design.confirm}
              </button>
            )}
            {!preview && !checking && (
              <button
                type="button"
                onClick={() => choose(pending)}
                className="btn-secondary"
              >
                {t.design.retry}
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              disabled={switching}
              className="btn-secondary disabled:opacity-60"
            >
              {t.design.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        {(detailState.loading || templatesState.loading) && (
          <p className="text-sm text-ink-400">{t.loading}</p>
        )}
        {templatesState.error && (
          <button
            type="button"
            onClick={templatesState.reload}
            className="btn-secondary"
          >
            {t.retry}
          </button>
        )}

        <div className="space-y-6">
          {groups.map(({ category, templates: group }) => (
            <div key={category}>
              {groups.length > 1 && (
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">
                  {t.newSite.categories[category] ?? category}
                </h3>
              )}
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((template) => {
                  const current = template.code === currentCode;
                  const locked = !isTierUnlocked(template.tier, ceiling);
                  return (
                    <TemplateCard
                      key={template.code}
                      template={template}
                      t={t}
                      current={current}
                      locked={locked}
                      selected={pending?.code === template.code}
                      // The design the site already has is not an action: the
                      // switch would be a no-op that still re-materialises
                      // every section, which is a real cost for no change.
                      onSelect={current ? undefined : () => choose(template)}
                      selectLabel={t.design.choose}
                      plansHref={plansHref}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** What actually happened, after the fact. Same vocabulary as the warning. */
function DonePanel({
  impact,
  t,
  siteId,
}: {
  impact: TemplateSwitchImpact;
  t: DashboardStrings;
  siteId: string;
}) {
  const dropped = Object.entries(impact.droppedFields).filter(
    ([, fields]) => fields.length > 0,
  );
  return (
    <div className="rounded-3xl border border-success bg-success-soft p-5 sm:p-6">
      <h2 className="text-lg font-extrabold text-ink-900">
        {t.design.doneTitle}
      </h2>
      <dl className="mt-3 space-y-1 text-sm text-ink-800">
        {impact.carriedOver.length > 0 && (
          <p>
            <span className="font-bold">{t.design.doneKept}:</span>{" "}
            {sectionList(impact.carriedOver, t)}
          </p>
        )}
        {impact.removed.length > 0 && (
          <p>
            <span className="font-bold">{t.design.doneRemoved}:</span>{" "}
            {sectionList(impact.removed, t)}
          </p>
        )}
        {dropped.length > 0 && (
          <p>
            <span className="font-bold">{t.design.doneDropped}:</span>{" "}
            {sectionList(
              dropped.map(([section]) => section),
              t,
            )}
          </p>
        )}
      </dl>
      {impact.losesOnlineOrdering && (
        <p className="mt-2 text-sm font-semibold text-danger">
          {t.design.doneOrders}
        </p>
      )}
      <Link
        to={dashPath(`/s/${siteId}/editor`)}
        className="btn-primary mt-4 inline-flex"
      >
        {t.design.doneNext}
      </Link>
    </div>
  );
}
