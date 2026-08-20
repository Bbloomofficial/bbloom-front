import { useState } from "react";
import type { FormEvent } from "react";
import type { EnquiryType } from "../api/types";
import { useSite } from "../context";
import { useEnquiry } from "../hooks/useEnquiry";
import { Icon } from "./Icon";
import { SiteButton } from "./SiteButton";

type Props = {
  /** Decides which fields render and which validation the backend applies. */
  type?: Exclude<EnquiryType, "NEWSLETTER">;
  buttonLabel?: string;
  subject?: string;
  productSlug?: string;
  maxGuests?: number;
  compact?: boolean;
  className?: string;
  glass?: boolean;
};

/**
 * Contact, reservation and product forms. The backend validates per type and
 * returns a readable message, so its errors are shown inline unchanged.
 */
export function EnquiryForm({
  type = "GENERAL",
  buttonLabel,
  subject,
  productSlug,
  maxGuests = 12,
  compact = false,
  className = "",
  glass = false,
}: Props) {
  const { t, locale } = useSite();
  const { send, status, error, sent, sending } = useEnquiry();
  const isReservation = type === "RESERVATION";
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    date: "",
    time: "",
    guests: "2",
    website: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const set =
    (key: keyof typeof values) => (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!values.name.trim()) {
      setLocalError(t.requiredName);
      return;
    }
    if (!values.email.trim() && !values.phone.trim()) {
      setLocalError(t.requiredContact);
      return;
    }
    if (
      values.email.trim() &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())
    ) {
      setLocalError(t.invalidEmail);
      return;
    }
    if (isReservation && (!values.date || !values.time)) {
      setLocalError(t.requiredReservation);
      return;
    }

    await send({
      type,
      name: values.name.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      subject: subject?.slice(0, 200),
      message: values.message.trim() || undefined,
      productSlug,
      reservationDate: isReservation ? values.date : undefined,
      reservationTime: isReservation ? values.time : undefined,
      partySize: isReservation ? Number(values.guests) : undefined,
      locale,
      website: values.website,
    });
  }

  if (sent) {
    return (
      <div
        className={`flex flex-col items-center gap-2 p-8 text-center ${
          glass ? "site-glass rounded-site-lg" : "site-card"
        } ${className}`}
        role="status"
      >
        <span className="text-site-primary">
          <Icon name="check" size={32} />
        </span>
        <p className="site-heading site-h3 text-site-text">{t.thanks}</p>
        <p className="text-sm text-site-muted">{t.thanksBody}</p>
      </div>
    );
  }

  const message = localError ?? (status === "error" ? error : null);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-enquiry={type}
      className={`flex flex-col gap-4 ${
        glass
          ? "site-glass rounded-site-lg p-6 sm:p-8"
          : compact
            ? ""
            : "site-card p-6 sm:p-8"
      } ${className}`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="site-label">{t.name}</span>
          <input
            className="site-field"
            name="name"
            value={values.name}
            onChange={set("name")}
            placeholder={t.namePlaceholder}
            autoComplete="name"
            required
          />
        </label>
        <label className="block">
          <span className="site-label">{t.phone}</span>
          <input
            className="site-field"
            name="phone"
            value={values.phone}
            onChange={set("phone")}
            placeholder="+995 5xx xx xx xx"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
      </div>

      <label className="block">
        <span className="site-label">{t.email}</span>
        <input
          className="site-field"
          type="email"
          name="email"
          value={values.email}
          onChange={set("email")}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
        />
      </label>

      {isReservation ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="site-label">{t.date}</span>
            <input
              className="site-field"
              type="date"
              name="reservationDate"
              value={values.date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={set("date")}
              required
            />
          </label>
          <label className="block">
            <span className="site-label">{t.time}</span>
            <input
              className="site-field"
              type="time"
              name="reservationTime"
              value={values.time}
              onChange={set("time")}
              required
            />
          </label>
          <label className="block">
            <span className="site-label">{t.guests}</span>
            <select
              className="site-field"
              value={values.guests}
              onChange={set("guests")}
            >
              {Array.from(
                { length: Math.max(1, maxGuests) },
                (_, index) => index + 1,
              ).map((count) => (
                <option key={count} value={count}>
                  {count} {t.guestsSuffix}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <label className="block">
        <span className="site-label">{t.message}</span>
        <textarea
          className="site-field min-h-28 resize-y"
          name="message"
          value={values.message}
          onChange={set("message")}
          placeholder={t.messagePlaceholder}
          rows={compact ? 3 : 4}
        />
      </label>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="site-hide" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set("website")}
          />
        </label>
      </div>

      {message ? (
        <p
          className="text-sm font-medium"
          style={{ color: "var(--site-accent)" }}
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <SiteButton type="submit" disabled={sending} className="self-start">
        {sending ? t.sending : (buttonLabel ?? t.send)}
      </SiteButton>
    </form>
  );
}

/** Email-only signup. The backend treats a repeat address as success. */
export function NewsletterForm({
  buttonLabel,
  className = "",
}: {
  buttonLabel?: string;
  className?: string;
}) {
  const { t } = useSite();
  const { send, status, error, sent, sending } = useEnquiry();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setLocalError(t.invalidEmail);
      return;
    }
    await send({ type: "NEWSLETTER", email: email.trim(), website });
  }

  if (sent) {
    return (
      <p
        className={`inline-flex items-center gap-2 font-semibold ${className}`}
        role="status"
      >
        <Icon name="check" size={20} />
        {t.subscribed}
      </p>
    );
  }

  const message = localError ?? (status === "error" ? error : null);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-enquiry="NEWSLETTER"
      className={`w-full ${className}`}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="site-hide">{t.email}</span>
          <input
            className="site-field"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            required
          />
        </label>
        <div className="site-hide" aria-hidden="true">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>
        <SiteButton type="submit" disabled={sending}>
          {sending ? t.sending : (buttonLabel ?? t.subscribe)}
        </SiteButton>
      </div>
      {message ? (
        <p className="mt-2 text-sm font-medium" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
