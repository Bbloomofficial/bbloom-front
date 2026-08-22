import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import { ApiError } from "../api/http";
import { fetchTemplates } from "../api/templates";
import { fetchSite } from "../site/api/client";
import type { PublicSection, SitePayload } from "../site/api/types";
import { SiteBody } from "../site/SitePage";
import { loginAccount, registerAccount } from "../dashboard/api/account";
import { storeSession } from "../dashboard/auth";
import {
  applyDraftToPayload,
  clearDraft,
  DraftTooLargeError,
  emptyDraft,
  readDraft,
  readPath,
  setImage,
  setText,
  writeDraft,
} from "../try/draft";
import type { TryDraft } from "../try/draft";
import { deriveFields, sectionLabel } from "../try/schema";
import type { EditableField } from "../try/schema";
import { fileToDraftImage, ImageTooLargeError } from "../try/image";
import { applyDraftToNewSite } from "../try/apply";
import type { ApplyProgress } from "../try/apply";
import { tryStrings } from "../try/strings";
import type { TryStrings } from "../try/strings";

/**
 * Editing a website before there is an account to own it.
 *
 * The preview is the real site renderer fed a locally modified payload, not a
 * lookalike — what someone sees while editing is exactly what their visitors
 * will get, which is the whole promise of the flow.
 */

const inputClass =
  "w-full rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200";

function FieldInput({
  field,
  value,
  onText,
  onImage,
  t,
}: {
  field: EditableField;
  value: string;
  onText: (next: string) => void;
  onImage: (file: File) => void;
  t: TryStrings;
}) {
  const picker = useRef<HTMLInputElement>(null);

  if (field.kind === "image") {
    return (
      <div>
        <span className="text-xs font-semibold text-ink-500">
          {field.label}
        </span>
        <div className="mt-2 flex items-center gap-3">
          {value ? (
            <img
              src={value}
              alt=""
              className="h-16 w-24 shrink-0 rounded-lg border border-ink-100 bg-ink-50 object-cover"
            />
          ) : null}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => picker.current?.click()}
          >
            {t.replaceImage}
          </button>
          <input
            ref={picker}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onImage(file);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-500">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          className={`${inputClass} mt-1.5 min-h-24`}
          value={value}
          onChange={(event) => onText(event.target.value)}
        />
      ) : (
        <input
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

  const section: PublicSection | null = useMemo(
    () =>
      preview?.sections.find((item) => item.key === selected) ??
      preview?.sections[0] ??
      null,
    [preview, selected],
  );

  const fields = useMemo(
    () => (section ? deriveFields(section, lang) : []),
    [section, lang],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, EditableField[]>();
    for (const field of fields) {
      const key = field.group ?? "";
      const list = groups.get(key) ?? [];
      list.push(field);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [fields]);

  async function onPickImage(sectionKey: string, path: string, file: File) {
    if (!draft) return;
    try {
      const image = await fileToDraftImage(file);
      commit(setImage(draft, sectionKey, path, image));
    } catch (error) {
      setNotice(error instanceof ImageTooLargeError ? "large" : "failed");
    }
  }

  async function finish(token: string) {
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
      setFormError(
        error instanceof ApiError ? error.message : String(error),
      );
      setSave({ phase: "form", mode: "register" });
    }
  }

  async function onSubmitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.phase !== "form") return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setFormError(null);
    try {
      const response =
        save.mode === "register"
          ? await registerAccount({
              fullName: String(data.get("fullName") ?? ""),
              email: String(data.get("email") ?? ""),
              password: String(data.get("password") ?? ""),
            })
          : await loginAccount(
              String(data.get("email") ?? ""),
              String(data.get("password") ?? ""),
            );
      storeSession(response);
      await finish(response.token);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : String(error));
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
      <aside className="flex max-h-screen flex-col gap-4 overflow-y-auto border-b border-ink-100 bg-canvas p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <Link
            to="/try"
            className="text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            ← {t.editorBack}
          </Link>
          <span className="text-xs text-ink-400">{t.savedLocally}</span>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-ink-500">
            {t.businessName}
          </span>
          <input
            className={`${inputClass} mt-1.5`}
            value={draft.businessName}
            onChange={(event) =>
              commit({ ...draft, businessName: event.target.value })
            }
          />
          <span className="mt-1 block text-xs text-ink-400">
            {t.businessNameHint}
          </span>
        </label>

        <div>
          <span className="text-xs font-semibold text-ink-500">
            {t.sections}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {preview.sections.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelected(item.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  item.key === section?.key
                    ? "bg-tint text-tint-fg"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {sectionLabel(item, lang)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {grouped.map(([group, list]) => (
            <div key={group || "root"} className="flex flex-col gap-3">
              {group ? (
                <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
                  {group}
                </span>
              ) : null}
              {list.map((field) => (
                <FieldInput
                  key={field.path}
                  field={field}
                  t={t}
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
                  onImage={(file) =>
                    section && onPickImage(section.key, field.path, file)
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {notice ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {notice === "large"
              ? t.imageTooLarge
              : notice === "full"
                ? t.draftFull
                : t.imageFailed}
          </p>
        ) : null}

        <div className="sticky bottom-0 mt-auto bg-canvas pt-3">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => setSave({ phase: "form", mode: "register" })}
          >
            {t.saveCta}
          </button>
          <p className="mt-2 text-center text-xs text-ink-400">{t.freeNote}</p>
        </div>
      </aside>

      <section className="flex max-h-screen flex-col overflow-hidden bg-ink-50/60">
        <div className="flex items-center justify-end gap-2 border-b border-ink-100 bg-canvas px-4 py-2">
          {(["desktop", "mobile"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDevice(option)}
              aria-pressed={device === option}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                device === option
                  ? "bg-tint text-tint-fg"
                  : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {option === "desktop" ? t.desktop : t.mobile}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            className={
              device === "mobile"
                ? "mx-auto my-4 w-[390px] max-w-full overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"
                : "min-h-full bg-white"
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

      {save.phase !== "idle" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-canvas p-6 shadow-xl">
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
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete={
                      save.mode === "register"
                        ? "new-password"
                        : "current-password"
                    }
                    className={`${inputClass} mt-1.5`}
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
                  {busy ? t.working : t.createAccount}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-ink-500 hover:text-ink-900"
                    onClick={() => setSave({ phase: "idle" })}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-bloom-600"
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
                    onClick={() => navigate(`/dashboard/s/${save.siteId}`)}
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
