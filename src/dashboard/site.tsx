import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { AccountSite } from "./api/types";

/**
 * Everything below `/dashboard/s/:siteId` works on one website. Rather than
 * thread the site through every page, the shell resolves it from the route once
 * and hands it down — the pages then cannot accidentally read the profile's
 * legacy flat `siteId`, which mirrors the *first* site and is wrong here.
 */

const SiteContext = createContext<AccountSite | null>(null);

export function SiteScope({
  site,
  children,
}: {
  site: AccountSite;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useActiveSite(): AccountSite {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useActiveSite requires a site-scoped route");
  return site;
}

/**
 * Owner-only covers committing the business to a bill and deciding who else may
 * edit. Rewriting the site's copy is not one of those, so an editor keeps it.
 */
export function useIsOwner(): boolean {
  return useActiveSite().role === "SITE_OWNER";
}
