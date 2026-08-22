import { Icon, SOCIAL_ICONS } from "./Icon";
import { MapEmbed } from "./MapEmbed";
import { useSite } from "../context";

function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

/** The client's own channels. Empty when they have configured none. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const { meta } = useSite();
  const entries = Object.entries(meta.social ?? {}).filter(([, href]) =>
    Boolean(href),
  );
  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {entries.map(([network, href]) => (
        <a
          key={network}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={network}
          className="rounded-full border border-site-border p-2.5 text-site-muted transition hover:border-site-primary hover:text-site-primary"
        >
          <Icon name={SOCIAL_ICONS[network] ?? "website"} size={18} />
        </a>
      ))}
    </div>
  );
}

/** Phone, email and address as the actions they are: tap to call, tap to write. */
export function ContactRows() {
  const { meta, t } = useSite();
  const contact = meta.contact;
  if (!contact?.phone && !contact?.email && !contact?.address) return null;

  return (
    <div className="flex flex-col gap-5">
      {contact?.phone ? (
        <a
          href={`tel:${contact.phone.replace(/\s+/g, "")}`}
          className="flex items-start gap-3 text-site-text transition hover:text-site-primary"
        >
          <span className="mt-0.5 text-site-primary">
            <Icon name="phone" size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs tracking-wide text-site-muted uppercase">
              {t.callUs}
            </span>
            <span className="site-heading">{contact.phone}</span>
          </span>
        </a>
      ) : null}

      {contact?.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-start gap-3 text-site-text transition hover:text-site-primary"
        >
          <span className="mt-0.5 text-site-primary">
            <Icon name="mail" size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs tracking-wide text-site-muted uppercase">
              {t.writeUs}
            </span>
            <span className="site-heading break-all">{contact.email}</span>
          </span>
        </a>
      ) : null}

      {contact?.address ? (
        <div className="flex items-start gap-3 text-site-text">
          <span className="mt-0.5 text-site-primary">
            <Icon name="map" size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs tracking-wide text-site-muted uppercase">
              {t.findUs}
            </span>
            <span className="site-heading">{contact.address}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function WhatsappButton({ className = "" }: { className?: string }) {
  const { meta, t } = useSite();
  const phone = meta.contact?.phone;
  if (!phone) return null;

  return (
    <a
      href={whatsappHref(phone)}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex items-center gap-2 rounded-site-pill border border-site-border px-4 py-2 text-sm font-semibold whitespace-nowrap text-site-text transition hover:border-site-primary hover:text-site-primary ${className}`}
    >
      <Icon name="whatsapp" size={18} />
      {t.whatsapp}
    </a>
  );
}

/**
 * What a visitor gets instead of a message form.
 *
 * A form implies someone is on the other end of it — a mailbox, a queue,
 * somebody who will reply. That is a hosted service, so a website that has not
 * paid for one must not pretend to have it: a message typed into a form nobody
 * reads is worse than no form at all. These are the channels the client already
 * runs, handed over directly.
 */
export function ContactPanel({
  glass = false,
  className = "",
  showMap = true,
}: {
  glass?: boolean;
  className?: string;
  showMap?: boolean;
}) {
  const { meta, t } = useSite();
  const hasSocial = Object.values(meta.social ?? {}).some(Boolean);
  const hasRows = Boolean(
    meta.contact?.phone || meta.contact?.email || meta.contact?.address,
  );
  if (!hasRows && !hasSocial) return null;

  return (
    <div
      className={`${
        glass ? "site-glass rounded-site-lg" : "site-card"
      } flex flex-col gap-6 p-6 sm:p-8 ${className}`}
    >
      <h3 className="site-heading site-h3 text-site-text">{t.getInTouch}</h3>
      <ContactRows />
      <WhatsappButton className="self-start" />
      {hasSocial ? (
        <div>
          <p className="mb-3 text-xs tracking-wide text-site-muted uppercase">
            {t.followUs}
          </p>
          <SocialLinks />
        </div>
      ) : null}
      {showMap ? <MapEmbed /> : null}
    </div>
  );
}
