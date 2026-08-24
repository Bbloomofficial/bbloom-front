import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { templateThumbnail } from "../../api/templates";
import type { SiteTemplate } from "../../api/templates";
import { fetchTemplates } from "../../api/templates";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import type { SiteLanguage } from "../api/types";
import { createSite } from "../api/account";
import { sitesOf, useSession } from "../auth";
import { useResource } from "../hooks";
import { dashboardStrings } from "../strings";
import { dashPath } from "../../routes";

/**
 * Where a design's live demo is published.
 *
 * Takes the slug the templates endpoint already reports rather than rebuilding
 * it from the template code. The backend derives it as `"demo-" + code`
 * (`SiteDemoSeeder.slugFor`), so the two agree today — but `demoSlug` is the
 * server stating the answer, and it is null when that design has no published
 * demo. Re-deriving would turn "no demo exists" into a confident link to a
 * site that isn't there, which is the failure worth avoiding: a button that
 * looks identical whether it works or not.
 */
function demoUrl(demoSlug: string) {
  return `https://${demoSlug}.bbloom.ge`;
}

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
              <option value="ka">ქართული</option>
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template: SiteTemplate) => {
            const selected = template.code === templateCode;
            return (
              /*
                The card is a container, not the control. It used to be a single
                <button>, and an <a> cannot legally live inside one — so the
                demo link is a sibling of the selection button rather than a
                child of it. That also means clicking the link cannot select the
                design: there is no ancestor handler for it to reach, which is a
                stronger guarantee than stopping propagation and cannot be
                undone by someone later adding a handler to the wrapper.
              */
              <div
                key={template.code}
                className={`flex flex-col overflow-hidden rounded-2xl border transition ${
                  selected
                    ? "border-bloom-500 ring-2 ring-bloom-500/30"
                    : "border-ink-100 hover:border-bloom-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTemplateCode(template.code)}
                  aria-pressed={selected}
                  className="block w-full flex-1 text-start"
                >
                  <img
                    src={templateThumbnail(template)}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-ink-50 object-cover"
                  />
                  <span className="block px-3 pt-3">
                    <span className="block text-sm font-bold text-ink-900">
                      {template.name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {template.tagline}
                    </span>
                  </span>
                </button>

                {/* A new tab on purpose: someone half-way through naming their
                    business should not lose the form to a navigation. Absent
                    when the design has no published demo, so the button is
                    never offered for a site that will not load. */}
                {template.demoSlug && (
                  <a
                    href={demoUrl(template.demoSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-3 mb-3 mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
                  >
                    {t.newSite.viewDemo}
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5 shrink-0"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.29a1 1 0 0 0 1.42 1.42L15 6.41V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
                      <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
                    </svg>
                  </a>
                )}
              </div>
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
      </div>
    </form>
  );
}
