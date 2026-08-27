import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthPath } from "../routes";

/**
 * A link to signing in or signing up, carrying the page it was clicked on.
 *
 * Both addresses render a dialog over a background route, and that background
 * is the page the visitor was reading — so every link into them has to say
 * which page that was. Arriving without it (a bookmark, a link in an email) is
 * handled too: the landing page stands in.
 *
 * One component rather than the state object repeated at each call site,
 * because a link that forgets it silently swaps the page behind the dialog for
 * the landing page, which reads as "the site navigated" rather than as a bug.
 */
export default function AuthLink({
  to,
  className,
  children,
}: {
  to: "/login" | "/register";
  className?: string;
  children: ReactNode;
}) {
  const location = useLocation();

  // A link pressed while the dialog is already open must not name the dialog's
  // own address as its background: closing it would have nowhere to go.
  const backgroundLocation = isAuthPath(location.pathname)
    ? { pathname: "/", search: "", hash: "", state: null, key: "default" }
    : location;

  return (
    <Link to={to} state={{ backgroundLocation }} className={className}>
      {children}
    </Link>
  );
}
