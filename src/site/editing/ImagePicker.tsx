import { useRef, useState } from "react";

/**
 * Choosing a picture, from a file or from a link.
 *
 * A link is fetched into a real file rather than kept as a URL. Pointing a
 * client's website at someone else's server means their page breaks the day
 * that server changes, and it also means the picture is not ours to resize,
 * serve or delete — so the link is a way to *find* an image, not a way to host
 * one. Some hosts refuse cross-origin reads, which cannot be worked around from
 * a browser, so that failure is reported plainly with the alternative.
 *
 * The component only ever hands back a `File`. What the editor then does with
 * it — hold it in a local draft, or upload it — is the editor's business, which
 * is what lets the same dialog serve the anonymous flow and the client panel.
 */

export type ImagePickerLabels = {
  title: string;
  fromFile: string;
  fromLink: string;
  linkPlaceholder: string;
  linkUse: string;
  linkFailed: string;
  cancel: string;
  note?: string;
};

function fileNameFrom(url: string): string {
  const last = url.split("?")[0].split("/").filter(Boolean).pop();
  return last && /\.[a-z0-9]{2,5}$/i.test(last) ? last : "image.jpg";
}

export function ImagePicker({
  labels,
  onPick,
  onClose,
}: {
  labels: ImagePickerLabels;
  onPick: (file: File) => void | Promise<void>;
  onClose: () => void;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function useLink() {
    const url = link.trim();
    if (!url) return;
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("fetch-failed");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("not-an-image");
      await onPick(
        new File([blob], fileNameFrom(url), { type: blob.type }),
      );
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-ink-100 bg-canvas p-5 shadow-xl">
        <h2 className="text-base font-extrabold text-ink-900">{labels.title}</h2>

        <button
          type="button"
          className="btn-secondary mt-4 w-full"
          disabled={busy}
          onClick={() => picker.current?.click()}
        >
          {labels.fromFile}
        </button>
        <input
          ref={picker}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void onPick(file);
          }}
        />

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-ink-500">
            {labels.fromLink}
          </span>
          <div className="mt-1.5 flex gap-2">
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder={labels.linkPlaceholder}
              inputMode="url"
              className="w-full min-w-0 rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void useLink();
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary btn-sm shrink-0"
              disabled={busy || !link.trim()}
              onClick={() => void useLink()}
            >
              {labels.linkUse}
            </button>
          </div>
        </label>

        {failed ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            {labels.linkFailed}
          </p>
        ) : null}
        {labels.note ? (
          <p className="mt-3 text-xs text-ink-400">{labels.note}</p>
        ) : null}

        <button
          type="button"
          className="mt-4 w-full text-sm font-semibold text-ink-500 transition hover:text-ink-900"
          onClick={onClose}
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}

export default ImagePicker;
