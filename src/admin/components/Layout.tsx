import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useI18n } from "../../i18n";
import { adminPath, marketingHome } from "../../routes";
import { useSession } from "../auth";
import { useSystemStatus } from "../system";
import MailAlert from "./MailAlert";
import {
  AccountsIcon,
  AdsIcon,
  CloseIcon,
  MenuIcon,
  PricingIcon,
  SignOutIcon,
  SitesIcon,
  SystemIcon,
} from "./NavIcons";
import { adminStrings } from "../strings";

/**
 * Pages given the whole width of the window rather than the usual reading
 * width: tables with more columns than that width holds.
 */
const WIDE_PAGES = [adminPath("/ads/campaigns")];

type Tab = { to: string; label: string };

/**
 * One sidebar entry. `match` lists the path prefixes that count as being in
 * this section, so the entry stays lit on its detail and editor screens.
 * `tabs` are the screens merged under it, shown as tabs above those screens.
 */
type Section = {
  key: string;
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match: string[];
  /** Whether `to` itself matches only exactly — the sites list is the root. */
  exactRoot?: boolean;
  tabs?: Tab[];
};

function inSection(pathname: string, section: Section): boolean {
  if (section.exactRoot && pathname === section.to) return true;
  return section.match.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** The tab bar for a merged section, on the screens that are its tabs. */
function SectionTabs({ tabs, pathname }: { tabs: Tab[]; pathname: string }) {
  const activeRef = useRef<HTMLAnchorElement>(null);
  // On a phone the strip scrolls, and the active tab may start off-screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);
  return (
    // The line under the tabs is an inset shadow rather than a border, and the
    // tabs carry no negative margin: either would overflow the scroll box by a
    // pixel, and Windows then draws a scrollbar beside two words.
    <nav className="mb-6 flex gap-1 overflow-x-auto [scrollbar-width:none] shadow-[inset_0_-1px_0_var(--color-ink-100)]">
      {tabs.map((tab) => {
        const active = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            ref={active ? activeRef : undefined}
            to={tab.to}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-bloom-500 text-ink-900"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { user, signOut } = useSession();
  // Staff below ADMIN cannot read the health endpoint, so the link is hidden
  // rather than left to lead them to an empty screen.
  const { forbidden } = useSystemStatus();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // A link chosen in the narrow-screen drawer should close it.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // One list, rendered in both the sidebar and the drawer, so a link cannot
  // end up existing on only one of them.
  const sections: Section[] = [
    {
      key: "sites",
      to: adminPath(),
      label: t.nav.sites,
      icon: SitesIcon,
      exactRoot: true,
      match: [adminPath("/sites")],
      tabs: [
        { to: adminPath(), label: t.nav.sites },
        { to: adminPath("/sites/new"), label: t.nav.newSite },
      ],
    },
    {
      key: "accounts",
      to: adminPath("/accounts"),
      label: t.nav.accounts,
      icon: AccountsIcon,
      match: [adminPath("/accounts")],
    },
    {
      key: "pricing",
      to: adminPath("/plans"),
      label: t.nav.pricing,
      icon: PricingIcon,
      match: [
        adminPath("/plans"),
        adminPath("/promo-codes"),
        adminPath("/new-customer-offer"),
      ],
      tabs: [
        { to: adminPath("/plans"), label: t.nav.plans },
        { to: adminPath("/promo-codes"), label: t.nav.promoCodes },
        { to: adminPath("/new-customer-offer"), label: t.nav.newCustomerOffer },
      ],
    },
    {
      key: "ads",
      to: adminPath("/ads"),
      label: t.nav.ads,
      icon: AdsIcon,
      match: [adminPath("/ads")],
      tabs: [
        { to: adminPath("/ads/campaigns"), label: t.ads.manager.openLink },
        { to: adminPath("/ads/analytics"), label: t.ads.analytics.tab },
        { to: adminPath("/ads"), label: t.nav.overview },
        { to: adminPath("/ads/settings"), label: t.ads.settingsLink },
        { to: adminPath("/ads/tools"), label: t.ads.tools },
      ],
    },
    ...(forbidden
      ? []
      : [
          {
            key: "system",
            to: adminPath("/system"),
            label: t.nav.system,
            icon: SystemIcon,
            match: [adminPath("/system")],
            tabs: [
              { to: adminPath("/system"), label: t.nav.systemStatus },
              { to: adminPath("/system/emails"), label: t.nav.emails },
            ],
          },
        ]),
  ];

  const current = sections.find((section) => inSection(pathname, section));
  // Tabs only on the screens that are tabs — not on an editor or a detail
  // page, which have their own way back.
  const tabs =
    current?.tabs && current.tabs.some((tab) => tab.to === pathname)
      ? current.tabs
      : null;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-5">
        <Link to={adminPath()} aria-label={t.brand} className="shrink-0">
          <Logo />
        </Link>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-tint-fg">
          {t.brand}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 px-5">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-3">
        {sections.map((section) => {
          const active = inSection(pathname, section);
          const Icon = section.icon;
          return (
            <Link
              key={section.key}
              to={section.to}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-tint text-tint-fg"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{section.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-100 px-3 py-4">
        <p className="truncate px-3 text-xs text-ink-400" title={user.email}>
          {t.signedInAs} {user.email}
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-bloom-600"
        >
          <SignOutIcon className="h-5 w-5 shrink-0" />
          {t.signOut}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Wide screens: a fixed sidebar. Sticky rather than fixed so the page
          beside it keeps its normal flow and scrolls on its own. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-e border-ink-100 bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Narrow screens: a bar with a menu button, and the same sidebar as a
          drawer. */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-100 bg-surface/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t.nav.openMenu}
          aria-expanded={menuOpen}
          className="rounded-xl p-2 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        >
          <MenuIcon />
        </button>
        <Link to={adminPath()} aria-label={t.brand}>
          <Logo />
        </Link>
        {current && (
          <span className="ms-auto truncate text-sm font-semibold text-ink-600">
            {current.label}
          </span>
        )}
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t.nav.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-surface pt-10 shadow-xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.nav.closeMenu}
              className="absolute end-3 top-3 rounded-xl p-2 text-ink-600 hover:bg-ink-50"
            >
              <CloseIcon />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <MailAlert />

        <main
          className={`flex-1 py-8 sm:py-10 ${
            WIDE_PAGES.includes(pathname) ? "w-full px-5 sm:px-8" : "container-page"
          }`}
        >
          {tabs && <SectionTabs tabs={tabs} pathname={pathname} />}
          {children}
        </main>

        <footer className="border-t border-ink-100 py-6">
          <div className="container-page flex flex-wrap items-center justify-end gap-3 text-xs text-ink-400">
            <a href={marketingHome()} className="font-semibold hover:text-bloom-600">
              {t.backToBbloom}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
