import type { PublicSection, SitePayload } from "../../api/types";

/**
 * Payloads shaped exactly like the ones the backend blueprints emit for the
 * personal templates.
 *
 * These sections only exist on the nine new templates, so until those are
 * seeded there is no live site to point a browser at — the fixtures are the
 * only description of the contract this repo can check itself against.
 */

export function credentialsSection(
  overrides: Partial<PublicSection> = {},
): PublicSection {
  return {
    key: "credentials",
    type: "credentials",
    variant: "timeline",
    sortOrder: 40,
    content: {
      title: "Qualifications",
      subtitle: "Where I trained and who I have worked with.",
      items: [
        {
          period: "2018 — 2022",
          title: "MA in Applied Linguistics",
          organisation: "Tbilisi State University",
          detail: "Specialised in second-language acquisition.",
          icon: "award",
        },
        {
          period: "since 2015",
          title: "Cambridge CELTA",
          organisation: "British Council",
          detail: "Certificate in teaching English to adults.",
        },
        // A title and nothing else: the least a client can plausibly type.
        { title: "Volunteer tutor" },
      ],
    },
    ...overrides,
  };
}

export function ratesSection(
  overrides: Partial<PublicSection> = {},
): PublicSection {
  return {
    key: "rates",
    type: "rates",
    variant: "cards",
    sortOrder: 50,
    content: {
      title: "Rates",
      subtitle: "Pick whichever suits you.",
      items: [
        {
          name: "Single lesson",
          price: "45 GEL",
          unit: "per hour",
          description: "One-to-one, online or in person.",
          bullets: [{ text: "60 minutes" }, { text: "Homework included" }],
          ctaLabel: "Book a lesson",
          ctaHref: "#contact",
        },
        {
          name: "Ten-lesson pack",
          price: "400 GEL",
          unit: "for ten hours",
          featured: true,
          // Deliberately mixed: an object, a bare string, a blank and an empty
          // object, because hand-edited drafts really do arrive like this.
          bullets: [
            { text: "Save 50 GEL" },
            "Flexible scheduling",
            { text: "   " },
            {},
          ],
          ctaLabel: "Get in touch",
        },
        // No price, no bullets, no CTA — still has to render its name.
        { name: "Exam preparation" },
      ],
    },
    ...overrides,
  };
}

/** The smallest payload `SiteProvider` will accept around a section. */
export function sitePayload(sections: PublicSection[]): SitePayload {
  return {
    site: {
      slug: "demo-teacher-simple",
      businessName: "Nino Beridze",
      status: "PUBLISHED",
      template: {
        code: "teacher-simple",
        category: "TEACHER",
        tier: "SIMPLE",
        name: "Teacher Simple",
      },
      theme: null,
      features: { credentials: true, rates: true },
      locale: "en",
      defaultLanguage: "en",
      languages: ["en", "ka"],
      currency: "GEL",
      seo: null,
      contact: null,
      social: null,
      labels: null,
      logo: null,
      favicon: null,
    },
    sections,
    categories: [],
    products: [],
  };
}
