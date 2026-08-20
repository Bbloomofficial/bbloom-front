import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Sites from "./pages/Sites";
import NewSite from "./pages/NewSite";
import SiteDetail from "./pages/SiteDetail";

function Routed() {
  const { token, restoring } = useAuth();

  // Hold the shell back while a stored token is revalidated, so a signed-in
  // staff member never sees the login screen flash on a refresh.
  if (restoring) return <div className="min-h-screen bg-canvas" />;
  if (!token) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Sites />} />
        <Route path="sites/new" element={<NewSite />} />
        <Route path="sites/:siteId" element={<SiteDetail />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
}

/** The bbloom staff area: build client websites and hand them over. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
