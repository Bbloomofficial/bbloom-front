import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useSession } from "../auth";
import { updateSiteSettings } from "../api/client";
import type { SiteDetail } from "../api/types";
import { dashboardStrings } from "../strings";

const SOCIAL_KEYS = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "telegram",
] as const;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink-100 bg-canvas px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200";

/**
 * Phone, email, address, map and social links belong to the site rather than to
 * any section, so the page editor never offered them. Without this the client
 * cannot change the phone number their visitors are told to call — and these
 * channels are the only ones every visitor gets, since the message form next
 * door is off by default and stops when a plan does.
 */
export function ContactSettings({
  site,
  onSaved,
}: {
  site: SiteDetail;
  onSaved: () => void;
}) {
  const { locale } = useI18n();
  const t = dashboardStrings(locale).contact;
  const { token, handleError } = useSession();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    setPhone(site.contactPhone ?? "");
    setEmail(site.contactEmail ?? "");
    setAddress(
      (locale === "en"
        ? (site.contactAddressEn ?? site.contactAddressKa)
        : (site.contactAddressKa ?? site.contactAddressEn)) ?? "",
    );
    setMapUrl(site.mapUrl ?? "");
    setSocial({ ...(site.social ?? {}) });
    setState("idle");
  }, [site, locale]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    const trimmed = address.trim();
    try {
      await updateSiteSettings(token, site.id, {
        contactPhone: phone.trim() || null,
        contactEmail: email.trim() || null,
        [locale === "en" ? "contactAddressEn" : "contactAddressKa"]:
          trimmed || null,
        mapUrl: mapUrl.trim() || null,
        social: Object.fromEntries(
          Object.entries(social)
            .map(([key, value]) => [key, value.trim()])
            .filter(([, value]) => value),
        ),
      });
      setState("saved");
      onSaved();
    } catch (error) {
      handleError(error);
      setState("error");
    }
  }

  return (
    <section className="rounded-3xl border border-ink-100 bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-ink-900">{t.title}</h2>
      <p className="mt-1 text-sm text-ink-600">{t.subtitle}</p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-ink-500">
              {t.phone}
            </span>
            <input
              className={inputClass}
              value={phone}
              dir="ltr"
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-500">
              {t.email}
            </span>
            <input
              className={inputClass}
              type="email"
              value={email}
              dir="ltr"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-ink-500">
            {t.address}
          </span>
          <input
            className={inputClass}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink-500">
            {t.mapUrl}
          </span>
          <input
            className={inputClass}
            value={mapUrl}
            dir="ltr"
            placeholder="https://maps.google.com/…"
            onChange={(event) => setMapUrl(event.target.value)}
          />
          <span className="mt-1 block text-xs text-ink-400">{t.mapHint}</span>
        </label>

        <div>
          <span className="text-xs font-semibold text-ink-500">{t.social}</span>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            {SOCIAL_KEYS.map((key) => (
              <label key={key} className="block">
                <span className="text-xs text-ink-400 capitalize">{key}</span>
                <input
                  className={inputClass}
                  value={social[key] ?? ""}
                  dir="ltr"
                  placeholder="https://"
                  onChange={(event) =>
                    setSocial((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn-primary disabled:opacity-60"
            disabled={state === "saving"}
          >
            {t.save}
          </button>
          {state === "saved" ? (
            <span className="text-sm font-semibold text-success">
              {t.saved}
            </span>
          ) : null}
          {state === "error" ? (
            <span role="alert" className="text-sm font-semibold text-danger">
              {t.error}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
