import type { PublicSection, RateItem } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Cta } from "../components/SiteButton";
import { Icon } from "../components/Icon";
import { useSite } from "../context";
import { itemStr, list, str } from "../utils/content";

/**
 * The two sections the personal templates are built around: what someone is
 * qualified to do, and what they charge for it.
 *
 * A shop proves itself with a catalogue and a restaurant with a menu. A teacher,
 * a lawyer or a photographer has neither — the credentials *are* the product
 * page, and the rate card is the closest thing to a price list they have.
 *
 * Nothing here sells. `price` and `unit` are strings the client typed out in
 * full ("45 GEL", "per hour") and are printed exactly as given: no formatter, no
 * currency, no minor units. That is not an omission to be tidied up later. A
 * rate card is an advertisement, `ctaHref` goes to the contact form, and the
 * categories these sections belong to cannot take online orders at all — so a
 * buy button here would be one no visitor could ever complete.
 */

/**
 * The lines of a rate card's inclusion list.
 *
 * Each entry is an object carrying `text`, because that is what makes the rows
 * editable in the dashboard — a list of bare strings has no `itemFields` schema
 * behind it and cannot be added to. A bare string is still accepted, so a
 * hand-authored payload degrades to something readable rather than to a column
 * of empty bullets, and anything with no text at all is dropped instead of
 * drawing an empty row.
 */
function itemBullets(item: unknown, key: string): string[] {
  if (!item || typeof item !== "object") return [];
  const value = (item as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) =>
      typeof entry === "string" ? entry : (itemStr(entry, "text") ?? ""),
    )
    .filter((text) => text.trim() !== "");
}

function itemBool(item: unknown, key: string): boolean {
  if (!item || typeof item !== "object") return false;
  return (item as Record<string, unknown>)[key] === true;
}

/**
 * Dated entries on a vertical rail — the plainest way to read a career, and the
 * default because it is the one that survives an entry with only a title.
 */
export function CredentialsTimeline({ section }: { section: PublicSection }) {
  const items = list(section.content, "items");
  const { effects } = useSite();
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <ol className="mx-auto mt-10 max-w-2xl border-s border-site-border">
        {items.map((item, index) => (
          <Reveal as="li" key={index} delay={index * 80} className="relative">
            <div className="relative ps-8 pb-8">
              <span
                className="absolute start-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-site-primary rtl:translate-x-1/2"
                aria-hidden="true"
              />
              {itemStr(item, "period") ? (
                <span className="site-eyebrow">{itemStr(item, "period")}</span>
              ) : null}
              <h3 className="site-heading site-h4 mt-1 text-site-text">
                {itemStr(item, "title")}
              </h3>
              {itemStr(item, "organisation") ? (
                <p className="mt-0.5 text-sm font-semibold text-site-primary">
                  {itemStr(item, "organisation")}
                </p>
              ) : null}
              {itemStr(item, "detail") ? (
                <p className="mt-2 text-sm leading-relaxed text-site-muted">
                  {itemStr(item, "detail")}
                </p>
              ) : null}
              {effects.goldDividers ? (
                <div className="site-divider mt-4 w-12" />
              ) : null}
            </div>
          </Reveal>
        ))}
      </ol>
    </Band>
  );
}

/** The same entries as cards, for a template that wants them side by side. */
export function CredentialsCards({ section }: { section: PublicSection }) {
  const items = list(section.content, "items");
  const { effects } = useSite();
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={index} delay={index * 80} className="h-full">
            <article
              className={`flex h-full flex-col gap-3 p-6 ${
                effects.glassCards ? "site-glass rounded-site-lg" : "site-card"
              } ${effects.hoverLift ? "site-lift" : ""}`}
            >
              <span className="text-site-primary">
                <Icon name={itemStr(item, "icon") ?? "award"} size={26} />
              </span>
              {itemStr(item, "period") ? (
                <span className="site-eyebrow">{itemStr(item, "period")}</span>
              ) : null}
              <h3 className="site-heading site-h4 text-site-text">
                {itemStr(item, "title")}
              </h3>
              {itemStr(item, "organisation") ? (
                <p className="text-sm font-semibold text-site-primary">
                  {itemStr(item, "organisation")}
                </p>
              ) : null}
              {itemStr(item, "detail") ? (
                <p className="text-sm leading-relaxed text-site-muted">
                  {itemStr(item, "detail")}
                </p>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}

/**
 * A price and its unit, printed verbatim.
 *
 * Kept as one component so there is a single place in the codebase where these
 * two fields are rendered, and so it is obvious that nothing happens to them on
 * the way to the page.
 */
function Price({ item }: { item: unknown }) {
  const price = itemStr(item, "price");
  const unit = itemStr(item, "unit");
  if (!price && !unit) return null;
  return (
    <p className="flex flex-wrap items-baseline gap-1.5">
      {price ? (
        <span className="site-heading site-h3 text-site-text">{price}</span>
      ) : null}
      {unit ? <span className="text-sm text-site-muted">{unit}</span> : null}
    </p>
  );
}

/** What each package includes. Absent when the client listed nothing. */
function Bullets({ item }: { item: unknown }) {
  const bullets = itemBullets(item, "bullets");
  if (bullets.length === 0) return null;
  return (
    <ul className="flex flex-1 flex-col gap-2">
      {bullets.map((bullet, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-site-muted">
          <span className="mt-0.5 shrink-0 text-site-accent">
            <Icon name="check" size={16} />
          </span>
          {bullet}
        </li>
      ))}
    </ul>
  );
}

/** Packages side by side, with the recommended one lifted out of the row. */
export function RatesCards({ section }: { section: PublicSection }) {
  const items = list<RateItem>(section.content, "items");
  const { effects } = useSite();
  if (items.length === 0) return null;

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const featured = itemBool(item, "featured");
          return (
            <Reveal key={index} delay={index * 80} className="h-full">
              <article
                className={`flex h-full flex-col gap-4 p-7 ${
                  effects.glassCards ? "site-glass rounded-site-lg" : "site-card"
                } ${effects.hoverLift ? "site-lift" : ""} ${
                  featured ? "ring-2 ring-site-primary" : ""
                }`}
              >
                <h3 className="site-heading site-h4 text-site-text">
                  {itemStr(item, "name")}
                </h3>
                <Price item={item} />
                {itemStr(item, "description") ? (
                  <p className="text-sm leading-relaxed text-site-muted">
                    {itemStr(item, "description")}
                  </p>
                ) : null}
                <Bullets item={item} />
                <Cta
                  label={itemStr(item, "ctaLabel")}
                  href={itemStr(item, "ctaHref")}
                  tone={featured ? "primary" : "outline"}
                  className="mt-auto self-start"
                />
              </article>
            </Reveal>
          );
        })}
      </div>
    </Band>
  );
}

/**
 * The compact form: a list of what things cost, for someone whose rates are a
 * reference rather than a decision between packages.
 */
export function RatesTable({ section }: { section: PublicSection }) {
  const items = list<RateItem>(section.content, "items");
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <ul className="mx-auto mt-10 max-w-3xl divide-y divide-site-border border-y border-site-border">
        {items.map((item, index) => (
          <Reveal as="li" key={index} delay={index * 60}>
            <div className="flex flex-wrap items-start justify-between gap-4 py-5">
              <div className="min-w-0 flex-1">
                <h3 className="site-heading text-site-text">
                  {itemStr(item, "name")}
                </h3>
                {itemStr(item, "description") ? (
                  <p className="mt-1 text-sm text-site-muted">
                    {itemStr(item, "description")}
                  </p>
                ) : null}
                <Bullets item={item} />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 text-end">
                <Price item={item} />
                <Cta
                  label={itemStr(item, "ctaLabel")}
                  href={itemStr(item, "ctaHref")}
                  tone="ghost"
                />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Band>
  );
}
