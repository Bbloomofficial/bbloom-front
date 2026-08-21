import { useCallback, useState } from "react";
import { ApiError, submitEnquiry } from "../api/client";
import type { EnquiryRequest } from "../api/types";
import { useSite } from "../context";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Backs every form on a client site. The backend types each submission
 * (GENERAL / PRODUCT / RESERVATION / NEWSLETTER) and validates per type, so its
 * `detail` message is worth showing to the visitor as-is.
 */
export function useEnquiry() {
  const { ref, locale, t } = useSite();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (payload: EnquiryRequest) => {
      setStatus("sending");
      setError(null);
      try {
        await submitEnquiry(ref, { locale, ...payload });
        setStatus("sent");
        return true;
      } catch (cause) {
        let message = t.errorGeneric;
        if (cause instanceof ApiError) {
          if (cause.status === 429) {
            message = t.rateLimited;
          } else if (Object.keys(cause.fields).length > 0) {
            message = Object.values(cause.fields)[0];
          } else if (cause.status < 500 && cause.message) {
            message = cause.message;
          }
        }
        setError(message);
        setStatus("error");
        return false;
      }
    },
    [ref, locale, t],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    send,
    reset,
    status,
    error,
    sent: status === "sent",
    sending: status === "sending",
  };
}
