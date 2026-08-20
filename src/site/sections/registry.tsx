import type { ComponentType } from "react";
import type { PublicSection } from "../api/types";
import { AboutParallaxSplit, AboutStorySplit, AboutTextImage } from "./About";
import { AnnouncementBar, AnnouncementMarquee } from "./Announcement";
import { CategoriesCards, CategoriesShowcaseTiles } from "./Categories";
import { Contact } from "./Contact";
import {
  CtaSplitImageGradient,
  DeliveryLogoRow,
  HoursSimple,
  NewsletterBand,
  NewsletterGradientPanel,
  ReservationFormPanel,
} from "./Conversion";
import { EventsCards, FaqAccordion } from "./EventsFaq";
import { FeaturesIconStrip, FeaturesThreeColumns } from "./Features";
import { FooterColumns, FooterMega, FooterSimple } from "./Footer";
import { GalleryGridLightbox, GalleryMasonryLightbox } from "./Gallery";
import {
  HeaderClassicCentered,
  HeaderMinimal,
  HeaderStickyGlass,
} from "./Header";
import {
  HeroCentered,
  HeroCinematicParallax,
  HeroImageOverlay,
  HeroImageRight,
  HeroSplitGradient,
} from "./Hero";
import {
  MenuColumnsByCategory,
  MenuListByCategory,
  MenuTabsByCategory,
} from "./Menu";
import {
  ProductsFeaturedCarousel,
  ProductsGrid,
  ProductsGridFilterable,
  ProductsHighlightRow,
} from "./Products";
import { TestimonialsGlassCards, TestimonialsQuotes } from "./Testimonials";

export type SectionComponent = ComponentType<{ section: PublicSection }>;

type Entry = {
  /** Used when the payload carries a variant this renderer does not know. */
  fallback: SectionComponent;
  variants: Record<string, SectionComponent>;
};

const registry: Record<string, Entry> = {
  header: {
    fallback: HeaderMinimal,
    variants: {
      minimal: HeaderMinimal,
      "classic-centered": HeaderClassicCentered,
      "sticky-glass": HeaderStickyGlass,
    },
  },
  announcement: {
    fallback: AnnouncementBar,
    variants: { bar: AnnouncementBar, "gradient-marquee": AnnouncementMarquee },
  },
  hero: {
    fallback: HeroCentered,
    variants: {
      centered: HeroCentered,
      "image-right": HeroImageRight,
      "image-overlay": HeroImageOverlay,
      "fullwidth-overlay": HeroImageOverlay,
      "split-gradient": HeroSplitGradient,
      "cinematic-parallax": HeroCinematicParallax,
    },
  },
  features: {
    fallback: FeaturesThreeColumns,
    variants: {
      "three-columns": FeaturesThreeColumns,
      "icon-strip": FeaturesIconStrip,
    },
  },
  categories: {
    fallback: CategoriesCards,
    variants: {
      cards: CategoriesCards,
      "showcase-tiles": CategoriesShowcaseTiles,
    },
  },
  products: {
    fallback: ProductsGrid,
    variants: {
      "grid-3": ProductsGrid,
      "grid-4": ProductsGrid,
      "grid-filterable": ProductsGridFilterable,
      "featured-carousel": ProductsFeaturedCarousel,
      "highlight-row": ProductsHighlightRow,
    },
  },
  menu: {
    fallback: MenuListByCategory,
    variants: {
      "list-by-category": MenuListByCategory,
      "columns-by-category": MenuColumnsByCategory,
      "tabs-by-category": MenuTabsByCategory,
    },
  },
  about: {
    fallback: AboutTextImage,
    variants: {
      "text-image": AboutTextImage,
      "story-split": AboutStorySplit,
      "parallax-split": AboutParallaxSplit,
    },
  },
  gallery: {
    fallback: GalleryGridLightbox,
    variants: {
      "grid-lightbox": GalleryGridLightbox,
      "masonry-lightbox": GalleryMasonryLightbox,
    },
  },
  events: { fallback: EventsCards, variants: { cards: EventsCards } },
  testimonials: {
    fallback: TestimonialsQuotes,
    variants: {
      quotes: TestimonialsQuotes,
      "glass-cards": TestimonialsGlassCards,
    },
  },
  reservation: {
    fallback: ReservationFormPanel,
    variants: {
      "form-panel": ReservationFormPanel,
      "glass-form": ReservationFormPanel,
    },
  },
  delivery: {
    fallback: DeliveryLogoRow,
    variants: { "logo-row": DeliveryLogoRow },
  },
  hours: {
    fallback: HoursSimple,
    variants: { simple: HoursSimple, "with-map": HoursSimple },
  },
  faq: { fallback: FaqAccordion, variants: { accordion: FaqAccordion } },
  newsletter: {
    fallback: NewsletterBand,
    variants: {
      band: NewsletterBand,
      "gradient-panel": NewsletterGradientPanel,
    },
  },
  cta: {
    fallback: CtaSplitImageGradient,
    variants: { "split-image-gradient": CtaSplitImageGradient },
  },
  contact: {
    fallback: Contact,
    variants: {
      simple: Contact,
      "split-form": Contact,
      "split-map": Contact,
      "split-glass-form": Contact,
    },
  },
  footer: {
    fallback: FooterSimple,
    variants: {
      simple: FooterSimple,
      columns: FooterColumns,
      mega: FooterMega,
    },
  },
};

const warned = new Set<string>();

function warnOnce(message: string) {
  if (!import.meta.env.DEV || warned.has(message)) return;
  warned.add(message);
  console.warn(`[bbloom/site] ${message}`);
}

export function resolveSection(
  section: PublicSection,
): SectionComponent | null {
  const entry = registry[section.type];
  if (!entry) {
    warnOnce(`no renderer for section type "${section.type}"`);
    return null;
  }
  const variant = section.variant ?? "";
  const component = entry.variants[variant];
  if (!component) {
    warnOnce(`unknown variant "${variant}" for section type "${section.type}"`);
    return entry.fallback;
  }
  return component;
}

/** Renders one section, or nothing at all rather than breaking a live site. */
export function SectionRenderer({ section }: { section: PublicSection }) {
  const Component = resolveSection(section);
  if (!Component) return null;
  return <Component section={section} />;
}
