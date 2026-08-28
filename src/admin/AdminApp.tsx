import { Navigate, Route, Routes } from "react-router-dom";
import { adminPath } from "../routes";
import { AuthProvider, useAuth } from "./auth";
import { SystemProvider } from "./system";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Sites from "./pages/Sites";
import NewSite from "./pages/NewSite";
import SiteDetail from "./pages/SiteDetail";
import SystemStatus from "./pages/SystemStatus";
import Accounts from "./pages/Accounts";
import AccountDetail from "./pages/AccountDetail";
import Plans from "./pages/Plans";
import PlanEditor from "./pages/PlanEditor";
import PromoCodes from "./pages/PromoCodes";
import PromoCodeEditor from "./pages/PromoCodeEditor";
import NewCustomerOffer from "./pages/NewCustomerOffer";

function Routed() {
  const { token, restoring } = useAuth();

  // Hold the shell back while a stored token is revalidated, so a signed-in
  // staff member never sees the login screen flash on a refresh.
  if (restoring) return <div className="min-h-screen bg-canvas" />;
  if (!token) return <Login />;

  return (
    <SystemProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Sites />} />
          <Route path="sites/new" element={<NewSite />} />
          <Route path="sites/:siteId" element={<SiteDetail />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="accounts/:accountId" element={<AccountDetail />} />
          <Route path="plans" element={<Plans />} />
          {/* `new` is matched by the same route as an id: one editor, so a
              field added to the create form cannot go missing from the edit
              form. */}
          <Route path="plans/:planId" element={<PlanEditor />} />
          <Route path="promo-codes" element={<PromoCodes />} />
          <Route path="promo-codes/:promoId" element={<PromoCodeEditor />} />
          <Route path="new-customer-offer" element={<NewCustomerOffer />} />
          <Route path="system" element={<SystemStatus />} />
          <Route path="*" element={<Navigate to={adminPath()} replace />} />
        </Routes>
      </Layout>
    </SystemProvider>
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
