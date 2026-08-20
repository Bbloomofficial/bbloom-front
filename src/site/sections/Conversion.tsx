import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Cta } from "../components/SiteButton";
import { EnquiryForm, NewsletterForm } from "../components/EnquiryForm";
import { Icon } from "../components/Icon";
import { MapEmbed } from "../components/MapEmbed";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { image, itemStr, list, num, str } from "../utils/content";

export function NewsletterBand({ section }: { section: PublicSection }) {
  return (
    <Band id={section.key} tone="surface">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="site-heading site-h2 text-site-text">
            {str(section.content, "title")}
          </h2>
          {str(section.content, "text") ? (
            <p className="mt-3 text-site-muted">
              {str(section.content, "text")}
            </p>
          ) : null}
        </div>
        <NewsletterForm buttonLabel={str(section.content, "buttonLabel")} />
      </div>
    </Band>
  );
}

/** Gradient panel with a soft glow — the flagship newsletter. */
export function NewsletterGradientPanel({
  section,
}: {
  section: PublicSection;
}) {
  return (
    <Band id={section.key}>
      <Reveal>
        <div className="site-gradient-bg site-noise relative overflow-hidden rounded-site-lg px-6 py-14 text-center sm:px-14">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
            <h2 className="site-heading site-h2 text-white">
              {str(section.content, "title")}
            </h2>
            {str(section.content, "text") ? (
              <p className="text-white/80">{str(section.content, "text")}</p>
            ) : null}
            <div className="mt-4 w-full max-w-lg">
              <NewsletterForm
                buttonLabel={str(section.content, "buttonLabel")}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </Band>
  );
}

/** Big closing call to action with an image half. */
export function CtaSplitImageGradient({ section }: { section: PublicSection }) {
  const { meta } = useSite();
  const media = image(section.content, "image");

  return (
    <Band id={section.key}>
      <Reveal>
        <div className="grid overflow-hidden rounded-site-lg border border-site-border lg:grid-cols-2">
          <div className="site-gradient-bg site-noise relative flex flex-col justify-center gap-4 px-8 py-14 sm:px-12">
            <h2 className="site-heading site-h2 text-white">
              {str(section.content, "title")}
            </h2>
            {str(section.content, "text") ? (
              <p className="max-w-md text-white/85">
                {str(section.content, "text")}
              </p>
            ) : null}
            <div className="mt-3">
              <Cta
                label={str(section.content, "ctaLabel")}
                href={str(section.content, "ctaHref")}
                tone="outline"
                className="!border-white !text-white hover:!bg-white/15"
              />
            </div>
          </div>
          <SiteImage
            media={media}
            alt={str(section.content, "title")}
            seed={`${meta.slug}-cta`}
            ratio="16 / 11"
            rounded={false}
            className="h-full"
          />
        </div>
      </Reveal>
    </Band>
  );
}

/** Table booking. Posts a RESERVATION enquiry. */
export function ReservationFormPanel({ section }: { section: PublicSection }) {
  const { meta, t } = useSite();
  const glass = section.variant === "glass-form";
  const phoneNote = str(section.content, "phoneNote");

  return (
    <Band
      id={section.key}
      tone={glass ? "default" : "surface"}
      className="relative overflow-hidden"
    >
      {glass ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, var(--site-gradient-from), transparent)",
          }}
          aria-hidden="true"
        />
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={str(section.content, "eyebrow")}
            title={str(section.content, "title")}
            subtitle={str(section.content, "subtitle")}
            align="left"
          />
          {phoneNote ? (
            <p className="mt-6 text-sm text-site-muted">{phoneNote}</p>
          ) : null}
          {meta.contact?.phone ? (
            <a
              href={`tel:${meta.contact.phone.replace(/\s+/g, "")}`}
              className="site-heading mt-2 inline-flex items-center gap-2 text-site-primary"
            >
              <Icon name="phone" size={18} />
              {meta.contact.phone}
            </a>
          ) : null}
        </div>
        <EnquiryForm
          type="RESERVATION"
          glass={glass}
          maxGuests={num(section.content, "maxGuests", 12)}
          buttonLabel={str(section.content, "buttonLabel") ?? t.send}
        />
      </div>
    </Band>
  );
}

/** Delivery partner links. Falls back to nothing when the client added none. */
export function DeliveryLogoRow({ section }: { section: PublicSection }) {
  const partners = list(section.content, "partners");
  if (partners.length === 0) return null;

  return (
    <Band id={section.key} tone="alt">
      <SectionHeading
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {partners.map((partner, index) => {
          const label = itemStr(partner, "name", "label");
          const href = itemStr(partner, "href", "url");
          const content = (
            <span className="site-card flex items-center gap-2 px-6 py-4 font-semibold text-site-text">
              <Icon name="truck" size={18} />
              {label}
            </span>
          );
          return href ? (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="site-lift"
            >
              {content}
            </a>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>
    </Band>
  );
}

export function HoursSimple({ section }: { section: PublicSection }) {
  const rows = list(section.content, "rows");
  const { meta, t } = useSite();
  const withMap =
    section.variant === "with-map" && Boolean(meta.contact?.mapUrl);

  const table = (
    <div className="site-card p-6 sm:p-8">
      <h2 className="site-heading site-h3 text-site-text">
        {str(section.content, "title")}
      </h2>
      <dl className="mt-5 divide-y divide-site-border">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex items-baseline justify-between gap-6 py-3"
          >
            <dt className="text-site-muted">{itemStr(row, "days")}</dt>
            <dd className="site-heading text-site-text">
              {itemStr(row, "hours")}
            </dd>
          </div>
        ))}
      </dl>
      {meta.contact?.address ? (
        <p className="mt-5 flex items-start gap-2 text-sm text-site-muted">
          <Icon name="map" size={16} />
          <span>{meta.contact.address}</span>
        </p>
      ) : null}
    </div>
  );

  if (rows.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      {withMap ? (
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {table}
          <MapEmbed className="h-full min-h-64" ratio="4 / 3" />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">{table}</div>
      )}
      <span className="site-hide">{t.findUs}</span>
    </Band>
  );
}
