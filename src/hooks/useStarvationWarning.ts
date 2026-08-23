import { useCallback, useRef } from "react";

/** Below this a pane is not "tight", it is unusable. */
const MIN_USABLE_PX = 80;

/**
 * Warns, in development only, when a scrolling pane has been squeezed to
 * nothing by its siblings.
 *
 * This exists because of a real bug rather than as a general precaution. The
 * try-editor's field pane was the only flexible child of a container capped at
 * `65vh`, and its siblings were fixed at ~500px, so the editing area was the
 * remainder: 18px on the tallest phone made, and zero below about 830px of
 * viewport. A client on a 16-section template had no visible field at all.
 *
 * The reason it survived is the part worth guarding. **It looks correct at
 * every height a developer tests at.** The chrome is fixed and the container is
 * proportional, so the fault only appears as the screen gets shorter — the
 * opposite of where anyone looks. It measures rather than inspecting classes,
 * so it still fires if the squeeze comes back via different CSS, which is how
 * it would come back.
 *
 * Returns a **callback ref**, and that is load-bearing rather than a style
 * choice. The first version was a `useEffect` reading a `useRef`, and it was
 * verified dead: at mount the pane does not exist yet, because the template is
 * still loading, so `ref.current` was null and the check returned early —
 * silently, in precisely the situation it was written to catch. A
 * `ResizeObserver` attached when the node appears has no such window, and also
 * covers the case the bug actually lives in: the viewport getting shorter after
 * load.
 */
export function useStarvationWarning(label: string) {
  const observer = useRef<ResizeObserver | null>(null);
  const starved = useRef(false);

  return useCallback(
    (element: HTMLElement | null) => {
      if (!import.meta.env.DEV) return;
      observer.current?.disconnect();
      observer.current = null;
      starved.current = false;
      if (!element || typeof ResizeObserver === "undefined") return;

      observer.current = new ResizeObserver(() => {
        const visible = element.clientHeight;
        const held = element.scrollHeight;
        // Nothing in it yet is not the same as no room for what is in it.
        const bad = held > visible && visible < MIN_USABLE_PX;
        if (bad === starved.current) return;
        starved.current = bad;
        if (!bad) return;
        console.warn(
          `[layout] "${label}" is ${visible}px tall but holds ${held}px at a ` +
            `${window.innerHeight}px viewport. Its siblings are taking the ` +
            `space. Check it at 390x640, not just at desktop heights.`,
        );
      });
      observer.current.observe(element);
    },
    [label],
  );
}
