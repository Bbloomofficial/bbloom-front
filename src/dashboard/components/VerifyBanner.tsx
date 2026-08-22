import { useI18n } from "../../i18n";
import { useAuth, useSession } from "../auth";
import { dashboardStrings } from "../strings";
import VerifyCodeForm from "./VerifyCodeForm";

/**
 * The standing "confirm your email" prompt.
 *
 * It says what confirming is *for* — it gates publishing and nothing else —
 * because a prompt that only nags gets ignored, and a client who cannot publish
 * deserves to already know why before they try.
 *
 * The code is entered here rather than on a separate screen. Someone who
 * skipped the email at signup is looking at this banner, and sending them
 * somewhere else to type six digits would be a detour around a box that could
 * simply be here.
 */
export default function VerifyBanner() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { user, token } = useSession();
  const { refresh } = useAuth();

  if (user.emailVerified) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
      <p className="font-bold text-amber-900 dark:text-amber-100">
        {t.verify.bannerTitle}
      </p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
        {t.verify.bannerBody}
      </p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
        {t.verify.codeSentTo}{" "}
        <span className="font-semibold text-amber-900 dark:text-amber-100" dir="ltr">
          {user.email}
        </span>
      </p>

      <VerifyCodeForm
        email={user.email}
        token={token}
        tone="warning"
        // Re-reading the profile is what makes the banner disappear: the
        // confirmed flag lives on the session, not in local state here.
        onVerified={() => void refresh()}
      />
    </div>
  );
}
