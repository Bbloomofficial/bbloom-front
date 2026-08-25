import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import {
  ContactRows,
  SocialLinks,
  WhatsappButton,
} from "../components/ContactPanel";
import { Icon } from "../components/Icon";
import { EnquiryForm } from "../components/EnquiryForm";
import { MapEmbed } from "../components/MapEmbed";
import { useSite } from "../context";
import { bool, itemStr, list, str } from "../utils/content";

function ContactDetails({ section }: { section: PublicSection }) {
  const rows = list(section.content, "rows");
  const hours = str(section.content, "hours");

  return (
    <div className="flex flex-col gap-5">
      <ContactRows />

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

      {bool(section.content, "showWhatsapp", false) ? (
        <WhatsappButton className="self-start" />
      ) : null}
    </div>
  );
}

/**
 * All four contact variants share one body; the variant decides the layout.
 *
 * The message form is drawn only when the client has switched it on and their
 * plan allows it — `features.enquiryForm`, resolved per site by the server. It
 * used to be absent by policy, on the grounds that a form promises a reply from
 * a mailbox this site does not have. That reasoning expired: messages now land
 * in the client's dashboard inbox, which they read. Where the form is off,
 * visitors still get the channels the client actually answers on, plus a map.
 */
export function Contact({ section }: { section: PublicSection }) {
  const { meta, features, t } = useSite();
  const variant = section.variant ?? "simple";
  const hasSocial = Object.values(meta.social ?? {}).some(Boolean);
  const showMap = Boolean(meta.contact?.mapUrl || meta.contact?.address);
  const showForm = features.enquiryForm === true;
  const glass = variant === "split-glass-form";

  const aside = (
    <div
      className={`${
        glass ? "site-glass rounded-site-lg" : "site-card"
      } flex flex-col gap-6 p-6 sm:p-8`}
    >
      {showForm ? (
        <div>
          <h3 className="site-heading site-h4 mb-4 text-site-text">
            {t.getInTouch}
          </h3>
          <EnquiryForm />
        </div>
      ) : null}
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
  const hasAside = hasSocial || showMap || showForm;

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
        <div
          className={`mt-10 grid gap-10 ${hasAside ? "lg:grid-cols-2" : ""}`}
        >
          <ContactDetails section={section} />
          {hasAside ? aside : null}
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

      <div
        className={`grid gap-10 ${hasAside ? "lg:grid-cols-2 lg:gap-16" : ""}`}
      >
        <Reveal>
          {heading}
          <div className="mt-8">
            <ContactDetails section={section} />
          </div>
        </Reveal>

        {hasAside ? <Reveal delay={120}>{aside}</Reveal> : null}
      </div>
    </Band>
  );
}
