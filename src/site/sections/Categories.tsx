import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Icon } from "../components/Icon";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { str } from "../utils/content";

/** Plain category cards — the classic shop. */
export function CategoriesCards({ section }: { section: PublicSection }) {
  const { categories } = useSite();
  if (categories.length === 0) return null;

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Reveal key={category.id} delay={index * 70}>
            <a
              href="#products"
              className="site-card site-zoom group block h-full overflow-hidden p-0"
            >
              <SiteImage
                media={category.image}
                alt={category.name}
                seed={category.slug}
                ratio="4 / 3"
                rounded={false}
              />
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <h3 className="site-heading site-h4 text-site-text">
                    {category.name}
                  </h3>
                  {category.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-site-muted">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <span className="text-site-primary transition group-hover:translate-x-1">
                  <Icon name="arrow" size={18} />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Band>
  );
}

/**
 * Editorial tiles where the first category runs full height — `shop-modern`.
 * `layout` switches between the tile mosaic, a swipeable row and a masonry wall.
 */
export function CategoriesShowcaseTiles({
  section,
}: {
  section: PublicSection;
}) {
  const { categories, effects, t } = useSite();
  const layout = str(section.content, "layout") ?? "tiles";
  if (categories.length === 0) return null;

  const tile = (
    category: (typeof categories)[number],
    large: boolean,
    index: number,
  ) => (
    <Reveal
      key={category.id}
      delay={index * 80}
      className={large ? "sm:row-span-2" : ""}
    >
      <a
        href="#products"
        className={`site-zoom group relative block h-full overflow-hidden rounded-site-lg border border-site-border ${
          effects.hoverLift ? "site-lift" : ""
        }`}
      >
        <SiteImage
          media={category.image}
          alt={category.name}
          seed={category.slug}
          ratio={large ? "3 / 4" : "4 / 3"}
          rounded={false}
          className="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div>
            <h3 className="site-heading site-h3">{category.name}</h3>
            <p className="text-sm text-white/75">
              {category.productCount} {t.itemsCount}
            </p>
          </div>
          <span className="rounded-full border border-white/40 p-2 transition group-hover:bg-white/15">
            <Icon name="arrow" size={18} />
          </span>
        </div>
      </a>
    </Reveal>
  );

  if (layout === "carousel") {
    return (
      <Band id={section.key}>
        <SectionHeading
          eyebrow={str(section.content, "eyebrow")}
          title={str(section.content, "title")}
          subtitle={str(section.content, "subtitle")}
        />
        <div className="site-scrollbar-none mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <div key={category.id} className="w-72 shrink-0 snap-start">
              {tile(category, false, index)}
            </div>
          ))}
        </div>
      </Band>
    );
  }

  if (layout === "masonry") {
    return (
      <Band id={section.key}>
        <SectionHeading
          eyebrow={str(section.content, "eyebrow")}
          title={str(section.content, "title")}
          subtitle={str(section.content, "subtitle")}
        />
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {categories.map((category, index) => (
            <div key={category.id} className="break-inside-avoid">
              {tile(category, index % 3 === 0, index)}
            </div>
          ))}
        </div>
      </Band>
    );
  }

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid auto-rows-[minmax(180px,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) =>
          // A tall first tile only reads as deliberate when the rest fill the grid.
          tile(
            category,
            index === 0 && categories.length % 3 === 1 && categories.length > 3,
            index,
          ),
        )}
      </div>
    </Band>
  );
}
