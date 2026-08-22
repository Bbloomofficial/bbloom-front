import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Icon } from "../components/Icon";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { itemNum, itemStr, list, str, toMedia } from "../utils/content";

function Rating({ value }: { value?: number }) {
  const stars = Math.round(value ?? 0);
  if (!stars) return null;
  return (
    <span className="flex gap-0.5 text-site-primary" aria-label={`${stars}/5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < stars ? "" : "opacity-25"}>
          <Icon name="star" size={16} filled={index < stars} />
        </span>
      ))}
    </span>
  );
}

/** Clients can clear an avatar, so the initial stands in when there is none. */
function Avatar({ item, size = 40 }: { item: unknown; size?: number }) {
  const media = toMedia((item as Record<string, unknown>)?.avatar);
  const author = itemStr(item, "author") ?? "";
  if (media) {
    return (
      <span
        className="block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <SiteImage media={media} alt={author} ratio="1 / 1" rounded={false} />
      </span>
    );
  }
  if (!author) return null;
  return (
    <span
      className="site-heading flex shrink-0 items-center justify-center rounded-full bg-site-primary/12 text-site-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {author.slice(0, 1)}
    </span>
  );
}

export function TestimonialsQuotes({ section }: { section: PublicSection }) {
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
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={index} delay={index * 80} className="h-full">
            <figure className="site-card flex h-full flex-col gap-4 p-6">
              <Rating value={itemNum(item, "rating")} />
              <blockquote className="flex-1 text-site-text">
                <p className="text-[1.02em] leading-relaxed">
                  “{itemStr(item, "quote")}”
                </p>
              </blockquote>
              {effects.goldDividers ? (
                <div className="site-divider w-12" />
              ) : null}
              <figcaption className="site-heading flex items-center gap-3 text-sm text-site-muted">
                <Avatar item={item} size={36} />
                {itemStr(item, "author")}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}

/** Glass cards on a tinted field — the flagship social proof. */
export function TestimonialsGlassCards({
  section,
}: {
  section: PublicSection;
}) {
  const items = list(section.content, "items");
  const { effects } = useSite();
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="alt" className="overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--site-gradient-from), transparent)",
        }}
        aria-hidden="true"
      />
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={index} delay={index * 90} className="h-full">
            <figure
              className={`flex h-full flex-col gap-4 p-7 ${
                effects.glassCards ? "site-glass rounded-site-lg" : "site-card"
              } ${effects.hoverLift ? "site-lift" : ""}`}
            >
              <span className="site-heading text-4xl leading-none text-site-primary opacity-60">
                “
              </span>
              <blockquote className="flex-1 text-site-text">
                <p className="text-[1.05em] leading-relaxed">
                  {itemStr(item, "quote")}
                </p>
              </blockquote>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-site-border pt-4">
                <figcaption className="site-heading flex min-w-0 items-center gap-3 text-sm text-site-text">
                  <Avatar item={item} size={40} />
                  <span className="min-w-0 break-words">
                    {itemStr(item, "author")}
                  </span>
                </figcaption>
                <span className="shrink-0">
                  <Rating value={itemNum(item, "rating")} />
                </span>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}
