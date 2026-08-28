import { useState } from "react";
import type { PublicProduct } from "../api/types";
import { useSite } from "../context";
import { EMAIL, EnquirySent, Honeypot, useEnquiry } from "./enquiry";
import { SiteButton } from "./SiteButton";

/**
 * "Ask about this one", from the product detail view.
 *
 * The same message form as the contact section with the item attached, which is
 * the whole point: the client's inbox shows them which product was being looked
 * at, so they can answer without a round trip asking "which one?". The product
 * is sent as `productSlug` rather than baked into the message text, so the
 * backend can resolve it to a real row and the dashboard can name it in the
 * client's own language.
 *
 * Gated on `features.enquiryForm` — it is the message form, reached from a
 * different place.
 */
export function ProductEnquiryForm({ product }: { product: PublicProduct }) {
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
      type: "PRODUCT",
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      productSlug: product.slug,
      subject: `${t.productSubject}: ${product.name ?? product.slug}`,
    });
  }

  if (sent)
    return (
      <EnquirySent
        title={t.thanks}
        body={t.thanksBody}
        className="rounded-site border border-site-border p-5 text-center"
      />
    );

  return (
    <form
      className="flex flex-col gap-3 rounded-site border border-site-border p-4 sm:p-5"
      onSubmit={submit}
      noValidate
    >
      <Honeypot {...trap} />

      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>

      <label className="block">
        <span className="site-hide">{t.message}</span>
        <textarea
          className="site-field min-h-24 resize-y"
          rows={3}
          value={message}
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
