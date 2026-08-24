import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useI18n } from "../i18n";
import type { AccountSite } from "./api/types";
import { AuthProvider, sitesOf, useAuth, useSession } from "./auth";
import Layout from "./components/Layout";
import Editor from "./editor/Editor";
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
 * `Date.parse` truncates to milliseconds, so two sites created in the same
 * millisecond tie and the earlier of them in the list wins — deterministic, and
 * not a case a client can reach by hand anyway.
 */
function earliestSite(sites: AccountSite[]): AccountSite | undefined {
  let earliest: AccountSite | undefined;
  let earliestAt = Number.POSITIVE_INFINITY;
  for (const site of sites) {
    const at = site.createdAt ? Date.parse(site.createdAt) : Number.NaN;
    if (Number.isNaN(at) || at >= earliestAt) continue;
    earliestAt = at;
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
          <Route path="page" element={<Editor />} />
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
      <Route
        index
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
      <Route path="s/:siteId/*" element={<SiteRoutes />} />
      <Route path="page" element={<LegacyRedirect to="page" />} />
      <Route path="inbox" element={<LegacyRedirect to="inbox" />} />
      {/*
        The enquiry notifications we sent before today named `/dashboard/messages`.
        Those mails are already in clients' inboxes and cannot be edited, so the
        path has to keep resolving even though nothing links to it any more.
      */}
      <Route path="messages" element={<LegacyRedirect to="inbox" />} />
      <Route path="login" element={<Navigate to={dashPath()} replace />} />
      <Route path="register" element={<Navigate to={dashPath()} replace />} />
      <Route path="*" element={<Navigate to={dashPath()} replace />} />
    </Routes>
  );
}

function Shell() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user, restoring } = useAuth();

  useEffect(() => {
    document.title = user
      ? `${t.nav.sites} · ${t.brand}`
      : `${t.login.title} · bbloom`;
  }, [user, t]);

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
