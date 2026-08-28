import { useState } from "react";
import { useSite } from "../context";
import { EMAIL, EnquirySent, Honeypot, useEnquiry } from "./enquiry";
import { SiteButton } from "./SiteButton";

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
  const { t } = useSite();
  const { error, sending, sent, reject, send, trap } = useEnquiry();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) return reject(t.requiredName);
    if (!trimmedEmail) return reject(t.requiredContact);
    if (!EMAIL.test(trimmedEmail)) return reject(t.invalidEmail);
    if (!trimmedMessage) return reject(t.requiredMessage);

    await send({
      type: "GENERAL",
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });
  }

  if (sent) return <EnquirySent title={t.thanks} body={t.thanksBody} />;

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <Honeypot {...trap} />

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

      <SiteButton type="submit" className="self-start" disabled={sending}>
        {sending ? t.sending : t.send}
      </SiteButton>
    </form>
  );
}
