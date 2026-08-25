import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import PasswordField from "../../components/PasswordField";
import VerifyCodeForm from "../components/VerifyCodeForm";
import { ApiError } from "../../api/http";
import { describeProblem } from "../../api/problem";
import type { VerificationTicket } from "../api/types";
import { useI18n } from "../../i18n";
import { useAuth } from "../auth";
import { dashboardStrings } from "../strings";
import { dashPath } from "../../routes";

/** Shared chrome for the signed-out screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="container-page flex h-16 items-center justify-between">
        <a href="/" aria-label="bbloom">
          <Logo />
        </a>
        <LanguageSwitcher />
      </header>
      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

export default function Register() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { signUp, completeVerification, noteSend } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * The 202 from registering. Its presence is what swaps this screen for the
   * confirmation one, and it is kept whole because the cooldown, the delivery
   * flag and the send result all live on it.
   *
   * Held in state rather than pushed as a route so the ticket survives: a
   * `/verify?email=` navigation would arrive with no idea that an email had
   * just gone out, and would offer a resend button the server refuses for
   * another minute. Reloading loses this screen, but that path self-heals —
   * logging in now returns the same 403 and lands back here.
   */
  const [issued, setIssued] = useState<VerificationTicket | null>(null);
  /**
   * Whether the address is already registered. Not itself a confirmation
   * screen: it only earns the client a button offering one, because the
   * likeliest reading is still "I already have an account" and hijacking the
   * screen would bury the link to log in.
   */
  const [taken, setTaken] = useState(false);
  /** They took the offer above and want to confirm rather than log in. */
  const [confirming, setConfirming] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Registering no longer signs anyone in — it mails a code and answers
      // 202. Confirming that code is what issues the first session, so the
      // next thing this screen shows is the box to type it into.
      //
      // `language` decides which language the confirmation email is written in.
      // The panel's current language is the best evidence we have, and it is
      // better evidence than anything the server could infer.
      const ticket = await signUp({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        language: locale,
      });
      setIssued(ticket);
      // Registration mails a code itself, so the panel-wide resend clock starts
      // here rather than when someone first presses resend.
      noteSend(ticket.mailSent);
      setSubmitting(false);
    } catch (caught) {
      // A duplicate email and a rejected password each get their own sentence;
      // both are things the client can act on, so neither is flattened into a
      // generic failure.
      setError(
        describeProblem(caught, t.errors, t.register.failed, {
          authAction: "signUp",
        }),
      );
      // An address that is already registered may well be this person's own
      // abandoned signup: the account row is written before confirmation, so a
      // first attempt they never finished still holds the address. Offering the
      // confirmation screen is the only way out of that, and it is safe to
      // offer because the code goes to the address, not to whoever asked.
      if (
        caught instanceof ApiError &&
        caught.code === "EMAIL_ALREADY_REGISTERED"
      ) {
        setTaken(true);
      }
      setSubmitting(false);
    }
  }

  if (issued || confirming) {
    return (
      <AuthShell>
        <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {t.register.confirmTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {issued ? t.register.confirmBody : t.register.confirmExisting}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            {t.verify.codeSentTo}{" "}
            <span className="font-semibold text-ink-900" dir="ltr">
              {email.trim()}
            </span>
          </p>

          <VerifyCodeForm
            email={email.trim()}
            emailDelivery={issued?.emailDelivery}
            resendAvailableAt={issued?.resendAvailableAt ?? null}
            onSendResult={noteSend}
            onVerified={(session) => {
              // Confirming hands back a real session, so there is nowhere to
              // navigate to: the shell re-renders into the panel as soon as it
              // lands. The tokenless branch is an address that was already
              // confirmed, which means the password they just chose works.
              if (session) completeVerification(session);
              else setIssued(null);
            }}
          />

          <p className="mt-5 text-center text-sm text-ink-600">
            <Link
              to={dashPath("/login")}
              className="font-semibold text-tint-fg hover:underline"
            >
              {t.register.signIn}
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="rounded-3xl border border-ink-100 bg-surface p-6 shadow-xl shadow-bloom-600/5 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.register.title}
        </h1>
        <p className="mt-2 text-sm text-ink-600">{t.register.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="register-name">
              {t.register.fullName}
            </label>
            <input
              id="register-name"
              name="fullName"
              autoComplete="name"
              required
              className="field"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="register-email">
              {t.register.email}
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="username"
              dir="ltr"
              required
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="register-password">
              {t.register.password}
            </label>
            <PasswordField
              id="register-password"
              name="password"
              autoComplete="new-password"
              dir="ltr"
              required
              minLength={8}
              maxLength={72}
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-400">
              {t.register.passwordHint}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
            >
              {error}
              {/* An account row is written before the address is confirmed, so
                  a signup somebody abandoned still holds their email and
                  answers a second attempt with this error. Without a way to
                  finish it, that person is locked out of their own address by
                  their own earlier attempt — they cannot re-register it and
                  cannot log in either. */}
              {taken && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="mt-2 block font-semibold text-tint-fg underline underline-offset-4"
                >
                  {t.register.confirmInstead}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? t.register.submitting : t.register.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-600">
          {t.register.haveAccount}{" "}
          <Link
            to={dashPath("/login")}
            className="font-semibold text-tint-fg hover:underline"
          >
            {t.register.signIn}
          </Link>
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-ink-400">{t.register.terms}</p>
    </AuthShell>
  );
}
