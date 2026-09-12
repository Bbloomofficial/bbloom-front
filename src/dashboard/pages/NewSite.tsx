import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { SiteTemplate } from "../../api/templates";
import {
  fetchTemplates,
  groupByCategory,
  isTierUnlocked,
} from "../../api/templates";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import type { SiteLanguage } from "../api/types";
import { createSite } from "../api/account";
import { sitesOf, useSession } from "../auth";
import { useResource } from "../hooks";
import { dashboardStrings } from "../strings";
import { dashPath } from "../../routes";
import TemplateCard from "../components/TemplateCard";
import { useTemplateCeiling } from "../api/templateAccess";

/**
 * Creating a website used to be staff work. A client does it themselves now, so
 * this is deliberately short: a design, a name, a language. Everything on the
 * page is editable afterwards, and none of it is public until a plan is paid.
 */
export default function NewSite() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user, refresh } = useSession();
  const navigate = useNavigate();

  const first = sitesOf(user).length === 0;
  const templatesState = useResource(() => fetchTemplates(), []);
  const templates = useMemo(
    () => templatesState.data ?? [],
    [templatesState.data],
  );
  // Grouped by who each design is for. A client picking their first website is
  // choosing between three designs for their own trade, not fifteen in general.
  const groups = useMemo(() => groupByCategory(templates), [templates]);

  const [businessName, setBusinessName] = useState("");
  const [language, setLanguage] = useState<SiteLanguage>(locale);
  const [templateCode, setTemplateCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The highest design tier this account may build on. `undefined` when the
  // backend does not report it, which unlocks everything â€” see `isTierUnlocked`.
  const ceiling = useTemplateCeiling();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!templateCode) {
      setError(t.newSite.noTemplate);
      return;
    }
    // A locked design cannot be put into state by the picker, so reaching here
    // with one means the ceiling moved under an open form â€” a plan lapsed in
    // another tab, say. Checked again rather than trusted: the request would be
    // refused anyway, and this states why without a round trip.
    const chosen = templates.find((one) => one.code === templateCode);
    if (chosen && !isTierUnlocked(chosen.tier, ceiling)) {
      setError(t.errors.templateTierRequiresPlan);
      setTemplateCode("");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Sample content is no longer a choice: a website that opens as a row of
      // empty boxes gives someone nothing to react to, and the field is gone
      // from the backend's request record, which now always seeds it.
      const site = await createSite(token, {
        businessName: businessName.trim(),
        templateCode,
        defaultLanguage: language,
      });
      // The new site only reaches the switcher through the profile, so the
      // session is refreshed before routing into a site-scoped screen.
      await refresh();
      navigate(dashPath(`/s/${site.id}`));
    } catch (caught) {
      setError(describeProblem(caught, t.errors, t.newSite.failed));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {first ? t.newSite.firstTitle : t.newSite.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {first ? t.newSite.firstSubtitle : t.newSite.subtitle}
        </p>
      </div>

      <div className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="new-site-name">
              {t.newSite.businessName}
            </label>
            <input
              id="new-site-name"
              required
              className="field"
              placeholder={t.newSite.businessNamePlaceholder}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="new-site-language">
              {t.newSite.language}
            </label>
            <select
              id="new-site-language"
              className="field"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as SiteLanguage)
              }
            >
              <option value="ka">áƒ¥áƒáƒ áƒ—áƒ£áƒšáƒ˜</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-bold text-ink-900">{t.newSite.template}</h2>
        <p className="mt-1 text-xs text-ink-400">{t.newSite.templateHint}</p>

        {templatesState.loading && (
          <p className="mt-4 text-sm text-ink-400">{t.loading}</p>
        )}
        {templatesState.error && (
          <button
            type="button"
            onClick={templatesState.reload}
            className="btn-secondary mt-4"
          >
            {t.retry}
          </button>
        )}

        <div className="mt-4 space-y-6">
          {groups.map(({ category, templates: group }) => (
            <div key={category}>
              {groups.length > 1 && (
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-400">
                  {t.newSite.categories[category] ?? category}
                </h3>
              )}
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.map((template: SiteTemplate) => (
                  <TemplateCard
                    key={template.code}
                    template={template}
                    t={t}
                    selected={template.code === templateCode}
                    locked={!isTierUnlocked(template.tier, ceiling)}
                    onSelect={() => setTemplateCode(template.code)}
                    plansHref="/pricing"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? t.newSite.submitting : t.newSite.submit}
        </button>
      </div>
    </form>
  );
}