import { useState } from "react";
import type { PublicSection } from "../api/types";
import { Band, Reveal, SectionHeading } from "../components/layout";
import { Icon } from "../components/Icon";
import { SiteImage } from "../components/SiteImage";
import { useSite } from "../context";
import { itemStr, list, str, toMedia } from "../utils/content";

/** Upcoming evenings, tastings and live music — restaurant templates. */
export function EventsCards({ section }: { section: PublicSection }) {
  const items = list(section.content, "items");
  const { effects } = useSite();
  if (items.length === 0) return null;

  return (
    <Band id={section.key} tone="surface">
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item, index) => {
          const media = toMedia((item as Record<string, unknown>).image);
          return (
            <Reveal key={index} delay={index * 80} className="h-full">
              <article
                className={`flex h-full flex-col overflow-hidden ${
                  effects.glassCards
                    ? "site-glass rounded-site-lg"
                    : "site-card"
                } ${effects.hoverLift ? "site-lift" : ""}`}
              >
                <SiteImage
                  media={media}
                  alt={itemStr(item, "title")}
                  seed={itemStr(item, "title") ?? `event-${index}`}
                  ratio="16 / 9"
                  rounded={false}
                />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  {itemStr(item, "date") ? (
                    <span className="site-eyebrow flex items-center gap-2">
                      <Icon name="calendar" size={14} />
                      {itemStr(item, "date")}
                    </span>
                  ) : null}
                  <h3 className="site-heading site-h4 text-site-text">
                    {itemStr(item, "title")}
                  </h3>
                  {itemStr(item, "description") ? (
                    <p className="text-sm text-site-muted">
                      {itemStr(item, "description")}
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Band>
  );
}

/** Accessible accordion — one panel open at a time. */
export function FaqAccordion({ section }: { section: PublicSection }) {
  const items = list(section.content, "items");
  const [open, setOpen] = useState<number | null>(0);
  if (items.length === 0) return null;

  return (
    <Band id={section.key}>
      <SectionHeading
        eyebrow={str(section.content, "eyebrow")}
        title={str(section.content, "title")}
        subtitle={str(section.content, "subtitle")}
      />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-site-border border-y border-site-border">
        {items.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={index}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  aria-controls={`${section.key}-faq-${index}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="site-heading text-site-text">
                    {itemStr(item, "question")}
                  </span>
                  <span
                    className={`shrink-0 text-site-primary transition-transform duration-300 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  >
                    <Icon name="chevronDown" size={20} />
                  </span>
                </button>
              </h3>
              <div
                id={`${section.key}-faq-${index}`}
                hidden={!expanded}
                className="pb-5 text-site-muted"
              >
                {itemStr(item, "answer")}
              </div>
            </div>
          );
        })}
      </div>
    </Band>
  );
}
