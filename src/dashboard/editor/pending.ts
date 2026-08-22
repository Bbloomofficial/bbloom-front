/**
 * Pictures the client has chosen but not yet committed.
 *
 * Uploading the moment someone picks a file makes the media library a record of
 * everything they ever considered, and it uploads work they may abandon. So a
 * pick is held here — the file plus a local URL to preview it — and the content
 * carries a marker in place of a media id until save.
 *
 * The marker is a plain JSON object so it survives every edit the panel makes
 * to the section content without special handling; the only code that has to
 * know about it is the save path, which swaps each one for the real media id.
 */

export type PendingImage = { file: File; url: string };

export const PENDING_KEY = "pendingUpload";

export type PendingMarker = { [PENDING_KEY]: string };

export function isPendingMarker(value: unknown): value is PendingMarker {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>)[PENDING_KEY] === "string"
  );
}

export function mediaIdOf(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.mediaId === "string") return record.mediaId;
  if (typeof record.id === "string") return record.id;
  return null;
}

/** Every media id referenced anywhere inside a section's content. */
export function collectMediaIds(value: unknown, into = new Set<string>()) {
  const id = mediaIdOf(value);
  if (id) into.add(id);
  if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, into);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectMediaIds(item, into);
    }
  }
  return into;
}

/**
 * Replaces every pending marker with the media id of the uploaded file. The
 * uploads run one after another rather than at once: a client replacing four
 * photographs on a phone connection gets a progress they can watch, and a
 * failure that names one picture rather than four.
 */
export async function resolvePending(
  value: unknown,
  upload: (image: PendingImage) => Promise<string>,
  pending: Map<string, PendingImage>,
): Promise<unknown> {
  if (isPendingMarker(value)) {
    const image = pending.get(value[PENDING_KEY]);
    if (!image) return null;
    return { mediaId: await upload(image) };
  }
  if (Array.isArray(value)) {
    const items: unknown[] = [];
    for (const item of value) {
      items.push(await resolvePending(item, upload, pending));
    }
    return items;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      next[key] = await resolvePending(item, upload, pending);
    }
    return next;
  }
  return value;
}
