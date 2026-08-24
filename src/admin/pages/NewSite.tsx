import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useResource } from "../hooks";
import { createSite, fetchTemplates } from "../api/client";
import { SITE_LANGUAGES } from "../api/types";
import type { CreateSiteRequest, SiteLanguage } from "../api/types";
import TemplatePicker from "../components/TemplatePicker";
import { TemplatePreview, demoHref } from "../components/TemplatePreview";
import { SLUG_PATTERN, slugify, templateText } from "../format";
import { adminStrings } from "../strings";
import { adminPath } from "../../routes";

type Step = 0 | 1 | 2 | 3;

export default function NewSite() {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();
  const navigate = useNavigate();

  // The catalog carries both languages, so it is fetched once and re-read from
  // memory when staff switch the interface language.
  const templatesState = useResource(() => fetchTemplates(), []);
  const templates = useMemo(
    () => templatesState.data ?? [],
    [templatesState.data],
  );

  const [step, setStep] = useState<Step>(0);
  const [templateCode, setTemplateCode] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [languages, setLanguages] = useState<SiteLanguage[]>(["ka"]);
  const [currency, setCurrency] = useState("GEL");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [includeSampleContent, setIncludeSampleContent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // The backend derives the slug from the business name; mirroring it here lets
  // staff see the address they are about to publish before they commit to it.
  const effectiveSlug = slugTouched ? slug : slugify(businessName);
  const slugValid = SLUG_PATTERN.test(effectiveSlug);

  const template = templates.find((item) => item.code === templateCode) ?? null;
  const canLeaveTemplate = templateCode !== null;
  const canLeaveBusiness = businessName.trim().length > 0 && slugValid;
  const canLeaveOptions = languages.length > 0;

  function toggleLanguage(language: SiteLanguage) {
    setLanguages((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language],
    );
  }

  /** Promoting a language to the front is what changes the site's default. */
  function makeDefault(language: SiteLanguage) {
    setLanguages((current) => [
      language,
      ...current.filter((item) => item !== language),
    ]);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !templateCode) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const body: CreateSiteRequest = {
      businessName: businessName.trim(),
      templateCode,
      // `defaultLanguage` is deliberately omitted: the backend falls back to the
      // first entry of `languages`, so the order shown on screen is the truth.
      languages,
      includeSampleContent,
    };
    if (effectiveSlug) body.slug = effectiveSlug;
    if (currency.trim()) body.currency = currency.trim().toUpperCase();
    if (contactEmail.trim()) body.contactEmail = contactEmail.trim();
    if (contactPhone.trim()) body.contactPhone = contactPhone.trim();

    try {
      const site = await createSite(token, body);
      navigate(adminPath(`/sites/${site.id}`), { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        // A slug we sent explicitly is honoured or refused, never altered, so
        // a clash comes back as 409 and belongs on the address field alone —
        // a banner saying the same thing twice is just noise.
        //
        // Staff are exempt from the reserved-address list, so `SLUG_RESERVED`
        // should not reach here; it is distinguished anyway because mapping
        // every 409 to "already taken" would otherwise tell a colleague to
        // pick another address without saying why this one cannot be had.
        if (caught.status === 409) {
          setFieldErrors({
            slug:
              caught.code === "SLUG_RESERVED"
                ? t.wizard.slugReserved
                : t.wizard.slugTaken,
          });
          setStep(1);
        } else {
          setError(caught.message || t.wizard.failed);
          setFieldErrors(caught.fields);
          // Validation complaints belong to the details step, not the review.
          if (Object.keys(caught.fields).length > 0) setStep(1);
        }
      } else {
        setError(t.wizard.failed);
      }
      setSubmitting(false);
    }
  }

  const steps = [
    t.wizard.steps.template,
    t.wizard.steps.business,
    t.wizard.steps.options,
    t.wizard.steps.review,
  ];

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {t.wizard.title}
          </h1>
          <p className="mt-1 text-sm text-ink-600">{t.wizard.subtitle}</p>
        </div>
        <Link to={adminPath()} className="text-sm font-semibold text-ink-600 hover:text-bloom-600">
          {t.cancel}
        </Link>
      </div>

      <ol className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        {steps.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                // Only steps already cleared are reachable by clicking back.
                disabled={index > step}
                onClick={() => setStep(index as Step)}
                className={[
                  "flex items-center gap-2 rounded-xl px-3 py-2 font-semibold transition",
                  active
                    ? "bg-tint text-tint-fg"
                    : done
                      ? "text-ink-600 hover:bg-ink-50"
                      : "text-ink-400",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    active || done
                      ? "bg-bloom-600 text-white"
                      : "bg-ink-100 text-ink-400",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                {label}
              </button>
              {index < steps.length - 1 && (
                <span aria-hidden className="text-ink-100">
                  —
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-6">
        {step === 0 && (
          <section>
            <h2 className="text-lg font-bold text-ink-900">
              {t.wizard.templateTitle}
            </h2>
            <p className="mt-1 text-sm text-ink-600">{t.wizard.templateHint}</p>

            {templatesState.loading && (
              <p className="mt-6 text-sm text-ink-400">{t.loading}</p>
            )}
            {templatesState.error && (
              <div className="mt-6 rounded-3xl border border-ink-100 bg-surface p-6 text-center">
                <p className="text-sm font-semibold text-danger">
                  {templatesState.error.message}
                </p>
                <button
                  type="button"
                  onClick={templatesState.reload}
                  className="btn-secondary mt-4"
                >
                  {t.retry}
                </button>
              </div>
            )}

            {templates.length > 0 && (
              <div className="mt-6">
                <TemplatePicker
                  templates={templates}
                  selected={templateCode}
                  onSelect={(code) => {
                    setTemplateCode(code);
                    setStep(1);
                  }}
                />
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="max-w-xl">
            <h2 className="text-lg font-bold text-ink-900">
              {t.wizard.businessTitle}
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="label" htmlFor="business-name">
                  {t.wizard.businessName}
                </label>
                <input
                  id="business-name"
                  className="field"
                  required
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                />
                <p className="mt-1.5 text-xs text-ink-400">
                  {t.wizard.businessNameHint}
                </p>
                {fieldErrors.businessName && (
                  <p className="mt-1.5 text-xs font-semibold text-danger">
                    {fieldErrors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="business-slug">
                  {t.wizard.slug}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="business-slug"
                    className="field"
                    dir="ltr"
                    value={effectiveSlug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(event.target.value);
                      // The clash was about the old value; stop claiming it.
                      if (fieldErrors.slug) {
                        setFieldErrors(({ slug: _slug, ...rest }) => rest);
                        setError(null);
                      }
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  {slugTouched ? t.wizard.slugHint : t.wizard.slugAuto}
                </p>
                <p className="mt-1 text-xs text-ink-400" dir="ltr">
                  {effectiveSlug || "…"}.bbloom.ge
                </p>
                {!slugValid && (
                  <p className="mt-1.5 text-xs font-semibold text-danger">
                    {t.wizard.slugInvalid}
                  </p>
                )}
                {fieldErrors.slug && (
                  <p className="mt-1.5 text-xs font-semibold text-danger">
                    {fieldErrors.slug}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="max-w-xl">
            <h2 className="text-lg font-bold text-ink-900">
              {t.wizard.optionsTitle}
            </h2>

            <div className="mt-5 space-y-6">
              <div>
                <span className="label">{t.wizard.languages}</span>
                <p className="text-xs text-ink-400">{t.wizard.languagesHint}</p>

                <div className="mt-3 space-y-2">
                  {/* Selected languages first, in order, then the unselected
                      ones — the list itself is the setting. */}
                  {[
                    ...languages,
                    ...SITE_LANGUAGES.filter(
                      (language) => !languages.includes(language),
                    ),
                  ].map((language, index) => {
                    const checked = languages.includes(language);
                    return (
                      <div
                        key={language}
                        className={[
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                          checked
                            ? "border-bloom-200 bg-tint/50"
                            : "border-ink-100 bg-surface",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          id={`language-${language}`}
                          className="h-4 w-4 accent-bloom-600"
                          checked={checked}
                          onChange={() => toggleLanguage(language)}
                        />
                        <label
                          htmlFor={`language-${language}`}
                          className="flex-1 text-sm font-semibold text-ink-800"
                        >
                          {t.languageNames[language] ?? language}
                        </label>

                        {checked && index === 0 && (
                          <span className="rounded-full bg-bloom-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                            {t.detail.primary}
                          </span>
                        )}
                        {checked && index > 0 && (
                          <button
                            type="button"
                            onClick={() => makeDefault(language)}
                            className="text-xs font-semibold text-bloom-600 hover:text-bloom-700"
                          >
                            {t.wizard.moveUp}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-ink-400">
                  {t.wizard.languageOrderHint}
                </p>

                {languages.length === 0 ? (
                  <p className="mt-2 text-xs font-semibold text-danger">
                    {t.wizard.needOneLanguage}
                  </p>
                ) : (
                  <p className="mt-3 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-tint-fg">
                    {t.wizard.opensIn(
                      t.languageAdverbs[languages[0]] ?? languages[0],
                    )}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="site-currency">
                    {t.wizard.currency}
                  </label>
                  <input
                    id="site-currency"
                    className="field"
                    dir="ltr"
                    maxLength={3}
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="site-phone">
                    {t.wizard.contactPhone}
                  </label>
                  <input
                    id="site-phone"
                    className="field"
                    dir="ltr"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="site-email">
                  {t.wizard.contactEmail}
                </label>
                <input
                  id="site-email"
                  type="email"
                  className="field"
                  dir="ltr"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
                {fieldErrors.contactEmail && (
                  <p className="mt-1.5 text-xs font-semibold text-danger">
                    {fieldErrors.contactEmail}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-surface p-4">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-bloom-600"
                  checked={includeSampleContent}
                  onChange={(event) =>
                    setIncludeSampleContent(event.target.checked)
                  }
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-800">
                    {t.wizard.sampleContent}
                  </span>
                  <span className="mt-1 block text-xs text-ink-400">
                    {t.wizard.sampleContentHint}
                  </span>
                </span>
              </label>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="max-w-xl">
            <h2 className="text-lg font-bold text-ink-900">
              {t.wizard.reviewTitle}
            </h2>
            <p className="mt-1 text-sm text-ink-600">{t.wizard.reviewHint}</p>

            {template && (
              <div className="mt-5 overflow-hidden rounded-3xl border border-ink-100 bg-surface">
                <div className="aspect-[4/3] bg-ink-50">
                  <TemplatePreview
                    template={template}
                    label={t.wizard.noPreview}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-2 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ink-400">
                      {t.wizard.selectedTemplate}
                    </p>
                    <p className="font-bold text-ink-900">
                      {templateText(template, locale).name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-3">
                    {demoHref(template) && (
                      <a
                        href={demoHref(template) as string}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-bloom-600 hover:underline"
                      >
                        {t.wizard.demo}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-sm font-semibold text-bloom-600 hover:underline"
                    >
                      {t.wizard.slugEdit}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <dl className="mt-5 divide-y divide-ink-100 rounded-3xl border border-ink-100 bg-surface px-5">
              {[
                [t.wizard.businessName, businessName],
                [t.wizard.slug, `${effectiveSlug}.bbloom.ge`],
                // Only named here when the preview card above is absent,
                // which is the case if the catalog never loaded.
                ...(template ? [] : [[t.sites.template, templateCode]]),
                [
                  t.wizard.languages,
                  languages
                    .map((language) => t.languageNames[language] ?? language)
                    .join(" · "),
                ],
                [t.wizard.currency, currency.toUpperCase()],
                [t.wizard.contactEmail, contactEmail || "—"],
                [t.wizard.contactPhone, contactPhone || "—"],
                [
                  t.wizard.sampleContent,
                  includeSampleContent ? t.yes : t.no,
                ],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3"
                >
                  <dt className="text-sm text-ink-400">{label}</dt>
                  <dd className="text-sm font-semibold text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-tint-fg">
              {t.wizard.opensIn(
                t.languageAdverbs[languages[0]] ?? languages[0],
              )}
            </p>
          </section>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-5">
        <button
          type="button"
          className="btn-secondary disabled:opacity-50"
          disabled={step === 0}
          onClick={() => setStep((current) => (current - 1) as Step)}
        >
          {t.wizard.back}
        </button>

        {step < 3 ? (
          <button
            type="button"
            className="btn-primary disabled:opacity-50"
            disabled={
              (step === 0 && !canLeaveTemplate) ||
              (step === 1 && !canLeaveBusiness) ||
              (step === 2 && !canLeaveOptions)
            }
            onClick={() => setStep((current) => (current + 1) as Step)}
          >
            {t.wizard.next}
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary disabled:opacity-60"
            disabled={submitting || !canLeaveBusiness || !canLeaveOptions}
          >
            {submitting ? t.wizard.submitting : t.wizard.submit}
          </button>
        )}
      </div>
    </form>
  );
}
