import { useState } from "react";
import { useSite } from "../context";
import { EMAIL, Honeypot, useEnquiry } from "./enquiry";
import { SiteButton } from "./SiteButton";

/**
 * Newsletter sign-up.
 *
 * An address and nothing else: anything more is a question the visitor has to
 * answer before they can agree to hear from someone, and it is the address that
 * the client actually needs. Sign-ups land in the same inbox as every other
 * message, filed as `NEWSLETTER`, so a client with no mailing tool still has
 * the list — it is a page of their dashboard rather than a file they must go
 * and fetch.
 *
 * Drawn when `features.newsletter` is on; the surrounding band keeps the phone
 * number and the social links either way, so switching this off never leaves a
 * visitor with no way to keep in touch.
 */
export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { t } = useSite();
  const { error, sending, sent, reject, send, trap } = useEnquiry();
  const [email, setEmail] = useState("");

  const dark = tone === "dark";

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) return reject(t.requiredContact);
    if (!EMAIL.test(trimmed)) return reject(t.invalidEmail);

    await send({ type: "NEWSLETTER", email: trimmed });
  }

  if (sent) {
    return (
      <div role="status" className={dark ? "text-white" : ""}>
        <p className="site-heading text-site-text">{t.subscribed}</p>
        <p
          className={`mt-1 text-sm ${dark ? "text-white/80" : "text-site-muted"}`}
        >
          {t.subscribedBody}
        </p>
      </div>
    );
  }

  return (
    <form className="w-full max-w-md" onSubmit={submit} noValidate>
      <Honeypot {...trap} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="block flex-1">
          <span className="site-hide">{t.email}</span>
          <input
            className="site-field"
            type="email"
            dir="ltr"
            value={email}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <SiteButton
          type="submit"
          tone={dark ? "outline" : "primary"}
          className={`shrink-0 whitespace-nowrap ${
            dark ? "!border-white !text-white hover:!bg-white/15" : ""
          }`}
          disabled={sending}
        >
          {sending ? t.sending : t.subscribe}
        </SiteButton>
      </div>

      {error ? (
        <p
          className={`mt-2 text-sm ${dark ? "text-white" : "text-site-primary"}`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
