import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { useActiveSite } from "../site";
import { useResource } from "../hooks";
import {
  discardSections,
  fetchSections,
  fetchSiteDetail,
  publishSections,
  reorderSections,
  resetSection,
  updateSection,
} from "../api/client";
import type { SectionDto, SiteLanguage } from "../api/types";
import { FieldList } from "./fields";
import type { FieldContext } from "./fields";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewDevice } from "./PreviewFrame";
import { editorStrings } from "./strings";

/**
 * The page editor. Every write goes into the section draft, so a client can
 * work on their page for as long as they like without the public site moving
 * under their visitors — then publish the lot in one go.
 */

function sectionLabel(section: SectionDto, locale: SiteLanguage) {
  return (
    section.label?.[locale] ??
    section.label?.en ??
    section.label?.ka ??
    section.key
  );
}

const chipClass =
  "rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40";

function Toggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-xl border border-ink-100 bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`${chipClass} ${
            value === option.value
              ? "bg-tint text-tint-fg"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Editor() {
  const { locale } = useI18n();
  const t = editorStrings(locale);
  const { token, handleError } = useSession();
  const siteId = useActiveSite().id;
  const uiLang: SiteLanguage = locale === "en" ? "en" : "ka";

  const site = useResource(
    () => fetchSiteDetail(token, siteId),
    [token, siteId],
  );
  const loaded = useResource(
    () => fetchSections(token, siteId),
    [token, siteId],
  );

  const [sections, setSections] = useState<SectionDto[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [showDraft, setShowDraft] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);

  const languages = useMemo<SiteLanguage[]>(() => {
    const listed = site.data?.languages ?? [];
    const preferred = site.data?.defaultLanguage;
    // The site's own default comes first, so the editor opens on the language
    // the client actually writes in.
    const ordered = preferred
      ? [preferred, ...listed.filter((item) => item !== preferred)]
      : listed;
    return ordered.length > 0 ? ordered : ["ka"];
  }, [site.data]);
  const [editLang, setEditLang] = useState<SiteLanguage | null>(null);
  const activeLang = editLang ?? languages[0];

  useEffect(() => {
    const list = loaded.data;
    if (!list) return;
    setSections(list);
    setHasDraft(list.some((section) => section.hasDraft));
    setSelectedKey((current) =>
      current && list.some((section) => section.key === current)
        ? current
        : (list[0]?.key ?? null),
    );
  }, [loaded.data]);

  useEffect(() => {
    if (site.data?.hasUnpublishedChanges) setHasDraft(true);
  }, [site.data]);

  const selected = sections.find((section) => section.key === selectedKey);

  // Swapping sections drops any half-typed edit, so the panel always shows what
  // the server holds for the section on screen.
  useEffect(() => {
    setDraftContent(selected?.content ?? {});
    setDirty(false);
    setError(null);
  }, [selectedKey, selected?.updatedAt]);

  const applySection = useCallback((updated: SectionDto) => {
    setSections((current) =>
      current.map((section) =>
        section.key === updated.key ? updated : section,
      ),
    );
  }, []);

  const refreshPreview = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSection(token, siteId, selected.key, {
        content: draftContent,
      });
      applySection(updated);
      setHasDraft(true);
      setDirty(false);
      setSavedAt(Date.now());
      refreshPreview();
    } catch (cause) {
      handleError(cause);
      setError(cause instanceof Error ? cause.message : t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      refreshPreview();
    } catch (cause) {
      handleError(cause);
      setError(cause instanceof Error ? cause.message : t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  const toggleVisible = (section: SectionDto) =>
    run(async () => {
      const updated = await updateSection(token, siteId, section.key, {
        visible: !section.visible,
      });
      applySection(updated);
      setHasDraft(true);
    });

  const move = (index: number, by: number) =>
    run(async () => {
      const target = index + by;
      if (target < 0 || target >= sections.length) return;
      const next = [...sections];
      [next[index], next[target]] = [next[target], next[index]];
      setSections(next);
      const updated = await reorderSections(
        token,
        siteId,
        next.map((section) => section.key),
      );
      setSections(updated);
      setHasDraft(true);
    });

  const reset = () => {
    if (!selected || !window.confirm(t.resetConfirm)) return;
    void run(async () => {
      const updated = await resetSection(token, siteId, selected.key);
      applySection(updated);
      setDraftContent(updated.content ?? {});
      setDirty(false);
      setHasDraft(true);
    });
  };

  const publish = () =>
    run(async () => {
      const state = await publishSections(token, siteId);
      setHasDraft(state.hasDraft);
      loaded.reload();
      site.reload();
    });

  const discard = () => {
    if (!window.confirm(t.discardConfirm)) return;
    void run(async () => {
      const state = await discardSections(token, siteId);
      setHasDraft(state.hasDraft);
      loaded.reload();
      site.reload();
    });
  };

  const ctx: FieldContext = {
    t,
    uiLang,
    editLang: activeLang,
    languages,
    siteId,
    token,
  };

  if (loaded.loading && sections.length === 0) {
    return <p className="text-sm text-ink-400">{t.loading}</p>;
  }

  if (loaded.error && sections.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-500">{t.loadFailed}</p>
        <button
          type="button"
          onClick={loaded.reload}
          className="rounded-xl bg-bloom-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="sticky top-16 z-30 -mx-4 flex flex-wrap items-end gap-3 border-b border-ink-100 bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink-900">{t.title}</h1>
          <p className="text-sm text-ink-400">{t.subtitle}</p>
        </div>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              hasDraft
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {hasDraft ? t.unpublished : t.allPublished}
          </span>
          <button
            type="button"
            onClick={discard}
            disabled={!hasDraft || busy}
            className="rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40"
          >
            {t.discard}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!hasDraft || busy}
            className="rounded-xl bg-bloom-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bloom-700 disabled:opacity-40"
          >
            {busy ? t.publishing : t.publish}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[16rem_22rem_1fr]">
        <aside className="rounded-2xl border border-ink-100 bg-surface p-2">
          <h2 className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
            {t.sections}
          </h2>
          <ul className="max-h-[18rem] space-y-0.5 overflow-y-auto sm:max-h-[32rem] lg:max-h-[60vh]">
            {sections.map((section, index) => {
              const active = section.key === selectedKey;
              return (
                <li key={section.key} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedKey(section.key)}
                    className={`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-start text-sm font-semibold transition ${
                      active
                        ? "bg-tint text-tint-fg"
                        : "text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    <span className="block truncate">
                      {sectionLabel(section, uiLang)}
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {section.hasDraft ? (
                        <span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">
                          {t.edited}
                        </span>
                      ) : null}
                      {!section.visible ? (
                        <span className="rounded bg-ink-100 px-1.5 text-[10px] font-bold text-ink-500">
                          {t.hidden}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <span className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => void move(index, -1)}
                      disabled={index === 0 || busy}
                      aria-label={t.moveUp}
                      className="px-1 text-xs text-ink-300 transition hover:text-bloom-600 disabled:opacity-25"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => void move(index, 1)}
                      disabled={index === sections.length - 1 || busy}
                      aria-label={t.moveDown}
                      className="px-1 text-xs text-ink-300 transition hover:text-bloom-600 disabled:opacity-25"
                    >
                      ▼
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-2xl border border-ink-100 bg-surface p-4">
          {!selected ? (
            <p className="text-sm text-ink-400">{t.selectSection}</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-ink-900">
                  {sectionLabel(selected, uiLang)}
                </h2>
                <button
                  type="button"
                  onClick={() => void toggleVisible(selected)}
                  disabled={busy}
                  className="ms-auto rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-500 transition hover:border-bloom-300 hover:text-bloom-600 disabled:opacity-40"
                >
                  {selected.visible ? t.hide : t.show}
                </button>
              </div>

              {languages.length > 1 ? (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-400">
                    {t.contentLanguage}
                  </span>
                  <Toggle
                    value={activeLang}
                    onChange={setEditLang}
                    options={languages.map((language) => ({
                      value: language,
                      label: language.toUpperCase(),
                    }))}
                  />
                </div>
              ) : null}

              <div className="max-h-[60vh] overflow-y-auto pe-1">
                <FieldList
                  fields={selected.fields ?? []}
                  content={draftContent}
                  onChange={(next) => {
                    setDraftContent(next);
                    setDirty(true);
                  }}
                  ctx={ctx}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={!dirty || saving}
                  className="rounded-xl bg-bloom-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bloom-700 disabled:opacity-40"
                >
                  {saving ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="rounded-xl border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-500 transition hover:border-bloom-300 hover:text-bloom-600 disabled:opacity-40"
                >
                  {t.reset}
                </button>
                <span className="text-xs text-ink-400">
                  {dirty ? t.unsaved : savedAt ? t.saved : ""}
                </span>
              </div>
            </>
          )}
        </section>

        <section className="flex min-h-[42rem] flex-col overflow-hidden rounded-2xl border border-ink-100 bg-surface lg:h-[calc(100vh-11rem)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-3 py-2">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-400">
              {t.preview}
            </h2>
            <div className="ms-auto flex flex-wrap gap-2">
              <Toggle
                value={showDraft ? "draft" : "live"}
                onChange={(next) => setShowDraft(next === "draft")}
                options={[
                  { value: "draft", label: t.draftView },
                  { value: "live", label: t.liveView },
                ]}
              />
              <Toggle
                value={device}
                onChange={setDevice}
                options={[
                  { value: "desktop", label: t.desktop },
                  { value: "phone", label: t.phone },
                ]}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1">
            {site.data ? (
              <PreviewFrame
                siteId={siteId}
                lang={activeLang}
                draft={showDraft}
                device={device}
                revision={revision}
                focusKey={selectedKey ?? undefined}
                title={t.preview}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
