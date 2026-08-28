import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Cta } from "../components/SiteButton";
import { ContactPanel, SocialLinks } from "../components/ContactPanel";
import { Icon } from "../components/Icon";
import { MapEmbed } from "../components/MapEmbed";
import { NewsletterForm } from "../components/NewsletterForm";
import { ReservationForm } from "../components/ReservationForm";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { image, itemStr, list, str } from "../utils/content";

/**
 * Keep in touch — by address when the client collects them, by phone and social
 * always.
 *
 * The sign-up form was absent for a while because collecting addresses needs a
 * list to put them in. There is one now: a sign-up is an enquiry like any other
 * and lands in the client's dashboard inbox filed as `NEWSLETTER`. The channels
 * stay next to the form rather than being replaced by it, since they are what a
 * visitor who will not hand over an address is left with.
 */
export function NewsletterBand({ section }: { section: PublicSection }) {
  const { meta, features, t } = useSite();
  const phone = meta.contact?.phone;
  const hasSocial = Object.values(meta.social ?? {}).some(Boolean);
  const showForm = features.newsletter === true;

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
          {showForm ? (
            <div className="mt-6">
              <NewsletterForm />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="site-heading inline-flex items-center gap-2 whitespace-nowrap text-site-primary"
            >
              <Icon name="phone" size={18} />
              {phone}
            </a>
          ) : null}
          {hasSocial ? (
            <div className="lg:text-right">
              <p className="mb-3 text-xs tracking-wide text-site-muted uppercase">
                {t.followUs}
              </p>
              <SocialLinks className="lg:justify-end" />
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  );
}

/** Gradient panel with a soft glow — the flagship closing band. */
export function NewsletterGradientPanel({
  section,
}: {
  section: PublicSection;
}) {
  const { meta, features, t } = useSite();
  const phone = meta.contact?.phone;
  const hasSocial = Object.values(meta.social ?? {}).some(Boolean);
  const showForm = features.newsletter === true;

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
            {showForm ? (
              <div className="mt-2 flex w-full justify-center">
                <NewsletterForm tone="dark" />
              </div>
            ) : null}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="site-heading mt-2 inline-flex items-center gap-2 rounded-site-pill bg-white px-6 py-3 whitespace-nowrap text-site-text"
              >
                <Icon name="phone" size={18} />
                {phone}
              </a>
            ) : null}
            {hasSocial ? (
              <div className="mt-2">
                <p className="mb-3 text-xs tracking-wide text-white/70 uppercase">
                  {t.followUs}
                </p>
                <SocialLinks className="justify-center [&_a]:border-white/40 [&_a]:text-white [&_a:hover]:border-white [&_a:hover]:text-white" />
              </div>
            ) : null}
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

/**
 * Table booking.
 *
 * The form posts a `RESERVATION` enquiry into the client's inbox when
 * `features.reservations` is on; the phone number stays regardless, because a
 * table for tonight is a phone call and always was. Where the feature is off,
 * this panel is what it has always been: the number, and the ways to reach it.
 */
export function ReservationFormPanel({ section }: { section: PublicSection }) {
  const { meta, features } = useSite();
  const glass = section.variant === "glass-form";
  const phoneNote = str(section.content, "phoneNote");
  const media = image(section.content, "image");
  const showForm = features.reservations === true;

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
          {media ? (
            <div className="mt-8 hidden lg:block">
              <SiteImage
                media={media}
                alt=""
                ratio="4 / 3"
                className={glass ? "site-glass p-1.5" : undefined}
              />
            </div>
          ) : null}
        </div>
        {showForm ? (
          <ReservationForm glass={glass} />
        ) : (
          <ContactPanel glass={glass} />
        )}
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
