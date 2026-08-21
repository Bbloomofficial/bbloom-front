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

// Client sites are a separate product from the marketing site, so visitors to
// either only download the half they need. The dashboard is a third audience —
// clients signing in to read their messages — so it splits out too.
const SitePage = lazy(() => import("./site/SitePage"));
const DashboardApp = lazy(() => import("./dashboard/DashboardApp"));

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
  // A client site served on its own hostname takes over the whole app.
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
      <Route path="*" element={<MarketingApp />} />
    </Routes>
  );
}
