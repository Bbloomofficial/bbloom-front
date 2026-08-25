import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useI18n } from "../i18n";
import { claimDocumentTitle } from "../documentTitle";
import type { AccountSite } from "./api/types";
import { AuthProvider, sitesOf, useAuth, useSession } from "./auth";
import Layout from "./components/Layout";
import EditorWindow from "./editor/EditorWindow";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import NewSite from "./pages/NewSite";
import Overview from "./pages/Overview";
import Register from "./pages/Register";
import Sites from "./pages/Sites";
import Team from "./pages/Team";
import { SiteScope } from "./site";
import { dashboardStrings } from "./strings";
import { dashPath } from "../routes";

/**
 * The sub-millisecond digits of a wire timestamp, padded so they compare as
 * numbers of the same magnitude.
 *
 * Raw string comparison is not safe here, and the reason is measured rather
 * than imagined: Java's `Instant.toString()` writes the fraction in groups of
 * three and trims empty trailing groups, so the backend emits **four different
 * widths** for the same field — `…40Z`, `…40.810Z`, `…40.810945Z`,
 * `…40.810945123Z`. Compared as text, `.810Z` sorts *after* `.810945Z` because
 * `Z` (90) beats `9` (57), and a whole second sorts after everything inside it
 * because `Z` beats `.` (46). Both put the earlier instant last.
 *
 * Padding removes the width entirely. The fraction is also independent of any
 * UTC offset, because offsets are whole minutes.
 *
 * Do not "simplify" this back to comparing the strings. A sample of real
 * timestamps will look like a fixed six digits and suggest it is safe: only
 * about one microsecond value in a thousand ends in `000`, so the ragged case
 * is invisible in anything short of a few thousand rows.
 */
function subMilliDigits(value: string): string {
  return (/\.(\d+)/.exec(value)?.[1] ?? "").slice(3).padEnd(6, "0");
}

/**
 * The website an old link was about: the account's *earliest*, which is the one
 * it had when that bookmark was made or that mail was sent.
 *
 * Deliberately not `sites[0]`. The list arrives newest-first, so indexing it
 * would silently retarget every old link the moment a client made a second
 * website — right for one site, wrong from two onwards, and wrong without ever
 * erroring. Choosing by `createdAt` also stops the order the API happens to
 * send from being load-bearing here, so this stays correct if that order
 * changes.
 *
 * `createdAt` is optional on the wire (absent, never null), so a site without a
 * usable one cannot win the comparison and the list order is the fallback.
 *
 * Milliseconds first, then the digits below them. `Date.parse` is right for
 * every format it accepts, but it truncates to milliseconds, and the backend
 * serialises Postgres *microseconds* (`…:15.810945Z`). Its legacy flat `siteId`
 * is `min(createdAt)` over the untruncated values, so a tie we broke by list
 * order could name a different website than the backend names while both of us
 * behaved exactly as documented — the kind of disagreement that is slow to
 * debug because neither side looks wrong. Two sites can share a millisecond
 * when they are seeded or scripted in a batch, even though a client clicking
 * through the UI never will.
 */
function earliestSite(sites: AccountSite[]): AccountSite | undefined {
  let earliest: AccountSite | undefined;
  let earliestAt = Number.POSITIVE_INFINITY;
  let earliestSub = "";
  for (const site of sites) {
    const at = site.createdAt ? Date.parse(site.createdAt) : Number.NaN;
    if (Number.isNaN(at) || at > earliestAt) continue;
    const sub = subMilliDigits(site.createdAt as string);
    if (at === earliestAt && sub >= earliestSub) continue;
    earliestAt = at;
    earliestSub = sub;
    earliest = site;
  }
  return earliest ?? sites[0];
}

/**
 * `/dashboard/page` and `/dashboard/inbox` were the whole dashboard until
 * today. They are kept as redirects to the account's earliest site so
 * bookmarks, and the links in mail we have already sent, keep landing on the
 * website they were about.
 */
function LegacyRedirect({ to }: { to: "page" | "inbox" | "" }) {
  const { user } = useSession();
  const { search, hash } = useLocation();
  const site = earliestSite(sitesOf(user));
  if (!site) return <Navigate to={dashPath()} replace />;
  const suffix = to ? `/${to}` : "";
  return (
    <Navigate to={dashPath(`/s/${site.id}${suffix}${search}${hash}`)} replace />
  );
}

/** Resolves `:siteId` against the account's memberships. */
function SiteRoutes() {
  const { siteId } = useParams();
  const { user } = useSession();
  const site = sitesOf(user).find((candidate) => candidate.id === siteId);

  // A site the account no longer belongs to is not an error worth a screen:
  // removal from a team is normal, so it falls back to the site list.
  if (!site) return <Navigate to={dashPath()} replace />;

  return (
    <SiteScope site={site}>
      <Layout site={site}>
        <Routes>
          <Route index element={<Overview />} />
          {/*
            The editor now has a window of its own at `/s/:siteId/editor`,
            outside this shell. `page` stays as a redirect rather than being
            deleted: it is what the legacy `/dashboard/page` lands on and what
            any bookmark from the last two days points at, and arriving in the
            editor is what those links were always asking for.
          */}
          <Route
            path="page"
            element={
              <Navigate to={dashPath(`/s/${site.id}/editor`)} replace />
            }
          />
          <Route path="inbox" element={<Inbox />} />
          <Route path="billing" element={<Billing />} />
          <Route path="team" element={<Team />} />
          <Route
            path="*"
            element={<Navigate to={dashPath(`/s/${site.id}`)} replace />}
          />
        </Routes>
      </Layout>
    </SiteScope>
  );
}

function SignedIn() {
  return (
    <Routes>
      {/*
        The dashboard's home is a path — `/dashboard` — not an index route.
        `/` is the marketing landing page for everyone, signed in or not, so
        there is no index for this app to claim.
      */}
      <Route
        path="dashboard"
        element={
          <Layout>
            <Sites />
          </Layout>
        }
      />
      <Route
        path="new"
        element={
          <Layout>
            <NewSite />
          </Layout>
        }
      />
      <Route
        path="account"
        element={
          <Layout>
            <Account />
          </Layout>
        }
      />
      <Route path="s/:siteId/editor" element={<EditorWindow />} />
      <Route path="s/:siteId/*" element={<SiteRoutes />} />
      <Route path="page" element={<LegacyRedirect to="page" />} />
      <Route path="inbox" element={<LegacyRedirect to="inbox" />} />
      {/*
        The enquiry notification names `/dashboard/messages`. No such mail has
        ever gone out — notifications are switched off and no enquiry has been
        recorded — so nothing is currently pointing here. It stays because the
        moment that switch is turned on the links become permanent, and a path
        that has to exist before the first send is cheaper than one added after.
      */}
      <Route path="messages" element={<LegacyRedirect to="inbox" />} />
      <Route path="login" element={<Navigate to={dashPath()} replace />} />
      <Route path="register" element={<Navigate to={dashPath()} replace />} />
      <Route path="*" element={<Navigate to={dashPath()} replace />} />
    </Routes>
  );
}

function Shell() {
  const { locale, t: marketing } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user, restoring } = useAuth();

  useEffect(() => {
    const release = claimDocumentTitle();
    document.title = user
      ? `${t.nav.sites} · ${t.brand}`
      : `${t.login.title} · bbloom`;
    // Put the marketing title back on the way out. The dashboard is a page on
    // the marketing site now, so leaving it — by the „ჩემი ვებგვერდები" link in
    // reverse, say — is an ordinary in-app navigation with no reload to reset
    // this. Without the cleanup the landing page keeps the dashboard's title,
    // and the tab reads „ვებგვერდები" while showing the pitch.
    //
    // Recomputed from the dictionary rather than captured on mount, because on
    // a cold load straight into `/dashboard` this effect runs before the one in
    // `I18nProvider` — a child's effects run first — so the title captured then
    // would be whatever `index.html` shipped, not the visitor's language.
    return () => {
      release();
      document.title = marketing.meta.title;
    };
  }, [user, t, marketing]);

  if (restoring) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm text-ink-400">
        {t.loading}
      </div>
    );
  }

  if (!token || !user) {
    return (
      <Routes>
        <Route path="register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return <SignedIn />;
}

/** The client panel: one account, its websites, their billing and team. */
export default function DashboardApp() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
