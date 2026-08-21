import { useEffect, useRef, useState } from "react";
import type { SiteLanguage } from "../api/types";

/**
 * The preview is an iframe rather than an inline render: a client site brings
 * its own theme, sticky headers and full-bleed layouts, none of which behave
 * inside a dashboard column. An iframe also gives us a real viewport, so the
 * phone preview is the actual mobile layout and not a scaled-down desktop one.
 */

export const PREVIEW_MESSAGE = "bbloom:preview";

export type PreviewDevice = "desktop" | "phone";

type Props = {
  siteId: string;
  lang: SiteLanguage;
  draft: boolean;
  device: PreviewDevice;
  /** Bumped by the editor after every save to pull fresh content in. */
  revision: number;
  /** Scrolls the preview to a section without reloading it. */
  focusKey?: string;
  title: string;
};

export function PreviewFrame({
  siteId,
  lang,
  draft,
  device,
  revision,
  focusKey,
  title,
}: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const src = `/preview/${siteId}?lang=${lang}&draft=${draft ? "true" : "false"}`;

  // Reload on every save. Reloading rather than patching keeps the preview
  // honest: it renders exactly what the backend would serve.
  useEffect(() => {
    if (revision === 0) return;
    const target = frame.current?.contentWindow;
    if (!target) return;
    setReady(false);
    target.location.reload();
  }, [revision]);

  useEffect(() => {
    if (!ready || !focusKey) return;
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE, action: "focus", key: focusKey },
      window.location.origin,
    );
  }, [ready, focusKey, revision]);

  return (
    <div className="flex h-full min-h-0 justify-center overflow-hidden bg-ink-50/60 p-3">
      <div
        className={`relative h-full overflow-hidden bg-white shadow-lg shadow-ink-900/5 ${
          device === "phone"
            ? "w-[390px] max-w-full rounded-3xl border-8 border-ink-900/85"
            : "w-full rounded-xl border border-ink-100"
        }`}
      >
        <iframe
          ref={frame}
          src={src}
          title={title}
          className="h-full w-full"
          onLoad={() => setReady(true)}
        />
        {!ready ? (
          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-surface/70">
            <span
              className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-bloom-500"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default PreviewFrame;
