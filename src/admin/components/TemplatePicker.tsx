import { useState } from "react";
import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { TEMPLATE_CATEGORIES, TEMPLATE_TIERS } from "../api/types";
import { TemplatePreview, TemplatePreviewDialog, demoHref } from "./TemplatePreview";
import type { TemplateSummary } from "../api/types";

/**
 * Staff pick a look, not a code. Templates are grouped by category and ordered
 * from plainest to richest, which is the order clients are walked through them.
 */

const TIER_RANK = new Map<string, number>(
  TEMPLATE_TIERS.map((tier, index) => [tier, index]),
);

export default function TemplatePicker({
  templates,
  selected,
  onSelect,
}: {
  templates: TemplateSummary[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewed = templates.find((item) => item.code === previewing) ?? null;

  // Anything in an unexpected category still gets shown, after the known ones.
  const categories = [
    ...TEMPLATE_CATEGORIES.filter((category) =>
      templates.some((template) => template.category === category),
    ),
    ...[...new Set(templates.map((template) => template.category))].filter(
      (category) =>
        !TEMPLATE_CATEGORIES.includes(category as (typeof TEMPLATE_CATEGORIES)[number]),
    ),
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const group = templates
          .filter((template) => template.category === category)
          .sort(
            (a, b) =>
              (TIER_RANK.get(a.tier) ?? 99) - (TIER_RANK.get(b.tier) ?? 99),
          );

        return (
          <section key={category}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400">
              {t.categories[category] ?? category}
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((template) => {
                const active = template.code === selected;
                const demo = demoHref(template);
                return (
                  <div
                    key={template.code}
                    className={[
                      "group relative overflow-hidden rounded-3xl border bg-surface transition",
                      active
                        ? "border-bloom-400 shadow-xl shadow-bloom-600/10 ring-4 ring-tint-strong"
                        : "border-ink-100 hover:border-bloom-200 hover:shadow-lg hover:shadow-bloom-600/5",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelect(template.code)}
                      className="block w-full text-start"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                        <TemplatePreview
                          template={template}
                          label={t.wizard.noPreview}
                        />
                        {template.flagship && (
                          <span className="absolute end-3 top-3 rounded-full bg-contrast/80 px-2.5 py-1 text-[11px] font-semibold text-white">
                            {t.wizard.flagship}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-ink-900">{template.name}</h4>
                          <span className="shrink-0 rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-tint-fg">
                            {t.tiers[template.tier] ?? template.tier}
                          </span>
                        </div>
                        {template.tagline && (
                          <p className="mt-1 text-sm text-ink-600">
                            {template.tagline}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-ink-400" dir="ltr">
                          {template.code}
                        </p>
                      </div>
                    </button>

                    {/* Siblings of the select button, not children: nesting
                        interactive elements is invalid and swallows the click. */}
                    <div className="absolute start-3 top-3 flex flex-wrap gap-2 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPreviewing(template.code)}
                        className="rounded-full bg-contrast/70 px-3 py-1.5 text-[11px] font-semibold text-white"
                      >
                        {t.wizard.preview}
                      </button>
                      {demo && (
                        <a
                          href={demo}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-ink-900 hover:bg-white"
                        >
                          {t.wizard.demo}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {previewed && (
        <TemplatePreviewDialog
          template={previewed}
          onClose={() => setPreviewing(null)}
          onChoose={() => onSelect(previewed.code)}
        />
      )}
    </div>
  );
}
