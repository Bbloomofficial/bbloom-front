import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../api/http";
import { uploadMedia } from "../api/client";
import type { FieldSchema, SiteLanguage } from "../api/types";
import type { EditorStrings } from "./strings";

/**
 * Section content is free-form JSON described by a per-section `fields` schema,
 * so the editor is a renderer too: one input per declared field, recursing
 * through lists. Anything the schema does not describe is left untouched.
 */

export type Json = unknown;

type Ctx = {
  t: EditorStrings;
  /** Language of the dashboard chrome — field labels follow it. */
  uiLang: SiteLanguage;
  /** Language the localised inputs are currently editing. */
  editLang: SiteLanguage;
  languages: SiteLanguage[];
  siteId: string;
  token: string;
};

function label(field: FieldSchema, lang: SiteLanguage) {
  return field.label?.[lang] ?? field.label?.en ?? field.label?.ka ?? field.key;
}

function hint(field: FieldSchema, lang: SiteLanguage) {
  return field.hint?.[lang] ?? field.hint?.en ?? field.hint?.ka;
}

const inputClass =
  "w-full rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200";

function asRecord(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: Json): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

/** Reads the value an input should show, unwrapping a localised pair. */
function readValue(field: FieldSchema, value: Json, lang: SiteLanguage): Json {
  if (!field.localized) return value;
  const pair = asRecord(value);
  return pair[lang] ?? "";
}

/** Writes back, preserving the other language of a localised pair. */
function writeValue(
  field: FieldSchema,
  current: Json,
  next: Json,
  lang: SiteLanguage,
): Json {
  if (!field.localized) return next;
  return { ...asRecord(current), [lang]: next };
}

function MediaThumb({ mediaId, alt }: { mediaId: string; alt: string }) {
  return (
    <img
      src={`${API_BASE}/media/${mediaId}`}
      alt={alt}
      className="h-20 w-28 shrink-0 rounded-lg border border-ink-100 bg-ink-50 object-cover"
      loading="lazy"
      decoding="async"
    />
  );
}

function ImageField({
  value,
  onChange,
  ctx,
  name,
}: {
  value: Json;
  onChange: (next: Json) => void;
  ctx: Ctx;
  name: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const record = asRecord(value);
  const mediaId =
    typeof record.mediaId === "string"
      ? record.mediaId
      : typeof record.id === "string"
        ? record.id
        : null;

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const media = await uploadMedia(ctx.token, ctx.siteId, file, {
        [ctx.editLang]: name,
      });
      onChange({ mediaId: media.id });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : ctx.t.uploadFailed);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {mediaId ? (
        <MediaThumb mediaId={mediaId} alt={name} />
      ) : (
        <span className="grid h-20 w-28 shrink-0 place-items-center rounded-lg border border-dashed border-ink-200 text-xs text-ink-400">
          {ctx.t.noImage}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-lg border border-ink-100 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600 disabled:opacity-50"
        >
          {busy ? ctx.t.uploading : mediaId ? ctx.t.replaceImage : ctx.t.upload}
        </button>
        {mediaId ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg border border-ink-100 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-400 transition hover:border-red-300 hover:text-red-600"
          >
            {ctx.t.removeImage}
          </button>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void onPick(event.target.files?.[0])}
      />
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function ListField({
  field,
  value,
  onChange,
  ctx,
  depth,
}: {
  field: FieldSchema;
  value: Json;
  onChange: (next: Json) => void;
  ctx: Ctx;
  depth: number;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const itemFields = field.itemFields ?? [];

  function replace(next: Record<string, unknown>[]) {
    onChange(next);
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    replace(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-ink-100 bg-canvas/60 p-3"
        >
          <div className="mb-2 flex items-center gap-1">
            <span className="text-xs font-bold text-ink-400">
              {ctx.t.item(index + 1)}
            </span>
            <span className="ms-auto flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={ctx.t.moveUp}
                className="rounded-md border border-ink-100 bg-surface px-2 py-1 text-xs text-ink-500 transition hover:text-bloom-600 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={ctx.t.moveDown}
                className="rounded-md border border-ink-100 bg-surface px-2 py-1 text-xs text-ink-500 transition hover:text-bloom-600 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  replace(items.filter((_, other) => other !== index))
                }
                aria-label={ctx.t.removeItem}
                className="rounded-md border border-ink-100 bg-surface px-2 py-1 text-xs text-ink-400 transition hover:border-red-300 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          </div>
          <FieldList
            fields={itemFields}
            content={item}
            onChange={(next) =>
              replace(items.map((old, other) => (other === index ? next : old)))
            }
            ctx={ctx}
            depth={depth + 1}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => replace([...items, {}])}
        className="rounded-lg border border-dashed border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-500 transition hover:border-bloom-300 hover:text-bloom-600"
      >
        {ctx.t.addItem}
      </button>
    </div>
  );
}

function Field({
  field,
  content,
  onChange,
  ctx,
  depth,
}: {
  field: FieldSchema;
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  ctx: Ctx;
  depth: number;
}) {
  const raw = content[field.key];
  const value = readValue(field, raw, ctx.editLang);
  const name = label(field, ctx.uiLang);
  const help = hint(field, ctx.uiLang);

  const set = (next: Json) => {
    onChange({
      ...content,
      [field.key]: writeValue(field, raw, next, ctx.editLang),
    });
  };

  if (field.type === "boolean") {
    return (
      <label className="flex items-start gap-2.5" data-field={field.key}>
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => set(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-ink-200 text-bloom-600 focus:ring-bloom-300"
        />
        <span>
          <span className="block text-sm font-semibold text-ink-700">
            {name}
          </span>
          {help ? (
            <span className="block text-xs text-ink-400">{help}</span>
          ) : null}
        </span>
      </label>
    );
  }

  const heading = (
    <span className="mb-1.5 flex items-baseline gap-2">
      <span className="text-sm font-semibold text-ink-700">{name}</span>
      {field.localized ? (
        <span className="rounded bg-ink-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-400">
          {ctx.editLang}
        </span>
      ) : null}
      {field.required ? <span className="text-xs text-red-500">*</span> : null}
    </span>
  );

  let control: React.ReactNode;
  switch (field.type) {
    case "list":
      control = (
        <ListField
          field={field}
          value={raw}
          onChange={(next) => onChange({ ...content, [field.key]: next })}
          ctx={ctx}
          depth={depth}
        />
      );
      break;
    case "image":
      control = (
        <ImageField
          value={raw}
          onChange={(next) => onChange({ ...content, [field.key]: next })}
          ctx={ctx}
          name={name}
        />
      );
      break;
    case "select":
      control = (
        <select
          value={asString(value)}
          onChange={(event) => set(event.target.value)}
          className={inputClass}
        >
          <option value="">—</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          value={asString(value)}
          onChange={(event) =>
            set(event.target.value === "" ? null : Number(event.target.value))
          }
          className={inputClass}
        />
      );
      break;
    case "textarea":
    case "richtext":
      control = (
        <textarea
          rows={field.type === "richtext" ? 6 : 3}
          value={asString(value)}
          onChange={(event) => set(event.target.value)}
          className={`${inputClass} resize-y`}
        />
      );
      break;
    default:
      control = (
        <input
          type={field.type === "link" ? "url" : "text"}
          value={asString(value)}
          onChange={(event) => set(event.target.value)}
          className={inputClass}
        />
      );
  }

  return (
    <div data-field={field.key}>
      {heading}
      {control}
      {help && field.type !== "list" ? (
        <p className="mt-1 text-xs text-ink-400">{help}</p>
      ) : null}
    </div>
  );
}

export function FieldList({
  fields,
  content,
  onChange,
  ctx,
  depth = 0,
}: {
  fields: FieldSchema[];
  content: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  ctx: Ctx;
  depth?: number;
}) {
  if (fields.length === 0) {
    return <p className="text-sm text-ink-400">{ctx.t.noFields}</p>;
  }
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          content={content}
          onChange={onChange}
          ctx={ctx}
          depth={depth}
        />
      ))}
    </div>
  );
}

/** Focuses the panel when the selected section changes, for keyboard users. */
export function useAutoFocus(dependency: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [dependency]);
  return ref;
}

export type { Ctx as FieldContext };
