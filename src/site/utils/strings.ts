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
  requiredName: string;
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
  productSubject: string;
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
  requiredName: "Please tell us your name.",
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
  productSubject: "Enquiry about",
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
  requiredName: "გთხოვთ, მიუთითოთ სახელი.",
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
  productSubject: "კითხვა პროდუქტზე",
};

export const siteStrings: Record<SiteLanguage, SiteStrings> = { ka, en };

export function stringsFor(locale: SiteLanguage | undefined): SiteStrings {
  return locale === "en" ? en : ka;
}
