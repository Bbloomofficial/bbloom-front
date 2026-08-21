import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../api/http";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { updateSite } from "../api/client";
import { SITE_LANGUAGES } from "../api/types";
import type { SiteDetail, SiteLanguage, UpdateSiteRequest } from "../api/types";
import { adminStrings } from "../strings";

/**
 * PATCH is a true partial update, so this form diffs against what was loaded
 * and sends only the keys that actually changed. Clearing a field sends an
 * explicit `null`, which is how the API distinguishes "erase this" from
 * "leave it alone".
 */

type Draft = {
  businessName: string;
  languages: SiteLanguage[];
  currency: string;
  contactEmail: string;
  contactPhone: string;
  contactAddressKa: string;
  contactAddressEn: string;
  mapUrl: string;
  seoTitleKa: string;
  seoTitleEn: string;
  seoDescriptionKa: string;
  seoDescriptionEn: string;
};

const TEXT_FIELDS = [
  "currency",
  "contactEmail",
  "contactPhone",
  "contactAddressKa",
  "contactAddressEn",
  "mapUrl",
  "seoTitleKa",
  "seoTitleEn",
  "seoDescriptionKa",
  "seoDescriptionEn",
] as const;

function toDraft(site: SiteDetail): Draft {
  return {
    businessName: site.businessName ?? "",
    languages: site.languages?.length ? site.languages : ["ka"],
    currency: site.currency ?? "",
    contactEmail: site.contactEmail ?? "",
    contactPhone: site.contactPhone ?? "",
    contactAddressKa: site.contactAddressKa ?? "",
    contactAddressEn: site.contactAddressEn ?? "",
    mapUrl: site.mapUrl ?? "",
    seoTitleKa: site.seoTitleKa ?? "",
    seoTitleEn: site.seoTitleEn ?? "",
    seoDescriptionKa: site.seoDescriptionKa ?? "",
    seoDescriptionEn: site.seoDescriptionEn ?? "",
  };
}

function diff(site: SiteDetail, draft: Draft): UpdateSiteRequest {
  const changes: UpdateSiteRequest = {};
  const original = toDraft(site);

  if (draft.businessName.trim() && draft.businessName !== original.businessName) {
    changes.businessName = draft.businessName.trim();
  }

  if (
    draft.languages.length > 0 &&
    draft.languages.join(",") !== original.languages.join(",")
  ) {
    changes.languages = draft.languages;
    // The site's default follows the first entry, and sending it explicitly
    // keeps an existing site consistent with how the wizard creates one.
    changes.defaultLanguage = draft.languages[0];
  }

  for (const field of TEXT_FIELDS) {
    const next = draft[field].trim();
    if (next === original[field].trim()) continue;
    // An emptied field is a request to clear it, which `null` says explicitly.
    changes[field] = next === "" ? null : next;
  }

  return changes;
}

export default function SettingsPanel({
  site,
  onSaved,
}: {
  site: SiteDetail;
  onSaved: (site: SiteDetail) => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { token } = useSession();

  const [draft, setDraft] = useState<Draft>(() => toDraft(site));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const changes = useMemo(() => diff(site, draft), [site, draft]);
  const dirty = Object.keys(changes).length > 0;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleLanguage(language: SiteLanguage) {
    const next = draft.languages.includes(language)
      ? draft.languages.filter((item) => item !== language)
      : [...draft.languages, language];
    if (next.length > 0) set("languages", next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const updated = await updateSite(token, site.id, changes);
      onSaved(updated);
      setDraft(toDraft(updated));
      setSaved(true);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setFieldErrors(caught.fields);
      } else {
        setError(String(caught));
      }
    } finally {
      setSaving(false);
    }
  }

  function textField(
    key: (typeof TEXT_FIELDS)[number] | "businessName",
    label: string,
    options: { ltr?: boolean; type?: string; textarea?: boolean } = {},
  ) {
    const id = `site-${key}`;
    return (
      <div>
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {options.textarea ? (
          <textarea
            id={id}
            rows={2}
            className="field"
            value={draft[key]}
            onChange={(event) => set(key, event.target.value)}
          />
        ) : (
          <input
            id={id}
            type={options.type ?? "text"}
            dir={options.ltr ? "ltr" : undefined}
            className="field"
            value={draft[key]}
            onChange={(event) => set(key, event.target.value)}
          />
        )}
        {fieldErrors[key] && (
          <p className="mt-1.5 text-xs font-semibold text-danger">
            {fieldErrors[key]}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card hover:border-ink-100 hover:shadow-none" noValidate>
      <h2 className="text-lg font-bold text-ink-900">{t.detail.settings}</h2>
      <p className="mt-1 text-sm text-ink-400">{t.detail.settingsHint}</p>

      <div className="mt-5 space-y-5">
        {textField("businessName", t.detail.businessName)}

        <div>
          <span className="label">{t.detail.languages}</span>
          <div className="flex flex-wrap gap-2">
            {[
              ...draft.languages,
              ...SITE_LANGUAGES.filter(
                (language) => !draft.languages.includes(language),
              ),
            ].map((language, index) => {
              const checked = draft.languages.includes(language);
              return (
                <span
                  key={language}
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
                    checked
                      ? "border-bloom-200 bg-tint/50"
                      : "border-ink-100 bg-surface",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    id={`settings-language-${language}`}
                    className="h-4 w-4 accent-bloom-600"
                    checked={checked}
                    onChange={() => toggleLanguage(language)}
                  />
                  <label
                    htmlFor={`settings-language-${language}`}
                    className="font-semibold text-ink-800"
                  >
                    {t.languageNames[language] ?? language}
                  </label>
                  {checked && index === 0 && (
                    <span className="rounded-full bg-bloom-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {t.detail.primary}
                    </span>
                  )}
                  {checked && index > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        set("languages", [
                          language,
                          ...draft.languages.filter((item) => item !== language),
                        ])
                      }
                      className="text-xs font-semibold text-bloom-600 hover:text-bloom-700"
                    >
                      {t.wizard.moveUp}
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {t.wizard.opensIn(
              t.languageAdverbs[draft.languages[0]] ?? draft.languages[0],
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textField("currency", t.detail.currency, { ltr: true })}
          {textField("contactPhone", t.detail.contactPhone, { ltr: true })}
          {textField("contactEmail", t.detail.contactEmail, {
            ltr: true,
            type: "email",
          })}
          {textField("mapUrl", t.detail.mapUrl, { ltr: true })}
          {textField("contactAddressKa", t.detail.addressKa)}
          {textField("contactAddressEn", t.detail.addressEn)}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400">
            {t.detail.seo}
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {textField("seoTitleKa", t.detail.seoTitleKa)}
            {textField("seoTitleEn", t.detail.seoTitleEn)}
            {textField("seoDescriptionKa", t.detail.seoDescriptionKa, {
              textarea: true,
            })}
            {textField("seoDescriptionEn", t.detail.seoDescriptionEn, {
              textarea: true,
            })}
          </div>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          className="btn-primary disabled:opacity-50"
          disabled={!dirty || saving}
        >
          {saving ? t.saving : t.save}
        </button>
        <span className="text-xs text-ink-400">
          {saved && !dirty ? t.saved : !dirty ? t.detail.noChanges : ""}
        </span>
      </div>
    </form>
  );
}
