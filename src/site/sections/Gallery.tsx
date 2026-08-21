import { useMemo } from "react";
import type { MediaRef, PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Lightbox, useLightbox } from "../components/Lightbox";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { list, str, toMedia } from "../utils/content";

/** Sample sites ship without photos, so the catalog's own images stand in. */
function useGalleryImages(section: PublicSection): MediaRef[] {
  const { products } = useSite();
  return useMemo(() => {
    const authored = list<unknown>(section.content, "images")
      .map(toMedia)
      .filter((media): media is MediaRef => Boolean(media));
    if (authored.length > 0) return authored;

    const fromCatalog: MediaRef[] = [];
    products.forEach((product) => {
      if (product.image) fromCatalog.push(product.image);
      (product.gallery ?? []).forEach((media) => fromCatalog.push(media));
    });
    return fromCatalog;
  }, [section.content, products]);
}

/**
 * Until the client uploads photos the tiles borrow the catalogue's names, so
 * the wall reads as a real gallery rather than a row of blank boxes.
 */
function usePlaceholderSeeds(count: number): string[] {
  const { products, categories, meta } = useSite();
  const names = [
    ...products.map((product) => product.name ?? product.slug),
    ...categories.map((category) => category.name ?? category.slug),
  ].filter(Boolean);

  return Array.from({ length: count }, (_, index) =>
    names.length > 0
      ? names[index % names.length]
      : `${meta.businessName} ${index}`,
  );
}

export function GalleryGridLightbox({ section }: { section: PublicSection }) {
  const images = useGalleryImages(section);
  const lightbox = useLightbox();
  const { t } = useSite();
  const seeds = usePlaceholderSeeds(6);
  const tiles: (MediaRef | string)[] = images.length > 0 ? images : seeds;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((tile, index) => (
          <Reveal key={index} delay={Math.min(index, 6) * 60}>
            {typeof tile === "string" ? (
              <SiteImage media={null} alt={tile} seed={tile} ratio="1 / 1" />
            ) : (
              <button
                type="button"
                onClick={() => lightbox.open(index)}
                className="site-zoom block w-full overflow-hidden rounded-site-lg"
                aria-label={`${t.gallery} ${index + 1}`}
              >
                <SiteImage media={tile} alt="" ratio="1 / 1" rounded={false} />
              </button>
            )}
          </Reveal>
        ))}
      </div>
      <Lightbox
        images={images}
        index={lightbox.index}
        onClose={lightbox.close}
        onIndexChange={lightbox.open}
      />
    </Band>
  );
}

/** Staggered wall with a lightbox — the flagship gallery. */
export function GalleryMasonryLightbox({
  section,
}: {
  section: PublicSection;
}) {
  const images = useGalleryImages(section);
  const lightbox = useLightbox();
  const { t } = useSite();
  const seeds = usePlaceholderSeeds(8);
  const tiles: (MediaRef | string)[] = images.length > 0 ? images : seeds;
  const ratios = [
    "3 / 4",
    "1 / 1",
    "4 / 5",
    "1 / 1",
    "3 / 4",
    "4 / 3",
    "1 / 1",
    "3 / 4",
  ];

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
        {tiles.map((tile, index) => (
          <div key={index} className="break-inside-avoid">
            <Reveal delay={Math.min(index, 6) * 50}>
              {typeof tile === "string" ? (
                <SiteImage
                  media={null}
                  alt={tile}
                  seed={tile}
                  ratio={ratios[index % ratios.length]}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => lightbox.open(index)}
                  className="site-zoom block w-full overflow-hidden rounded-site-lg"
                  aria-label={`${t.gallery} ${index + 1}`}
                >
                  <SiteImage
                    media={tile}
                    alt=""
                    ratio={ratios[index % ratios.length]}
                    rounded={false}
                  />
                </button>
              )}
            </Reveal>
          </div>
        ))}
      </div>
      <Lightbox
        images={images}
        index={lightbox.index}
        onClose={lightbox.close}
        onIndexChange={lightbox.open}
      />
    </Band>
  );
}
