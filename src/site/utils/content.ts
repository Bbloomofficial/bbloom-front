import type { MediaRef, SectionContent } from "../api/types";

/**
 * Section content is client-authored JSON, so every read is defensive: a missing
 * or mistyped field falls back rather than breaking a live website.
 */

export function str(
  content: SectionContent | null | undefined,
  key: string,
): string | undefined {
  const value = content?.[key];
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export function bool(
  content: SectionContent | null | undefined,
  key: string,
  fallback = false,
): boolean {
  const value = content?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function num(
  content: SectionContent | null | undefined,
  key: string,
  fallback?: number,
): number | undefined {
  const value = content?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return fallback;
}

export function list<T = Record<string, unknown>>(
  content: SectionContent | null | undefined,
  key: string,
): T[] {
  const value = content?.[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

/** An image field may be a media ref object, a wrapper around one, or a bare URL. */
export function image(
  content: SectionContent | null | undefined,
  key: string,
): MediaRef | undefined {
  return toMedia(content?.[key]);
}

const MEDIA_KEYS = ["image", "media", "photo", "picture", "src"] as const;

export function toMedia(value: unknown): MediaRef | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    return value.trim()
      ? { id: null, url: value, width: null, height: null, alt: null }
      : undefined;
  }
  if (typeof value === "object") {
    const candidate = value as Record<string, unknown> & Partial<MediaRef>;
    const url = candidate.url ?? candidate.src ?? candidate.image;
    if (typeof url === "string" && url.trim()) {
      return {
        id: candidate.id ?? null,
        url,
        width: candidate.width ?? null,
        height: candidate.height ?? null,
        alt: candidate.alt ?? null,
      };
    }
    // Gallery and card items wrap the ref, e.g. { image: { url, … } }.
    for (const key of MEDIA_KEYS) {
      const nested = candidate[key];
      if (nested && typeof nested === "object") {
        const media = toMedia(nested);
        if (media) return media;
      }
    }
  }
  return undefined;
}

/** Reads a string field off a list item, tolerating a few common aliases. */
export function itemStr(item: unknown, ...keys: string[]): string | undefined {
  if (!item || typeof item !== "object") return undefined;
  const record = item as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

export function itemNum(item: unknown, ...keys: string[]): number | undefined {
  if (!item || typeof item !== "object") return undefined;
  const record = item as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }
  return undefined;
}
