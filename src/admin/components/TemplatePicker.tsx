import { useState } from "react";
import { useI18n } from "../../i18n";
import { adminStrings } from "../strings";
import { TEMPLATE_CATEGORIES, TEMPLATE_TIERS } from "../api/types";
import { assetUrl } from "../api/client";
import type { TemplateSummary } from "../api/types";

/**
 * Staff pick a look, not a code. Templates are grouped by category and ordered
 * from plainest to richest, which is the order clients are walked through them.
 */

const TIER_RANK = new Map<string, number>(
  TEMPLATE_TIERS.map((tier, index) => [tier, index]),
);

/** A tinted tile standing in for a preview the backend cannot give us. */
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

function Thumbnail({ template, label }: { template: TemplateSummary; label: string }) {
  // A wireframe of the template's own layout and palette, drawn server-side.
  // Older backends don't send one, and an image can always fail to load, so a
  // broken load falls back to the placeholder rather than a broken-image icon.
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
      className="h-full w-full object-cover object-top"
      onError={() => setFailed(true)}
    />
  );
}

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
                return (
                  <button
                    key={template.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(template.code)}
                    className={[
                      "group overflow-hidden rounded-3xl border bg-surface text-start transition",
                      active
                        ? "border-bloom-400 shadow-xl shadow-bloom-600/10 ring-4 ring-tint-strong"
                        : "border-ink-100 hover:border-bloom-200 hover:shadow-lg hover:shadow-bloom-600/5",
                    ].join(" ")}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                      <Thumbnail template={template} label={t.wizard.noPreview} />
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
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
