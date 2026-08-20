import { useEffect, useState } from "react";
import type { PublicSection, SiteLanguage } from "../api/types";
import { Container } from "../components/layout";
import { Cta } from "../components/SiteButton";
import { Icon } from "../components/Icon";
import { useSite } from "../context";
import { bool, image, itemStr, list, str } from "../utils/content";

type MenuItem = { label?: string; href?: string };

function useNav(section: PublicSection) {
  const content = section.content;
  return {
    logo: image(content, "logo") ?? undefined,
    showName: bool(content, "showBusinessName", true),
    phone: str(content, "phone"),
    ctaLabel: str(content, "ctaLabel"),
    ctaHref: str(content, "ctaHref"),
    showLanguageSwitch: bool(content, "showLanguageSwitch", false),
    items: list<MenuItem>(content, "menu").filter((item) =>
      itemStr(item, "label"),
    ),
  };
}

function Brand({
  logo,
  showName,
  className = "",
}: {
  logo?: { url: string; alt: string | null } | undefined;
  showName: boolean;
  className?: string;
}) {
  const { meta } = useSite();
  return (
    <a href="#top" className={`flex items-center gap-3 site-link ${className}`}>
      {logo?.url ? (
        <img
          src={logo.url}
          alt={logo.alt ?? meta.businessName}
          className="h-9 w-auto object-contain"
        />
      ) : null}
      {showName || !logo?.url ? (
        <span className="site-heading text-lg tracking-tight">
          {meta.businessName}
        </span>
      ) : null}
    </a>
  );
}

function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { meta, locale, setLanguage } = useSite();
  const languages = (meta.languages ?? []).filter(Boolean);
  if (languages.length < 2) return null;

  return (
    <div
      className={`flex items-center gap-1 ${compact ? "" : "rounded-site-pill border border-site-border p-0.5"}`}
    >
      {languages.map((language: SiteLanguage) => (
        <button
          key={language}
          type="button"
          onClick={() => setLanguage(language)}
          aria-pressed={language === locale}
          className={`rounded-site-pill px-2.5 py-1 text-xs font-semibold uppercase transition ${
            language === locale
              ? "bg-site-primary text-site-on-primary"
              : "text-site-muted hover:text-site-text"
          }`}
        >
          {language}
        </button>
      ))}
    </div>
  );
}

function MobileMenu({
  items,
  phone,
  ctaLabel,
  ctaHref,
  showLanguageSwitch,
  className = "md:hidden",
}: {
  items: MenuItem[];
  phone?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showLanguageSwitch: boolean;
  className?: string;
}) {
  const { t } = useSite();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={open ? t.closeMenu : t.openMenu}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-site border border-site-border p-2 text-site-text"
      >
        <Icon name={open ? "close" : "plus"} size={20} />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-site-border bg-site-surface shadow-site">
          <Container>
            <nav className="flex flex-col py-4">
              {items.map((item, index) => (
                <a
                  key={`${item.href}-${index}`}
                  href={item.href ?? "#"}
                  onClick={() => setOpen(false)}
                  className="site-link border-b border-site-border/60 py-3 text-base font-medium last:border-0"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="site-link inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    <Icon name="phone" size={16} />
                    {phone}
                  </a>
                ) : null}
                {showLanguageSwitch ? <LanguageSwitch /> : null}
              </div>
              <Cta label={ctaLabel} href={ctaHref} className="mt-4 w-full" />
            </nav>
          </Container>
        </div>
      ) : null}
    </div>
  );
}

/** Compact left-aligned bar — `shop-simple`, `restaurant-simple`. */
export function HeaderMinimal({ section }: { section: PublicSection }) {
  const nav = useNav(section);

  return (
    <header
      id={section.key}
      className="relative border-b border-site-border bg-site-bg"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Brand logo={nav.logo} showName={nav.showName} />

          <nav className="hidden items-center gap-7 md:flex">
            {nav.items.map((item, index) => (
              <a
                key={index}
                href={item.href ?? "#"}
                className="site-link text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {nav.showLanguageSwitch ? <LanguageSwitch /> : null}
            {nav.phone ? (
              <a
                href={`tel:${nav.phone.replace(/\s/g, "")}`}
                className="site-link inline-flex items-center gap-2 text-sm font-semibold"
              >
                <Icon name="phone" size={16} />
                {nav.phone}
              </a>
            ) : null}
            <Cta label={nav.ctaLabel} href={nav.ctaHref} />
          </div>

          <MobileMenu {...nav} />
        </div>
      </Container>
    </header>
  );
}

/** Centred wordmark with the navigation underneath — the classic templates. */
export function HeaderClassicCentered({ section }: { section: PublicSection }) {
  const nav = useNav(section);
  const { effects } = useSite();

  return (
    <header
      id={section.key}
      className="relative border-b border-site-border bg-site-bg"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 md:h-auto md:flex-col md:gap-3 md:py-6">
          <Brand
            logo={nav.logo}
            showName={nav.showName}
            className="md:text-center"
          />

          <div className="hidden items-center gap-3 text-sm text-site-muted md:flex">
            {nav.phone ? (
              <a
                href={`tel:${nav.phone.replace(/\s/g, "")}`}
                className="site-link font-semibold"
              >
                {nav.phone}
              </a>
            ) : null}
            {nav.showLanguageSwitch ? <LanguageSwitch compact /> : null}
          </div>

          <MobileMenu {...nav} />
        </div>
      </Container>

      {effects.goldDividers ? <div className="site-divider" /> : null}

      <div className="hidden border-t border-site-border md:block">
        <Container>
          <nav className="flex flex-wrap items-center justify-center gap-8 py-3">
            {nav.items.map((item, index) => (
              <a
                key={index}
                href={item.href ?? "#"}
                className="site-link text-xs font-semibold tracking-[0.18em] uppercase"
              >
                {item.label}
              </a>
            ))}
            {nav.ctaLabel ? (
              <Cta
                label={nav.ctaLabel}
                href={nav.ctaHref}
                tone="outline"
                className="ml-2"
              />
            ) : null}
          </nav>
        </Container>
      </div>
    </header>
  );
}

/** Sticky glass bar that condenses on scroll — the flagship templates. */
export function HeaderStickyGlass({ section }: { section: PublicSection }) {
  const nav = useNav(section);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id={section.key}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "site-glass border-b border-site-border shadow-site"
          : "border-b border-transparent"
      }`}
    >
      <Container>
        <div
          className={`flex items-center justify-between gap-6 transition-all ${scrolled ? "h-16" : "h-20"}`}
        >
          <Brand logo={nav.logo} showName={nav.showName} />

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.items.map((item, index) => (
              <a
                key={index}
                href={item.href ?? "#"}
                className="site-link relative text-sm font-medium after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-site-primary after:transition-all hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {nav.showLanguageSwitch ? <LanguageSwitch /> : null}
            {nav.phone ? (
              <a
                href={`tel:${nav.phone.replace(/\s/g, "")}`}
                className="site-link inline-flex items-center gap-2 text-sm font-semibold"
              >
                <Icon name="phone" size={16} />
                <span className="hidden xl:inline">{nav.phone}</span>
              </a>
            ) : null}
            <Cta label={nav.ctaLabel} href={nav.ctaHref} />
          </div>

          <div className="lg:hidden">
            <MobileMenu {...nav} className="" />
          </div>
        </div>
      </Container>
    </header>
  );
}
