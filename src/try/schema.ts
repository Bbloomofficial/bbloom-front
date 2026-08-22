import type { PublicSection } from "../site/api/types";

/**
 * What can be edited, worked out from the content itself.
 *
 * The manage API describes each section with a `fields` schema — types, and
 * labels already translated. That schema is behind authentication, and the
 * whole point of this flow is that there is no account yet, so here the shape
 * of the demo content is the only description available: a string is text, an
 * object carrying a `url` is an image, an array is a repeated block.
 *
 * This is deliberately a stopgap. The backend has been asked for a public
 * `/public/templates/{code}/sections` returning the real schema; when it lands,
 * `deriveFields` is the only thing that needs replacing, because everything
 * downstream already speaks in `EditableField`.
 */

export type EditableField = {
  /** Dotted path into the section content, e.g. `items.0.title`. */
  path: string;
  kind: "text" | "textarea" | "image";
  /** Label shown to the client, already in their language. */
  label: string;
  /** Set for fields inside a repeated block, so the UI can group them. */
  group?: string;
};

type Lang = "ka" | "en";

/**
 * Georgian first. Keys are the ones the templates actually use; anything not
 * listed falls back to a humanised key rather than being hidden, so a template
 * that grows a field stays editable without a frontend release.
 */
const LABELS: Record<string, { ka: string; en: string }> = {
  title: { ka: "სათაური", en: "Title" },
  subtitle: { ka: "ქვესათაური", en: "Subtitle" },
  heading: { ka: "სათაური", en: "Heading" },
  text: { ka: "ტექსტი", en: "Text" },
  body: { ka: "ტექსტი", en: "Text" },
  description: { ka: "აღწერა", en: "Description" },
  summary: { ka: "მოკლე აღწერა", en: "Summary" },
  name: { ka: "დასახელება", en: "Name" },
  label: { ka: "წარწერა", en: "Label" },
  price: { ka: "ფასი", en: "Price" },
  image: { ka: "სურათი", en: "Image" },
  logo: { ka: "ლოგო", en: "Logo" },
  photo: { ka: "ფოტო", en: "Photo" },
  ctaLabel: { ka: "ღილაკის ტექსტი", en: "Button text" },
  ctaHref: { ka: "ღილაკის ბმული", en: "Button link" },
  secondaryCtaLabel: { ka: "მეორე ღილაკის ტექსტი", en: "Second button text" },
  secondaryCtaHref: { ka: "მეორე ღილაკის ბმული", en: "Second button link" },
  address: { ka: "მისამართი", en: "Address" },
  phone: { ka: "ტელეფონი", en: "Phone" },
  email: { ka: "ელფოსტა", en: "Email" },
  hours: { ka: "სამუშაო საათები", en: "Opening hours" },
  note: { ka: "შენიშვნა", en: "Note" },
  eyebrow: { ka: "წინა ტექსტი", en: "Eyebrow" },
  quote: { ka: "ციტატა", en: "Quote" },
  author: { ka: "ავტორი", en: "Author" },
  question: { ka: "კითხვა", en: "Question" },
  answer: { ka: "პასუხი", en: "Answer" },
  day: { ka: "დღე", en: "Day" },
  value: { ka: "მნიშვნელობა", en: "Value" },
  tagline: { ka: "სლოგანი", en: "Tagline" },
};

const SECTION_LABELS: Record<string, { ka: string; en: string }> = {
  header: { ka: "თავსართი", en: "Header" },
  hero: { ka: "მთავარი ბანერი", en: "Main banner" },
  about: { ka: "ჩვენ შესახებ", en: "About" },
  products: { ka: "პროდუქტები", en: "Products" },
  menu: { ka: "მენიუ", en: "Menu" },
  hours: { ka: "სამუშაო საათები", en: "Opening hours" },
  contact: { ka: "კონტაქტი", en: "Contact" },
  footer: { ka: "ქვედა ნაწილი", en: "Footer" },
  gallery: { ka: "გალერეა", en: "Gallery" },
  testimonials: { ka: "შეფასებები", en: "Testimonials" },
  faq: { ka: "ხდკ", en: "FAQ" },
  features: { ka: "უპირატესობები", en: "Features" },
  announcement: { ka: "განცხადება", en: "Announcement" },
  conversion: { ka: "მოწოდება", en: "Call to action" },
  categories: { ka: "კატეგორიები", en: "Categories" },
  events: { ka: "ღონისძიებები", en: "Events" },
};

function humanise(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function labelFor(key: string, lang: Lang): string {
  return LABELS[key]?.[lang] ?? humanise(key);
}

export function sectionLabel(section: PublicSection, lang: Lang): string {
  return SECTION_LABELS[section.key]?.[lang] ?? humanise(section.key);
}

function isImage(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).url === "string"
  );
}

/**
 * Long prose wants a textarea and a button label does not, and the content
 * cannot say which it is. Length is a crude signal, so it is combined with the
 * field name, which is the one the templates are consistent about.
 */
const LONG_FIELDS = new Set([
  "subtitle",
  "description",
  "body",
  "text",
  "answer",
  "quote",
  "summary",
  "note",
  "address",
]);

function kindFor(key: string, value: string): "text" | "textarea" {
  if (LONG_FIELDS.has(key)) return "textarea";
  return value.length > 90 ? "textarea" : "text";
}

/**
 * Fields the client should never be handed: internal wiring that looks like
 * ordinary text but breaks the page when typed into.
 */
const SKIP = new Set(["id", "key", "slug", "icon", "variant", "anchor", "type"]);

const MAX_ITEMS = 12;

export function deriveFields(
  section: PublicSection,
  lang: Lang,
): EditableField[] {
  const fields: EditableField[] = [];

  const walk = (
    value: unknown,
    path: string,
    key: string,
    group: string | undefined,
    depth: number,
  ) => {
    if (SKIP.has(key)) return;

    if (typeof value === "string") {
      // Empty strings are still offered: an unused slot in the template is a
      // place the client may want to put something.
      fields.push({
        path,
        kind: kindFor(key, value),
        label: labelFor(key, lang),
        group,
      });
      return;
    }

    if (isImage(value)) {
      fields.push({ path, kind: "image", label: labelFor(key, lang), group });
      return;
    }

    if (Array.isArray(value)) {
      if (depth > 1) return;
      value.slice(0, MAX_ITEMS).forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return;
        const groupLabel = `${labelFor(key, lang)} ${index + 1}`;
        for (const [childKey, childValue] of Object.entries(
          item as Record<string, unknown>,
        )) {
          walk(
            childValue,
            `${path}.${index}.${childKey}`,
            childKey,
            groupLabel,
            depth + 1,
          );
        }
      });
      return;
    }

    if (value && typeof value === "object") {
      if (depth > 1) return;
      for (const [childKey, childValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        walk(childValue, `${path}.${childKey}`, childKey, group, depth + 1);
      }
    }
  };

  for (const [key, value] of Object.entries(section.content ?? {})) {
    walk(value, key, key, undefined, 0);
  }

  return fields;
}
