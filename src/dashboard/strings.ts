import type { Locale } from "../i18n";
import type { ProblemStrings } from "../api/problem";
import { problemStrings } from "../api/problemStrings";
import type { PublishBlock } from "./gate";

/**
 * Chrome for the client dashboard. Site *content* is localised by the backend,
 * but the dashboard shell is ours, so it ships its own dictionaries — same
 * shape as the renderer's, keyed off the marketing site's locale.
 */
export type DashboardStrings = {
  brand: string;
  nav: {
    overview: string;
    inbox: string;
    page: string;
    billing: string;
    team: string;
    sites: string;
    account: string;
  };
  signedInAs: string;
  signOut: string;
  viewSite: string;
  backToBbloom: string;
  loading: string;
  retry: string;
  cancel: string;
  close: string;
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    failed: string;
    help: string;
    noAccount: string;
    createAccount: string;
  };
  register: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    password: string;
    passwordHint: string;
    submit: string;
    submitting: string;
    failed: string;
    haveAccount: string;
    signIn: string;
    terms: string;
  };
  sites: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    create: string;
    open: string;
    manage: string;
    addAnother: string;
    allSites: string;
    switcher: string;
    draftChanges: string;
    trialEnds: (date: string) => string;
    renewsOn: (date: string) => string;
    graceUntil: (date: string) => string;
    endsOn: (date: string) => string;
  };
  newSite: {
    title: string;
    subtitle: string;
    firstTitle: string;
    firstSubtitle: string;
    businessName: string;
    businessNamePlaceholder: string;
    language: string;
    template: string;
    templateHint: string;
    sampleContent: string;
    sampleContentHint: string;
    submit: string;
    submitting: string;
    failed: string;
    noTemplate: string;
    preview: string;
    demo: string;
    afterHint: string;
  };
  verify: {
    bannerTitle: string;
    bannerBody: string;
    resend: string;
    resendCode: string;
    resending: string;
    resent: string;
    resentAgain: string;
    resendFailed: string;
    resendWait: (seconds: number) => string;
    resendTooSoon: string;
    codeLabel: string;
    codeDigit: (position: number) => string;
    codeSubmit: string;
    codeChecking: string;
    codeWrong: string;
    codeAttemptsLeft: (remaining: number) => string;
    codeExpired: string;
    codeTooManyAttempts: string;
    codeFailed: string;
    codeSentTo: string;
    /**
     * `mailSent: true` means the SMTP server accepted the message, not that it
     * arrived: a typo'd or dead address is accepted and bounces asynchronously
     * minutes later, with no signal the API ever sees. So the optimistic branch
     * has to offer the two things that can still be wrong — the spam folder and
     * the address itself — next to the address, where a typo is visible.
     */
    notArrived: string;
    deliveryOff: string;
    /**
     * A single send that failed, as opposed to mail being switched off. The
     * address is fine and the account is fine; one message did not leave.
     */
    sendFailed: string;
    sendFailedTitle: string;
    sendFailedBody: string;
    /** Shown instead of "we sent you a code" when the server cannot send mail. */
    unavailableTitle: string;
    unavailableBody: string;
    unavailableHaveCode: string;
    resendDailyLimit: string;
    linkOnly: string;
    pageTitle: string;
    pageBody: string;
    pageNoEmail: string;
    pageChecking: string;
    pageSuccessTitle: string;
    pageSuccessBody: string;
    pageFailedTitle: string;
    pageFailedBody: string;
    missingToken: string;
    goToPanel: string;
    verified: string;
  };
  billing: {
    title: string;
    subtitle: string;
    status: string;
    plan: string;
    noPlan: string;
    provider: string;
    trialEnds: string;
    renews: string;
    graceEnds: string;
    cancelAtPeriodEnd: string;
    cancelAtPeriodEndOn: (date: string) => string;
    choosePlan: string;
    changePlan: string;
    payments: string;
    noPayments: string;
    cancelPlan: string;
    cancelling: string;
    cancelConfirm: string;
    cancelHint: string;
    ownerOnly: string;
    periods: string;
    period: (count: number) => string;
    checkoutTitle: string;
    checkoutStarting: string;
    checkoutFailed: string;
    cancelFailed: string;
    bankTitle: string;
    bankHint: string;
    redirecting: string;
    done: string;
    pendingTitle: string;
    pendingBody: (amount: string, plan: string) => string;
    pendingNotPaid: string;
    pendingReplace: string;
    pendingSince: (date: string) => string;
    paidTitle: Record<"FREE_PLAN" | "LAPSED", string>;
    paidBody: Record<"FREE_PLAN" | "LAPSED", string>;
    paidPerks: string[];
  };
  plans: {
    monthly: string;
    yearly: string;
    perMonth: string;
    perYear: string;
    featured: string;
    choose: string;
    current: string;
    loadFailed: string;
  };
  team: {
    title: string;
    subtitle: string;
    member: string;
    role: string;
    added: string;
    lastLogin: string;
    never: string;
    invite: string;
    inviteTitle: string;
    inviteHint: string;
    inviting: string;
    remove: string;
    removeConfirm: string;
    makeOwner: string;
    makeEditor: string;
    you: string;
    ownerOnly: string;
    unverified: string;
  };
  account: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    passwordTitle: string;
    currentPassword: string;
    newPassword: string;
    submit: string;
    submitting: string;
    saved: string;
    /**
     * A 401 here is not a dead session — it is the current password being
     * wrong, and saying "wrong email or password" next to two password boxes
     * would send someone hunting for a mistake in a field they cannot see.
     */
    wrongCurrent: string;
    sessionExpired: string;
    failed: string;
  };
  gate: {
    blocked: Record<PublishBlock, string>;
    title: string;
    verifyEmail: string;
    ready: string;
  };
  siteStatuses: Record<string, string>;
  subscriptionStatuses: Record<string, string>;
  roles: Record<string, string>;
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
    publishFailed: string;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    email: string;
    address: string;
    mapUrl: string;
    mapHint: string;
    social: string;
    save: string;
    saved: string;
    error: string;
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
    saveFailed: string;
    reply: string;
    call: string;
    close: string;
  };
  types: Record<string, string>;
  statuses: Record<string, string>;
  preview: {
    failed: string;
  };
  /**
   * What the client is told when a request fails. The API explains itself in
   * English; these are the sentences we show instead.
   */
  errors: ProblemStrings;
};

const en: DashboardStrings = {
  brand: "bbloom",
  nav: {
    overview: "Overview",
    inbox: "Inbox",
    page: "Page",
    billing: "Billing",
    team: "Team",
    sites: "Websites",
    account: "Account",
  },
  signedInAs: "Signed in as",
  signOut: "Sign out",
  viewSite: "View site",
  backToBbloom: "Back to bbloom.ge",
  loading: "Loading…",
  retry: "Try again",
  cancel: "Cancel",
  close: "Close",
  login: {
    title: "Your websites",
    subtitle: "Sign in to edit your websites and read your messages.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    failed: "We could not sign you in. Check your email and password.",
    help: "Forgot your password? Write to us at hello@bbloom.ge and we will reset it.",
    noAccount: "New to bbloom?",
    createAccount: "Create an account",
  },
  register: {
    title: "Create your account",
    subtitle:
      "Sign up, build your website, and put it online whenever you are ready.",
    fullName: "Your name",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters.",
    submit: "Create account",
    submitting: "Creating…",
    failed: "We could not create your account.",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    terms:
      "You can edit everything straight away. Your website is free to publish at a bbloom.ge address — you only pay to drop our badge or use your own domain.",
  },
  sites: {
    title: "Your websites",
    subtitle: "Everything you own or help edit.",
    emptyTitle: "Let's build your first website",
    emptyBody:
      "Pick a design, name your business, and start editing. Publishing is free — just confirm your email first.",
    create: "Create a website",
    open: "Open",
    manage: "Manage",
    addAnother: "Add another website",
    allSites: "All websites",
    switcher: "Switch website",
    draftChanges: "Unpublished edits",
    trialEnds: (date) => `Trial ends ${date}`,
    renewsOn: (date) => `Renews ${date}`,
    graceUntil: (date) => `Payment overdue — extras end ${date}`,
    endsOn: (date) => `Ends ${date}`,
  },
  newSite: {
    title: "New website",
    subtitle: "Pick a design to start from. You can change everything on it.",
    firstTitle: "Create your first website",
    firstSubtitle:
      "Choose a design, give it your business name, and start editing right away.",
    businessName: "Business name",
    businessNamePlaceholder: "For example, Cafe Mimoza",
    language: "Main language",
    template: "Design",
    templateHint: "Every design is fully editable — text, photos and colours.",
    sampleContent: "Fill it with example content",
    sampleContentHint:
      "Gives you a complete page to edit instead of empty boxes. Recommended.",
    submit: "Create website",
    submitting: "Creating…",
    failed: "We couldn't create the website. Please try again.",
    noTemplate: "Choose a design to continue.",
    preview: "Preview",
    demo: "Live demo",
    afterHint:
      "Your website starts private. Publish it for free whenever you are ready.",
  },
  verify: {
    bannerTitle: "Confirm your email address",
    bannerBody:
      "We sent you a six-digit code. Until you enter it you can edit everything — you just cannot put a website online.",
    resend: "Send the email again",
    resendCode: "Send a new code",
    resending: "Sending…",
    resent: "Sent. Check your inbox, including spam.",
    resentAgain:
      "Sent again. If none of them have arrived, the problem is at our end and not with the address you typed. Write to hello@bbloom.ge and we will confirm you by hand.",
    resendFailed: "We could not send it. Try again shortly.",
    resendWait: (seconds) => `Send again in ${seconds}s`,
    resendTooSoon: "We just sent one. Give it a moment.",
    codeLabel: "Enter the six-digit code",
    codeDigit: (position) => `Digit ${position}`,
    codeSubmit: "Confirm",
    codeChecking: "Checking…",
    codeWrong: "That code is not right. Check it and try again.",
    codeAttemptsLeft: (remaining) =>
      remaining === 1
        ? "That code is not right. One more try before you need a new one."
        : `That code is not right. ${remaining} tries left.`,
    codeExpired: "That code has expired. Send yourself a new one.",
    codeTooManyAttempts:
      "Too many attempts. Send yourself a new code and try again.",
    codeFailed: "We could not check that code. Try again shortly.",
    codeSentTo: "We sent a code to",
    notArrived:
      "Not there? Check your spam folder. If that address is wrong, write to hello@bbloom.ge and we will correct it.",
    deliveryOff:
      "Email sending is not switched on yet, so nothing was sent. Tell us and we will confirm your address for you.",
    sendFailed:
      "That one did not send. Your address is fine — try again in a moment, or write to hello@bbloom.ge and we will confirm it for you.",
    sendFailedTitle: "Your confirmation email did not send",
    sendFailedBody:
      "Nothing arrived because the message failed to leave us, not because your address is wrong. Send it again below, or write to hello@bbloom.ge and we will confirm your address for you.",
    unavailableTitle: "Email confirmation is temporarily unavailable",
    unavailableBody:
      "We cannot send confirmation emails at the moment, so no code is on its way. Keep building your website — you can confirm later, and nothing you do now is lost. Write to hello@bbloom.ge if you need your website online today.",
    unavailableHaveCode: "Already have a code? Enter it here.",
    resendDailyLimit:
      "That's as many codes as we can send today. Try again tomorrow, or write to hello@bbloom.ge.",
    linkOnly:
      "Open the link in the email we sent you to confirm your address.",
    pageTitle: "Confirm your email address",
    pageBody:
      "Enter the six-digit code from the email, or open the link it contains.",
    pageNoEmail:
      "Sign in and we will send you a new confirmation email.",
    pageChecking: "Confirming your email…",
    pageSuccessTitle: "Your email is confirmed",
    pageSuccessBody: "That's the last thing between you and a website online.",
    pageFailedTitle: "This link did not work",
    pageFailedBody:
      "It may have expired or already been used. Sign in and send yourself a new one.",
    missingToken: "This link is incomplete.",
    goToPanel: "Go to your websites",
    verified: "Email confirmed",
  },
  billing: {
    title: "Plan and billing",
    subtitle:
      "Your website is online for free. A plan drops our badge and lets you use your own domain.",
    status: "Status",
    plan: "Plan",
    noPlan: "Free plan",
    provider: "Payment method",
    trialEnds: "Trial ends",
    renews: "Renews",
    graceEnds: "Extras end",
    cancelAtPeriodEnd: "Stops at the end of this period",
    cancelAtPeriodEndOn: (date) =>
      `Your plan runs until ${date}. Your website stays online after that.`,
    choosePlan: "Choose a plan",
    changePlan: "Change plan",
    payments: "Payments",
    noPayments: "No payments yet.",
    cancelPlan: "Stop renewing",
    cancelling: "Stopping…",
    cancelConfirm:
      "Your plan runs until the end of the period you have paid for. Your website stays online either way — our badge comes back and your own domain stops working. Continue?",
    cancelHint: "You keep everything you have edited either way.",
    ownerOnly: "Only the website's owner can change the plan.",
    periods: "How long",
    period: (count) => `${count} month${count === 1 ? "" : "s"}`,
    checkoutTitle: "Payment",
    checkoutStarting: "Preparing…",
    checkoutFailed: "We couldn't start the payment. Please try again.",
    cancelFailed: "We couldn't cancel the renewal. Please try again.",
    bankTitle: "Bank transfer",
    bankHint: "Your plan starts as soon as the payment reaches us.",
    redirecting: "Taking you to the payment page…",
    done: "Done",
    pendingTitle: "Waiting for your payment",
    pendingBody: (amount, plan) =>
      `We are waiting for ${amount} for the ${plan} plan. It starts once the money reaches us.`,
    pendingNotPaid:
      "We have not received it yet, so your website is still on the free plan.",
    pendingReplace:
      "Choosing a different plan replaces this — you will never be asked for both.",
    pendingSince: (date) => `Requested ${date}`,
    paidTitle: {
      FREE_PLAN: "You are on the free plan",
      LAPSED: "Your plan has ended",
    },
    paidBody: {
      FREE_PLAN:
        "Your website is online and stays online, for free, at its bbloom.ge address. A plan adds three things.",
      LAPSED:
        "Your website itself stays online at its bbloom.ge address — nothing has gone down. What stopped is the paid part.",
    },
    paidPerks: [
      "Our badge comes off your pages.",
      "Your own domain name works.",
      "Enquiries are emailed to you as they arrive. You see every one in your inbox here either way.",
    ],
  },
  plans: {
    monthly: "per month",
    yearly: "per year",
    perMonth: "/month",
    perYear: "/year",
    featured: "Most popular",
    choose: "Choose",
    current: "Your plan",
    loadFailed: "We could not load the plans.",
  },
  team: {
    title: "Who can edit",
    subtitle: "People with access to this website.",
    member: "Person",
    role: "Role",
    added: "Added",
    lastLogin: "Last signed in",
    never: "Never",
    invite: "Add someone",
    inviteTitle: "Add someone to this website",
    inviteHint:
      "They need a bbloom account already. Editors can change the website; owners can also handle billing.",
    inviting: "Adding…",
    remove: "Remove",
    removeConfirm: "Remove this person's access to the website?",
    makeOwner: "Make owner",
    makeEditor: "Make editor",
    you: "You",
    ownerOnly: "Only the website's owner can manage who has access.",
    unverified: "Email not confirmed",
  },
  account: {
    title: "Your account",
    subtitle: "Your details and password.",
    name: "Name",
    email: "Email",
    passwordTitle: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    submit: "Change password",
    submitting: "Saving…",
    saved: "Password changed.",
    wrongCurrent: "Your current password isn't right.",
    sessionExpired:
      "You have been signed out. Sign in again and change your password from there.",
    failed: "We couldn't change your password. Please try again.",
  },
  gate: {
    blocked: {
      EMAIL_UNVERIFIED:
        "Confirm your email address before putting your website online.",
    },
    title: "Not online yet",
    verifyEmail: "Confirm your email",
    ready: "Publishing makes your website visible to everyone.",
  },
  siteStatuses: {
    DRAFT: "Private",
    PUBLISHED: "Online",
    SUSPENDED: "Taken offline",
    ARCHIVED: "Archived",
  },
  subscriptionStatuses: {
    TRIALING: "Free trial",
    ACTIVE: "Active",
    GRACE: "Payment overdue",
    EXPIRED: "Expired",
    CANCELLED: "Stopped",
  },
  roles: {
    SITE_OWNER: "Owner",
    SITE_EDITOR: "Editor",
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
    publishFailed: "We couldn't change what's online. Please try again.",
  },
  contact: {
    title: "Contact details",
    subtitle:
      "Shown on your website — visitors call, write and find you with these.",
    phone: "Phone",
    email: "Email",
    address: "Address",
    mapUrl: "Map link",
    mapHint: "Paste a Google Maps link to your location.",
    social: "Social links",
    save: "Save",
    saved: "Saved",
    error: "Could not save. Please try again.",
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
    saveFailed: "We couldn't save that. Please try again.",
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
  preview: {
    failed: "We couldn't load the preview. Try again.",
  },
  errors: problemStrings("en"),
};

const ka: DashboardStrings = {
  brand: "bbloom",
  nav: {
    overview: "მიმოხილვა",
    inbox: "შემოსული",
    page: "გვერდი",
    billing: "გადახდები",
    team: "გუნდი",
    sites: "ვებგვერდები",
    account: "ანგარიში",
  },
  signedInAs: "შესული ხართ როგორც",
  signOut: "გამოსვლა",
  viewSite: "საიტის ნახვა",
  backToBbloom: "bbloom.ge-ზე დაბრუნება",
  loading: "იტვირთება…",
  retry: "ხელახლა ცდა",
  cancel: "გაუქმება",
  close: "დახურვა",
  login: {
    title: "თქვენი ვებგვერდები",
    subtitle: "შედით, რომ დაარედაქტიროთ ვებგვერდები და წაიკითხოთ შეტყობინებები.",
    email: "ელფოსტა",
    password: "პაროლი",
    submit: "შესვლა",
    submitting: "მიმდინარეობს…",
    failed: "ვერ შეხვედით. გადაამოწმეთ ელფოსტა და პაროლი.",
    help: "დაგავიწყდათ პაროლი? მოგვწერეთ hello@bbloom.ge-ზე და აღვადგენთ.",
    noAccount: "პირველად ხართ bbloom-ზე?",
    createAccount: "ანგარიშის შექმნა",
  },
  register: {
    title: "შექმენით ანგარიში",
    subtitle:
      "დარეგისტრირდით, ააწყვეთ ვებგვერდი და გამოაქვეყნეთ მაშინ, როცა მოისურვებთ.",
    fullName: "თქვენი სახელი",
    email: "ელფოსტა",
    password: "პაროლი",
    passwordHint: "მინიმუმ 8 სიმბოლო.",
    submit: "ანგარიშის შექმნა",
    submitting: "იქმნება…",
    failed: "ანგარიშის შექმნა ვერ მოხერხდა.",
    haveAccount: "უკვე გაქვთ ანგარიში?",
    signIn: "შესვლა",
    terms:
      "რედაქტირება მაშინვე შეგიძლიათ. bbloom.ge-ის მისამართზე გამოქვეყნება უფასოა — გადახდა მხოლოდ ჩვენი ნიშნის მოსახსნელად ან საკუთარი დომენისთვის დაგჭირდებათ.",
  },
  sites: {
    title: "თქვენი ვებგვერდები",
    subtitle: "ყველაფერი, რასაც ფლობთ ან რედაქტირებაში ეხმარებით.",
    emptyTitle: "მოდი, პირველი ვებგვერდი შევქმნათ",
    emptyBody:
      "აირჩიეთ დიზაინი, მიუთითეთ ბიზნესის სახელი და დაიწყეთ რედაქტირება. გამოქვეყნება უფასოა — მხოლოდ ელფოსტა დაადასტურეთ.",
    create: "ვებგვერდის შექმნა",
    open: "გახსნა",
    manage: "მართვა",
    addAnother: "კიდევ ერთი ვებგვერდი",
    allSites: "ყველა ვებგვერდი",
    switcher: "ვებგვერდის შეცვლა",
    draftChanges: "გამოუქვეყნებელი ცვლილებები",
    trialEnds: (date) => `საცდელი პერიოდი მთავრდება ${date}`,
    renewsOn: (date) => `განახლდება ${date}`,
    graceUntil: (date) => `გადახდა ვადაგადაცილებულია — გაითიშება ${date}-ის შემდეგ`,
    endsOn: (date) => `მთავრდება ${date}`,
  },
  newSite: {
    title: "ახალი ვებგვერდი",
    subtitle: "აირჩიეთ დიზაინი, საიდანაც დაიწყებთ. მასზე ყველაფრის შეცვლა შეგიძლიათ.",
    firstTitle: "შექმენით პირველი ვებგვერდი",
    firstSubtitle:
      "აირჩიეთ დიზაინი, დაარქვით ბიზნესის სახელი და მაშინვე დაიწყეთ რედაქტირება.",
    businessName: "ბიზნესის სახელი",
    businessNamePlaceholder: "მაგალითად, კაფე მიმოზა",
    language: "მთავარი ენა",
    template: "დიზაინი",
    templateHint: "ყველა დიზაინი სრულად რედაქტირებადია — ტექსტი, ფოტოები და ფერები.",
    sampleContent: "შეავსეთ სანიმუშო შიგთავსით",
    sampleContentHint:
      "ცარიელი ველების ნაცვლად მზა გვერდს მიიღებთ, რომელსაც დაარედაქტირებთ. გირჩევთ.",
    submit: "ვებგვერდის შექმნა",
    submitting: "იქმნება…",
    failed: "ვებგვერდის შექმნა ვერ მოხერხდა. სცადეთ თავიდან.",
    noTemplate: "გასაგრძელებლად აირჩიეთ დიზაინი.",
    preview: "გადახედვა",
    demo: "ცოცხალი დემო",
    afterHint:
      "ვებგვერდი თავიდან დახურულია. გამოქვეყნება უფასოა — როცა მოისურვებთ, მაშინ.",
  },
  verify: {
    bannerTitle: "დაადასტურეთ ელფოსტა",
    bannerBody:
      "გამოგიგზავნეთ ექვსნიშნა კოდი. მის შეყვანამდე ყველაფრის რედაქტირება შეგიძლიათ — უბრალოდ ვებგვერდს ვერ გამოაქვეყნებთ.",
    resend: "წერილის ხელახლა გაგზავნა",
    resendCode: "ახალი კოდის გამოგზავნა",
    resending: "იგზავნება…",
    resent: "გაიგზავნა. შეამოწმეთ ელფოსტა, სპამის საქაღალდის ჩათვლით.",
    resentAgain:
      "ხელახლა გაიგზავნა. თუ არცერთი წერილი არ მოვიდა, პრობლემა ჩვენს მხარესაა და არა თქვენს მისამართში. მოგვწერეთ hello@bbloom.ge-ზე და ხელით დაგადასტურებთ.",
    resendFailed: "ვერ გავაგზავნეთ. სცადეთ ცოტა ხანში.",
    resendWait: (seconds) => `ხელახლა გაგზავნა ${seconds} წმ-ში`,
    resendTooSoon: "ახლახან გავგზავნეთ. მოიცადეთ ცოტა.",
    codeLabel: "შეიყვანეთ ექვსნიშნა კოდი",
    codeDigit: (position) => `ციფრი ${position}`,
    codeSubmit: "დადასტურება",
    codeChecking: "მოწმდება…",
    codeWrong: "კოდი არასწორია. გადაამოწმეთ და სცადეთ ხელახლა.",
    codeAttemptsLeft: (remaining) =>
      remaining === 1
        ? "კოდი არასწორია. დარჩა ერთი ცდა, შემდეგ ახალი კოდი დაგჭირდებათ."
        : `კოდი არასწორია. დარჩა ${remaining} ცდა.`,
    codeExpired: "კოდს ვადა გაუვიდა. გამოიგზავნეთ ახალი.",
    codeTooManyAttempts:
      "ცდების რაოდენობა ამოიწურა. გამოიგზავნეთ ახალი კოდი და სცადეთ ხელახლა.",
    codeFailed: "კოდი ვერ შევამოწმეთ. სცადეთ ცოტა ხანში.",
    codeSentTo: "კოდი გამოგზავნილია მისამართზე",
    notArrived:
      "არ მოვიდა? შეამოწმეთ სპამის საქაღალდე. თუ ეს მისამართი არასწორია, მოგვწერეთ hello@bbloom.ge-ზე და გავასწორებთ.",
    unavailableTitle: "ელფოსტის დადასტურება დროებით მიუწვდომელია",
    unavailableBody:
      "ამჟამად დამადასტურებელი წერილის გაგზავნა ვერ ხერხდება, ამიტომ კოდი არ მოვა. განაგრძეთ ვებგვერდის აწყობა — დადასტურებას მოგვიანებით შეძლებთ და არაფერი დაიკარგება. თუ ვებგვერდის დღესვე გამოქვეყნება გჭირდებათ, მოგვწერეთ hello@bbloom.ge-ზე.",
    unavailableHaveCode: "უკვე გაქვთ კოდი? შეიყვანეთ აქ.",
    deliveryOff:
      "ელფოსტის გაგზავნა ჯერ არ არის ჩართული, ამიტომ წერილი არ გასულა. მოგვწერეთ და ჩვენ დაგიდასტურებთ მისამართს.",
    sendFailed:
      "ეს წერილი ვერ გაიგზავნა. თქვენი მისამართი გამართულია — სცადეთ ცოტა ხანში ან მოგვწერეთ hello@bbloom.ge-ზე და ჩვენ დაგიდასტურებთ.",
    sendFailedTitle: "დამადასტურებელი წერილი ვერ გაიგზავნა",
    sendFailedBody:
      "წერილი არ მოვიდა იმიტომ, რომ ჩვენგან ვერ გავიდა და არა იმიტომ, რომ მისამართი არასწორია. გაგზავნეთ ხელახლა ქვემოთ ან მოგვწერეთ hello@bbloom.ge-ზე და ჩვენ დაგიდასტურებთ მისამართს.",
    resendDailyLimit:
      "დღეს კოდების გაგზავნის ლიმიტი ამოიწურა. სცადეთ ხვალ ან მოგვწერეთ hello@bbloom.ge-ზე.",
    linkOnly:
      "დასადასტურებლად გახსენით ბმული, რომელიც ელფოსტაზე გამოგიგზავნეთ.",
    pageTitle: "დაადასტურეთ ელფოსტა",
    pageBody:
      "შეიყვანეთ ექვსნიშნა კოდი წერილიდან ან გახსენით მასში მითითებული ბმული.",
    pageNoEmail: "შედით ანგარიშში და ახალ წერილს გამოგიგზავნით.",
    pageChecking: "მიმდინარეობს ელფოსტის დადასტურება…",
    pageSuccessTitle: "ელფოსტა დადასტურებულია",
    pageSuccessBody: "ეს იყო უკანასკნელი ნაბიჯი ვებგვერდის გამოქვეყნებამდე.",
    pageFailedTitle: "ბმულმა არ იმუშავა",
    pageFailedBody:
      "შესაძლოა ვადა გაუვიდა ან უკვე გამოყენებულია. შედით და გამოიგზავნეთ ახალი.",
    missingToken: "ბმული არასრულია.",
    goToPanel: "ვებგვერდებზე გადასვლა",
    verified: "ელფოსტა დადასტურებულია",
  },
  billing: {
    title: "პაკეტი და გადახდები",
    subtitle:
      "ვებგვერდი უფასოდ არის ონლაინ. პაკეტი ხსნის ჩვენს ნიშანს და საკუთარ დომენს გააქტიურებს.",
    status: "სტატუსი",
    plan: "პაკეტი",
    noPlan: "უფასო პაკეტი",
    provider: "გადახდის მეთოდი",
    trialEnds: "საცდელი პერიოდი მთავრდება",
    renews: "განახლდება",
    graceEnds: "დამატებები სრულდება",
    cancelAtPeriodEnd: "შეწყდება მიმდინარე პერიოდის ბოლოს",
    cancelAtPeriodEndOn: (date) =>
      `პაკეტი მოქმედებს ${date}-მდე. ვებგვერდი ამის შემდეგაც ონლაინ რჩება.`,
    choosePlan: "პაკეტის არჩევა",
    changePlan: "პაკეტის შეცვლა",
    payments: "გადახდები",
    noPayments: "გადახდები ჯერ არ არის.",
    cancelPlan: "განახლების შეწყვეტა",
    cancelling: "წყდება…",
    cancelConfirm:
      "პაკეტი მოქმედებს გადახდილი პერიოდის ბოლომდე. ვებგვერდი ნებისმიერ შემთხვევაში ონლაინ რჩება — უბრალოდ ჩვენი ნიშანი დაბრუნდება და საკუთარი დომენი შეწყვეტს მუშაობას. გავაგრძელოთ?",
    cancelHint: "ნებისმიერ შემთხვევაში, დარედაქტირებული შიგთავსი გრჩებათ.",
    ownerOnly: "პაკეტის შეცვლა მხოლოდ ვებგვერდის მფლობელს შეუძლია.",
    periods: "რა ვადით",
    period: (count) => `${count} თვე`,
    checkoutTitle: "გადახდა",
    checkoutStarting: "მზადდება…",
    checkoutFailed: "გადახდის დაწყება ვერ მოხერხდა. სცადეთ თავიდან.",
    cancelFailed: "განახლების გაუქმება ვერ მოხერხდა. სცადეთ თავიდან.",
    bankTitle: "საბანკო გადარიცხვა",
    bankHint: "პაკეტი ამოქმედდება, როგორც კი თანხა ჩამოგვივა.",
    redirecting: "გადაგიყვანთ გადახდის გვერდზე…",
    done: "მზადაა",
    pendingTitle: "ველოდებით თქვენს გადახდას",
    pendingBody: (amount, plan) =>
      `ველოდებით ${amount}-ს პაკეტისთვის „${plan}“. ის ამოქმედდება, როგორც კი თანხა ჩამოგვივა.`,
    pendingNotPaid:
      "თანხა ჯერ არ მიგვიღია, ამიტომ ვებგვერდი ისევ უფასო პაკეტზეა.",
    pendingReplace:
      "სხვა პაკეტის არჩევა ამას ჩაანაცვლებს — ორივეს გადახდა არასდროს მოგიწევთ.",
    pendingSince: (date) => `მოთხოვნილია ${date}`,
    paidTitle: {
      FREE_PLAN: "თქვენ უფასო პაკეტზე ხართ",
      LAPSED: "თქვენი პაკეტი დასრულდა",
    },
    paidBody: {
      FREE_PLAN:
        "ვებგვერდი ონლაინ არის და ონლაინვე რჩება — უფასოდ, bbloom.ge-ის მისამართზე. პაკეტი სამ რამეს ამატებს.",
      LAPSED:
        "ვებგვერდი თავად ონლაინ რჩება bbloom.ge-ის მისამართზე — არაფერი გათიშულა. შეწყდა მხოლოდ ფასიანი ნაწილი.",
    },
    paidPerks: [
      "ჩვენი ნიშანი ქრება გვერდებიდან.",
      "მუშაობს თქვენი საკუთარი დომენი.",
      "შეტყობინებები ელფოსტაზე მოგდით. ყველა მათგანს აქაც ხედავთ, ნებისმიერ შემთხვევაში.",
    ],
  },
  plans: {
    monthly: "თვეში",
    yearly: "წელიწადში",
    perMonth: "/თვე",
    perYear: "/წელი",
    featured: "ყველაზე პოპულარული",
    choose: "არჩევა",
    current: "თქვენი პაკეტი",
    loadFailed: "პაკეტები ვერ ჩაიტვირთა.",
  },
  team: {
    title: "ვის შეუძლია რედაქტირება",
    subtitle: "ადამიანები, ვისაც ამ ვებგვერდზე წვდომა აქვს.",
    member: "ადამიანი",
    role: "როლი",
    added: "დამატებულია",
    lastLogin: "ბოლო შესვლა",
    never: "არასდროს",
    invite: "ადამიანის დამატება",
    inviteTitle: "დაამატეთ ადამიანი ამ ვებგვერდზე",
    inviteHint:
      "მას უკვე უნდა ჰქონდეს bbloom-ის ანგარიში. რედაქტორს ვებგვერდის შეცვლა შეუძლია; მფლობელს — გადახდებიც.",
    inviting: "ემატება…",
    remove: "წაშლა",
    removeConfirm: "წავშალოთ ამ ადამიანის წვდომა ვებგვერდზე?",
    makeOwner: "მფლობელად დანიშვნა",
    makeEditor: "რედაქტორად დანიშვნა",
    you: "თქვენ",
    ownerOnly: "წვდომების მართვა მხოლოდ ვებგვერდის მფლობელს შეუძლია.",
    unverified: "ელფოსტა დაუდასტურებელია",
  },
  account: {
    title: "თქვენი ანგარიში",
    subtitle: "თქვენი მონაცემები და პაროლი.",
    name: "სახელი",
    email: "ელფოსტა",
    passwordTitle: "პაროლის შეცვლა",
    currentPassword: "მიმდინარე პაროლი",
    newPassword: "ახალი პაროლი",
    submit: "პაროლის შეცვლა",
    submitting: "ინახება…",
    saved: "პაროლი შეიცვალა.",
    wrongCurrent: "მიმდინარე პაროლი არასწორია.",
    sessionExpired:
      "სესია დასრულდა. შედით თავიდან და პაროლი იქიდან შეცვალეთ.",
    failed: "პაროლის შეცვლა ვერ მოხერხდა. სცადეთ თავიდან.",
  },
  gate: {
    blocked: {
      EMAIL_UNVERIFIED:
        "ვებგვერდის გამოქვეყნებამდე დაადასტურეთ თქვენი ელფოსტა.",
    },
    title: "ჯერ არ არის ონლაინ",
    verifyEmail: "ელფოსტის დადასტურება",
    ready: "გამოქვეყნების შემდეგ ვებგვერდი ყველასთვის ხილვადი ხდება.",
  },
  siteStatuses: {
    DRAFT: "დახურული",
    PUBLISHED: "ონლაინ",
    SUSPENDED: "გათიშულია",
    ARCHIVED: "დაარქივებული",
  },
  subscriptionStatuses: {
    TRIALING: "საცდელი პერიოდი",
    ACTIVE: "აქტიური",
    GRACE: "გადახდა ვადაგადაცილებულია",
    EXPIRED: "ვადაგასული",
    CANCELLED: "შეწყვეტილი",
  },
  roles: {
    SITE_OWNER: "მფლობელი",
    SITE_EDITOR: "რედაქტორი",
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
    publishFailed: "სტატუსის შეცვლა ვერ მოხერხდა. სცადეთ თავიდან.",
  },
  contact: {
    title: "საკონტაქტო ინფორმაცია",
    subtitle:
      "ჩანს თქვენს ვებგვერდზე — ამით დაგირეკავენ, მოგწერენ და გიპოვიან.",
    phone: "ტელეფონი",
    email: "ელფოსტა",
    address: "მისამართი",
    mapUrl: "რუკის ბმული",
    mapHint: "ჩასვით Google Maps-ის ბმული თქვენს მდებარეობაზე.",
    social: "სოციალური ბმულები",
    save: "შენახვა",
    saved: "შენახულია",
    error: "ვერ შეინახა. სცადეთ თავიდან.",
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
    saveFailed: "შენახვა ვერ მოხერხდა. სცადეთ თავიდან.",
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
  preview: {
    failed: "გადახედვა ვერ ჩაიტვირთა. სცადეთ თავიდან.",
  },
  errors: problemStrings("ka"),
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
