import { useSite } from "../context";
import { Icon } from "./Icon";

/**
 * `mapUrl` is whatever the client pasted. A Google "embed" URL is used as-is;
 * anything else falls back to an address-based embed, and if there is no address
 * at all we just link out.
 */
export function MapEmbed({
  className = "",
  ratio = "16 / 10",
}: {
  className?: string;
  ratio?: string;
}) {
  const { meta, t } = useSite();
  const contact = meta.contact;
  const mapUrl = contact?.mapUrl ?? undefined;
  const address = contact?.address ?? undefined;

  const embedSrc = mapUrl?.includes("/maps/embed")
    ? mapUrl
    : address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : undefined;

  if (!embedSrc) {
    if (!mapUrl && !address) return null;
    return (
      <div className={`site-card flex flex-col gap-3 p-6 ${className}`}>
        {address ? <p className="text-site-muted">{address}</p> : null}
        {mapUrl ? (
          <a
            className="inline-flex items-center gap-2 font-semibold text-site-primary"
            href={mapUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="map" size={18} />
            {t.openInMaps}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="overflow-hidden rounded-site-lg border border-site-border"
        style={{ aspectRatio: ratio }}
      >
        <iframe
          src={embedSrc}
          title={t.findUs}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
      <a
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-site-primary"
        href={
          mapUrl ??
          `https://www.google.com/maps?q=${encodeURIComponent(address ?? "")}`
        }
        target="_blank"
        rel="noreferrer noopener"
      >
        <Icon name="map" size={16} />
        {t.openInMaps}
      </a>
    </div>
  );
}
