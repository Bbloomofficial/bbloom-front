import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useI18n } from "../../i18n";
import type { AccountSite } from "../api/types";
import { sitesOf, useSession } from "../auth";
import { dashboardStrings } from "../strings";
import { SiteStatusBadge } from "./Badges";
import VerifyBanner from "./VerifyBanner";
import { dashPath, marketingHome } from "../../routes";

type NavKey =
  | "overview"
  | "page"
  | "inbox"
  | "billing"
  | "team"
  | "sites"
  | "account";

const NAV_ICONS: Record<NavKey, string> = {
  overview: "M10 2.5 2.5 8.4V17a1 1 0 0 0 1 1h4v-5h5v5h4a1 1 0 0 0 1-1V8.4L10 2.5Z",
  page: "M5 2h6l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm6 1.5V7h3.5L11 3.5Z",
  inbox:
    "M2.5 6.2A2.2 2.2 0 0 1 4.7 4h10.6a2.2 2.2 0 0 1 2.2 2.2v7.6a2.2 2.2 0 0 1-2.2 2.2H4.7a2.2 2.2 0 0 1-2.2-2.2V6.2Zm2.1-.2 5.4 4 5.4-4H4.6Z",
  billing:
    "M2 6.5A2.5 2.5 0 0 1 4.5 4h11A2.5 2.5 0 0 1 18 6.5V7H2v-.5ZM2 9h16v4.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 13.5V9Zm3 3.5h4V14H5v-1.5Z",
  team: "M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.5 16c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5v1h-11v-1Zm12.2-3.6c2.3.4 4.3 2 4.3 3.9V17h-4v-1c0-1.4-.5-2.7-1.4-3.7l1.1.1Z",
  sites: "M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z",
  account:
    "M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 1.5c-3.6 0-6.5 2.2-6.5 4.4V17h13v-1.1c0-2.2-2.9-4.4-6.5-4.4Z",
};

function NavIcon({ name }: { name: NavKey }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[18px] w-[18px] shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={NAV_ICONS[name]} />
    </svg>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-tint text-tint-fg"
      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
  }`;
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "b";
}

/**
 * The account-level header. Deliberately static: on these screens the switcher
 * had nothing to offer that was not already on the page behind it — the
 * websites list renders the same sites with the same badges and the same "add
 * another" link, and the sidebar's own nav already carries both the list and
 * the account. A chevron that opens a copy of the current page is an invitation
 * to a dead end.
 *
 * Inside a site it is the opposite and `SiteSwitcher` keeps every part of it,
 * because there the site tabs replace this nav entirely and the menu is the
 * only way back to the list or across to another website.
 */
function AccountHeader() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user } = useSession();

  return (
    <div className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-2 py-1.5 text-start sm:gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-bloom-500 to-bloom-700 text-sm font-extrabold text-white shadow-lg shadow-bloom-600/25">
        {initial(t.nav.sites)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">
          {t.nav.sites}
        </span>
        <span className="block truncate text-xs text-ink-400" dir="ltr">
          {user.email}
        </span>
      </span>
    </div>
  );
}

/**
 * The switcher is the whole difference between "your website" and "your
 * account": one login can now hold sites in different roles, so the site being
 * worked on has to be a visible, changeable thing rather than an assumption.
 *
 * Only rendered inside a site. `active` is required rather than nullable so
 * that stays true by construction — the account-level case is `AccountHeader`,
 * and a nullable prop here would quietly let the menu back onto those screens.
 */
function SiteSwitcher({ active }: { active: AccountSite }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user } = useSession();
  const sites = sitesOf(user);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const label = active.businessName;

  return (
    <div className="relative min-w-0 shrink" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-2 py-1.5 text-start transition hover:bg-ink-50 sm:gap-3"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-bloom-500 to-bloom-700 text-sm font-extrabold text-white shadow-lg shadow-bloom-600/25">
          {initial(label)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink-900">
            {label}
          </span>
          <span className="block truncate text-xs text-ink-400" dir="ltr">
            {active.primaryDomain ?? active.slug}
          </span>
        </span>
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 text-ink-400"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute start-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-ink-100 bg-surface p-1.5 shadow-xl shadow-ink-900/10"
        >
          {/*
            The way out, first and before the list of places to go instead.

            Every route into a site's screens replaces this whole header with
            that site's tabs, and none of them is the websites list — so once a
            client was inside one site the only way back was the URL bar. The
            avatar looks like it should do this, but it opens the menu, which
            is why the menu is where the answer belongs.

            Unconditional now: this component only renders inside a site, so
            there is no longer a case where it would point at the page already
            being read.
          */}
          <Link
            to={dashPath()}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-900 transition hover:bg-ink-50"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 text-ink-400 rtl:-scale-x-100"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.42 10l4.3 4.3a1 1 0 0 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
            </svg>
            {t.sites.allSites}
          </Link>
          <div className="my-1 border-t border-ink-100" />

          <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-ink-400">
            {t.sites.switcher}
          </p>
          {sites.map((site) => (
            <Link
              key={site.id}
              to={dashPath(`/s/${site.id}`)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-ink-50 ${
                site.id === active?.id ? "bg-tint" : ""
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink-900">
                  {site.businessName}
                </span>
                <span className="block truncate text-xs text-ink-400" dir="ltr">
                  {site.slug}
                </span>
              </span>
              <SiteStatusBadge status={site.status} />
            </Link>
          ))}
          <Link
            to={dashPath("/new")}
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-tint-fg transition hover:bg-ink-50"
          >
            + {t.sites.addAnother}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Layout({
  children,
  site,
}: {
  children: ReactNode;
  /** Absent on the account-level screens, which are not about one website. */
  site?: AccountSite | null;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user, signOut } = useSession();
  const location = useLocation();
  const active = site ?? null;
  const [drawer, setDrawer] = useState(false);
  // Read the account's own list rather than `site`, which is absent on every
  // account-level screen and would make a client with five websites look like a
  // client with none.
  const hasSite = sitesOf(user).length > 0;

  // Following a link inside the drawer navigates behind it, so the drawer has
  // to close itself or it covers the page it just opened.
  useEffect(() => setDrawer(false), [location.pathname]);

  useEffect(() => {
    if (!drawer) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawer(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const links: { to: string; label: string; end: boolean; icon: NavKey }[] =
    active
      ? [
          {
            to: dashPath(`/s/${active.id}`),
            label: t.nav.overview,
            end: true,
            icon: "overview",
          },
          {
            to: dashPath(`/s/${active.id}/page`),
            label: t.nav.page,
            end: false,
            icon: "page",
          },
          {
            to: dashPath(`/s/${active.id}/inbox`),
            label: t.nav.inbox,
            end: false,
            icon: "inbox",
          },
          {
            to: dashPath(`/s/${active.id}/billing`),
            label: t.nav.billing,
            end: false,
            icon: "billing",
          },
          // Listing members is owner-only on the backend, so offering an editor
          // the tab would only take them to a refusal. Billing stays visible:
          // why the site is offline is not an owner-only fact.
          ...(active.role === "SITE_OWNER"
            ? [
                {
                  to: dashPath(`/s/${active.id}/team`),
                  label: t.nav.team,
                  end: false,
                  icon: "team" as NavKey,
                },
              ]
            : []),
        ]
      : [
          { to: dashPath(), label: t.nav.sites, end: true, icon: "sites" },
          {
            to: dashPath("/account"),
            label: t.nav.account,
            end: false,
            icon: "account",
          },
        ];

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col gap-1 p-3">
      {active ? <SiteSwitcher active={active} /> : <AccountHeader />}

      <nav className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={navClass}
          >
            <NavIcon name={link.icon} />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}

        {/*
          Inside a site the links are that site's own, none of which is the
          account, and the switcher lists only websites — so without this the
          account page is reachable only from the browser's back button. On the
          account-level screens it is already the second link above.
        */}
        {active && (
          <NavLink to={dashPath("/account")} end={false} className={navClass}>
            <NavIcon name="account" />
            <span className="truncate">{t.nav.account}</span>
          </NavLink>
        )}
      </nav>

      <div className="mt-2 space-y-2 border-t border-ink-100 pt-3">
        {/* `publicUrl` is the site's real address; guessing it from the
            slug went wrong the moment custom domains existed. */}
        {active && (
          <a
            href={active.publicUrl ?? `/site/${active.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-xl border border-ink-100 bg-control px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
          >
            {t.viewSite}
          </a>
        )}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            className="ms-auto rounded-xl border border-ink-100 bg-control px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* The sidebar scrolls on its own so a long website list cannot push the
          navigation off the bottom of a short window. */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 shrink-0 border-e border-ink-100 bg-surface lg:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-40 border-b border-ink-100 bg-surface/90 backdrop-blur lg:hidden">
        <div className="container-page flex h-16 items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={t.nav.menu}
            aria-expanded={drawer}
            className="rounded-xl border border-ink-100 bg-control p-2.5 text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 5.5h14v1.6H3V5.5Zm0 3.7h14v1.6H3V9.2Zm0 3.7h14v1.6H3v-1.6Z" />
            </svg>
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-900">
            {active?.businessName ?? t.nav.sites}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setDrawer(false)}
            className="absolute inset-0 h-full w-full bg-ink-900/40"
          />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] border-e border-ink-100 bg-surface shadow-xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="container-page flex-1 space-y-6 py-8 sm:py-10">
          {/*
            The banner goes first once there is a website, because from that point
            on it explains a live restriction: the publish button is refusing, and
            the reason belongs above the thing that is refusing.

            Before the first website it explains nothing yet. Confirming an address
            gates publishing and only publishing, and an account with no site has
            nothing to publish — the gate is a full step ahead of the client. Put
            in front of them, it is a 428px amber form standing between a new
            signup and the only action that account can take, and on a 390x844
            phone that measurably pushed "create a website" to y=835: off-screen
            before browser chrome is subtracted. The first screen of the funnel
            then reads as a wall, which is exactly how it reads to someone who
            never received the mail.

            So the order follows the gate rather than the severity: after the
            content while it gates nothing, before it the moment it gates
            something.
          */}
          {hasSite && <VerifyBanner />}
          {children}
          {!hasSite && <VerifyBanner />}
        </main>

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
    </div>
  );
}
