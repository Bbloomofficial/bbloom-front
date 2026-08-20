import { useEffect } from "react";

/** Keeps the page behind a modal or drawer from scrolling. */
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
}
