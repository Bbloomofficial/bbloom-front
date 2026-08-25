import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
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
 * The account, not a website: the person's own name over the address they
 * signed in with.
 *
 * Static by design. The websites list is the site selector, and folding a
 * second one into this header gave the rail a menu whose entire contents were
 * the page behind it. Moving between websites now goes through the rail, which
 * is present on every screen, so being inside one website never hides the way
 * back.
 */
function AccountHeader() {
  const { user } = useSession();

  /*
    `fullName` is never null, absent or blank -- the column is NOT NULL and
    validated at signup. It can still *equal the email*: staff inviting someone
    who has no account yet, without typing a name, fall the new account back to
    its own address. Printing the same string twice reads as a rendering fault
    rather than as a name, so the sub-label steps aside for it.

    No account in production hits this today, which is precisely why it is
    handled now: the data cannot express the case, and it becomes reachable on
    the first invite that leaves the name blank.
  */
  const emailIsTheName =
    user.fullName.trim().toLowerCase() === user.email.trim().toLowerCase();

  return (
    <div className="flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-2 py-1.5 text-start sm:gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-bloom-500 to-bloom-700 text-sm font-extrabold text-white shadow-lg shadow-bloom-600/25">
        {initial(user.fullName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-900">
          {user.fullName}
        </span>
        {!emailIsTheName && (
          <span className="block truncate text-xs text-ink-400" dir="ltr">
            {user.email}
          </span>
        )}
      </span>
    </div>
  );
}

function tabClass({ isActive }: { isActive: boolean }) {
  return `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-tint text-tint-fg"
      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
  }`;
}

/**
 * One website's own navigation, along the top.
 *
 * The rail underneath stays general -- the websites list and the account -- so
 * the two kinds of navigation stop competing for one column. Opening a website
 * used to replace every general link with that website's tabs, and that is what
 * made a menu folded into the header the only way back out.
 *
 * Sticky under the mobile app bar, and at the top of the content column on
 * large screens, so the tabs stay reachable part-way down a long editor page.
 */
function SiteTabs({ site }: { site: AccountSite }) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);

  const tabs: { to: string; label: string; end: boolean; icon: NavKey }[] = [
    {
      to: dashPath(`/s/${site.id}`),
      label: t.nav.overview,
      end: true,
      icon: "overview",
    },
    {
      to: dashPath(`/s/${site.id}/page`),
      label: t.nav.page,
      end: false,
      icon: "page",
    },
    {
      to: dashPath(`/s/${site.id}/inbox`),
      label: t.nav.inbox,
      end: false,
      icon: "inbox",
    },
    {
      to: dashPath(`/s/${site.id}/billing`),
      label: t.nav.billing,
      end: false,
      icon: "billing",
    },
    // Listing members is owner-only on the backend, so offering an editor the
    // tab would only take them to a refusal. Billing stays visible: why the
    // site is offline is not an owner-only fact.
    ...(site.role === "SITE_OWNER"
      ? [
          {
            to: dashPath(`/s/${site.id}/team`),
            label: t.nav.team,
            end: false,
            icon: "team" as NavKey,
          },
        ]
      : []),
  ];

  return (
    <div className="sticky top-16 z-30 border-b border-ink-100 bg-surface/90 backdrop-blur lg:top-0">
      <div className="container-page">
        {/*
          The name gets a whole line to itself on a phone. Sharing one with the
          badge and the view-site button left it 19px wide -- measured, not
          guessed -- which matters more than usual because the mobile app bar
          above deliberately shows the brand instead of the website's name, on
          the grounds that it is legible here.
        */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-3">
          <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto">
            <span className="truncate text-sm font-bold text-ink-900">
              {site.businessName}
            </span>
            <SiteStatusBadge status={site.status} />
          </div>
          {/* `publicUrl` is the site's real address; guessing it from the
              slug went wrong the moment custom domains existed. */}
          <a
            href={site.publicUrl ?? `/site/${site.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm ms-auto shrink-0"
          >
            {t.viewSite}
          </a>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
              <NavIcon name={tab.icon} />
              <span className="truncate">{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
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
  /*
    The page editor is a workspace rather than a document, so on that one route
    the shell stops being a scrolling page and becomes a fixed-height frame:
    the editor's preview can then take every pixel the panel does not.

    `useMatch` rather than a regex on the path, so this is tied to the route as
    declared in `DashboardApp` and moves with it.

    Only from `lg`. On a phone there is no room to split, and a fixed-height
    frame there would trap the field list in an inner scroller fighting the
    native gesture.
  */
  const editorRoute = useMatch(dashPath("/s/:siteId/page"));
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

  const links: { to: string; label: string; end: boolean; icon: NavKey }[] = [
    { to: dashPath(), label: t.nav.sites, end: true, icon: "sites" },
    {
      to: dashPath("/account"),
      label: t.nav.account,
      end: false,
      icon: "account",
    },
  ];

  /*
    The rail is general navigation and nothing else. It used to become the
    active site's tabs, which is why opening a website hid every route out of
    it; those tabs are now `SiteTabs` along the top. The consequence worth
    keeping in mind: these two links are on screen on every dashboard route, so
    nothing below depends on a menu to get back.
  */
  const sidebar = (
    <div className="flex h-full min-h-0 flex-col gap-1 p-3">
      <AccountHeader />

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
      </nav>

      <div className="mt-2 space-y-2 border-t border-ink-100 pt-3">
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            className="ms-auto rounded-xl border border-ink-100 bg-control px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-bloom-300 hover:bg-tint hover:text-bloom-600 active:scale-95"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-canvas lg:flex ${
        editorRoute ? "lg:h-screen lg:overflow-hidden" : ""
      }`}
    >
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
            className="rounded-xl border border-ink-100 bg-control p-2.5 text-ink-600 transition hover:border-bloom-300 hover:bg-tint hover:text-bloom-600 active:scale-95"
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
          {/* The website's own name is in `SiteTabs` directly below; repeating
              it here would spend the one line a phone has on the same word
              twice. */}
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-900">
            {t.brand}
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {active && <SiteTabs site={active} />}

        <main
          className={
            editorRoute
              ? "flex min-h-0 flex-1 flex-col"
              : "container-page flex-1 space-y-6 py-8 sm:py-10"
          }
        >
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

            The editor is the exception, and for the same measurement: it is a
            fixed-height frame, so a 428px form at the top of it would leave the
            preview a couple of hundred pixels and recreate the squeeze this
            layout exists to fix. Nothing is lost — the editor's publish button
            refuses with the very same sentence, and the banner is still on the
            overview one click away.
          */}
          {hasSite && !editorRoute && <VerifyBanner />}
          {children}
          {!hasSite && <VerifyBanner />}
        </main>

        {/* The editor owns the full height, so the footer would only eat into
            the preview. It is on every other route. */}
        {!editorRoute && (
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
        )}
      </div>
    </div>
  );
}
