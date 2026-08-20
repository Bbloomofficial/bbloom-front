import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { RichText } from "../components/RichText";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { image, list, str } from "../utils/content";
import { itemStr } from "../utils/content";

type Stat = { label?: string; value?: string };

function Stats({ items }: { items: unknown[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
      {items.map((item, index) => (
        <div key={index}>
          <dt className="site-heading site-h3 text-site-primary">
            {itemStr(item, "value")}
          </dt>
          <dd className="mt-1 text-sm text-site-muted">
            {itemStr(item, "label")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Signature({ section }: { section: PublicSection }) {
  const signature = str(section.content, "signature");
  if (!signature) return null;
  return (
    <p
      className="site-heading mt-8 text-site-muted"
      style={{ fontStyle: "italic", fontSize: "1.05rem" }}
    >
      — {signature}
    </p>
  );
}

/** Text beside a picture — the simple templates. */
export function AboutTextImage({ section }: { section: PublicSection }) {
  const { meta } = useSite();
  const media = image(section.content, "image");

  return (
    <Band id={section.key} tone="surface">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow={str(section.content, "eyebrow")}
            title={str(section.content, "title")}
            align="left"
          />
          <RichText html={str(section.content, "body")} className="mt-5" />
          <Stats items={list<Stat>(section.content, "stats")} />
          <Signature section={section} />
        </Reveal>
        <Reveal delay={120}>
          <SiteImage
            media={media}
            alt={str(section.content, "title")}
            seed={meta.slug}
            ratio="4 / 3"
          />
        </Reveal>
      </div>
    </Band>
  );
}

/** Overlapping editorial split — the classic templates. */
export function AboutStorySplit({ section }: { section: PublicSection }) {
  const { meta, effects } = useSite();
  const media = image(section.content, "image");

  return (
    <Band id={section.key} tone="alt">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="relative">
            <SiteImage
              media={media}
              alt={str(section.content, "title")}
              seed={meta.slug}
              ratio="3 / 4"
            />
            <div
              className="absolute -inset-3 -z-10 rounded-site-lg border border-site-border"
              aria-hidden="true"
            />
          </div>
        </Reveal>
        <Reveal delay={100} className="order-1 lg:order-2">
          <SectionHeading
            eyebrow={str(section.content, "eyebrow")}
            title={str(section.content, "title")}
            align="left"
          />
          {effects.goldDividers ? (
            <div className="site-divider mt-5 w-24" />
          ) : null}
          <RichText html={str(section.content, "body")} className="mt-5" />
          <Stats items={list<Stat>(section.content, "stats")} />
          <Signature section={section} />
        </Reveal>
      </div>
    </Band>
  );
}

/** Full-bleed parallax image with a floating copy panel — `restaurant-modern`. */
export function AboutParallaxSplit({ section }: { section: PublicSection }) {
  const { meta, effects } = useSite();
  const media = image(section.content, "image");

  return (
    <section id={section.key} className="site-section relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <SiteImage
          media={media}
          alt=""
          seed={`${meta.slug}-about`}
          ratio="auto"
          rounded={false}
          className="h-full"
          imgClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-site-bg/80" />
      </div>

      <div className="site-container relative">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow={str(section.content, "eyebrow")}
              title={str(section.content, "title")}
              align="left"
            />
          </Reveal>
          <Reveal delay={120}>
            <div
              className={
                effects.glassCards
                  ? "site-glass rounded-site-lg p-8"
                  : "site-card p-8"
              }
            >
              <RichText html={str(section.content, "body")} />
              <Stats items={list<Stat>(section.content, "stats")} />
              <Signature section={section} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
