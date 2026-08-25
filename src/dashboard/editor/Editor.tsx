import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { publishErrorMessage } from "../gate";
import { dashboardStrings } from "../strings";
import { useActiveSite } from "../site";
import { useResource } from "../hooks";
import { useStarvationWarning } from "../../hooks/useStarvationWarning";
import {
  deleteMedia,
  discardSections,
  fetchSections,
  fetchSiteDetail,
  publishSections,
  reorderSections,
  resetSection,
  updateSection,
  uploadMedia,
} from "../api/client";
import type { SectionDto, SiteLanguage } from "../api/types";
import { FieldList } from "./fields";
import type { FieldContext } from "./fields";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewDevice } from "./PreviewFrame";
import { editorStrings } from "./strings";
import { ImagePicker } from "../../site/editing/ImagePicker";
import { sectionTargets, splitTargetId } from "./targets";
import {
  collectMediaIds,
  resolvePending,
  type PendingImage,
} from "./pending";

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
  const { token, handleError, user } = useSession();
  const activeSite = useActiveSite();
  const siteId = activeSite.id;
  const shell = dashboardStrings(locale);
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
  const [mode, setMode] = useState<"edit" | "review">("edit");
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);

  /**
   * Pictures chosen but not uploaded. A ref rather than state: it must survive
   * every keystroke re-render, and nothing renders from it directly except
   * through `pendingUrl`.
   */
  const pending = useRef(new Map<string, PendingImage>());
  const fieldsPaneRef = useStarvationWarning("site editor fields");
  const [pickResolve, setPickResolve] = useState<
    ((value: unknown) => void) | null
  >(null);

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

  /*
    Re-read the page when this window is focused again.

    The editor is its own window now, so two of them open on one website is no
    longer a contrived case — it is one extra click on the dashboard tab. Two
    windows each holding their own copy of the sections means the second one to
    save wins with content that was loaded before the first one wrote, and the
    client is never told.

    This does not make saving safe; it narrows the window in the one case where
    narrowing is free. Refetching is refused outright while there are unsaved
    edits here, because pulling the other window's copy over something the
    client is part-way through typing would destroy work to prevent losing it.
    An untouched window has nothing to lose, so it takes the newer copy.

    The real fix is the server refusing a write made against a stale revision.
    That needs a version on the section payload, which does not exist yet.
  */
  const reloadSections = loaded.reload;
  useEffect(() => {
    function onFocus() {
      if (dirty || saving) return;
      reloadSections();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dirty, saving, reloadSections]);

  const selected = sections.find((section) => section.key === selectedKey);
  const selectedIndex = sections.findIndex(
    (section) => section.key === selectedKey,
  );

  /*
    Preview mode hands the whole window to the page.

    Asked for directly: "when clicking preview hide the editor side panel on
    that page". It is also what the mode already means — review mode strips the
    hotspots so the preview behaves exactly as a visitor's browser would, and
    leaving a column of inputs beside it contradicts that. The toggle lives in
    the preview's own toolbar, so the way back is on screen the whole time.
  */
  const panelOpen = mode === "edit";

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

  /**
   * A picture that no field points at any more is dead weight in the client's
   * media library and on our disk, so replacing one deletes the old file. It is
   * checked against every other section first: the same logo legitimately
   * appears in the header and the footer, and deleting it because one of them
   * changed would break the other.
   */
  async function dropUnusedMedia(
    sectionKey: string,
    before: Record<string, unknown>,
    after: unknown,
  ) {
    const removed = collectMediaIds(before);
    for (const id of collectMediaIds(after)) removed.delete(id);
    if (removed.size === 0) return;

    const elsewhere = new Set<string>();
    for (const section of sections) {
      if (section.key === sectionKey) continue;
      collectMediaIds(section.content, elsewhere);
    }

    for (const id of removed) {
      if (elsewhere.has(id)) continue;
      try {
        await deleteMedia(token, siteId, id);
      } catch {
        // A picture we failed to delete is untidy, not broken — the client's
        // edit is already saved and telling them about our housekeeping would
        // only be noise.
      }
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const resolved = (await resolvePending(
        draftContent,
        async (image) => {
          const media = await uploadMedia(token, siteId, image.file, {
            [activeLang]: image.file.name,
          });
          return media.id;
        },
        pending.current,
      )) as Record<string, unknown>;

      const previous = selected.content ?? {};
      const updated = await updateSection(token, siteId, selected.key, {
        content: resolved,
      });
      applySection(updated);
      setDraftContent(updated.content ?? resolved);
      for (const image of pending.current.values()) {
        URL.revokeObjectURL(image.url);
      }
      pending.current.clear();
      setHasDraft(true);
      setDirty(false);
      setSavedAt(Date.now());
      refreshPreview();
      await dropUnusedMedia(selected.key, previous, resolved);
    } catch (cause) {
      handleError(cause);
      setError(describeProblem(cause, t.errors, t.saveFailed));
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
      // A refused publish is the one failure here whose reason lives in the
      // subscription rather than in the response, so it is named from state.
      setError(
        publishErrorMessage(
          cause,
          activeSite,
          user.emailVerified,
          shell.gate.blocked,
          () => describeProblem(cause, t.errors, t.saveFailed),
        ),
      );
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
    requestImage: () =>
      new Promise<unknown>((resolve) => {
        setPickResolve(() => resolve);
      }),
    pendingUrl: (key) => pending.current.get(key)?.url ?? null,
  };

  const targets = useMemo(
    () => sectionTargets(sections, activeLang),
    [sections, activeLang],
  );

  const onSelectHotspot = useCallback((id: string) => {    const found = splitTargetId(id);
    if (!found) return;
    setSelectedKey(found.sectionKey);
    setFocusPath(found.path);
  }, []);

  // Runs after the panel has re-rendered for the newly selected section, which
  // is why it waits on `focusPath` rather than doing this inside the click.
  useEffect(() => {
    if (!focusPath) return;
    const wrapper = document.querySelector(
      `[data-field-path="${CSS.escape(focusPath)}"]`,
    );
    if (!wrapper) return;
    wrapper.scrollIntoView({ block: "center", behavior: "smooth" });
    const input = wrapper.querySelector<HTMLElement>(
      "input, textarea, select, button",
    );
    input?.focus();
    setFocusPath(null);
  }, [focusPath, selectedKey, draftContent]);

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
          className="btn btn-primary"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  /*
    A workspace, not a document: one panel of fields and a preview that gets
    every pixel left over.

    It used to be three columns — a 16rem section list, a 22rem field form and
    the preview in whatever remained. Measured on a 1031px window that left the
    preview *56px* wide and the iframe inside it *28px*, so the page being
    edited was a sliver. The section list is now a chooser at the top of the
    panel, which buys the preview a whole column back.

    Read `flex-1` here together with `EditorWindow`, which hosts this in a
    window of its own: from `lg` that shell is a fixed-height flex column, so
    the remainder is a real one rather than unbounded. Below `lg` it stays a
    normal scrolling page. This component no longer renders inside the
    dashboard shell at all.
  */
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-ink-100 bg-sunken px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-ink-900">{t.title}</h1>
          <p className="text-xs text-ink-400">{t.subtitle}</p>
        </div>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              hasDraft
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
            }`}
          >
            {hasDraft ? t.unpublished : t.allPublished}
          </span>
          <button
            type="button"
            onClick={discard}
            disabled={!hasDraft || busy}
            className="rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-500 transition hover:border-red-300 hover:text-red-600 active:scale-95 disabled:opacity-40"
          >
            {t.discard}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!hasDraft || busy}
            className="rounded-xl bg-bloom-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-bloom-600/20 transition hover:bg-bloom-700 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            {busy ? t.publishing : t.publish}
          </button>
        </div>
      </header>

      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div
        className={`grid min-h-0 flex-1 ${
          panelOpen ? "lg:grid-cols-[24rem_1fr]" : "lg:grid-cols-1"
        }`}
      >
        {panelOpen ? (
          <aside className="flex min-h-0 flex-col border-b border-ink-100 bg-surface lg:border-b-0 lg:border-e">
            {/* The section list was a column of its own. As a chooser it costs
                one row instead, and the reorder arrows act on whichever
                section is chosen — the same two operations, without spending a
                quarter of the window on a list of fourteen names. */}
            <div className="flex items-center gap-1 border-b border-ink-100 p-3">
              <select
                value={selectedKey ?? ""}
                onChange={(event) => setSelectedKey(event.target.value)}
                aria-label={t.sections}
                className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-900 transition hover:border-bloom-300"
              >
                {sections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {sectionLabel(section, uiLang)}
                    {section.hasDraft ? ` · ${t.edited}` : ""}
                    {!section.visible ? ` · ${t.hidden}` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void move(selectedIndex, -1)}
                disabled={selectedIndex <= 0 || busy}
                aria-label={t.moveUp}
                title={t.moveUp}
                className="icon-button h-10 w-10 shrink-0"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => void move(selectedIndex, 1)}
                disabled={
                  selectedIndex < 0 ||
                  selectedIndex === sections.length - 1 ||
                  busy
                }
                aria-label={t.moveDown}
                title={t.moveDown}
                className="icon-button h-10 w-10 shrink-0"
              >
                ▼
              </button>
            </div>

            {!selected ? (
              <p className="p-4 text-sm text-ink-400">{t.selectSection}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
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
                  <div className="flex items-center gap-2 px-4 pt-3">
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

                {/* The panel is the only thing that scrolls on a desktop, which
                    is what lets the preview stay put while you work down a long
                    section.

                    Not capped on a phone: a vh-height inner scroller inside a
                    page that already scrolls fights the native gesture, and it
                    is the same shape as the try-editor bug. If this ever looks
                    cramped on a phone, do not reach for dvh or svh: they
                    resolve smaller than vh, so on a pane sized as a remainder
                    they make the symptom worse. The long version of that
                    argument is in TryEditor.tsx. */}
                <div
                  ref={fieldsPaneRef}
                  className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
                  onFocusCapture={(event) => {
                    const wrapper = (event.target as HTMLElement).closest(
                      "[data-field-path]",
                    );
                    const path = wrapper?.getAttribute("data-field-path");
                    setActivePath(path ? `${selected.key}::${path}` : null);
                  }}
                  onBlurCapture={(event) => {
                    // Only clear when focus leaves the field list altogether,
                    // so tabbing between inputs does not flicker the highlight.
                    const next = event.relatedTarget as Node | null;
                    if (!next || !event.currentTarget.contains(next)) {
                      setActivePath(null);
                    }
                  }}
                >
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

                {/* Sticky to the bottom of the screen while you are inside the
                    field list. It used to sit in flow at the end of it, which
                    put the primary action of the screen ~900px below the fold
                    on a phone: you could not tell a saved page from an unsaved
                    one without scrolling to find out. At lg it is the panel's
                    own footer, so it is on screen whatever the section. */}
                <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t border-ink-100 bg-surface px-4 pb-4 pt-3 lg:static">
                  <button
                    type="button"
                    onClick={() => void save()}
                    disabled={!dirty || saving}
                    className="inline-flex min-h-11 items-center rounded-xl bg-bloom-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bloom-700 active:scale-95 disabled:opacity-40 lg:min-h-0"
                  >
                    {saving ? t.saving : t.save}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={busy}
                    className="inline-flex min-h-11 items-center rounded-xl border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-500 transition hover:border-bloom-300 hover:bg-tint hover:text-bloom-600 active:scale-95 disabled:opacity-40 lg:min-h-0"
                  >
                    {t.reset}
                  </button>
                  <span className="text-xs text-ink-400">
                    {dirty ? t.unsaved : savedAt ? t.saved : ""}
                  </span>
                </div>
              </>
            )}
          </aside>
        ) : null}

        <section className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden bg-surface lg:min-h-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-3 py-2">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-400">
              {t.preview}
            </h2>
            <div className="ms-auto flex flex-wrap gap-2">
              <Toggle
                value={mode}
                onChange={setMode}
                options={[
                  { value: "edit" as const, label: t.modeEdit },
                  { value: "review" as const, label: t.modeReview },
                ]}
              />
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
                hotspots={mode === "edit" && showDraft ? targets : undefined}
                onSelectHotspot={onSelectHotspot}
                hotspotTextLabel={t.hotspotText}
                hotspotImageLabel={t.hotspotImage}
                activeHotspot={activePath}
              />
            ) : null}
          </div>
          {mode === "edit" ? (
            <p className="border-t border-ink-100 px-3 py-2 text-xs text-ink-400">
              {showDraft ? t.editModeHint : t.editModeLiveHint}
            </p>
          ) : null}
        </section>
      </div>

      {pickResolve ? (
        <ImagePicker
          labels={{
            title: t.imageTitle,
            fromFile: t.imageFromFile,
            fromLink: t.imageFromLink,
            linkPlaceholder: t.imageLinkPlaceholder,
            linkUse: t.imageLinkUse,
            linkFailed: t.imageLinkFailed,
            cancel: t.cancel,
            note: t.imagePending,
          }}
          onPick={(file) => {
            const key = `p${Date.now()}-${Math.random().toString(36).slice(2)}`;
            pending.current.set(key, { file, url: URL.createObjectURL(file) });
            pickResolve({ pendingUpload: key });
            setPickResolve(null);
            setDirty(true);
          }}
          onClose={() => {
            pickResolve(null);
            setPickResolve(null);
          }}
        />
      ) : null}
    </div>
  );
}
