import type { Locale } from "../i18n";

/**
 * Chrome for the client dashboard. Site *content* is localised by the backend,
 * but the dashboard shell is ours, so it ships its own dictionaries — same
 * shape as the renderer's, keyed off the marketing site's locale.
 */
export type DashboardStrings = {
  brand: string;
  nav: { overview: string; inbox: string; page: string };
  signedInAs: string;
  signOut: string;
  viewSite: string;
  backToBbloom: string;
  loading: string;
  retry: string;
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    failed: string;
    help: string;
  };
  overview: {
    greeting: (name: string) => string;
    subtitle: string;
    siteTitle: string;
    template: string;
    plan: string;
    products: string;
    languages: string;
    currency: string;
    address: string;
    domains: string;
    noDomains: string;
    published: string;
    created: string;
    publish: string;
    unpublish: string;
    publishHint: string;
    ownerOnly: string;
    statsTitle: string;
    total: string;
    unread: string;
    last7: string;
    last30: string;
    byType: string;
    recent: string;
    viewAll: string;
    empty: string;
  };
  inbox: {
    title: string;
    subtitle: string;
    type: string;
    status: string;
    all: string;
    refresh: string;
    empty: string;
    emptyFiltered: string;
    results: (total: number) => string;
    prev: string;
    next: string;
    page: (page: number, total: number) => string;
    select: string;
  };
  detail: {
    message: string;
    noMessage: string;
    contact: string;
    product: string;
    reservation: string;
    partySize: (count: number) => string;
    details: string;
    language: string;
    received: string;
    handled: string;
    status: string;
    note: string;
    notePlaceholder: string;
    save: string;
    saving: string;
    saved: string;
    reply: string;
    call: string;
    close: string;
  };
  types: Record<string, string>;
  statuses: Record<string, string>;
};

const en: DashboardStrings = {
  brand: "bbloom",
  nav: { overview: "Overview", inbox: "Inbox", page: "Page" },
  signedInAs: "Signed in as",
  signOut: "Sign out",
  viewSite: "View site",
  backToBbloom: "Back to bbloom.co",
  loading: "Loading…",
  retry: "Try again",
  login: {
    title: "Your website",
    subtitle: "Sign in to see the messages your website has collected.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    failed: "We could not sign you in. Check your email and password.",
    help: "Forgot your password? Write to us at hello@bbloom.co and we will reset it.",
  },
  overview: {
    greeting: (name) => `Hello, ${name}`,
    subtitle: "Here is how your website is doing.",
    siteTitle: "Your website",
    template: "Template",
    plan: "Plan",
    products: "Products",
    languages: "Languages",
    currency: "Currency",
    address: "Address",
    domains: "Domains",
    noDomains: "No custom domain yet",
    published: "Published",
    created: "Created",
    publish: "Publish",
    unpublish: "Unpublish",
    publishHint: "Publishing makes your website visible to everyone.",
    ownerOnly: "Only the site owner can publish or unpublish.",
    statsTitle: "Messages",
    total: "All time",
    unread: "New",
    last7: "Last 7 days",
    last30: "Last 30 days",
    byType: "By type",
    recent: "Latest messages",
    viewAll: "Open inbox",
    empty: "No messages yet. They will appear here as soon as someone writes.",
  },
  inbox: {
    title: "Inbox",
    subtitle: "Everything sent through your website's forms.",
    type: "Type",
    status: "Status",
    all: "All",
    refresh: "Refresh",
    empty: "No messages yet.",
    emptyFiltered: "Nothing matches these filters.",
    results: (total) => `${total} message${total === 1 ? "" : "s"}`,
    prev: "Previous",
    next: "Next",
    page: (page, total) => `Page ${page} of ${total}`,
    select: "Select a message to read it.",
  },
  detail: {
    message: "Message",
    noMessage: "No message was written.",
    contact: "Contact",
    product: "Product",
    reservation: "Reservation",
    partySize: (count) => `${count} ${count === 1 ? "guest" : "guests"}`,
    details: "Extra details",
    language: "Language",
    received: "Received",
    handled: "Handled",
    status: "Status",
    note: "Private note",
    notePlaceholder: "Only you and bbloom can see this.",
    save: "Save note",
    saving: "Saving…",
    saved: "Saved",
    reply: "Reply by email",
    call: "Call",
    close: "Close",
  },
  types: {
    GENERAL: "Message",
    PRODUCT: "Product question",
    RESERVATION: "Reservation",
    NEWSLETTER: "Newsletter",
  },
  statuses: {
    NEW: "New",
    CONTACTED: "Contacted",
    HANDLED: "Handled",
    SPAM: "Spam",
    ARCHIVED: "Archived",
  },
};

const ka: DashboardStrings = {
  brand: "bbloom",
  nav: { overview: "მიმოხილვა", inbox: "შემოსული", page: "გვერდი" },
  signedInAs: "შესული ხართ როგორც",
  signOut: "გამოსვლა",
  viewSite: "საიტის ნახვა",
  backToBbloom: "bbloom.co-ზე დაბრუნება",
  loading: "იტვირთება…",
  retry: "ხელახლა ცდა",
  login: {
    title: "თქვენი ვებგვერდი",
    subtitle: "შედით, რომ ნახოთ ვებგვერდიდან მიღებული შეტყობინებები.",
    email: "ელფოსტა",
    password: "პაროლი",
    submit: "შესვლა",
    submitting: "მიმდინარეობს…",
    failed: "ვერ შეხვედით. გადაამოწმეთ ელფოსტა და პაროლი.",
    help: "დაგავიწყდათ პაროლი? მოგვწერეთ hello@bbloom.co-ზე და აღვადგენთ.",
  },
  overview: {
    greeting: (name) => `გამარჯობა, ${name}`,
    subtitle: "აი, როგორ მიდის თქვენი ვებგვერდის საქმეები.",
    siteTitle: "თქვენი ვებგვერდი",
    template: "შაბლონი",
    plan: "პაკეტი",
    products: "პროდუქტი",
    languages: "ენები",
    currency: "ვალუტა",
    address: "მისამართი",
    domains: "დომენები",
    noDomains: "საკუთარი დომენი ჯერ არ არის",
    published: "გამოქვეყნდა",
    created: "შეიქმნა",
    publish: "გამოქვეყნება",
    unpublish: "გამოქვეყნების გაუქმება",
    publishHint: "გამოქვეყნების შემდეგ ვებგვერდი ყველასთვის ხილვადი ხდება.",
    ownerOnly: "გამოქვეყნება მხოლოდ მფლობელს შეუძლია.",
    statsTitle: "შეტყობინებები",
    total: "სულ",
    unread: "ახალი",
    last7: "ბოლო 7 დღე",
    last30: "ბოლო 30 დღე",
    byType: "ტიპების მიხედვით",
    recent: "ბოლო შეტყობინებები",
    viewAll: "შემოსულების გახსნა",
    empty: "ჯერ არაფერია. შეტყობინებები აქ გამოჩნდება.",
  },
  inbox: {
    title: "შემოსული",
    subtitle: "ყველაფერი, რაც ვებგვერდის ფორმებიდან გამოგზავნეს.",
    type: "ტიპი",
    status: "სტატუსი",
    all: "ყველა",
    refresh: "განახლება",
    empty: "ჯერ შეტყობინებები არ არის.",
    emptyFiltered: "ამ ფილტრებით ვერაფერი მოიძებნა.",
    results: (total) => `${total} შეტყობინება`,
    prev: "წინა",
    next: "შემდეგი",
    page: (page, total) => `გვერდი ${page} / ${total}`,
    select: "აირჩიეთ შეტყობინება წასაკითხად.",
  },
  detail: {
    message: "შეტყობინება",
    noMessage: "ტექსტი არ დაწერილა.",
    contact: "კონტაქტი",
    product: "პროდუქტი",
    reservation: "ჯავშანი",
    partySize: (count) => `${count} სტუმარი`,
    details: "დამატებითი დეტალები",
    language: "ენა",
    received: "მიღებულია",
    handled: "დამუშავდა",
    status: "სტატუსი",
    note: "შიდა შენიშვნა",
    notePlaceholder: "ამას მხოლოდ თქვენ და bbloom ხედავთ.",
    save: "შენახვა",
    saving: "ინახება…",
    saved: "შენახულია",
    reply: "პასუხი ელფოსტით",
    call: "დარეკვა",
    close: "დახურვა",
  },
  types: {
    GENERAL: "შეტყობინება",
    PRODUCT: "კითხვა პროდუქტზე",
    RESERVATION: "ჯავშანი",
    NEWSLETTER: "სიახლეები",
  },
  statuses: {
    NEW: "ახალი",
    CONTACTED: "დაუკავშირდით",
    HANDLED: "დამუშავებული",
    SPAM: "სპამი",
    ARCHIVED: "დაარქივებული",
  },
};

const dictionaries: Record<Locale, DashboardStrings> = { en, ka };

export function dashboardStrings(locale: Locale): DashboardStrings {
  return dictionaries[locale] ?? ka;
}

const kaMonths = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

/** Not every browser ships Georgian locale data, so ka is formatted by hand. */
function toDate(iso: string | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Dates arrive as ISO instants; clients want them in their own language. */
export function formatDateTime(iso: string | undefined, locale: Locale) {
  const date = toDate(iso);
  if (!date) return "";
  if (locale === "ka") {
    return `${date.getDate()} ${kaMonths[date.getMonth()]} ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(iso: string | undefined, locale: Locale) {
  const date = toDate(iso);
  if (!date) return "";
  if (locale === "ka") {
    return `${date.getDate()} ${kaMonths[date.getMonth()]} ${date.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date);
}
