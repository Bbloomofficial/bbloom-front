import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { dashboardStrings } from "../strings";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-tint text-tint-fg"
      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
  }`;
}

export default function Layout({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user, signOut } = useSession();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-surface/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-bloom-500 to-bloom-700 text-sm font-extrabold text-white shadow-lg shadow-bloom-600/25">
              {user.businessName.trim().charAt(0).toUpperCase() || "b"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink-900">
                {user.businessName}
              </span>
              <span className="block truncate text-xs text-ink-400">
                {user.siteSlug}.bbloom.co
              </span>
            </span>
          </div>

          <nav className="ms-2 hidden items-center gap-1 sm:flex">
            <NavLink to="/dashboard" end className={navClass}>
              {t.nav.overview}
            </NavLink>
            <NavLink to="/dashboard/page" className={navClass}>
              {t.nav.page}
            </NavLink>
            <NavLink to="/dashboard/inbox" className={navClass}>
              {t.nav.inbox}
            </NavLink>
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <a
              href={`/site/${user.siteSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600 md:inline-flex"
            >
              {t.viewSite}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              className="rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
            >
              {t.signOut}
            </button>
          </div>
        </div>

        <nav className="container-page flex items-center gap-1 border-t border-ink-100 py-2 sm:hidden">
          <NavLink to="/dashboard" end className={navClass}>
            {t.nav.overview}
          </NavLink>
          <NavLink to="/dashboard/page" className={navClass}>
            {t.nav.page}
          </NavLink>
          <NavLink to="/dashboard/inbox" className={navClass}>
            {t.nav.inbox}
          </NavLink>
        </nav>
      </header>

      <main className="container-page flex-1 py-8 sm:py-10">{children}</main>

      <footer className="border-t border-ink-100 py-6">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400">
          <span>
            {t.signedInAs} {user.email}
          </span>
          <a href="/" className="font-semibold hover:text-bloom-600">
            {t.backToBbloom}
          </a>
        </div>
      </footer>
    </div>
  );
}
