import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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

export default function App() {
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

  if (appHost === "panel") {
    return (
      <Routes>
        {/* Unauthenticated on purpose, and reachable here as well as on the
            marketing domain, because a confirmation link may well be opened
            from a mail client on either. */}
        <Route
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

  return (
    <Routes>
      <Route path="/site/:slug" element={<Site mode="ref" />} />
      <Route path="/site/:slug/p/:productSlug" element={<Site mode="ref" />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
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
