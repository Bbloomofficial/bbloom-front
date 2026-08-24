import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import PasswordField from "../components/PasswordField";
import { useStarvationWarning } from "../hooks/useStarvationWarning";
import { describeProblem } from "../api/problem";
import { fetchTemplates } from "../api/templates";
import { fetchSite } from "../site/api/client";
import type { PublicSection, SitePayload } from "../site/api/types";
import { SiteBody } from "../site/SitePage";
import { attachHotspots, highlightHotspot } from "../site/editing/hotspots";
import type { HotspotTarget } from "../site/editing/hotspots";
import { ImagePicker } from "../site/editing/ImagePicker";
import { loginAccount, registerAccount } from "../dashboard/api/account";
import { storeSession, readStoredAccount } from "../dashboard/auth";
import {
  applyDraftToPayload,
  clearDraft,
  clearField,
  DraftTooLargeError,
  emptyDraft,
  isFieldEdited,
  readDraft,
  readPath,
  sectionEditCount,
  setImage,
  setText,
  writeDraft,
} from "../try/draft";
import type { TryDraft } from "../try/draft";
import { deriveFields, itemSummary, sectionLabel } from "../try/schema";
import type { EditableField } from "../try/schema";
import { SITE_SCOPE, siteSection, siteSectionLabel } from "../try/siteFields";
import { fileToDraftImage, ImageTooLargeError } from "../try/image";
import { applyDraftToNewSite } from "../try/apply";
import type { ApplyProgress } from "../try/apply";
import { tryStrings } from "../try/strings";
import type { TryStrings } from "../try/strings";
import { dashPath } from "../routes";

/**
 * Editing a website before there is an account to own it.
 *
 * The preview is the real site renderer fed a locally modified payload, not a
 * lookalike — what someone sees while editing is exactly what their visitors
 * will get, which is the whole promise of the flow.
 */

const inputClass =
  "w-full rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200";

/** Stable, valid element id for a field, so a click in the preview can focus it. */
function fieldDomId(sectionKey: string, path: string): string {
  return `bb-field-${sectionKey}-${path}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function FieldInput({
  field,
  domId,
  value,
  edited,
  onText,
  onImage,
  onReset,
  t,
}: {
  field: EditableField;
  domId: string;
  value: string;
  edited: boolean;
  onText: (next: string) => void;
  onImage: () => void;
  onReset: () => void;
  t: TryStrings;
}) {
  // The draft is an overlay, so "undo" restores the design's own value exactly
  // rather than guessing at what was there — worth offering per field.
  const label = (
    <span className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-ink-500">{field.label}</span>
      {edited ? (
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 text-xs font-semibold text-ink-400 underline-offset-4 transition hover:text-ink-900 hover:underline"
        >
          ↺ {t.reset}
        </button>
      ) : null}
    </span>
  );

  if (field.kind === "image") {
    return (
      <div data-field-path={field.path}>
        {label}
        <div className="mt-2 flex items-center gap-3">
          {value ? (
            <img
              src={value}
              alt=""
              className="h-14 w-20 shrink-0 rounded-lg border border-ink-100 bg-ink-50 object-cover"
            />
          ) : null}
          <button
            type="button"
            id={domId}
            className="btn-secondary btn-sm"
            onClick={onImage}
          >
            {t.replaceImage}
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className="block" data-field-path={field.path}>
      {label}
      {field.kind === "textarea" ? (
        <textarea
          id={domId}
          className={`${inputClass} mt-1.5 min-h-24`}
          value={value}
          onChange={(event) => onText(event.target.value)}
        />
      ) : (
        <input
          id={domId}
          className={`${inputClass} mt-1.5`}
          value={value}
          onChange={(event) => onText(event.target.value)}
        />
      )}
    </label>
  );
}

type SaveState =
  | { phase: "idle" }
  | { phase: "signedIn"; token: string; email: string }
  | { phase: "form"; mode: "register" | "signin" }
  | { phase: "working"; progress: ApplyProgress }
  | { phase: "done"; slug: string; siteId: string; publishError: string | null };

export default function TryEditor() {
  const { code = "" } = useParams<{ code: string }>();
  const { locale } = useI18n();
  const t = tryStrings(locale);
  const navigate = useNavigate();
  const lang: "ka" | "en" = locale === "en" ? "en" : "ka";

  const [payload, setPayload] = useState<SitePayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState<TryDraft | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [notice, setNotice] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ phase: "idle" });
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"edit" | "review">("edit");
  const [imagePick, setImagePick] = useState<{
    sectionKey: string;
    path: string;
  } | null>(null);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fieldsPaneRef = useStarvationWarning("try editor fields");

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    (async () => {
      const templates = await fetchTemplates();
      const template = templates.find((item) => item.code === code);
      const demoRef = template?.demoSlug;
      if (!demoRef) throw new Error("no-demo");
      const site = await fetchSite(demoRef, lang);
      if (cancelled) return;

      setPayload(site);
      const existing = readDraft();
      setDraft(
        existing && existing.templateCode === code
          ? { ...existing, lang }
          : emptyDraft(code, demoRef, lang),
      );
      setSelected((current) => current ?? site.sections[0]?.key ?? null);
    })().catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  // Every edit is persisted immediately: someone building a website in a tab
  // they might close is exactly who this flow is for.
  const commit = useCallback((next: TryDraft) => {
    setDraft(next);
    try {
      writeDraft(next);
      setNotice(null);
    } catch (error) {
      if (error instanceof DraftTooLargeError) setNotice("full");
    }
  }, []);

  const preview = useMemo(
    () => (payload && draft ? applyDraftToPayload(payload, draft) : payload),
    [payload, draft],
  );

  /**
   * The sections on the page plus one synthetic "contact & links" section for
   * the details that live on the site rather than in any section.
   */
  const editable = useMemo<PublicSection[]>(
    () => (preview ? [...preview.sections, siteSection(preview)] : []),
    [preview],
  );

  const section: PublicSection | null = useMemo(
    () =>
      editable.find((item) => item.key === selected) ?? editable[0] ?? null,
    [editable, selected],
  );

  const labelOf = useCallback(
    (item: PublicSection) =>
      item.key === SITE_SCOPE ? siteSectionLabel(lang) : sectionLabel(item, lang),
    [lang],
  );

  const fields = useMemo(
    () => (section ? deriveFields(section, lang) : []),
    [section, lang],
  );

  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      { label: string; groupPath?: string; fields: EditableField[] }
    >();
    for (const field of fields) {
      const key = field.group ?? "";
      const group = groups.get(key) ?? {
        label: key,
        groupPath: field.groupPath,
        fields: [],
      };
      group.fields.push(field);
      groups.set(key, group);
    }
    return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
  }, [fields]);

  const totalEdits = useMemo(
    () =>
      draft
        ? editable.reduce(
            (sum, item) => sum + sectionEditCount(draft, item.key),
            0,
          ) + (draft.businessName.trim() ? 1 : 0)
        : 0,
    [draft, editable],
  );

  // Collapsed by default beyond the first block: six menu entries expanded at
  // once buries the rest of the section under a scroll.
  const isOpen = (key: string, index: number) =>
    open[`${section?.key}:${key}`] ?? index === 0;

  /**
   * Every editable value on the page, not just the section on screen in the
   * panel — clicking a heading three sections down is exactly how someone
   * finds the field for it.
   */
  const targets = useMemo<HotspotTarget[]>(() => {
    const list: HotspotTarget[] = [];
    for (const item of editable) {
      for (const field of deriveFields(item, lang)) {
        const raw = readPath(item.content ?? {}, field.path);
        const value =
          field.kind === "image"
            ? ((raw as Record<string, unknown> | null)?.url as string) ?? ""
            : String(raw ?? "");
        if (!value) continue;
        list.push({
          id: `${item.key}::${field.path}`,
          kind: field.kind === "image" ? "image" : "text",
          value,
        });
      }
    }
    return list;
  }, [editable, lang]);

  const onSelectHotspot = useCallback(
    (id: string) => {
      const [sectionKey, path] = id.split("::");
      const target = editable.find((item) => item.key === sectionKey);
      if (!target) return;
      const field = deriveFields(target, lang).find(
        (item) => item.path === path,
      );
      setSelected(sectionKey);
      if (field?.group) {
        setOpen((current) => ({
          ...current,
          [`${sectionKey}:${field.group}`]: true,
        }));
      }
      if (field?.kind === "image") setImagePick({ sectionKey, path });
      else setFocusField(id);
    },
    [editable, lang],
  );

  useEffect(() => {
    const root = previewRef.current;
    if (!root || mode !== "edit") return;
    return attachHotspots(root, targets, {
      onSelect: onSelectHotspot,
      textLabel: t.hotspotText,
      imageLabel: t.hotspotImage,
    });
  }, [targets, mode, onSelectHotspot, t.hotspotText, t.hotspotImage]);

  // The other direction: the field with the cursor lights up on the page.
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    highlightHotspot(root, mode === "edit" ? activeField : null);
  }, [activeField, mode, targets]);

  // The panel has to have re-rendered with the clicked section before its input
  // exists to be focused.
  useEffect(() => {
    if (!focusField) return;
    const [sectionKey, path] = focusField.split("::");
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(fieldDomId(sectionKey, path));
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      (element as HTMLInputElement | null)?.focus?.();
      setFocusField(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [focusField, section]);

  async function onPickImage(sectionKey: string, path: string, file: File) {
    if (!draft) return;
    try {
      const image = await fileToDraftImage(file);
      commit(setImage(draft, sectionKey, path, image));
    } catch (error) {
      setNotice(error instanceof ImageTooLargeError ? "large" : "failed");
    }
  }

  async function finish(token: string, back: SaveState) {
    if (!draft) return;
    setSave({
      phase: "working",
      progress: { ratio: 0, step: "creating" },
    });
    try {
      const result = await applyDraftToNewSite(token, draft, (progress) =>
        setSave({ phase: "working", progress }),
      );
      clearDraft();
      setSave({
        phase: "done",
        slug: result.slug,
        siteId: result.siteId,
        publishError: result.publishError,
      });
    } catch (error) {
      setFormError(describeProblem(error, t.errors, t.saveFailed));
      setSave(back);
    }
  }

  async function onSubmitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.phase !== "form") return;
    const data = new FormData(event.currentTarget);
    // This one form both registers and signs in, and the two throttles are
    // keyed differently, so the error has to know which button was pressed.
    const authAction = save.mode === "register" ? "signUp" : "signIn";
    setBusy(true);
    setFormError(null);
    try {
      const response =
        save.mode === "register"
          ? await registerAccount({
              fullName: String(data.get("fullName") ?? ""),
              email: String(data.get("email") ?? ""),
              password: String(data.get("password") ?? ""),
              language: locale,
            })
          : await loginAccount(
              String(data.get("email") ?? ""),
              String(data.get("password") ?? ""),
            );
      storeSession(response);
      await finish(response.token, save);
    } catch (error) {
      setFormError(
        describeProblem(error, t.errors, t.saveFailed, { authAction }),
      );
    } finally {
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-sm text-ink-600">{t.loadFailed}</p>
        <Link to="/try" className="btn-secondary mt-4 inline-flex">
          {t.editorBack}
        </Link>
      </div>
    );
  }

  if (!preview || !draft) {
    return (
      <div className="container-page py-20 text-center text-sm text-ink-500">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[380px_1fr] lg:grid-rows-1">
      {/* On a phone this pane is a plain column that grows with its content and
          scrolls with the page. It used to be capped at 65vh with the fields as
          the only flexible child, which meant the header, the section list and
          the save footer took a fixed ~440-500px and the editing area got
          whatever was left: 18px on the tallest phone made, and literally
          nothing below about 830px of viewport. A client on a 16-section
          template inside Instagram's browser had no visible field at all.
          Capping by viewport height only works where the chrome is a small
          fraction of it, which is the desktop case and only that.

          **Do not "fix" a cramped pane here by switching vh to dvh or svh.**
          That is the reflex, it is wrong, and it was measured rather than
          reasoned about. The pane is a *remainder* — viewport minus fixed
          chrome — so it shrinks as the unit resolves smaller. dvh and svh
          resolve to the visible height *with* the browser's bars, which is
          smaller than vh, so on the in-app browser where this was reported
          they would have taken the last 18 pixels to zero. The relationship
          is monotonically increasing in the unit: vh was the most generous
          option available and was already not enough. The fix for a
          remainder that is too small is to stop computing it as a remainder,
          which is what the lg: gating above does. */}
      <aside className="flex flex-col border-b border-ink-100 bg-canvas lg:max-h-screen lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/try"
              className="whitespace-nowrap text-sm font-semibold text-ink-500 transition hover:text-ink-900"
            >
              ← {t.editorBack}
            </Link>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-400">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
              {t.savedLocally}
            </span>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-ink-500">
              {t.businessName}
            </span>
            <input
              className={`${inputClass} mt-1.5`}
              value={draft.businessName}
              placeholder={preview.site.businessName}
              onChange={(event) =>
                commit({ ...draft, businessName: event.target.value })
              }
            />
            <span className="mt-1 block text-xs text-ink-400">
              {t.businessNameHint}
            </span>
          </label>
        </div>

        <div className="border-b border-ink-100 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t.sections}
            </span>
            {totalEdits > 0 ? (
              <button
                type="button"
                className="whitespace-nowrap text-xs font-semibold text-ink-400 underline-offset-4 transition hover:text-ink-900 hover:underline"
                onClick={() => {
                  if (window.confirm(t.resetAllConfirm)) {
                    commit(emptyDraft(draft.templateCode, draft.demoRef, lang));
                  }
                }}
              >
                ↺ {t.resetAll}
              </button>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {editable.map((item) => {
              const active = item.key === section?.key;
              const edits = sectionEditCount(draft, item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelected(item.key)}
                  aria-current={active}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-tint text-tint-fg"
                      : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                  }`}
                >
                  {labelOf(item)}
                  {edits > 0 ? (
                    <span
                      aria-label={t.edits}
                      className="h-1.5 w-1.5 rounded-full bg-bloom-500"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={fieldsPaneRef}
          className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
          onFocusCapture={(event) => {
            const wrapper = (event.target as HTMLElement).closest(
              "[data-field-path]",
            );
            const path = wrapper?.getAttribute("data-field-path");
            setActiveField(
              path && section ? `${section.key}::${path}` : null,
            );
          }}
          onBlurCapture={(event) => {
            const next = event.relatedTarget as Node | null;
            if (!next || !event.currentTarget.contains(next)) {
              setActiveField(null);
            }
          }}
        >
          {fields.length === 0 ? (
            <p className="text-sm text-ink-400">{t.noFields}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {grouped.map((group, index) => {
                // A group of one is a heading with nothing under it: the item's
                // name and its only field say the same thing twice, and the
                // client has to open a drawer to reach a single input. Those
                // render as the input itself, labelled with both names.
                const single = !!group.key && group.fields.length === 1;
                const inputs = group.fields.map((field) => (
                  <FieldInput
                    key={field.path}
                    field={
                      single && group.label && group.label !== field.label
                        ? { ...field, label: `${group.label} · ${field.label}` }
                        : field
                    }
                    domId={fieldDomId(section?.key ?? "", field.path)}
                    t={t}
                    edited={
                      !!section && isFieldEdited(draft, section.key, field.path)
                    }
                    value={
                      field.kind === "image"
                        ? ((
                            readPath(
                              section?.content ?? {},
                              field.path,
                            ) as Record<string, unknown> | null
                          )?.url as string) ?? ""
                        : String(
                            readPath(section?.content ?? {}, field.path) ?? "",
                          )
                    }
                    onText={(next) =>
                      section &&
                      commit(setText(draft, section.key, field.path, next))
                    }
                    onImage={() =>
                      section &&
                      setImagePick({
                        sectionKey: section.key,
                        path: field.path,
                      })
                    }
                    onReset={() =>
                      section && commit(clearField(draft, section.key, field.path))
                    }
                  />
                ));

                if (!group.key) {
                  return (
                    <div key="root" className="flex flex-col gap-3">
                      {inputs}
                    </div>
                  );
                }

                if (single) {
                  return (
                    <div
                      key={group.key}
                      className="rounded-xl border border-ink-100 p-3"
                    >
                      {inputs}
                    </div>
                  );
                }

                const opened = isOpen(
                  group.key,
                  grouped
                    .slice(0, index)
                    .filter((item) => item.key && item.fields.length > 1).length,
                );
                const item = group.groupPath
                  ? (readPath(section?.content ?? {}, group.groupPath) as Record<
                      string,
                      unknown
                    > | null)
                  : null;
                const summary = item ? itemSummary(item) : "";
                const touched = group.fields.some(
                  (field) =>
                    !!section && isFieldEdited(draft, section.key, field.path),
                );

                return (
                  <div
                    key={group.key}
                    className="overflow-hidden rounded-xl border border-ink-100"
                  >
                    <button
                      type="button"
                      aria-expanded={opened}
                      onClick={() =>
                        setOpen((current) => ({
                          ...current,
                          [`${section?.key}:${group.key}`]: !opened,
                        }))
                      }
                      className="flex w-full items-center gap-2 bg-ink-50/60 px-3 py-2 text-left transition hover:bg-ink-50"
                    >
                      <span
                        aria-hidden
                        className={`shrink-0 text-xs text-ink-400 transition ${
                          opened ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-ink-700">
                          {group.label}
                        </span>
                        {summary ? (
                          <span className="block truncate text-xs text-ink-400">
                            {summary}
                          </span>
                        ) : null}
                      </span>
                      {touched ? (
                        <span
                          aria-label={t.edits}
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-bloom-500"
                        />
                      ) : null}
                    </button>
                    {opened ? (
                      <div className="flex flex-col gap-3 border-t border-ink-100 p-3">
                        {inputs}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-ink-100 bg-canvas p-4">
          {notice ? (
            <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {notice === "large"
                ? t.imageTooLarge
                : notice === "full"
                  ? t.draftFull
                  : t.imageFailed}
            </p>
          ) : null}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              // A returning client already has an account, and several websites
              // on one account is a supported thing rather than an edge case.
              const account = readStoredAccount();
              setSave(
                account
                  ? { phase: "signedIn", ...account }
                  : { phase: "form", mode: "register" },
              );
            }}
          >
            {t.saveCta}
          </button>
          <p className="mt-2 text-center text-xs text-ink-400">{t.freeNote}</p>
        </div>
      </aside>

      <section className="flex max-h-screen flex-col overflow-hidden bg-ink-50/60">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-canvas px-4 py-2">
          <div className="flex items-center gap-1 rounded-xl border border-ink-100 bg-surface p-0.5">
            {(["edit", "review"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  mode === option
                    ? "bg-tint text-tint-fg"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {option === "edit" ? t.modeEdit : t.modeReview}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(["desktop", "mobile"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDevice(option)}
                aria-pressed={device === option}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  device === option
                    ? "bg-tint text-tint-fg"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {option === "desktop" ? t.desktop : t.mobile}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            ref={previewRef}
            className={
              device === "mobile"
                ? "relative mx-auto my-4 w-[390px] max-w-full overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"
                : "relative min-h-full bg-white"
            }
          >
            <SiteBody
              payload={preview}
              siteRef={draft.demoRef}
              onLanguageChange={() => undefined}
              onOpenProduct={() => undefined}
              onCloseProduct={() => undefined}
            />
          </div>
        </div>
      </section>

      {imagePick ? (
        <ImagePicker
          labels={{
            title: t.imageTitle,
            fromFile: t.imageFromFile,
            fromLink: t.imageFromLink,
            linkPlaceholder: t.imageLinkPlaceholder,
            linkUse: t.imageLinkUse,
            linkFailed: t.imageLinkFailed,
            cancel: t.dismiss,
            note: t.imageNotSavedYet,
          }}
          onClose={() => setImagePick(null)}
          onPick={async (file) => {
            const { sectionKey, path } = imagePick;
            setImagePick(null);
            await onPickImage(sectionKey, path, file);
          }}
        />
      ) : null}

      {save.phase !== "idle" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-canvas p-6 shadow-xl">
            {save.phase === "signedIn" ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-extrabold text-ink-900">
                  {t.saveSignedInTitle}
                </h2>
                <p className="text-sm text-ink-600">
                  {t.saveSignedInBody.replace("{email}", save.email)}
                </p>
                {formError ? (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {formError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn-primary mt-1"
                  onClick={() => finish(save.token, save)}
                >
                  {t.saveConfirm}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-ink-500 underline-offset-4 transition hover:text-ink-900 hover:underline"
                    onClick={() => setSave({ phase: "idle" })}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-bloom-600 underline-offset-4 transition hover:text-bloom-700 hover:underline"
                    onClick={() => setSave({ phase: "form", mode: "signin" })}
                  >
                    {t.useAnother}
                  </button>
                </div>
              </div>
            ) : null}

            {save.phase === "form" ? (
              <form onSubmit={onSubmitAccount} className="flex flex-col gap-3">
                <h2 className="text-lg font-extrabold text-ink-900">
                  {t.saveTitle}
                </h2>
                <p className="text-sm text-ink-600">{t.saveBody}</p>

                {save.mode === "register" ? (
                  <label className="block">
                    <span className="text-xs font-semibold text-ink-500">
                      {t.fullName}
                    </span>
                    <input
                      name="fullName"
                      required
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="text-xs font-semibold text-ink-500">
                    {t.email}
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`${inputClass} mt-1.5`}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-ink-500">
                    {t.password}
                  </span>
                  <PasswordField
                    name="password"
                    required
                    minLength={8}
                    autoComplete={
                      save.mode === "register"
                        ? "new-password"
                        : "current-password"
                    }
                    className={inputClass}
                    wrapperClassName="mt-1.5"
                  />
                  {save.mode === "register" ? (
                    <span className="mt-1 block text-xs text-ink-400">
                      {t.passwordHint}
                    </span>
                  ) : null}
                </label>

                {formError ? (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {formError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="btn-primary mt-1"
                  disabled={busy}
                >
                  {busy
                    ? t.working
                    : save.mode === "register"
                      ? t.createAccount
                      : t.signIn}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-ink-500 underline-offset-4 transition hover:text-ink-900 hover:underline"
                    onClick={() => setSave({ phase: "idle" })}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-bloom-600 underline-offset-4 transition hover:text-bloom-700 hover:underline"
                    onClick={() =>
                      setSave({
                        phase: "form",
                        mode:
                          save.mode === "register" ? "signin" : "register",
                      })
                    }
                  >
                    {save.mode === "register" ? t.signIn : t.createAccount}
                  </button>
                </div>
              </form>
            ) : null}

            {save.phase === "working" ? (
              <div className="flex flex-col gap-3 text-center">
                <h2 className="text-lg font-extrabold text-ink-900">
                  {t.working}
                </h2>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-bloom-500 transition-all"
                    style={{
                      width: `${Math.round(save.progress.ratio * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-ink-600">
                  {save.progress.step === "creating"
                    ? t.stepCreating
                    : save.progress.step === "images"
                      ? t.stepImages
                      : save.progress.step === "publishing"
                        ? t.stepPublishing
                        : t.stepContent}
                </p>
              </div>
            ) : null}

            {save.phase === "done" ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-extrabold text-ink-900">
                  {save.publishError ? t.saveTitle : t.doneTitle}
                </h2>
                <p className="text-sm text-ink-600">
                  {save.publishError ? t.doneOffline : t.doneBody}
                </p>
                {save.publishError ? null : (
                  <code className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
                    {`${window.location.origin}/site/${save.slug}`}
                  </code>
                )}
                <div className="mt-1 flex gap-2">
                  {save.publishError ? null : (
                    <Link to={`/site/${save.slug}`} className="btn-primary">
                      {t.openSite}
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(dashPath(`/s/${save.siteId}`))}
                  >
                    {t.openPanel}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
