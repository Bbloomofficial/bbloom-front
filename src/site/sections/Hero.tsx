import { useEffect, useState } from "react";
import type { PublicSection } from "../api/types";
import { Container } from "../components/layout";
import { Icon } from "../components/Icon";
import { SiteImage } from "../components/SiteImage";
import { Cta } from "../components/SiteButton";
import { useSite } from "../context";
import { image, itemStr, list, num, str } from "../utils/content";

type Stat = { value?: string; label?: string };
type Badge = { icon?: string; label?: string };

function useHero(section: PublicSection) {
  const content = section.content;
  return {
    eyebrow: str(content, "badge") ?? str(content, "eyebrow"),
    title: str(content, "title"),
    highlight: str(content, "highlight"),
    subtitle: str(content, "subtitle"),
    ctaLabel: str(content, "ctaLabel"),
    ctaHref: str(content, "ctaHref"),
    secondaryLabel: str(content, "secondaryCtaLabel"),
    secondaryHref: str(content, "secondaryCtaHref"),
    picture: image(content, "image"),
    background: image(content, "backgroundImage"),
    videoUrl: str(content, "videoUrl"),
    overlay: (num(content, "overlayOpacity", 55) ?? 55) / 100,
    stats: list<Stat>(content, "stats"),
    badges: list<Badge>(content, "badges"),
  };
}

function Title({
  title,
  highlight,
  className = "site-h1",
}: {
  title?: string;
  highlight?: string;
  className?: string;
}) {
  const { effects } = useSite();
  if (!title && !highlight) return null;
  return (
    <h1 className={`site-heading ${className}`}>
      {title}
      {highlight ? (
        <>
          {title ? <br /> : null}
          <span
            className={
              effects.gradientText ? "site-gradient-text" : "text-site-primary"
            }
          >
            {highlight}
          </span>
        </>
      ) : null}
    </h1>
  );
}

function Actions({
  hero,
  className = "",
}: {
  hero: ReturnType<typeof useHero>;
  className?: string;
}) {
  if (!hero.ctaLabel && !hero.secondaryLabel) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Cta label={hero.ctaLabel} href={hero.ctaHref} />
      <Cta label={hero.secondaryLabel} href={hero.secondaryHref} tone="ghost" />
    </div>
  );
}

function Stats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-8">
      {stats.map((stat, index) => (
        <div key={index}>
          <dt className="site-heading site-h3 text-site-text">
            {itemStr(stat, "value")}
          </dt>
          <dd className="text-sm text-site-muted">{itemStr(stat, "label")}</dd>
        </div>
      ))}
    </dl>
  );
}

function Badges({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <li
          key={index}
          className="site-glass inline-flex items-center gap-2 rounded-site-pill px-3.5 py-1.5 text-sm"
        >
          <span className="text-site-accent">
            <Icon name={itemStr(badge, "icon") ?? "sparkles"} size={16} />
          </span>
          {itemStr(badge, "label")}
        </li>
      ))}
    </ul>
  );
}

/** Centred copy on a plain background — `shop-simple`. */
export function HeroCentered({ section }: { section: PublicSection }) {
  const hero = useHero(section);
  return (
    <section id={section.key} className="site-section bg-site-bg text-center">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
          {hero.eyebrow ? (
            <span className="site-eyebrow">{hero.eyebrow}</span>
          ) : null}
          <Title title={hero.title} highlight={hero.highlight} />
          {hero.subtitle ? (
            <p className="site-lead text-site-muted">{hero.subtitle}</p>
          ) : null}
          <Actions hero={hero} className="justify-center" />
        </div>
        {hero.picture ? (
          <SiteImage
            media={hero.picture}
            alt={hero.title}
            ratio="16 / 7"
            className="mt-12"
            priority
          />
        ) : null}
      </Container>
    </section>
  );
}

/** Copy left, picture right — `restaurant-simple`. */
export function HeroImageRight({ section }: { section: PublicSection }) {
  const hero = useHero(section);
  const { meta } = useSite();

  return (
    <section id={section.key} className="site-section bg-site-bg">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            {hero.eyebrow ? (
              <span className="site-eyebrow">{hero.eyebrow}</span>
            ) : null}
            <Title title={hero.title} highlight={hero.highlight} />
            {hero.subtitle ? (
              <p className="site-lead text-site-muted">{hero.subtitle}</p>
            ) : null}
            <Actions hero={hero} />
          </div>
          <SiteImage
            media={hero.picture ?? hero.background}
            alt={hero.title ?? meta.businessName}
            seed={meta.slug}
            ratio="4 / 3"
            priority
          />
        </div>
      </Container>
    </section>
  );
}

/** Full-bleed image with a dark scrim — the classic templates. */
export function HeroImageOverlay({ section }: { section: PublicSection }) {
  const hero = useHero(section);
  const { meta, effects } = useSite();
  const centered = section.variant === "fullwidth-overlay";

  return (
    <section id={section.key} className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {hero.background?.url ? (
          <img
            src={hero.background.url}
            alt=""
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(80% 70% at 18% 15%, color-mix(in srgb, var(--site-primary) 60%, transparent), transparent 70%), radial-gradient(70% 60% at 85% 80%, color-mix(in srgb, var(--site-accent) 55%, transparent), transparent 70%), linear-gradient(135deg, color-mix(in srgb, var(--site-primary) 45%, var(--site-bg)), color-mix(in srgb, var(--site-accent) 35%, var(--site-bg)))",
            }}
          />
        )}
        {!hero.background?.url ? (
          <div
            className="site-noise pointer-events-none absolute inset-0 opacity-50"
            aria-hidden="true"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${hero.overlay})` }}
        />
      </div>

      <Container>
        <div
          className={`flex min-h-[68vh] flex-col justify-center gap-5 py-24 text-white ${
            centered
              ? "mx-auto max-w-3xl items-center text-center"
              : "max-w-2xl"
          }`}
        >
          {hero.eyebrow ? (
            <span
              className="site-eyebrow"
              style={{ color: "var(--site-accent)" }}
            >
              {hero.eyebrow}
            </span>
          ) : null}
          <Title title={hero.title} highlight={hero.highlight} />
          {hero.subtitle ? (
            <p className="site-lead text-white/85">{hero.subtitle}</p>
          ) : null}
          <Badges badges={hero.badges} />
          <Actions hero={hero} className={centered ? "justify-center" : ""} />
          {effects.goldDividers ? (
            <div
              className="site-divider mt-6 w-40"
              style={{ opacity: 0.9 }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </Container>
      <span className="sr-only">{meta.businessName}</span>
    </section>
  );
}

/** Split layout on a gradient field — `shop-modern`. */

/**
 * Without a hero photo a lone empty panel looks unfinished, so the flagship
 * shop hero shows a small collage of real catalogue items instead.
 */
function HeroProductCollage() {
  const { products, money, openProduct, effects } = useSite();
  const picks = (
    products.filter((product) => product.featured).length > 0
      ? products.filter((product) => product.featured)
      : products
  ).slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {picks.map((product, index) => (
        <button
          key={product.id}
          type="button"
          onClick={() => openProduct(product.slug)}
          className={`overflow-hidden text-left ${
            effects.glassCards ? "site-glass rounded-site-lg" : "site-card"
          } ${effects.hoverLift ? "site-lift" : ""} ${
            index === 0 ? "col-span-2" : ""
          }`}
        >
          <SiteImage
            media={product.image}
            alt={product.name}
            seed={product.slug}
            ratio={index === 0 ? "16 / 10" : "1 / 1"}
            rounded={false}
            priority={index === 0}
          />
          <span className="flex items-baseline justify-between gap-2 p-3">
            <span className="site-heading truncate text-sm text-site-text">
              {product.name}
            </span>
            <span className="site-heading shrink-0 text-sm text-site-primary">
              {money(product.price)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function HeroSplitGradient({ section }: { section: PublicSection }) {
  const hero = useHero(section);
  const { meta, effects } = useSite();

  return (
    <section
      id={section.key}
      className={`relative isolate overflow-hidden ${effects.noiseOverlay ? "site-noise" : ""}`}
    >
      <div
        className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[38rem] w-[38rem] rounded-full opacity-30 blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--site-gradient-from), transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[34rem] w-[34rem] rounded-full opacity-25 blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--site-gradient-to), transparent 65%)",
        }}
        aria-hidden="true"
      />

      <Container>
        <div className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            {hero.eyebrow ? (
              <span className="site-glass site-eyebrow w-fit rounded-site-pill px-3.5 py-1.5">
                {hero.eyebrow}
              </span>
            ) : null}
            <Title title={hero.title} highlight={hero.highlight} />
            {hero.subtitle ? (
              <p className="site-lead max-w-xl text-site-muted">
                {hero.subtitle}
              </p>
            ) : null}
            <Actions hero={hero} />
            <Stats stats={hero.stats} />
          </div>

          <div className="relative">
            <div className="site-float">
              {(hero.picture ?? hero.background) ? (
                <SiteImage
                  media={hero.picture ?? hero.background}
                  alt={hero.title ?? meta.businessName}
                  seed={meta.slug}
                  ratio="4 / 5"
                  className="shadow-site-lg"
                  priority
                />
              ) : (
                <HeroProductCollage />
              )}
            </div>
            <div
              className="absolute -inset-6 -z-10 rounded-site-lg opacity-40 blur-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, var(--site-gradient-from), var(--site-gradient-to))",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Cinematic full-height hero with a parallax backdrop — `restaurant-modern`. */
export function HeroCinematicParallax({ section }: { section: PublicSection }) {
  const hero = useHero(section);
  const { effects, meta } = useSite();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!effects.parallaxHero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => setOffset(Math.min(window.scrollY * 0.28, 180));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [effects.parallaxHero]);

  const hasImage = Boolean(hero.background?.url);
  const overlay = hasImage ? hero.overlay : Math.min(hero.overlay, 0.25);

  return (
    <section
      id={section.key}
      className="relative isolate flex min-h-[86vh] items-end overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-20 scale-110"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        {hero.background?.url ? (
          <img
            src={hero.background.url}
            alt=""
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(75% 60% at 12% 8%, color-mix(in srgb, var(--site-gradient-from) 75%, transparent), transparent 70%), radial-gradient(70% 55% at 88% 22%, color-mix(in srgb, var(--site-gradient-to) 65%, transparent), transparent 70%), radial-gradient(90% 70% at 55% 108%, color-mix(in srgb, var(--site-primary) 45%, transparent), transparent 65%), linear-gradient(160deg, color-mix(in srgb, var(--site-surface) 90%, transparent), var(--site-bg))",
            }}
          />
        )}
      </div>
      {!hasImage ? (
        <div
          className="site-noise pointer-events-none absolute inset-0 -z-10 opacity-60"
          aria-hidden="true"
        />
      ) : null}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(to top, var(--site-bg) 2%, rgba(0,0,0,${overlay}) 45%, rgba(0,0,0,${Math.max(
            overlay - 0.2,
            0,
          )}) 100%)`,
        }}
        aria-hidden="true"
      />

      <Container>
        <div className="flex max-w-3xl flex-col gap-6 pt-40 pb-20">
          {hero.eyebrow ? (
            <span className="site-glass site-eyebrow w-fit rounded-site-pill px-3.5 py-1.5">
              {hero.eyebrow}
            </span>
          ) : null}
          <Title title={hero.title} highlight={hero.highlight} />
          {hero.subtitle ? (
            <p className="site-lead max-w-xl text-site-muted">
              {hero.subtitle}
            </p>
          ) : null}
          <Badges badges={hero.badges} />
          <Actions hero={hero} />
        </div>
      </Container>

      <span className="sr-only">{meta.businessName}</span>
    </section>
  );
}
