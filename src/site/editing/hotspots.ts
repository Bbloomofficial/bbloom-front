/**
 * Making a rendered page point back at the fields that produced it.
 *
 * Editing a website through a list of labelled inputs asks the client to hold a
 * map in their head: which of the eleven text boxes is the heading they can see
 * on the page. So in edit mode the preview itself becomes the index — every
 * piece of text and every picture that *can* be changed says so, and clicking
 * one takes you to its field.
 *
 * The renderers are not touched to do this. They are the real site components,
 * shared with what visitors are served, and threading an editing concern
 * through all fifteen of them would put editor wiring into the public product.
 * Instead the values are matched back onto the DOM after it renders: a text
 * field is claimed by the deepest element showing exactly that text, and an
 * image field by the `img` serving it.
 *
 * That is a heuristic, and it is chosen knowing it: a field that cannot be
 * matched simply gets no hotspot and stays editable in the panel, which is a
 * far better failure than a preview that lies about what it will do.
 *
 * The module is deliberately plain DOM so the same implementation serves the
 * inline preview of the anonymous editor and the same-origin preview iframe of
 * the client panel.
 */

export type HotspotTarget = {
  /** Opaque id handed back on click. */
  id: string;
  kind: "text" | "image";
  /** The text shown on the page, or the image URL being rendered. */
  value: string;
};

export type HotspotOptions = {
  onSelect: (id: string) => void;
  /** Chip shown while hovering a text hotspot. */
  textLabel: string;
  /** Chip shown while hovering an image hotspot. */
  imageLabel: string;
};

const MARK = "data-bb-edit";
const KIND = "data-bb-edit-kind";
const ACTIVE = "data-bb-edit-active";
const STYLE_ID = "bb-edit-style";
const CHIP_ID = "bb-edit-chip";

/** A long paragraph is still text; a whole page of it is a container. */
const MAX_TEXT = 2000;

const CSS = `
[${MARK}] {
  cursor: pointer;
  outline: 1px dashed rgba(99, 102, 241, 0.5);
  outline-offset: 2px;
}
[${MARK}]:hover {
  outline: 2px solid rgb(99, 102, 241);
  background-color: rgba(99, 102, 241, 0.08);
}
[${ACTIVE}] {
  outline: 2px solid rgb(79, 70, 229);
  outline-offset: 3px;
  background-color: rgba(99, 102, 241, 0.12);
  animation: bb-edit-pulse 1.2s ease-out 1;
}
@keyframes bb-edit-pulse {
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.45); }
  100% { box-shadow: 0 0 0 14px rgba(79, 70, 229, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [${ACTIVE}] { animation: none; }
}
#${CHIP_ID} {
  position: absolute;
  z-index: 2147483000;
  display: none;
  transform: translateY(-100%);
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(79, 70, 229);
  color: #fff;
  font: 600 11px/1.7 system-ui, sans-serif;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}
`;

function normalise(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** `CSS` is taken by the stylesheet above, so the escape is spelled out. */
function cssEscape(value: string): string {
  return value.replace(/["\\]/g, "\\$&");
}

/** `/api/v1/media/abc` and `https://host/api/v1/media/abc` are one image. */
function imageKeys(value: string): string[] {
  if (!value) return [];
  if (value.startsWith("data:")) return [value.slice(0, 96)];
  const clean = value.split("?")[0];
  const last = clean.split("/").filter(Boolean).pop();
  return last ? [clean, last] : [clean];
}

function documentOf(root: HTMLElement | Document): Document | null {
  return root instanceof Document ? root : root.ownerDocument;
}

function scopeOf(root: HTMLElement | Document): HTMLElement | null {
  return root instanceof Document ? root.body : root;
}

export function clearHotspots(root: HTMLElement | Document): void {
  const scope = scopeOf(root);
  if (!scope) return;
  for (const element of scope.querySelectorAll(`[${MARK}]`)) {
    element.removeAttribute(MARK);
    element.removeAttribute(KIND);
    element.removeAttribute(ACTIVE);
  }
}

/**
 * Lights up the element a field produces, so the traffic runs both ways: click
 * the page to reach the field, or put the cursor in a field to see what on the
 * page it will change. Passing `null` clears the highlight.
 */
export function highlightHotspot(
  root: HTMLElement | Document,
  id: string | null,
  options: { scroll?: boolean } = {},
): void {
  const scope = scopeOf(root);
  if (!scope) return;
  for (const element of scope.querySelectorAll(`[${ACTIVE}]`)) {
    element.removeAttribute(ACTIVE);
  }
  if (!id) return;
  const element = scope.querySelector(`[${MARK}="${cssEscape(id)}"]`);
  if (!element) return;
  element.setAttribute(ACTIVE, "");
  if (options.scroll !== false) {
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

/**
 * Marks the targets that can be found and wires the interactions. Returns a
 * cleanup that puts the document back as it was, because these same nodes are
 * what a visitor sees the moment the client switches to review mode.
 */
export function attachHotspots(
  root: HTMLElement | Document,
  targets: HotspotTarget[],
  options: HotspotOptions,
): () => void {
  const doc = documentOf(root);
  const scope = scopeOf(root);
  if (!doc || !scope) return () => undefined;

  clearHotspots(root);

  if (!doc.getElementById(STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    doc.head.append(style);
  }

  const claimed = new Set<Element>();
  const byText = new Map<string, HTMLElement[]>();
  const byImage = new Map<string, HTMLElement[]>();

  for (const element of scope.querySelectorAll<HTMLElement>("*")) {
    if (element.id === CHIP_ID) continue;
    if (element instanceof HTMLImageElement) {
      for (const key of imageKeys(element.currentSrc || element.src)) {
        byImage.set(key, [...(byImage.get(key) ?? []), element]);
      }
      continue;
    }
    const text = normalise(element.textContent ?? "");
    if (!text || text.length > MAX_TEXT) continue;
    byText.set(text, [...(byText.get(text) ?? []), element]);
  }

  // The deepest match is the one showing *only* this value: a heading rather
  // than the section that happens to contain it.
  const deepest = (list: HTMLElement[]) =>
    list
      .filter((element) => !claimed.has(element))
      .sort(
        (a, b) =>
          a.querySelectorAll("*").length - b.querySelectorAll("*").length,
      )[0];

  for (const target of targets) {
    const value =
      target.kind === "image" ? target.value : normalise(target.value);
    if (!value) continue;

    let element: HTMLElement | undefined;
    if (target.kind === "image") {
      for (const key of imageKeys(value)) {
        element = deepest(byImage.get(key) ?? []);
        if (element) break;
      }
    } else {
      element = deepest(byText.get(value) ?? []);
    }
    if (!element) continue;

    claimed.add(element);
    element.setAttribute(MARK, target.id);
    element.setAttribute(KIND, target.kind);
  }

  const chip = doc.createElement("div");
  chip.id = CHIP_ID;
  scope.append(chip);

  const place = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    chip.textContent =
      element.getAttribute(KIND) === "image"
        ? options.imageLabel
        : options.textLabel;
    chip.style.display = "block";
    if (scope === doc.body) {
      const view = doc.defaultView;
      chip.style.top = `${rect.top + (view?.scrollY ?? 0) - 2}px`;
      chip.style.left = `${rect.left + (view?.scrollX ?? 0)}px`;
      return;
    }
    const box = scope.getBoundingClientRect();
    chip.style.top = `${rect.top - box.top + scope.scrollTop - 2}px`;
    chip.style.left = `${rect.left - box.left + scope.scrollLeft}px`;
  };

  const onOver = (event: Event) => {
    const target = (event.target as Element | null)?.closest?.(`[${MARK}]`);
    if (target instanceof HTMLElement) place(target);
    else chip.style.display = "none";
  };

  const hide = () => {
    chip.style.display = "none";
  };

  const onClick = (event: MouseEvent) => {
    const element = (event.target as Element | null)?.closest?.(`[${MARK}]`);
    if (element) {
      event.preventDefault();
      event.stopPropagation();
      const id = element.getAttribute(MARK);
      if (id) options.onSelect(id);
      return;
    }
    // Nothing navigates in edit mode: following a link out of the preview is
    // never what someone clicking their own page to change it meant.
    if ((event.target as Element | null)?.closest?.("a,button")) {
      event.preventDefault();
    }
  };

  scope.addEventListener("mouseover", onOver, true);
  scope.addEventListener("mouseleave", hide, true);
  scope.addEventListener("scroll", hide, true);
  scope.addEventListener("click", onClick, true);

  return () => {
    scope.removeEventListener("mouseover", onOver, true);
    scope.removeEventListener("mouseleave", hide, true);
    scope.removeEventListener("scroll", hide, true);
    scope.removeEventListener("click", onClick, true);
    chip.remove();
    doc.getElementById(STYLE_ID)?.remove();
    clearHotspots(root);
  };
}
