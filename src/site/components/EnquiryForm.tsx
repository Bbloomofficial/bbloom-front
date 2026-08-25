import { useState } from "react";
import { ApiError } from "../../api/http";
import { submitEnquiry } from "../api/client";
import { useSite } from "../context";
import { SiteButton } from "./SiteButton";

type State = "idle" | "sending" | "sent";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The contact form on a client's public website.
 *
 * Messages land in the client's dashboard inbox. Nothing is emailed to the
 * visitor and no reply is promised beyond „we will be in touch", because the
 * only guarantee we can make is that the client can read it.
 *
 * Rendered only when `features.enquiryForm` is on, but the server gates the
 * submission too — the form is code we ship to a stranger's browser, so not
 * drawing it is presentation, not enforcement. That means a `409` here is a
 * normal outcome rather than a bug: the flag can lapse between the page being
 * loaded and the message being sent.
 */
export function EnquiryForm() {
  const { ref, t } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state === "sending") return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) return setError(t.requiredName);
    if (!trimmedEmail) return setError(t.requiredContact);
    if (!EMAIL.test(trimmedEmail)) return setError(t.invalidEmail);
    if (!trimmedMessage) return setError(t.requiredMessage);

    setError(null);
    setState("sending");
    try {
      await submitEnquiry(ref, {
        type: "GENERAL",
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setState("sent");
    } catch (caught) {
      setState("idle");
      setError(enquiryError(caught));
    }
  }

  /**
   * Branch on `code` and `status`, never on the server's prose: those sentences
   * are English and are written to be reworded.
   */
  function enquiryError(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.code === "ENQUIRIES_DISABLED") return t.enquiriesDisabled;
      if (caught.status === 429) return t.rateLimited;
      if (caught.status === 409) return t.enquiriesDisabled;
    }
    return t.errorGeneric;
  }

  if (state === "sent") {
    return (
      <div className="site-card p-6 text-center sm:p-8" role="status">
        <p className="site-heading site-h4 text-site-text">{t.thanks}</p>
        <p className="mt-2 text-sm text-site-muted">{t.thanksBody}</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <label className="block">
        <span className="site-hide">{t.name}</span>
        <input
          className="site-field"
          value={name}
          placeholder={t.namePlaceholder}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="block">
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

      <label className="block">
        <span className="site-hide">{t.message}</span>
        <textarea
          className="site-field min-h-32 resize-y"
          value={message}
          rows={4}
          placeholder={t.messagePlaceholder}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      {error ? (
        <p className="text-sm text-site-primary" role="alert">
          {error}
        </p>
      ) : null}

      <SiteButton
        type="submit"
        className="self-start"
        disabled={state === "sending"}
      >
        {state === "sending" ? t.sending : t.send}
      </SiteButton>
    </form>
  );
}
