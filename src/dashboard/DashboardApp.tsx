import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useI18n } from "../i18n";
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

/**
 * `/dashboard/page` and `/dashboard/inbox` were the whole dashboard until
 * today. They are kept as redirects to the first site so bookmarks, and the
 * links in mail we have already sent, keep landing somewhere sensible.
 */
function LegacyRedirect({ to }: { to: "page" | "inbox" | "" }) {
  const { user } = useSession();
  const { search, hash } = useLocation();
  const sites = sitesOf(user);
  const first = sites[0];
  if (!first) return <Navigate to="/dashboard" replace />;
  const suffix = to ? `/${to}` : "";
  return (
    <Navigate to={`/dashboard/s/${first.id}${suffix}${search}${hash}`} replace />
  );
}

/** Resolves `:siteId` against the account's memberships. */
function SiteRoutes() {
  const { siteId } = useParams();
  const { user } = useSession();
  const site = sitesOf(user).find((candidate) => candidate.id === siteId);

  // A site the account no longer belongs to is not an error worth a screen:
  // removal from a team is normal, so it falls back to the site list.
  if (!site) return <Navigate to="/dashboard" replace />;

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
            element={<Navigate to={`/dashboard/s/${site.id}`} replace />}
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
      <Route path="login" element={<Navigate to="/dashboard" replace />} />
      <Route path="register" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
