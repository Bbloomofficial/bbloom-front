import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Templates from "./pages/Templates";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { resolveSiteHost } from "./site/host";
import { resolveAppHost } from "./routes";

// Client sites are a separate product from the marketing site, so visitors to
// either only download the half they need. The dashboard is a third audience —
// clients signing in to read their messages — and the staff admin a fourth, so
// they split out too.
const SitePage = lazy(() => import("./site/SitePage"));
const DashboardApp = lazy(() => import("./dashboard/DashboardApp"));
const PreviewPage = lazy(() => import("./dashboard/editor/PreviewPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const Verify = lazy(() => import("./pages/Verify"));
const TryStart = lazy(() => import("./pages/TryStart"));
const TryEditor = lazy(() => import("./pages/TryEditor"));

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white dark:bg-neutral-950" />}
    >
      {children}
    </Suspense>
  );
}

function Site({ mode }: { mode: "host" | "ref" }) {
  return (
    <Lazy>
      <SitePage mode={mode} />
    </Lazy>
  );
}

function Dashboard() {
  return (
    <Lazy>
      <DashboardApp />
    </Lazy>
  );
}

function Admin() {
  return (
    <Lazy>
      <AdminApp />
    </Lazy>
  );
}

function MarketingApp() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/work" element={<Navigate to="/services" replace />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/try"
            element={
              <Lazy>
                <TryStart />
              </Lazy>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/**
 * The first path segment of every screen the client dashboard owns.
 *
 * `dashboard` is its home. The rest sit at the root rather than under it, and
 * that is deliberate rather than left over: the backend composes enquiry
 * notification links as `<origin>/s/{siteId}/inbox`, so these paths are part of
 * a contract with mail that has already been sent.
 *
 * Listed rather than inferred, because the alternative — hand every unknown
 * path to the dashboard and let it fall through — would mean a typo like
 * `/pricng` reaching the dashboard's catch-all and being answered with a login
 * screen instead of a 404. The marketing site keeps every path not named here,
 * `/` above all.
 *
 * `s`, `account` and `new` are the live screens; `page`, `inbox` and `messages`
 * are the single-site paths the dashboard still answers with a redirect, and
 * they are listed for the same reason it keeps them.
 */
const CLIENT_APP_SEGMENTS = new Set([
  "dashboard",
  "s",
  "account",
  "new",
  "login",
  "register",
  "page",
  "inbox",
  "messages",
]);

/**
 * Whether the client dashboard, rather than the marketing site, answers here.
 *
 * `/` is not in the set and never will be. The landing page is the landing page
 * for everyone: a signed-in client sees the same pitch a stranger does, and
 * reaches their websites through a link to `/dashboard`. Making the root
 * conditional on a session is what we got wrong the first time, and it is
 * invisible to anyone signed out — which is why it survived a full round of
 * verification.
 */
function clientAppOwns(pathname: string): boolean {
  return CLIENT_APP_SEGMENTS.has(pathname.split("/")[1] ?? "");
}

/**
 * `/dashboard/...` — where the whole panel used to live — folded onto the paths
 * its screens occupy now.
 *
 * Only ever the *sub*paths: `/dashboard` itself is the dashboard's home again,
 * so this must not touch it. The query and fragment come along, because
 * `/dashboard/s/1/inbox?selected=X` has to land on the same enquiry it always
 * did.
 */
function isLegacyDashboardSubpath(pathname: string): boolean {
  return pathname.startsWith("/dashboard/") && pathname !== "/dashboard/";
}

function LegacyDashboardPath() {
  const { pathname, search, hash } = useLocation();
  const rest = pathname.replace(/^\/dashboard/, "");
  return <Navigate to={`${rest || "/"}${search}${hash}`} replace />;
}

export default function App() {
  // Read before any branch returns: the client dashboard shares the marketing
  // domain now, so which app answers depends on the path rather than on the
  // hostname alone.
  const { pathname } = useLocation();

  // Each signed-in app has a hostname of its own, where it is served from the
  // root rather than from a path. This is checked before the client-site
  // branch because both are subdomains of the same base domain and only an
  // exact label tells them apart.
  const appHost = resolveAppHost();

  if (appHost === "admin") {
    return (
      <Routes>
        <Route path="/*" element={<Admin />} />
      </Routes>
    );
  }

  // `panel.bbloom.ge` is a compatibility hostname now: the dashboard lives on
  // the marketing domain, and `main.tsx` forwards that hostname there before
  // this ever renders. The branch stays because it is how the dashboard is run
  // at the root locally (`VITE_APP_HOST=panel`), which the forward deliberately
  // ignores, and because a forward that is ever removed should land on a
  // working dashboard rather than on nothing.
  if (appHost === "panel") {
    return (
      <Routes>
        {/* Unauthenticated on purpose, and reachable here as well as on the
            marketing domain, because a confirmation link may well be opened
            from a mail client on either. */}        <Route
          path="/verify"
          element={
            <Lazy>
              <Verify />
            </Lazy>
          }
        />
        {/* The editor's preview iframe uses a relative URL, so it resolves
            against whichever hostname the dashboard is running on. */}
        <Route
          path="/preview/:siteId"
          element={
            <Lazy>
              <PreviewPage />
            </Lazy>
          }
        />
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    );
  }

  // A client site served on its own hostname takes over the whole app: on a
  // client's domain neither /admin nor /dashboard should resolve, so this
  // branch stays ahead of every other route.
  if (resolveSiteHost()) {
    return (
      <Routes>
        <Route path="/" element={<Site mode="host" />} />
        <Route path="/p/:productSlug" element={<Site mode="host" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  /*
    The client dashboard, which is a page on this site now rather than a site of
    its own. It answers for `/dashboard` and for its own screens, and never for
    `/` — the landing page belongs to the marketing site for everyone.

    Mounted at `/*` as one element for every path it owns, so that moving
    between `/login` and `/dashboard` does not unmount and remount the whole app
    mid sign-in.

    The legacy check comes first because `/dashboard/account` is an old link
    that must fold onto `/account`, while `/dashboard` itself is the live home.
  */
  if (isLegacyDashboardSubpath(pathname)) {
    return (
      <Routes>
        <Route path="*" element={<LegacyDashboardPath />} />
      </Routes>
    );
  }

  if (clientAppOwns(pathname)) {
    return (
      <Routes>
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/site/:slug" element={<Site mode="ref" />} />
      <Route path="/site/:slug/p/:productSlug" element={<Site mode="ref" />} />
      {/*
        The client dashboard used to be mounted here, under `/dashboard`, as a
        prefix owning everything beneath it. It is a page on this site now: `/`
        is the landing page for everyone, `/dashboard` is a client's websites,
        and the branch above hands the dashboard that path and its own screens.
      */}
      {/* The editor is its own full-height workspace, so it sits outside the
          marketing chrome rather than inside a page with a navbar. */}
      <Route
        path="/try/:code"
        element={
          <Lazy>
            <TryEditor />
          </Lazy>
        }
      />
      <Route path="/admin/*" element={<Admin />} />
      {/* Unauthenticated on purpose — the confirmation link is opened by
          whatever browser the mail client picks, not necessarily the one
          holding the session. */}
      <Route
        path="/verify"
        element={
          <Lazy>
            <Verify />
          </Lazy>
        }
      />
      <Route
        path="/preview/:siteId"
        element={
          <Lazy>
            <PreviewPage />
          </Lazy>
        }
      />
      <Route path="*" element={<MarketingApp />} />
    </Routes>
  );
}
