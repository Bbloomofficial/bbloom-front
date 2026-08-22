import { ApiError } from "../api/http";
import {
  fetchSections,
  publishSections,
  setPublished,
  updateSection,
  uploadMedia,
} from "../dashboard/api/client";
import { createSite } from "../dashboard/api/account";
import type { SectionDto } from "../dashboard/api/types";
import type { TryDraft } from "./draft";
import { readPath, writePath } from "./draft";

/**
 * Turning an anonymous draft into a real website, once an account exists.
 *
 * The draft is language-flat, because the public demo it was layered on is
 * flattened by the API before it ever reaches the browser. The manage API is
 * not: it stores localised text as a `{ka, en}` pair. So every write has to
 * know which of the two it is looking at, and it decides that from the value
 * already in the section rather than from a schema — the content is the thing
 * being overwritten, so its own shape is the most reliable description of what
 * belongs there.
 */

function isLocalisedPair(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as Record<string, unknown>);
  return (
    keys.length > 0 && keys.every((key) => key === "ka" || key === "en")
  );
}

function dataUrlToFile(dataUrl: string, name: string, type: string): File {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: type || "image/jpeg" });
}

export type ApplyProgress = {
  /** 0–1, for a progress bar that means something on a slow phone. */
  ratio: number;
  step: "creating" | "content" | "images" | "publishing" | "done";
};

export type ApplyResult = {
  siteId: string;
  slug: string;
  /** Set when the site could not be put online, in the API's own words. */
  publishError: string | null;
};

/**
 * Creates the website, replays the draft onto it, and puts it online.
 *
 * Publishing is attempted rather than assumed: until the backend ungates free
 * hosting it answers 409 with a message written for the client, and losing the
 * whole signup because the last step was refused would be absurd — the site
 * exists and holds their work either way, so the refusal is reported and the
 * caller decides what to say about it.
 */
export async function applyDraftToNewSite(
  token: string,
  draft: TryDraft,
  onProgress?: (progress: ApplyProgress) => void,
): Promise<ApplyResult> {
  const report = (ratio: number, step: ApplyProgress["step"]) =>
    onProgress?.({ ratio, step });

  report(0.05, "creating");
  const site = await createSite(token, {
    businessName: draft.businessName.trim() || "My website",
    templateCode: draft.templateCode,
    defaultLanguage: draft.lang,
    languages: [draft.lang],
  });

  const sections = await fetchSections(token, site.id);
  const byKey = new Map<string, SectionDto>(
    sections.map((section) => [section.key, section]),
  );

  const editedKeys = new Set([
    ...Object.keys(draft.text),
    ...Object.keys(draft.images),
  ]);
  const total = Math.max(editedKeys.size, 1);
  let done = 0;

  for (const key of editedKeys) {
    const section = byKey.get(key);
    // A template whose sections moved since the draft was started: skip the
    // orphan rather than failing the signup over it.
    if (!section) continue;

    let content = section.content ?? {};

    for (const [path, value] of Object.entries(draft.text[key] ?? {})) {
      const current = readPath(content, path);
      content = writePath(
        content,
        path,
        isLocalisedPair(current)
          ? { ...(current as Record<string, unknown>), [draft.lang]: value }
          : value,
      );
    }

    const images = Object.entries(draft.images[key] ?? {});
    if (images.length > 0) report(0.2 + (done / total) * 0.6, "images");
    for (const [path, image] of images) {
      const media = await uploadMedia(
        token,
        site.id,
        dataUrlToFile(image.dataUrl, image.name, image.type),
      );
      const current = readPath(content, path);
      const alt =
        current && typeof current === "object"
          ? ((current as Record<string, unknown>).alt ?? null)
          : null;
      content = writePath(content, path, {
        id: media.id,
        mediaId: media.id,
        url: media.url,
        width: media.width ?? null,
        height: media.height ?? null,
        alt,
      });
    }

    await updateSection(token, site.id, key, { content });
    done += 1;
    report(0.2 + (done / total) * 0.6, "content");
  }

  report(0.85, "publishing");
  // Section edits land in the draft layer, so they have to be published before
  // the site is, or the new site would go online showing template defaults.
  await publishSections(token, site.id);

  let publishError: string | null = null;
  try {
    await setPublished(token, site.id, true);
  } catch (error) {
    if (error instanceof ApiError) publishError = error.message;
    else throw error;
  }

  report(1, "done");
  return { siteId: site.id, slug: site.slug, publishError };
}
