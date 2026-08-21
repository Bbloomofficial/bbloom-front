import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { assetUrl } from "../api/client";
import { templateText } from "../format";
import type { TemplateSummary } from "../api/types";

/**
 * The template preview, in the two sizes the wizard needs: a tile in the
 * picker and a full-size view in a dialog. Both come from the same image, a
 * wireframe of the template's own layout and palette drawn by the backend.
 */

/**
 * Where the renderer serves the template's live demo, or null when the backend
 * has not provisioned one. The wireframe shows the shape of a template; this
 * shows the finished article, which is what actually sells it to a client.
 */
export function demoHref(template: TemplateSummary): string | null {
  return template.demoSlug ? `/site/${template.demoSlug}` : null;
}

/** Stands in when there is no image, or when the one we were given fails. */
function Placeholder({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-tint to-tint-strong">
      <span
        aria-hidden
        className="text-2xl font-extrabold uppercase text-tint-fg/70"
        dir="ltr"
      >
        {code.slice(0, 2)}
      </span>
      <span className="px-3 text-center text-[11px] font-semibold text-tint-fg/70">
        {label}
      </span>
    </div>
  );
}

export function TemplatePreview({
  template,
  label,
  className = "h-full w-full object-cover object-top",
}: {
  template: TemplateSummary;
  label: string;
  className?: string;
}) {
  // Older backends send no preview at all, and any image can fail to load, so
  // a broken one falls back to the placeholder rather than a broken-image icon.
  const source = template.previewUrl ? assetUrl(template.previewUrl) : null;
  const [failed, setFailed] = useState(false);

  if (!source || failed) return <Placeholder code={template.code} label={label} />;

  return (
    <img
      src={source}
      alt=""
      loading="lazy"
      width={1200}
      height={900}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * The enlarged view. A thumbnail in a grid is enough to tell the six templates
 * apart, but not enough to decide between them, so this shows the whole frame
 * with the section list and a way to pick it without going back to the grid.
 */
export function TemplatePreviewDialog({
  template,
  onClose,
  onChoose,
}: {
  template: TemplateSummary;
  onClose: () => void;
  onChoose: () => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const closeRef = useRef<HTMLButtonElement>(null);
  const demo = demoHref(template);
  const text = templateText(template, locale);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // The grid behind must not scroll while the dialog is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={text.name}
      className="fixed inset-0 z-50 flex items-center justify-center bg-contrast/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-5">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{text.name}</h3>
            {text.tagline && (
              <p className="mt-1 text-sm text-ink-600">{text.tagline}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            {t.wizard.closePreview}
          </button>
        </div>

        <div className="bg-ink-50">
          <TemplatePreview
            template={template}
            label={t.wizard.noPreview}
            className="h-auto w-full"
          />
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs text-ink-400">{t.wizard.previewNote}</p>

          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-2xl border border-bloom-200 bg-tint p-3 transition hover:border-bloom-400"
            >
              <span aria-hidden className="text-lg leading-none">
                ↗
              </span>
              <span>
                <span className="block text-sm font-bold text-tint-fg">
                  {t.wizard.demo}
                </span>
                <span className="mt-0.5 block text-xs text-ink-600">
                  {t.wizard.demoNote}
                </span>
              </span>
            </a>
          )}

          {text.description && (
            <p className="text-sm text-ink-600">{text.description}</p>
          )}

          {template.sections && template.sections.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {template.sections.map((section) => (
                <li
                  key={section}
                  className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600"
                  dir="ltr"
                >
                  {section}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.wizard.closePreview}
            </button>
            <button
              type="button"
              onClick={() => {
                onChoose();
                onClose();
              }}
              className="btn-primary"
            >
              {t.wizard.chooseTemplate}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
