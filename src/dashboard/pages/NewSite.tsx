import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { templateThumbnail } from "../../api/templates";
import type { SiteTemplate } from "../../api/templates";
import { fetchTemplates } from "../../api/templates";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import type { SiteLanguage } from "../api/types";
import { createSite } from "../api/account";
import { sitesOf, useSession } from "../auth";
import { useResource } from "../hooks";
import { dashboardStrings } from "../strings";

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

  const [businessName, setBusinessName] = useState("");
  const [language, setLanguage] = useState<SiteLanguage>(locale);
  const [templateCode, setTemplateCode] = useState("");
  const [sample, setSample] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!templateCode) {
      setError(t.newSite.noTemplate);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const site = await createSite(token, {
        businessName: businessName.trim(),
        templateCode,
        defaultLanguage: language,
        includeSampleContent: sample,
      });
      // The new site only reaches the switcher through the profile, so the
      // session is refreshed before routing into a site-scoped screen.
      await refresh();
      navigate(`/dashboard/s/${site.id}`);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.message
          ? caught.message
          : t.newSite.submitting,
      );
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
              <option value="ka">ქართული</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={sample}
            onChange={(event) => setSample(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-ink-200"
          />
          <span>
            <span className="block text-sm font-semibold text-ink-900">
              {t.newSite.sampleContent}
            </span>
            <span className="block text-xs text-ink-400">
              {t.newSite.sampleContentHint}
            </span>
          </span>
        </label>
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template: SiteTemplate) => {
            const selected = template.code === templateCode;
            return (
              <button
                key={template.code}
                type="button"
                onClick={() => setTemplateCode(template.code)}
                aria-pressed={selected}
                className={`overflow-hidden rounded-2xl border text-start transition ${
                  selected
                    ? "border-bloom-500 ring-2 ring-bloom-500/30"
                    : "border-ink-100 hover:border-bloom-300"
                }`}
              >
                <img
                  src={templateThumbnail(template)}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full bg-ink-50 object-cover"
                />
                <span className="block p-3">
                  <span className="block text-sm font-bold text-ink-900">
                    {template.name}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {template.tagline}
                  </span>
                </span>
              </button>
            );
          })}
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
        <p className="text-xs text-ink-400">{t.newSite.afterHint}</p>
      </div>
    </form>
  );
}
