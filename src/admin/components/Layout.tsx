import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
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
    "rounded-xl px-3 py-2 text-sm font-semibold transition",
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
    { to: adminPath("/sites/new"), label: t.nav.newSite, end: false },
    ...(forbidden
      ? []
      : [{ to: adminPath("/system"), label: t.nav.system, end: false }]),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-surface/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3">
          <a href={marketingHome()} aria-label="bbloom" className="shrink-0">
            <Logo />
          </a>
          <span className="hidden rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-tint-fg sm:inline">
            {t.brand}
          </span>

          <nav className="ms-4 hidden items-center gap-1 sm:flex">
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

        <nav className="container-page flex items-center gap-1 overflow-x-auto border-t border-ink-100 py-2 sm:hidden">
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
