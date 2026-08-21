import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useI18n } from "../i18n";
import { AuthProvider, useAuth } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Inbox from "./pages/Inbox";
import Editor from "./editor/Editor";
import { dashboardStrings } from "./strings";

function Shell() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user, restoring } = useAuth();

  useEffect(() => {
    document.title = user
      ? `${t.nav.inbox} · ${user.businessName}`
      : `${t.login.title} · bbloom`;
  }, [user, t]);

  if (restoring) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm text-ink-400">
        {t.loading}
      </div>
    );
  }

  if (!token || !user) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="page" element={<Editor />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

/** The client dashboard: one business, one website, their own messages. */
export default function DashboardApp() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
