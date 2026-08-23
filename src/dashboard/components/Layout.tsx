import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useI18n } from "../../i18n";
import type { AccountSite } from "../api/types";
import { sitesOf, useSession } from "../auth";
import { dashboardStrings } from "../strings";
import { SiteStatusBadge } from "./Badges";
import VerifyBanner from "./VerifyBanner";

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-tint text-tint-fg"
      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
  }`;
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "b";
}

/**
 * The switcher is the whole difference between "your website" and "your
 * account": one login can now hold sites in different roles, so the site being
 * worked on has to be a visible, changeable thing rather than an assumption.
 */
function SiteSwitcher({ active }: { active: AccountSite | null }) {
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

  const label = active?.businessName ?? t.nav.sites;

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
        <span className="hidden min-w-0 flex-1 sm:block">
          <span className="block truncate text-sm font-bold text-ink-900">
            {label}
          </span>
          <span className="block truncate text-xs text-ink-400" dir="ltr">
            {active?.primaryDomain ?? active?.slug ?? user.email}
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

            Only while inside a site: on the websites list itself this would
            point at the page already being read.
          */}
          {active && (
            <>
              <Link
                to="/dashboard"
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
            </>
          )}

          <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-ink-400">
            {t.sites.switcher}
          </p>
          {sites.map((site) => (
            <Link
              key={site.id}
              to={`/dashboard/s/${site.id}`}
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
            to="/dashboard/new"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-tint-fg transition hover:bg-ink-50"
          >
            + {t.sites.addAnother}
          </Link>

          {/*
            The account, on the same terms as the button in the header: shown
            only inside a site, because that is where the tabs do not offer it.

            This is also the only route to it on a phone. The header button is
            `md:inline-flex`, so below 768px a site's screens had no way to the
            account page at all — the menu is reachable at every width, so the
            same entry closes that too.
          */}
          {active && (
            <Link
              to="/dashboard/account"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-50 md:hidden"
            >
              {t.nav.account}
            </Link>
          )}
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
  const navigate = useNavigate();
  const active = site ?? null;
  // Read the account's own list rather than `site`, which is absent on every
  // account-level screen and would make a client with five websites look like a
  // client with none.
  const hasSite = sitesOf(user).length > 0;

  const links = active
    ? [
        { to: `/dashboard/s/${active.id}`, label: t.nav.overview, end: true },
        { to: `/dashboard/s/${active.id}/page`, label: t.nav.page, end: false },
        { to: `/dashboard/s/${active.id}/inbox`, label: t.nav.inbox, end: false },
        {
          to: `/dashboard/s/${active.id}/billing`,
          label: t.nav.billing,
          end: false,
        },
        // Listing members is owner-only on the backend, so offering an editor
        // the tab would only take them to a refusal. Billing stays visible:
        // why the site is offline is not an owner-only fact.
        ...(active.role === "SITE_OWNER"
          ? [
              {
                to: `/dashboard/s/${active.id}/team`,
                label: t.nav.team,
                end: false,
              },
            ]
          : []),
      ]
    : [
        { to: "/dashboard", label: t.nav.sites, end: true },
        { to: "/dashboard/account", label: t.nav.account, end: false },
      ];

  const nav = (
    <>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
          {link.label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-surface/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3">
          <SiteSwitcher active={active} />

          <nav className="ms-2 hidden items-center gap-1 xl:flex">{nav}</nav>

          <div className="ms-auto flex shrink-0 items-center gap-2">
            {/* `publicUrl` is the site's real address; guessing it from the
                slug went wrong the moment custom domains existed. */}
            {active && (
              <a
                href={active.publicUrl ?? `/site/${active.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600 md:inline-flex"
              >
                {t.viewSite}
              </a>
            )}
            {/*
              Only when the tab group isn't already offering it. On the account
              level screens the tabs are "websites" and "account", so this button
              was a second copy of a tab sitting a few centimetres away — which
              is what the user saw and asked to lose.

              On a site's screens the tabs are that site's own (overview, page,
              inbox, billing, team), none of which is the account, and the site
              switcher lists only sites and "add another". There this is the only
              way to reach the account page at any width, so deleting it outright
              would have stranded that page behind the browser's back button.
            */}
            {active && (
              <button
                type="button"
                onClick={() => navigate("/dashboard/account")}
                className="hidden rounded-xl border border-ink-100 bg-surface px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:text-bloom-600 md:inline-flex"
              >
                {t.nav.account}
              </button>
            )}
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

        <nav className="container-page flex flex-wrap items-center gap-1 border-t border-ink-100 py-2 xl:hidden">
          {nav}
        </nav>
      </header>

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
          <a href="/" className="font-semibold hover:text-bloom-600">
            {t.backToBbloom}
          </a>
        </div>
      </footer>
    </div>
  );
}
