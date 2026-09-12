import { Link } from "react-router-dom";
import TemplateThumb from "../../components/TemplateThumb";
import type { SiteTemplate } from "../../api/templates";
import type { DashboardStrings } from "../strings";

/**
 * Where a design's live demo is published.
 *
 * Takes the slug the templates endpoint reports rather than rebuilding it from
 * the template code: `demoSlug` is null when that design has no published demo,
 * and re-deriving it would turn "no demo exists" into a confident link to a
 * site that isn't there.
 */
export function demoUrl(demoSlug: string) {
  return `https://${demoSlug}.bbloom.ge`;
}

type Props = {
  template: SiteTemplate;
  t: DashboardStrings;
  /** Chosen right now, in whichever picker this card is in. */
  selected?: boolean;
  /** Above the account's ceiling. Shown off, but not selectable. */
  locked?: boolean;
  /** Already the site's design, on the design switcher. */
  current?: boolean;
  /** Absent on a card that is only ever shown, never picked. */
  onSelect?: () => void;
  /** Where an upgrade is bought. A locked card is useless without it. */
  plansHref: string;
  /** Overrides the picker's default call to action. */
  selectLabel?: string;
};

/**
 * One design, in every picker a signed-in client sees.
 *
 * Shared so a locked design reads identically wherever it appears: the card is
 * an advertisement for a plan, and two wordings for the same lock would be two
 * different offers.
 *
 * A locked design stays full-colour and keeps its demo link — deliberately. The
 * point is to make someone want it. What it loses is the means of choosing it:
 * the selection button is **not rendered at all**, replaced by the link to the
 * plans. That is a stronger guarantee than a disabled button, because there is
 * no control left to re-enable, and the parent cannot submit a code the client
 * was never able to put into state.
 */
export default function TemplateCard({
  template,
  t,
  selected = false,
  locked = false,
  current = false,
  onSelect,
  plansHref,
  selectLabel,
}: Props) {
  /*
    The card is a container, not the control. It cannot be a single <button>:
    an <a> may not live inside one, so the demo link and the plans link are
    siblings of the selection button rather than children of it. That also
    means clicking either cannot select the design — there is no ancestor
    handler for it to reach, which survives someone later adding one.
  */
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border transition ${
        selected
          ? "border-bloom-500 ring-2 ring-bloom-500/30"
          : locked
            ? "border-ink-100"
            : "border-ink-100 hover:border-bloom-300"
      }`}
    >
      {locked && (
        <span className="absolute end-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-ink-900/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          <svg
            viewBox="0 0 20 20"
            className="h-3 w-3 shrink-0"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2a4 4 0 0 0-4 4v2H5.5A1.5 1.5 0 0 0 4 9.5v7A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 8H14V6a4 4 0 0 0-4-4Zm2 6H8V6a2 2 0 1 1 4 0v2Z" />
          </svg>
          {t.design.lockedBadge}
        </span>
      )}
      {current && !locked && (
        <span className="absolute end-2 top-2 z-10 rounded-full bg-bloom-600 px-2.5 py-1 text-[11px] font-bold text-white">
          {t.design.current}
        </span>
      )}

      {/* The same markup whether or not it is selectable, so a locked design
          looks like something worth having rather than something broken. */}
      {onSelect && !locked ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="block w-full flex-1 text-start"
        >
          <CardFace template={template} />
        </button>
      ) : (
        <div className="w-full flex-1">
          <CardFace template={template} />
        </div>
      )}

      {locked && (
        <p className="px-3 pt-2 text-xs text-ink-500">{t.design.lockedBody}</p>
      )}
      {current && !locked && (
        <p className="px-3 pt-2 text-xs text-ink-500">
          {t.design.currentNote}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-2 px-3 pb-3">
        {locked ? (
          <Link
            to={plansHref}
            className="inline-flex items-center justify-center rounded-xl bg-bloom-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-bloom-700"
          >
            {t.design.seePlans}
          </Link>
        ) : (
          onSelect &&
          selectLabel && (
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex items-center justify-center rounded-xl border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
            >
              {selectLabel}
            </button>
          )
        )}

        {/* A new tab on purpose: someone half-way through naming their business
            should not lose the form to a navigation. Absent when the design has
            no published demo, so the button is never offered for a site that
            will not load. */}
        {template.demoSlug && (
          <a
            href={demoUrl(template.demoSlug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
          >
            {t.newSite.viewDemo}
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.29a1 1 0 0 0 1.42 1.42L15 6.41V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
              <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

function CardFace({ template }: { template: SiteTemplate }) {
  return (
    <>
      <span className="block aspect-[4/3] w-full overflow-hidden bg-ink-50">
        <TemplateThumb template={template} alt="" />
      </span>
      <span className="block px-3 pt-3">
        <span className="block text-sm font-bold text-ink-900">
          {template.name}
        </span>
        <span className="block text-xs text-ink-400">{template.tagline}</span>
      </span>
    </>
  );
}
