import { useCallback, useEffect, useState } from "react";
import type { MediaRef } from "../api/types";
import { useSite } from "../context";
import { useLockScroll } from "../hooks/useLockScroll";
import { Icon } from "./Icon";

/** Keyboard-navigable image viewer shared by both gallery variants. */
export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: MediaRef[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const { t } = useSite();
  const open = index !== null;
  useLockScroll(open);

  const step = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  if (!open || !images[index]) return null;
  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.gallery}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.close}
        className="absolute top-4 right-4 rounded-full border border-white/25 p-2 text-white transition hover:border-white/50 hover:bg-white/15 active:scale-90"
      >
        <Icon name="close" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label={t.previous}
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 rounded-full border border-white/25 p-2.5 text-white transition hover:bg-white/10 sm:left-6"
          >
            <Icon name="chevronLeft" />
          </button>
          <button
            type="button"
            aria-label={t.next}
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            className="absolute right-3 rounded-full border border-white/25 p-2.5 text-white transition hover:bg-white/10 sm:right-6"
          >
            <Icon name="chevronRight" />
          </button>
        </>
      ) : null}

      <img
        src={current.url}
        alt={current.alt ?? ""}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[86vh] max-w-[92vw] rounded-site-lg object-contain shadow-2xl"
      />
    </div>
  );
}

/** Small hook so gallery sections only track an index. */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    open: (value: number) => setIndex(value),
    close: () => setIndex(null),
    setIndex,
  };
}
