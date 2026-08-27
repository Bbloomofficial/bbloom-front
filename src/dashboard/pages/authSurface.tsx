import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { dashPath } from "../../routes";

/**
 * What is holding the sign-in and sign-up forms.
 *
 * The two screens are the same forms wherever they appear, so rather than
 * copying them into a dialog they are told which surface they are on. Absent
 * context means the standalone screens, which is still how the dashboard
 * answers on `panel.bbloom.ge` and how a signed-out client reaches them if the
 * modal is ever taken out.
 */
export type AuthSurface = {
  /** Drop the full-screen page chrome: the dialog supplies its own. */
  modal: boolean;
  /** Move between the two forms without leaving the page behind the dialog. */
  go: (mode: "login" | "register") => void;
};

const AuthSurfaceContext = createContext<AuthSurface | null>(null);

export const AuthSurfaceProvider = AuthSurfaceContext.Provider;

export function useAuthSurface(): AuthSurface | null {
  return useContext(AuthSurfaceContext);
}

/**
 * The "no account yet?" / "already have one?" link between the two forms.
 *
 * A real link on the standalone screens, and a button inside the dialog —
 * navigating there would swap the page behind it for whatever `/register`
 * resolves to, which is the one thing a modal exists to avoid.
 */
export function AuthSwitch({
  to,
  className,
  children,
}: {
  to: "login" | "register";
  className?: string;
  children: React.ReactNode;
}) {
  const surface = useAuthSurface();

  if (surface) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => surface.go(to)}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={dashPath(`/${to}`)} className={className}>
      {children}
    </Link>
  );
}
