import { useState } from "react";
import { useSite } from "../context";
import { EMAIL, EnquirySent, Honeypot, useEnquiry } from "./enquiry";
import { SiteButton } from "./SiteButton";

/** Today, in the visitor's own timezone — a booking in the past is a typo. */
function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Table booking on a restaurant's website.
 *
 * A request, not a confirmation: nothing here checks a floor plan, so the copy
 * promises only that the restaurant has it and will come back. The phone number
 * stays next to this form for the same reason — someone booking for tonight
 * should not have to wait on someone reading an inbox.
 *
 * Drawn when `features.reservations` is on. Submission is gated on the server
 * as well, so a refusal is a normal outcome rather than a bug.
 */
export function ReservationForm({ glass = false }: { glass?: boolean }) {
  const { t } = useSite();
  const { error, sending, sent, reject, send, trap } = useEnquiry();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [note, setNote] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) return reject(t.requiredName);
    // A phone number is enough to confirm a table, so an email is only checked
    // when it is the only way back to the visitor — or when they typed one.
    if (!trimmedPhone && !trimmedEmail) return reject(t.requiredContact);
    if (trimmedEmail && !EMAIL.test(trimmedEmail)) return reject(t.invalidEmail);
    if (!date || !time) return reject(t.requiredReservation);

    const partySize = Number(guests);

    await send({
      type: "RESERVATION",
      name: trimmedName,
      phone: trimmedPhone || undefined,
      email: trimmedEmail || undefined,
      reservationDate: date,
      reservationTime: time,
      partySize: Number.isFinite(partySize) && partySize > 0 ? partySize : undefined,
      message: note.trim() || undefined,
    });
  }

  const card = glass ? "site-glass rounded-site-lg" : "site-card";

  if (sent) {
    return (
      <EnquirySent
        title={t.booked}
        body={t.bookedBody}
        className={`${card} p-6 text-center sm:p-8`}
      />
    );
  }

  return (
    <form
      className={`${card} flex flex-col gap-4 p-6 sm:p-8`}
      onSubmit={submit}
      noValidate
    >
      <Honeypot {...trap} />

      <div className="grid gap-4 sm:grid-cols-2">
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
          <span className="site-hide">{t.phone}</span>
          <input
            className="site-field"
            type="tel"
            dir="ltr"
            value={phone}
            placeholder={t.phone}
            autoComplete="tel"
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="site-hide">{t.email}</span>
        <input
          className="site-field"
          type="email"
          dir="ltr"
          value={email}
          placeholder={`${t.emailPlaceholder} (${t.optional})`}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs text-site-muted">{t.date}</span>
          <input
            className="site-field"
            type="date"
            dir="ltr"
            value={date}
            min={today()}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-site-muted">{t.time}</span>
          <input
            className="site-field"
            type="time"
            dir="ltr"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-site-muted">{t.guests}</span>
          <input
            className="site-field"
            type="number"
            dir="ltr"
            min={1}
            max={50}
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="site-hide">{t.message}</span>
        <textarea
          className="site-field min-h-24 resize-y"
          rows={3}
          value={note}
          placeholder={t.reservationNotePlaceholder}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      {error ? (
        <p className="text-sm text-site-primary" role="alert">
          {error}
        </p>
      ) : null}

      <SiteButton type="submit" className="self-start" disabled={sending}>
        {sending ? t.sending : t.book}
      </SiteButton>
    </form>
  );
}
