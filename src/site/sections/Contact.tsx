import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { EnquiryForm } from "../components/EnquiryForm";
import { Icon } from "../components/Icon";
import { MapEmbed } from "../components/MapEmbed";
import { useSite } from "../context";
import { bool, itemStr, list, str } from "../utils/content";

function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

function ContactDetails({ section }: { section: PublicSection }) {
  const { meta, t } = useSite();
  const contact = meta.contact;
  const rows = list(section.content, "rows");
  const hours = str(section.content, "hours");
  const showWhatsapp =
    bool(section.content, "showWhatsapp", false) && Boolean(contact?.phone);

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
          <span>
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
          <span>
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
          <span>
            <span className="block text-xs tracking-wide text-site-muted uppercase">
              {t.findUs}
            </span>
            <span className="site-heading">{contact.address}</span>
          </span>
        </div>
      ) : null}

      {hours ? (
        <div className="flex items-start gap-3 text-site-text">
          <span className="mt-0.5 text-site-primary">
            <Icon name="clock" size={18} />
          </span>
          <span className="site-heading">{hours}</span>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <dl className="divide-y divide-site-border border-y border-site-border">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex items-baseline justify-between gap-6 py-2.5"
            >
              <dt className="text-sm text-site-muted">
                {itemStr(row, "days")}
              </dt>
              <dd className="site-heading text-sm text-site-text">
                {itemStr(row, "hours")}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {showWhatsapp && contact?.phone ? (
        <a
          href={whatsappHref(contact.phone)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 self-start rounded-site-pill border border-site-border px-4 py-2 text-sm font-semibold text-site-text transition hover:border-site-primary hover:text-site-primary"
        >
          <Icon name="whatsapp" size={18} />
          {t.whatsapp}
        </a>
      ) : null}
    </div>
  );
}

/**
 * All four contact variants share one body; the variant decides the layout and
 * whether the form sits on glass.
 */
export function Contact({ section }: { section: PublicSection }) {
  const { meta, features } = useSite();
  const variant = section.variant ?? "simple";
  const showForm =
    bool(section.content, "showForm", true) && features.enquiryForm !== false;
  const showMap =
    bool(section.content, "showMap", false) && Boolean(meta.contact?.mapUrl);
  const glass = variant === "split-glass-form";

  const heading = (
    <SectionHeading
      eyebrow={str(section.content, "eyebrow")}
      title={str(section.content, "title")}
      subtitle={str(section.content, "subtitle")}
      align={variant === "simple" ? "center" : "left"}
    />
  );

  if (variant === "simple") {
    return (
      <Band id={section.key} tone="surface">
        {heading}
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <ContactDetails section={section} />
            {showMap ? <MapEmbed /> : null}
          </div>
          {showForm ? <EnquiryForm /> : null}
        </div>
      </Band>
    );
  }

  return (
    <Band
      id={section.key}
      tone={glass ? "default" : "surface"}
      className="relative overflow-hidden"
    >
      {glass ? (
        <div
          className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-[46rem] -translate-x-1/2 opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--site-gradient-to), transparent)",
          }}
          aria-hidden="true"
        />
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          {heading}
          <div className="mt-8">
            <ContactDetails section={section} />
          </div>
          {showMap && variant === "split-map" ? (
            <MapEmbed className="mt-8" />
          ) : null}
        </Reveal>

        <Reveal delay={120}>
          {showForm ? <EnquiryForm glass={glass} /> : null}
          {showMap && variant !== "split-map" ? (
            <MapEmbed className={showForm ? "mt-6" : ""} />
          ) : null}
        </Reveal>
      </div>
    </Band>
  );
}
