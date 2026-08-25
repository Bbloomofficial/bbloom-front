import type { SiteLanguage } from "../api/types";

/**
 * Chrome the renderer itself owns — search boxes, sort labels, form errors.
 * Client-authored copy always comes from the payload and is never translated here.
 */
export type SiteStrings = {
  search: string;
  searchPlaceholder: string;
  all: string;
  itemsCount: string;
  sortBy: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNameAsc: string;
  noResults: string;
  noResultsHint: string;
  viewDetails: string;
  enquire: string;
  from: string;
  outOfStock: string;
  close: string;
  previous: string;
  next: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  subject: string;
  date: string;
  time: string;
  guests: string;
  guestsSuffix: string;
  send: string;
  sending: string;
  thanks: string;
  thanksBody: string;
  errorGeneric: string;
  rateLimited: string;
  /**
   * The site is not accepting messages — `409 ENQUIRIES_DISABLED`.
   *
   * Says nothing about plans or billing on purpose. Whoever reads this is the
   * *client's customer*: they cannot act on someone else's subscription status
   * and are not owed it. The reason belongs in the editor, to the client.
   */
  enquiriesDisabled: string;
  requiredName: string;
  requiredMessage: string;
  requiredContact: string;
  requiredReservation: string;
  invalidEmail: string;
  emailPlaceholder: string;
  namePlaceholder: string;
  messagePlaceholder: string;
  subscribe: string;
  subscribed: string;
  openMenu: string;
  closeMenu: string;
  callUs: string;
  writeUs: string;
  findUs: string;
  getInTouch: string;
  followUs: string;
  openInMaps: string;
  whatsapp: string;
  gallery: string;
  aboutProduct: string;
  loading: string;
  notFoundTitle: string;
  notFoundBody: string;
  errorTitle: string;
  retry: string;
  language: string;
  backToTop: string;
  poweredBy: string;
  productSubject: string;
  /** Upgrade prompt for free-tier sites */
  upgradePrompt: {
    title: string;
    body: string;
    createOwn: string;
    seePricing: string;
    dismiss: string;
  };
};

const en: SiteStrings = {
  search: "Search",
  searchPlaceholder: "Search by name…",
  all: "All",
  itemsCount: "items",
  sortBy: "Sort",
  sortDefault: "Featured",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  sortNameAsc: "Name: A–Z",
  noResults: "Nothing found",
  noResultsHint: "Try a different search or category.",
  viewDetails: "View details",
  enquire: "Ask about this",
  from: "from",
  outOfStock: "Unavailable",
  close: "Close",
  previous: "Previous",
  next: "Next",
  name: "Name",
  email: "Email",
  phone: "Phone",
  message: "Message",
  subject: "Subject",
  date: "Date",
  time: "Time",
  guests: "Guests",
  guestsSuffix: "people",
  send: "Send",
  sending: "Sending…",
  thanks: "Thank you!",
  thanksBody: "We have your message and will be in touch shortly.",
  errorGeneric: "Something went wrong. Please try again.",
  rateLimited:
    "Too many messages from this device. Please try again a little later.",
  enquiriesDisabled:
    "This website is not accepting messages at the moment. Please use the contact details above.",
  requiredName: "Please tell us your name.",
  requiredMessage: "Please write your message.",
  requiredContact: "Leave an email or a phone number so we can reply.",
  requiredReservation: "Please choose a date and a time.",
  invalidEmail: "That email address does not look right.",
  emailPlaceholder: "you@example.com",
  namePlaceholder: "Your name",
  messagePlaceholder: "How can we help?",
  subscribe: "Subscribe",
  subscribed: "You are on the list.",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  callUs: "Call",
  writeUs: "Email",
  findUs: "Address",
  getInTouch: "Get in touch",
  followUs: "Follow us",
  openInMaps: "Open in maps",
  whatsapp: "WhatsApp",
  gallery: "Gallery",
  aboutProduct: "Details",
  loading: "Loading…",
  notFoundTitle: "Site not found",
  notFoundBody: "This address does not point to a published website.",
  errorTitle: "Could not load the site",
  retry: "Try again",
  language: "Language",
  backToTop: "Back to top",
  poweredBy: "Made with bbloom",
  productSubject: "Enquiry about",
  upgradePrompt: {
    title: "This is a free bbloom website",
    body: "Want your own website like this? Create one in minutes — free to build, free to publish.",
    createOwn: "Create your own",
    seePricing: "See pricing",
    dismiss: "Dismiss",
  },
};

const ka: SiteStrings = {
  search: "ძებნა",
  searchPlaceholder: "მოძებნეთ დასახელებით…",
  all: "ყველა",
  itemsCount: "პოზიცია",
  sortBy: "დალაგება",
  sortDefault: "რჩეული",
  sortPriceAsc: "ფასი: ზრდადობით",
  sortPriceDesc: "ფასი: კლებადობით",
  sortNameAsc: "დასახელება: ა–ჰ",
  noResults: "ვერაფერი მოიძებნა",
  noResultsHint: "სცადეთ სხვა სიტყვა ან კატეგორია.",
  viewDetails: "დეტალურად",
  enquire: "დაინტერესება",
  from: "-დან",
  outOfStock: "არ არის",
  close: "დახურვა",
  previous: "წინა",
  next: "შემდეგი",
  name: "სახელი",
  email: "ელფოსტა",
  phone: "ტელეფონი",
  message: "შეტყობინება",
  subject: "თემა",
  date: "თარიღი",
  time: "დრო",
  guests: "სტუმრები",
  guestsSuffix: "სტუმარი",
  send: "გაგზავნა",
  sending: "იგზავნება…",
  thanks: "გმადლობთ!",
  thanksBody: "შეტყობინება მივიღეთ და მალე დაგიკავშირდებით.",
  errorGeneric: "დაფიქსირდა შეცდომა. სცადეთ თავიდან.",
  rateLimited:
    "ამ მოწყობილობიდან ბევრი შეტყობინება გაიგზავნა. სცადეთ ცოტა ხანში.",
  enquiriesDisabled:
    "ეს ვებგვერდი ამჟამად შეტყობინებებს არ იღებს. გთხოვთ, დაგვიკავშირდეთ ზემოთ მითითებული კონტაქტით.",
  requiredName: "გთხოვთ, მიუთითოთ სახელი.",
  requiredMessage: "გთხოვთ, დაწეროთ შეტყობინება.",
  requiredContact: "დატოვეთ ელფოსტა ან ტელეფონი, რომ დაგიკავშირდეთ.",
  requiredReservation: "გთხოვთ, აირჩიოთ თარიღი და დრო.",
  invalidEmail: "ელფოსტა არასწორია.",
  emailPlaceholder: "you@example.com",
  namePlaceholder: "თქვენი სახელი",
  messagePlaceholder: "როგორ დაგეხმაროთ?",
  subscribe: "გამოწერა",
  subscribed: "თქვენ უკვე სიაში ხართ.",
  openMenu: "მენიუს გახსნა",
  closeMenu: "მენიუს დახურვა",
  callUs: "დარეკვა",
  writeUs: "მოგვწერეთ",
  findUs: "მისამართი",
  getInTouch: "დაგვიკავშირდით",
  followUs: "გამოგვყევით",
  openInMaps: "რუკაზე ნახვა",
  whatsapp: "WhatsApp",
  gallery: "გალერეა",
  aboutProduct: "დეტალები",
  loading: "იტვირთება…",
  notFoundTitle: "საიტი ვერ მოიძებნა",
  notFoundBody: "ამ მისამართზე გამოქვეყნებული საიტი არ არის.",
  errorTitle: "საიტის ჩატვირთვა ვერ მოხერხდა",
  retry: "თავიდან ცდა",
  language: "ენა",
  backToTop: "დასაწყისში",
  poweredBy: "შექმნილია bbloom-ით",
  productSubject: "კითხვა პროდუქტზე",
  upgradePrompt: {
    title: "ეს უფასო bbloom ვებგვერდია",
    body: "გინდა მსგავსი ვებგვერდი? შექმენი წუთებში — აწყობა და გამოქვეყნება უფასოა.",
    createOwn: "შექმენი საკუთარი",
    seePricing: "ფასების ნახვა",
    dismiss: "დახურვა",
  },
};

export const siteStrings: Record<SiteLanguage, SiteStrings> = { ka, en };

export function stringsFor(locale: SiteLanguage | undefined): SiteStrings {
  return locale === "en" ? en : ka;
}

function pluralise(word: string): string {
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

/**
 * Templates name their catalog: a restaurant sells dishes, not products. The
 * payload carries that wording, so the chrome borrows it where it reads naturally.
 */
export function withLabels(
  base: SiteStrings,
  labels: { products?: string | null } | null | undefined,
  locale: SiteLanguage,
): SiteStrings {
  const noun = labels?.products?.trim();
  if (!noun) return base;
  const many = (locale === "en" ? pluralise(noun) : noun).toLocaleLowerCase();
  return {
    ...base,
    itemsCount: many,
    searchPlaceholder:
      locale === "en" ? `Search ${many}…` : `მოძებნეთ ${many}…`,
  };
}
