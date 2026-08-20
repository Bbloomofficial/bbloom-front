import { useEffect, useRef, useState } from "react";

/**
 * Reveals an element the first time it scrolls into view. Returns a ref plus the
 * visibility flag; the CSS in `site.css` does the animating.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  enabled = true,
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, visible };
}
