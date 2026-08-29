import type { ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useI18n } from "../../i18n";
import { adminPath, marketingHome } from "../../routes";
import { useSession } from "../auth";
import { useSystemStatus } from "../system";
import MailAlert from "./MailAlert";
import { adminStrings } from "../strings";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    // `whitespace-nowrap` and `shrink-0` are both load-bearing: without them a
    // flex item is free to shrink below its own text, and a two-word label like
    // "ახალი საიტი" breaks across two lines inside a 16-unit-tall header.
    "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-tint text-tint-fg"
      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
  ].join(" ");
}

export default function Layout({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const t = adminStrings(locale);
  const { user, signOut } = useSession();
  // Staff below ADMIN cannot read the health endpoint, so the link is hidden
  // rather than left to lead them to an empty screen.
  const { forbidden } = useSystemStatus();

  // One list, rendered twice — the wide and narrow navs used to be separate
  // copies, which is how a link ends up existing on only one of them.
  const links = [
    { to: adminPath(), label: t.nav.sites, end: true },
    { to: adminPath("/accounts"), label: t.nav.accounts, end: false },
    { to: adminPath("/plans"), label: t.nav.plans, end: false },
    { to: adminPath("/promo-codes"), label: t.nav.promoCodes, end: false },
    {
      to: adminPath("/new-customer-offer"),
      label: t.nav.newCustomerOffer,
      end: false,
    },
    { to: adminPath("/ads"), label: t.nav.ads, end: false },
    { to: adminPath("/sites/new"), label: t.nav.newSite, end: false },
    ...(forbidden
      ? []
      : [{ to: adminPath("/system"), label: t.nav.system, end: false }]),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-surface/95 backdrop-blur">
        {/* Deliberately not `container-page`. Everything else on the screen is
            capped at `max-w-6xl` and should be — a form is unreadable ruler-wide
            — but that cap was making the header fight for 1088px on a 1920px
            monitor, which is why seven links plus the account controls had
            nowhere to go. The bar spans the window and keeps the same padding
            either side, so the first link and the last control sit the same
            distance from their edges. */}
        <div className="flex h-16 items-center gap-3 px-5 sm:px-8">
          <Link to={adminPath()} aria-label={t.brand} className="shrink-0">
            <Logo />
          </Link>
          {/* `shrink-0` and `whitespace-nowrap` for the same reason the links
              have them: this was the only shrinkable item in the row, so it was
              the one the browser crushed, and "bbloom გუნდი" wrapped onto two
              lines inside a 16-unit-tall header and rode up over the logo. */}
          <span className="hidden shrink-0 whitespace-nowrap rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-tint-fg sm:inline">
            {t.brand}
          </span>

          {/* Not `xl`, and no longer 1340px either. The seven Georgian labels
              plus the brand and the account controls measured at about 1316px,
              which is why this was never the stock 1280px breakpoint. "რეკლამა"
              makes eight and adds roughly another hundred, so the row needs
              about 1416px to fit and switches at 1440. If a ninth link is ever
              added, re-measure rather than nudging this — past about 1500px
              there is no monitor left to widen into and the links should be
              grouped instead. */}
          <nav className="ms-4 hidden items-center gap-1 [@media(min-width:1440px)]:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="rounded-xl border border-ink-100 bg-control px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
            >
              {t.signOut}
            </button>
          </div>
        </div>

        {/* Below the width where the links fit beside the brand they move to
            their own row and scroll on purpose — a row that scrolls when you
            expect it to is better than one that quietly clips. Same padding as
            the bar above, so the first link lines up under the logo. */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-ink-100 px-5 py-2 sm:px-8 [@media(min-width:1440px)]:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <MailAlert />

      <main className="container-page flex-1 py-8 sm:py-10">{children}</main>

      <footer className="border-t border-ink-100 py-6">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400">
          <span>
            {t.signedInAs} {user.email}
          </span>
          <a
            href={marketingHome()}
            className="font-semibold hover:text-bloom-600"
          >
            {t.backToBbloom}
          </a>
        </div>
      </footer>
    </div>
  );
}
