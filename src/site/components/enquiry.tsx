import { useState } from "react";
import { ApiError } from "../../api/http";
import { submitEnquiry } from "../api/client";
import type { EnquiryRequest } from "../api/types";
import { useSite } from "../context";

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type State = "idle" | "sending" | "sent";

/**
 * The one place a visitor's message is posted from.
 *
 * Every form on a client's website — general message, table request, sign-up,
 * a question about one product — is the same POST with a different `type`, so
 * the parts that are easy to get subtly wrong live here once: the honeypot, the
 * language stamp, and the mapping from a failure to a sentence a stranger can
 * act on.
 *
 * Callers branch on `code` and `status`, never on the server's prose: those
 * sentences are English and are written to be reworded.
 */
export function useEnquiry() {
  const { ref, locale, t } = useSite();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [trap, setTrap] = useState("");

  async function send(payload: EnquiryRequest): Promise<boolean> {
    if (state === "sending") return false;

    // A field no human can see came back filled, so this is a script. It is
    // shown the same thank-you a person gets: telling a bot it was caught only
    // teaches whoever wrote it which field to leave alone next time.
    if (trap.trim()) {
      setState("sent");
      return true;
    }

    setError(null);
    setState("sending");
    try {
      await submitEnquiry(ref, { locale, ...payload });
      setState("sent");
      return true;
    } catch (caught) {
      setState("idle");
      setError(describe(caught));
      return false;
    }
  }

  function describe(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.code === "ENQUIRIES_DISABLED") return t.enquiriesDisabled;
      if (caught.status === 429) return t.rateLimited;
      if (caught.status === 409) return t.enquiriesDisabled;
    }
    return t.errorGeneric;
  }

  return {
    error,
    sending: state === "sending",
    sent: state === "sent",
    /** For the client-side checks, which fail before anything is posted. */
    reject: setError,
    send,
    trap: { value: trap, onChange: setTrap },
  };
}

/**
 * A field only a script will fill in.
 *
 * Positioned off-screen rather than `display: none` — some bots skip hidden
 * inputs — and taken out of the tab order and the accessibility tree so a
 * person using a keyboard or a screen reader never lands on it.
 */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
      }}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** The thank-you every form ends on, so a sent message reads the same anywhere. */
export function EnquirySent({
  title,
  body,
  className = "site-card p-6 text-center sm:p-8",
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={className} role="status">
      <p className="site-heading site-h4 text-site-text">{title}</p>
      <p className="mt-2 text-sm text-site-muted">{body}</p>
    </div>
  );
}
