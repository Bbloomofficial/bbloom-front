import type { SitePayload } from "../site/api/types";

/**
 * The draft of a website someone is building *before* they have an account.
 *
 * It lives entirely in this browser. The backend has no concept of an anonymous
 * site — it cannot: a site belongs to an account, and there is no account yet.
 * So the edits are kept as a thin overlay on top of a template's public demo
 * payload, keyed by section and field, and replayed onto the real website the
 * moment one exists (see `apply.ts`).
 *
 * Storing an overlay rather than the whole payload matters: it keeps the draft
 * small, it survives the demo content changing underneath, and — the reason
 * that actually decides it — replaying only what the client *touched* means the
 * rest of their new site stays as the template intended rather than being
 * overwritten with a snapshot of a demo.
 */

const STORAGE_KEY = "bbloom:try-draft";

/** Images are held as data URLs until an account exists to upload them to. */
export type DraftImage = {
  dataUrl: string;
  name: string;
  type: string;
};

export type TryDraft = {
  templateCode: string;
  /** The public demo the draft is layered on, so it can be reloaded. */
  demoRef: string;
  lang: "ka" | "en";
  businessName: string;
  /** section key → field path → text the client typed. */
  text: Record<string, Record<string, string>>;
  /** section key → field path → replacement image. */
  images: Record<string, Record<string, DraftImage>>;
  updatedAt: number;
};

export function emptyDraft(
  templateCode: string,
  demoRef: string,
  lang: "ka" | "en",
): TryDraft {
  return {
    templateCode,
    demoRef,
    lang,
    businessName: "",
    text: {},
    images: {},
    updatedAt: Date.now(),
  };
}

export function readDraft(): TryDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as TryDraft;
    if (!draft?.templateCode || !draft.demoRef) return null;
    return {
      ...draft,
      text: draft.text ?? {},
      images: draft.images ?? {},
      businessName: draft.businessName ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Quota is a real failure mode here rather than a theoretical one: a couple of
 * photographs will fill the 5MB a browser gives us, and losing the client's
 * typing because an image did not fit would be the worst possible trade. The
 * text is written back without the images, and the caller is told.
 */
export class DraftTooLargeError extends Error {
  constructor() {
    super("draft-too-large");
    this.name = "DraftTooLargeError";
  }
}

export function writeDraft(draft: TryDraft): void {
  const next = { ...draft, updatedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...next, images: {} }),
      );
    } catch {
      /* Nothing more to try; the caller still holds the draft in memory. */
    }
    throw new DraftTooLargeError();
  }
}

export function clearDraft(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasEdits(draft: TryDraft | null): boolean {
  if (!draft) return false;
  const touched = (map: Record<string, Record<string, unknown>>) =>
    Object.values(map).some((fields) => Object.keys(fields).length > 0);
  return (
    draft.businessName.trim().length > 0 ||
    touched(draft.text) ||
    touched(draft.images)
  );
}

export function setText(
  draft: TryDraft,
  sectionKey: string,
  path: string,
  value: string,
): TryDraft {
  return {
    ...draft,
    text: {
      ...draft.text,
      [sectionKey]: { ...(draft.text[sectionKey] ?? {}), [path]: value },
    },
  };
}

export function setImage(
  draft: TryDraft,
  sectionKey: string,
  path: string,
  image: DraftImage,
): TryDraft {
  return {
    ...draft,
    images: {
      ...draft.images,
      [sectionKey]: { ...(draft.images[sectionKey] ?? {}), [path]: image },
    },
  };
}

/* Reading and writing a dotted path inside free-form section content. */

export function readPath(
  content: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((value, step) => {
    if (value == null) return undefined;
    if (Array.isArray(value)) return value[Number(step)];
    if (typeof value === "object") {
      return (value as Record<string, unknown>)[step];
    }
    return undefined;
  }, content);
}

/** Returns a copy — the payload it walks is shared with the preview. */
export function writePath(
  content: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const [head, ...rest] = path.split(".");
  const clone: Record<string, unknown> = { ...content };
  if (rest.length === 0) {
    clone[head] = value;
    return clone;
  }
  const child = clone[head];
  if (Array.isArray(child)) {
    const index = Number(rest[0]);
    const items = [...child];
    items[index] = writePath(
      (items[index] ?? {}) as Record<string, unknown>,
      rest.slice(1).join("."),
      value,
    );
    clone[head] = items;
    return clone;
  }
  clone[head] = writePath(
    (child ?? {}) as Record<string, unknown>,
    rest.join("."),
    value,
  );
  return clone;
}

/**
 * Lays the draft over a demo payload so the preview shows what the client will
 * actually get. Images become the local data URL, which the renderer treats
 * like any other `src`.
 */
export function applyDraftToPayload(
  payload: SitePayload,
  draft: TryDraft,
): SitePayload {
  const sections = payload.sections.map((section) => {
    const text = draft.text[section.key];
    const images = draft.images[section.key];
    if (!text && !images) return section;

    let content = section.content as Record<string, unknown>;
    for (const [path, value] of Object.entries(text ?? {})) {
      content = writePath(content, path, value);
    }
    for (const [path, image] of Object.entries(images ?? {})) {
      const current = readPath(content, path);
      const alt =
        current && typeof current === "object"
          ? ((current as Record<string, unknown>).alt ?? null)
          : null;
      content = writePath(content, path, {
        url: image.dataUrl,
        alt,
        width: null,
        height: null,
      });
    }
    return { ...section, content };
  });

  const businessName = draft.businessName.trim();
  return {
    ...payload,
    sections,
    site: businessName ? { ...payload.site, businessName } : payload.site,
  };
}
