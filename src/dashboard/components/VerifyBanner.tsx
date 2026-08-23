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
  const { refresh, resendAvailableAt, lastSendFailed, noteSend } = useAuth();

  if (user.emailVerified) return null;

  // Only an explicit `false` means mail is down. An older backend omits the
  // field, and treating that as "broken" would tell every client on a healthy
  // server that confirmation is unavailable.
  const undeliverable = user.emailDelivery === false;
  // A single send that failed is a different claim from mail being off, and it
  // is the one that cost a real client: `emailDelivery` only goes false on the
  // third consecutive failure, so the first people of an outage saw a healthy
  // server and a cheerful "check your inbox" for a message that never left.
  const failed = !undeliverable && lastSendFailed;

  const title = undeliverable
    ? t.verify.unavailableTitle
    : failed
      ? t.verify.sendFailedTitle
      : t.verify.bannerTitle;
  const body = undeliverable
    ? t.verify.unavailableBody
    : failed
      ? t.verify.sendFailedBody
      : t.verify.bannerBody;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
      <p className="font-bold text-amber-900 dark:text-amber-100">{title}</p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
        {body}
      </p>
      {!undeliverable && !failed && (
        <>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
            {t.verify.codeSentTo}{" "}
            <span
              className="font-semibold text-amber-900 dark:text-amber-100"
              dir="ltr"
            >
              {user.email}
            </span>
          </p>
          {/* The server can only tell us the message was accepted, never that
              it landed: a typo'd address is accepted and bounces minutes later
              at the far end, where nothing reaches us. Printing the address is
              what makes a typo visible; this names the two things that can
              still be wrong when the code does not arrive. */}
          <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
            {t.verify.notArrived}
          </p>
        </>
      )}

      <VerifyCodeForm
        email={user.email}
        token={token}
        tone="warning"
        emailDelivery={user.emailDelivery}
        resendAvailableAt={resendAvailableAt}
        onSendResult={noteSend}
        // Re-reading the profile is what makes the banner disappear: the
        // confirmed flag lives on the session, not in local state here.
        onVerified={() => void refresh()}
      />
    </div>
  );
}
