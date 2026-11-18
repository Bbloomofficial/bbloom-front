import type { Locale } from "../i18n";
import type { ProblemStrings } from "../api/problem";
import { problemStrings } from "../api/problemStrings";
import type { PublishRefusal } from "./gate";
import type { PaidBlock } from "./gate";
import type { OrderingBlockedReason, SiteLanguage } from "./api/types";

/**
 * Chrome for the client dashboard. Site *content* is localised by the backend,
 * but the dashboard shell is ours, so it ships its own dictionaries — same
 * shape as the renderer's, keyed off the marketing site's locale.
 */
/**
 * One switch on the forms panel. Three of these ship today — message form,
 * table booking, newsletter — and they are spelled out separately rather than
 * generated from a noun, because each one is a different promise to a visitor
 * and translating "the {thing} form" produces Georgian nobody would write.
 */
export type FormToggleStrings = {
  title: string;
  subtitle: string;
  toggle: string;
  /** Chosen on, but the plan is not letting it run. */
  pausedTitle: string;
  pausedBody: string;
  inboxHint: string;
  needsPlan: string;
  lapsed: string;
};

export type DashboardStrings = {
  brand: string;
  nav: {
    overview: string;
    inbox: string;
    /** The shop's order list. Only offered when the website can actually sell. */
    orders: string;
    page: string;
    ads: string;
    /** The printable card. Short: it sits in a row of tabs. */
    qr: string;
    billing: string;
    team: string;
    sites: string;
    account: string;
    menu: string;
  };
  signedInAs: string;
  signOut: string;
  viewSite: string;
  opensInNewWindow: string;
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
    backToSignIn: string;
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
    confirmTitle: string;
    confirmBody: string;
    confirmExisting: string;
    confirmInstead: string;
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
    draftChanges: string;
    /**
     * Marks a website that would be refused if published, so the client learns
     * it here rather than from a rejection. Kept to a short label because it
     * sits in a row of badges; the full explanation is on the site's own page.
     */
    needsPlan: string;
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
    /** Heading above each group of designs, keyed by the backend's category. */
    categories: Record<string, string>;
    /** On each design card, opening that design's live demo in a new tab. */
    viewDemo: string;
    submit: string;
    submitting: string;
    failed: string;
    noTemplate: string;
    preview: string;
    demo: string;
  };
  /**
   * Designs a client cannot have on their plan, and changing the design of a
   * website they already have.
   *
   * One block shared by the new-website picker and the design switcher, because
   * a locked card must read identically in both — it is an advertisement for a
   * plan, and two wordings for it would become two offers.
   */
  design: {
    /** On a locked card. Short: it sits on top of the thumbnail. */
    lockedBadge: string;
    lockedBody: string;
    seePlans: string;
    /** The design tiers, as a client reads them. */
    tiers: Record<string, string>;
    title: string;
    subtitle: string;
    back: string;
    current: string;
    currentNote: string;
    choose: string;
    checking: string;
    checkFailed: string;
    retry: string;
    /** The confirmation, in the order it must be read. */
    confirmTitle: (from: string, to: string) => string;
    ordersHeadline: string;
    ordersBody: string;
    publishedWarning: string;
    draftWarning: string;
    irreversible: string;
    keeps: string;
    removes: string;
    drops: string;
    dropsField: (section: string, count: number) => string;
    /** Sections we have no name for. Counted rather than printed raw. */
    moreSections: (count: number) => string;
    nothingLost: string;
    featuresLost: string;
    /** Only the client-facing feature keys ever arrive here. */
    featureNames: Record<string, string>;
    featuresLostGeneric: string;
    acknowledge: string;
    confirm: string;
    switching: string;
    cancel: string;
    doneTitle: string;
    doneKept: string;
    doneRemoved: string;
    doneDropped: string;
    doneOrders: string;
    doneNext: string;
    failed: string;
    /** Section types, for naming what is carried over or lost. */
    sections: Record<string, string>;
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
    codeSuperseded: string;
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
    /** Promo codes, and the breakdown a quote produces. */
    promoLabel: string;
    promoPlaceholder: string;
    promoApply: string;
    promoChecking: string;
    promoClear: string;
    /** A code that worked, named so the client can see which one is on. */
    promoOn: (code: string) => string;
    /**
     * A valid code that lost to a better sale price. Not an error: it was not
     * refused and has not been spent.
     */
    promoBeaten: string;
    quoteTotal: string;
    quoteSaving: (amount: string) => string;
    /**
     * The new-customer offer, on a purchase of more than one period. Says which
     * part of the total it covered, because the saving above it is a fraction
     * of a percentage the client can see and would otherwise read as a mistake.
     */
    quoteFirstPurchase: (percent: number) => string;
    cancelFailed: string;
    /**
     * Card payment answered, and answered that it cannot take money yet.
     *
     * Deliberately not worded as a failure: the checkout succeeded, the plan is
     * still available, and the client has somewhere to go. It is also kept
     * apart from the bank-transfer block below, which is shown *underneath*
     * this when the API sent instructions — "you cannot pay online yet" and
     * "here is where to transfer" are both true at once and neither replaces
     * the other.
     */
    comingSoonTitle: string;
    comingSoonBody: string;
    /** How to reach us to buy anyway, since there is no button that will do it. */
    comingSoonContact: string;
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
    comingSoon: string;
    comingSoonCta: string;
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
    blocked: Record<PublishRefusal, string>;
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
    /** The template's tier, not the subscription — those are unrelated names. */
    design: string;
    /** Opens the design switcher. Short: it sits inline on the design row. */
    changeDesign: string;
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
  forms: {
    title: string;
    subtitle: string;
    on: string;
    off: string;
    seePlans: string;
    error: string;
    enquiryForm: FormToggleStrings;
    reservationForm: FormToggleStrings;
    newsletterForm: FormToggleStrings;
  };
  /**
   * The printable QR card.
   *
   * `locked` is keyed by `PaidBlock` rather than written once, because the two
   * states want opposite things from a client: one has never paid and is being
   * sold to, the other has paid and needs to restart something. A single
   * "upgrade" sentence shown to a lapsed client reads as us not knowing they
   * were ever a customer.
   */
  qr: {
    title: string;
    subtitle: string;
    previewAlt: (businessName: string) => string;
    preparing: string;
    downloadPdf: string;
    downloadPdfHint: string;
    downloadPng: string;
    downloadPngHint: string;
    printHint: string;
    /** The language of the words printed on the card, not of this panel. */
    cardLanguage: string;
    cardLanguageHint: string;
    languages: Record<SiteLanguage, string>;
    /** A custom domain the client has asked for but not yet confirmed. */
    pendingDomain: (hostname: string) => string;
    error: string;
    locked: Record<
      PaidBlock,
      { title: string; body: string; action: string }
    >;
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
  /**
   * Online orders.
   *
   * Two vocabularies, kept apart because the two columns they name are moved by
   * different people. `orderStatuses` is the bank's word; `fulfilments` is the
   * shop's. Sharing one dictionary would invite a screen that shows one badge
   * and hides the disagreement that matters most — paid but cancelled.
   */
  orderStatuses: Record<string, string>;
  fulfilments: Record<string, string>;
  orders: {
    title: string;
    subtitle: string;
    refresh: string;
    status: string;
    fulfilment: string;
    all: string;
    empty: string;
    emptyFiltered: string;
    results: (total: number) => string;
    prev: string;
    next: string;
    page: (page: number, total: number) => string;
    select: string;
    number: (order: number) => string;
    statsTitle: string;
    statTotal: string;
    statAwaiting: string;
    statPaid: string;
    statNew: string;
    statLast7: string;
    statLast30: string;
    statTakings: string;
    /** What the takings figure does and does not mean. */
    takingsHint: string;
    blockedTitle: string;
    /**
     * One sentence per reason, each ending somewhere different. The bank one
     * has to say "talk to us": connecting an account is staff work, and a
     * client sent looking for that screen will not find it. The category one
     * has to end nowhere at all — it is not a fault and there is nothing to
     * buy, so it says what the website is for instead of what it lacks.
     */
    blocked: Record<OrderingBlockedReason, string>;
    /** A reason this build has no sentence for. Better than a blank panel. */
    blockedUnknown: string;
    seePlans: string;
    detail: {
      placed: string;
      paid: string;
      notPaid: string;
      customer: string;
      noCustomer: string;
      customerNote: string;
      items: string;
      quantity: string;
      total: string;
      provider: string;
      language: string;
      internalNote: string;
      notePlaceholder: string;
      save: string;
      saving: string;
      saved: string;
      saveFailed: string;
      /** The 409 for moving an unpaid order into preparation. */
      notPaidYet: string;
      /**
       * The refund control. Every word of this exists because the button does
       * not do what its name suggests: it writes down a refund somebody has
       * already made at the client's bank, and pressing it sends the customer
       * nothing.
       */
      refund: string;
      refundHint: string;
      refundConfirm: string;
      refundNotePlaceholder: string;
      refunding: string;
      refundFailed: string;
      /** Only a paid order can be recorded as refunded. */
      refundNotPaid: string;
      close: string;
      reply: string;
      call: string;
    };
  };
  /**
   * The client's read-only view of advertising we run for them. There is no
   * create, pause or delete here on purpose: campaigns come out of one shared
   * agency ad account and staff launch them, so this screen reports and never
   * acts. When the client has not bought advertising it becomes an offer.
   */
  ads: {
    title: string;
    subtitle: string;
    empty: string;
    emptyBody: string;
    upsellTitle: string;
    upsellBody: string;
    upsellCta: string;
    allowanceTitle: string;
    allowanceImpressions: (used: string, limit: string) => string;
    allowanceImpressionsUnmetered: (used: string) => string;
    allowanceChannels: (channels: string) => string;
    allowanceSpent: string;
    allowanceStale: string;
    managed: string;
    colName: string;
    colStatus: string;
    colChannels: string;
    colBudget: string;
    colSpend: string;
    colWhen: string;
    notYet: string;
    asOf: (when: string) => string;
    cached: string;
    channels: Record<string, string>;
    statuses: Record<string, string>;
    prev: string;
    next: string;
    page: (page: number, total: number) => string;
    loadFailed: string;
  };
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
    orders: "Orders",
    page: "Page",
    ads: "Advertising",
    qr: "QR code",
    billing: "Billing",
    team: "Team",
    sites: "Websites",
    account: "Account",
    menu: "Menu",
  },
  signedInAs: "Signed in as",
  signOut: "Sign out",
  viewSite: "View site",
  opensInNewWindow: "Opens in a new window",
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
    backToSignIn: "Back to sign in",
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
    confirmTitle: "Confirm your email",
    confirmBody:
      "Your account is ready. Enter the code we just emailed you to finish signing in.",
    confirmExisting:
      "This address has an account that has not been confirmed yet. Enter the code from the email, or send a new one.",
    confirmInstead: "Confirm this address instead",
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
    draftChanges: "Unpublished edits",
    needsPlan: "Needs a plan to go online",
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
    categories: {
      SHOP: "Shops",
      RESTAURANT: "Restaurants & cafés",
      TEACHER: "Teachers & tutors",
      LAWYER: "Professional services",
      CREATIVE: "Creatives & portfolios",
    },
    viewDemo: "See an example",
    submit: "Create website",
    submitting: "Creating…",
    failed: "We couldn't create the website. Please try again.",
    noTemplate: "Choose a design to continue.",
    preview: "Preview",
    demo: "Live demo",
  },
  design: {
    lockedBadge: "On a higher plan",
    lockedBody:
      "This design comes with a higher plan. Your website can move to it whenever you upgrade.",
    seePlans: "See plans",
    tiers: { SIMPLE: "Simple", CLASSIC: "Classic", MODERN: "Modern" },
    title: "Change your design",
    subtitle:
      "Your text, photos and products stay with you. The layout they sit in changes.",
    back: "Back to the website",
    current: "Your design now",
    currentNote: "This is the design your website already uses.",
    choose: "Use this design",
    checking: "Checking what would change…",
    checkFailed:
      "We couldn't work out what this change would do to your website, so we haven't changed anything. Please try again.",
    retry: "Try again",
    confirmTitle: (from, to) => `Change from ${from} to ${to}?`,
    ordersHeadline: "You will stop being able to take orders and payments",
    ordersBody:
      "Online ordering only works on the Modern design. If you continue, the order and payment buttons come off your website and customers will not be able to buy or pay through it. Orders you have already taken stay in your dashboard.",
    publishedWarning:
      "Your website is online. It changes for visitors the moment you confirm.",
    draftWarning:
      "Your website is not online yet, so only you will see the change.",
    irreversible:
      "This cannot be undone. Going back to your old design is another change like this one, and it will not bring back anything lost here.",
    keeps: "Kept, with your content",
    removes: "Removed, with everything in them",
    drops: "Kept, but these parts do not fit the new design",
    dropsField: (section, count) =>
      count === 1 ? `${section} — 1 part` : `${section} — ${count} parts`,
    moreSections: (count) =>
      count === 1 ? "and 1 more section" : `and ${count} more sections`,
    nothingLost: "Nothing is lost — every section moves across.",
    featuresLost: "These will be switched off",
    featureNames: {
      enquiryForm: "The message form",
      reservations: "Table reservations",
      newsletter: "Newsletter sign-ups",
    },
    featuresLostGeneric:
      "Some features you have switched on are not part of this design and will stop working.",
    acknowledge: "I understand what will be lost",
    confirm: "Change my design",
    switching: "Changing…",
    cancel: "Keep my design",
    doneTitle: "Your design has changed",
    doneKept: "Kept",
    doneRemoved: "Removed",
    doneDropped: "Parts that did not fit",
    doneOrders:
      "Online ordering is now off. Move back to the Modern design to take orders again.",
    doneNext: "Open the editor",
    failed: "The design could not be changed. Nothing was changed.",
    sections: {
      header: "Top bar",
      announcement: "Announcement",
      hero: "Main banner",
      features: "Highlights",
      categories: "Categories",
      products: "Products",
      menu: "Menu",
      about: "About",
      gallery: "Gallery",
      events: "Events",
      credentials: "Qualifications",
      rates: "Prices",
      testimonials: "Reviews",
      reservation: "Reservations",
      delivery: "Delivery",
      hours: "Opening hours",
      faq: "Questions",
      newsletter: "Newsletter",
      cta: "Call to action",
      contact: "Contact",
      footer: "Footer",
    },
  },
  verify: {
    bannerTitle: "Confirm your email address",
    bannerBody:
      "We sent you a six-digit code. Until you enter it you can edit everything — you just cannot put a website online.",
    resend: "Send the email again",
    resendCode: "Send a new code",
    resending: "Sending…",
    resent:
      "Sent. Check your inbox, including spam. Use the code in this newest email — the earlier one stopped working the moment we sent this one.",
    resentAgain:
      "Sent again. Use the code in the newest email; the earlier ones stopped working. If none of them have arrived, the problem is at our end and not with the address you typed. Write to hello@bbloom.ge and we will confirm you by hand.",
    resendFailed: "We could not send it. Try again shortly.",
    resendWait: (seconds) => `Send again in ${seconds}s`,
    resendTooSoon: "We just sent one. Give it a moment.",
    codeLabel: "Enter the six-digit code",
    codeDigit: (position) => `Digit ${position}`,
    codeSubmit: "Confirm",
    codeChecking: "Checking…",
    codeWrong: "That code is not right. Check it and try again.",
    codeSuperseded:
      "That code was replaced when a newer one was sent. Use the code from the most recent email.",
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
    promoLabel: "Discount code",
    promoPlaceholder: "Enter a code",
    promoApply: "Apply",
    promoChecking: "Checking…",
    promoClear: "Remove",
    promoOn: (code) => `Code ${code} applied.`,
    promoBeaten:
      "Your code is valid, but the sale price is better, so we've used that. Your code hasn't been used up.",
    quoteTotal: "Total",
    quoteSaving: (amount) => `You save ${amount}`,
    quoteFirstPurchase: (percent) =>
      `New customer offer: ${percent}% off your first period. The rest are at the usual price.`,
    cancelFailed: "We couldn't cancel the renewal. Please try again.",
    comingSoonTitle: "Card payment is being set up",
    comingSoonBody:
      "We can't take card payments online just yet — the bank side is still being arranged. Your plan is still available; get in touch and we'll set it up for you.",
    comingSoonContact: "Write to us",
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
      "Visitors can write to you from your website, and their messages arrive in your inbox here.",
    ],
  },
  plans: {
    monthly: "per month",
    yearly: "per year",
    perMonth: "/month",
    perYear: "/year",
    featured: "Most popular",
    choose: "Choose",
    comingSoon: "Coming soon",
    comingSoonCta: "Coming soon",
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
      ADDITIONAL_SITE_REQUIRES_PLAN:
        "Your free website is already online. Take that one offline to put this one up instead, or choose a plan to have both online at once. You can keep editing this one either way.",
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
    design: "Design",
    changeDesign: "Change",
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
  forms: {
    title: "Website forms",
    subtitle:
      "What visitors can send you from your website. Everything arrives in your inbox here — nothing is sent on by email.",
    on: "On",
    off: "Off",
    seePlans: "See plans",
    error: "Could not save. Please try again.",
    enquiryForm: {
      title: "Message form",
      subtitle:
        "Lets visitors write to you from your website, and ask about a single item from its page.",
      toggle: "Show a message form on my website",
      pausedTitle: "Your form is switched on, but not running",
      pausedBody:
        "Your plan does not currently include the message form, so visitors cannot write to you from the website. Your setting is kept — the form comes back as soon as the plan is active. Your contact details are still shown.",
      inboxHint: "Read messages in Messages.",
      needsPlan: "The message form needs a paid plan.",
      lapsed:
        "Your plan has stopped, so the message form cannot be switched on right now.",
    },
    reservationForm: {
      title: "Table booking",
      subtitle:
        "Lets visitors request a table — date, time and how many. A request, not a confirmation: you reply to agree it. Your phone number stays on the page either way.",
      toggle: "Take table requests from my website",
      pausedTitle: "Booking is switched on, but not running",
      pausedBody:
        "Your plan does not currently include table requests, so the booking section shows your phone number instead. Your setting is kept and comes back as soon as the plan is active.",
      inboxHint: "Requests arrive in Messages, filed as Reservation.",
      needsPlan: "Table booking needs a paid plan.",
      lapsed:
        "Your plan has stopped, so table booking cannot be switched on right now.",
    },
    newsletterForm: {
      title: "Newsletter sign-up",
      subtitle:
        "Lets visitors leave an email address to hear from you. The addresses are kept in your inbox here — we do not send anything on your behalf.",
      toggle: "Collect email addresses on my website",
      pausedTitle: "Sign-up is switched on, but not running",
      pausedBody:
        "Your plan does not currently include the sign-up form, so the section shows your phone number and social links instead. Your setting is kept and comes back as soon as the plan is active.",
      inboxHint: "Addresses arrive in Messages, filed as Newsletter.",
      needsPlan: "The sign-up form needs a paid plan.",
      lapsed:
        "Your plan has stopped, so the sign-up form cannot be switched on right now.",
    },
  },
  qr: {
    title: "Printable QR code",
    subtitle:
      "A card to print and put in your window or on the table. Customers point their phone at it and your website opens — no typing, no searching.",
    previewAlt: (businessName) => `QR card for ${businessName}`,
    preparing: "Preparing…",
    downloadPdf: "Download for printing (PDF)",
    downloadPdfHint:
      "This is the one to print or send to a print shop — it stays sharp at any size, from a table card to a shop window.",
    downloadPng: "Download as an image (PNG)",
    downloadPngHint: "A picture, for social media or to send in a message.",
    printHint:
      "Keep the white border around the code when you print — phones need it to read the code.",
    cardLanguage: "Language on the card",
    cardLanguageHint:
      "Only the words printed on the card. Your website and this panel stay as they are.",
    languages: { ka: "Georgian", en: "English" },
    pendingDomain: (hostname) =>
      `The card uses your bbloom.ge address for now, because ${hostname} is not confirmed yet. A printed card cannot be corrected later, so it is better to wait for the domain than to print an address that does not open.`,
    error: "We could not prepare your card. Please try again.",
    locked: {
      FREE_PLAN: {
        title: "The QR card comes with a paid plan",
        body: "Your website is online and stays online for free. The printable card is part of the paid plans — choose one and the card is ready to download straight away.",
        action: "See plans",
      },
      LAPSED: {
        title: "Your plan has stopped",
        body: "Your website is still online and still yours. Only the card is unavailable until the plan is active again — nothing needs to be set up a second time.",
        action: "Restart your plan",
      },
    },
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
  orderStatuses: {
    AWAITING_PAYMENT: "Awaiting payment",
    PAID: "Paid",
    FAILED: "Payment failed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },
  fulfilments: {
    NEW: "New",
    IN_PROGRESS: "Being prepared",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  },
  orders: {
    title: "Orders",
    subtitle: "What people have bought from your website.",
    refresh: "Refresh",
    status: "Payment",
    fulfilment: "Progress",
    all: "All",
    empty: "No orders yet.",
    emptyFiltered: "No orders match this filter.",
    results: (total) => `${total} order${total === 1 ? "" : "s"}`,
    prev: "Previous",
    next: "Next",
    page: (page, total) => `Page ${page} of ${total}`,
    select: "Choose an order to see what was bought.",
    number: (order) => `Order #${order}`,
    statsTitle: "This shop so far",
    statTotal: "Orders",
    statAwaiting: "Awaiting payment",
    statPaid: "Paid",
    statNew: "Not looked at yet",
    statLast7: "Last 7 days",
    statLast30: "Last 30 days",
    statTakings: "Paid in total",
    takingsHint:
      "The total of orders your bank has confirmed. It goes to your own account — bbloom never holds it.",
    blockedTitle: "This website is not selling yet",
    blocked: {
      TEMPLATE_TIER:
        "Online ordering needs a Modern design. Your website is on a simpler one, so there is nowhere for a customer to buy.",
      TEMPLATE_CATEGORY:
        "This website is not a shop, and it is not meant to be. Designs for teachers, professionals and creatives are built to win enquiries and bookings rather than to take payments — your contact form is where new clients reach you.",
      FEATURE_OFF:
        "Online ordering is part of a paid plan and is switched off for this website at the moment.",
      NO_PAYMENT_ACCOUNT:
        "Your bank account is not connected yet. We set that up for you — write to us and we will arrange it with your bank.",
    },
    blockedUnknown:
      "This website cannot take online orders at the moment. Write to us and we will look into it.",
    seePlans: "See plans",
    detail: {
      placed: "Placed",
      paid: "Paid",
      notPaid: "Not paid yet",
      customer: "Customer",
      noCustomer: "The customer left no contact details.",
      customerNote: "Note from the customer",
      items: "What was bought",
      quantity: "Qty",
      total: "Total",
      provider: "Bank",
      language: "Language",
      internalNote: "Your note",
      notePlaceholder: "Only you and your team can see this.",
      save: "Save",
      saving: "Saving…",
      saved: "Saved",
      saveFailed: "We couldn't save that. Please try again.",
      notPaidYet:
        "This order has not been paid for. You can cancel it, but it cannot be marked as being prepared until the bank confirms the payment.",
      refund: "Record a refund",
      refundHint:
        "This does not send any money back. Make the refund in your bank first, then record it here so the order stops counting as a sale.",
      refundConfirm:
        "Only record this if you have already refunded the customer at your bank. Continue?",
      refundNotePlaceholder: "Why it was refunded (optional)",
      refunding: "Recording…",
      refundFailed: "We couldn't record the refund. Please try again.",
      refundNotPaid: "Only a paid order can be recorded as refunded.",
      close: "Close",
      reply: "Reply by email",
      call: "Call",
    },
  },
  ads: {
    title: "Advertising",
    subtitle:
      "The Facebook and Instagram campaigns bbloom runs for you, and what they have done so far.",
    empty: "No campaigns yet",
    emptyBody:
      "Nothing has been launched for you yet. Tell us what you want to promote and we will build it.",
    upsellTitle: "Advertising isn't part of your plan yet",
    upsellBody:
      "We can run Facebook and Instagram campaigns for your business — written, built and watched by us, out of our own ad account. It comes with the website plans rather than being a separate bill: the entry plan includes Facebook, and the plans above it add Instagram and more people reached.",
    upsellCta: "Talk to us about advertising",
    allowanceTitle: "Your allowance",
    allowanceImpressions: (used, limit) =>
      `${used} of ${limit} impressions used`,
    allowanceImpressionsUnmetered: (used) =>
      `${used} impressions so far, with no limit on your plan`,
    allowanceChannels: (channels) => `Running on ${channels}`,
    allowanceSpent:
      "You've used the impressions your plan includes. Moving up a plan is the quickest way to keep going.",
    allowanceStale:
      "Counted from Facebook's own figures, which we refresh through the day, so this trails what has actually been shown.",
    managed:
      "We launch and adjust these for you, so there is nothing to change here. Email us and we'll do it.",
    colName: "Campaign",
    colStatus: "Status",
    colChannels: "Where",
    colBudget: "Daily budget",
    colSpend: "Spent",
    colWhen: "Started",
    notYet: "Not yet",
    asOf: (when) => `as of ${when}`,
    cached:
      "Facebook reports its figures a few hours behind and corrects them afterwards, so treat these as a guide.",
    channels: { FACEBOOK: "Facebook", INSTAGRAM: "Instagram" },
    statuses: {
      ACTIVE: "Running",
      PAUSED: "Paused",
      FAILED: "Stopped",
      DELETED: "Finished",
    },
    prev: "Previous",
    next: "Next",
    page: (page, total) => `Page ${page} of ${total}`,
    loadFailed: "We couldn't load your campaigns. Try again.",
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
    orders: "შეკვეთები",
    page: "გვერდი",
    ads: "რეკლამა",
    qr: "QR კოდი",
    billing: "გადახდები",
    team: "გუნდი",
    sites: "ვებგვერდები",
    account: "ანგარიში",
    menu: "მენიუ",
  },
  signedInAs: "შესული ხართ როგორც",
  signOut: "გამოსვლა",
  viewSite: "საიტის ნახვა",
  opensInNewWindow: "იხსნება ახალ ფანჯარაში",
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
    backToSignIn: "შესვლის გვერდზე დაბრუნება",
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
    confirmTitle: "დაადასტურეთ ელფოსტა",
    confirmBody:
      "ანგარიში მზადაა. შეიყვანეთ კოდი, რომელიც ახლახან გამოგიგზავნეთ, და შესვლას დაასრულებთ.",
    confirmExisting:
      "ამ მისამართზე ანგარიში უკვე არსებობს, მაგრამ დადასტურებული არ არის. შეიყვანეთ კოდი წერილიდან ან გამოითხოვეთ ახალი.",
    confirmInstead: "დაადასტურეთ ეს მისამართი",
  },
  sites: {
    title: "თქვენი ვებგვერდები",
    subtitle: "ყველაფერი, რასაც ფლობთ ან რედაქტირებაში ეხმარებით.",
    emptyTitle: "შექმენით, თქვენი პირველი ვებგვერდი",
    emptyBody:
      "აირჩიეთ დიზაინი, მიუთითეთ ბიზნესის სახელი და დაიწყეთ რედაქტირება. გამოქვეყნება უფასოა!",
    create: "ვებგვერდის შექმნა",
    open: "გახსნა",
    manage: "მართვა",
    addAnother: "კიდევ ერთი ვებგვერდი",
    draftChanges: "გამოუქვეყნებელი ცვლილებები",
    needsPlan: "გამოსაქვეყნებლად საჭიროა პაკეტი",
    trialEnds: (date) => `საცდელი პერიოდი მთავრდება ${date}`,
    renewsOn: (date) => `განახლდება ${date}`,
    graceUntil: (date) => `გადახდა ვადაგადაცილებულია — გაითიშება ${date}-ის შემდეგ`,
    endsOn: (date) => `მთავრდება ${date}`,
  },
  newSite: {
    title: "ახალი ვებგვერდი",
    subtitle: "აირჩიეთ დიზაინი, საიდანაც დაიწყებთ. მასზე ყველაფრის შეცვლა შეგიძლიათ.",
    firstTitle: "შექმენით თქვენი ვებგვერდი",
    firstSubtitle:
      "აირჩიეთ დიზაინი, ბიზნესის სახელი და დაიწყეთ რედაქტირება.",
    businessName: "ბიზნესის სახელი",
    businessNamePlaceholder: "მაგალითად: Bloom",
    language: "მთავარი ენა",
    template: "დიზაინი",
    templateHint: "ყველა დიზაინი სრულად რედაქტირებადია — ტექსტი, ფოტოები და ფერები.",
    categories: {
      SHOP: "მაღაზიები",
      RESTAURANT: "რესტორნები და კაფეები",
      TEACHER: "მასწავლებლები და რეპეტიტორები",
      LAWYER: "პროფესიული მომსახურება",
      CREATIVE: "შემოქმედებითი პორტფოლიო",
    },
    viewDemo: "მაგალითის ნახვა",
    submit: "ვებგვერდის შექმნა",
    submitting: "იქმნება…",
    failed: "ვებგვერდის შექმნა ვერ მოხერხდა. სცადეთ თავიდან.",
    noTemplate: "გასაგრძელებლად აირჩიეთ დიზაინი.",
    preview: "გადახედვა",
    demo: "ცოცხალი დემო",
  },
  design: {
    lockedBadge: "სხვა პაკეტში",
    lockedBody:
      "ეს დიზაინი უფრო მაღალ პაკეტშია. პაკეტის განახლებისთანავე შეძლებთ მასზე გადასვლას.",
    seePlans: "პაკეტების ნახვა",
    tiers: { SIMPLE: "მარტივი", CLASSIC: "კლასიკური", MODERN: "თანამედროვე" },
    title: "დიზაინის შეცვლა",
    subtitle:
      "თქვენი ტექსტი, ფოტოები და პროდუქტები რჩება. იცვლება მხოლოდ გარეგნობა, რომელშიც ისინი ჩანს.",
    back: "ვებგვერდზე დაბრუნება",
    current: "თქვენი ახლანდელი დიზაინი",
    currentNote: "ეს დიზაინი უკვე გიდგათ.",
    choose: "ამ დიზაინის არჩევა",
    checking: "ვამოწმებთ, რა შეიცვლება…",
    checkFailed:
      "ვერ დავადგინეთ, რას შეცვლიდა ეს თქვენს ვებგვერდზე, ამიტომ არაფერი შეგვიცვლია. სცადეთ თავიდან.",
    retry: "თავიდან ცდა",
    confirmTitle: (from, to) =>
      `შეიცვალოს დიზაინი „${from}“-დან „${to}“-ზე?`,
    ordersHeadline: "ვეღარ მიიღებთ შეკვეთებსა და გადახდებს",
    ordersBody:
      "ონლაინ შეკვეთა მხოლოდ თანამედროვე დიზაინზე მუშაობს. თუ გააგრძელებთ, შეკვეთისა და გადახდის ღილაკები ვებგვერდიდან ქრება და მომხმარებლები ვეღარ შეიძენენ და ვეღარ გადაიხდიან. უკვე მიღებული შეკვეთები პანელში რჩება.",
    publishedWarning:
      "თქვენი ვებგვერდი ონლაინაა. დადასტურებისთანავე ის ვიზიტორებისთვისაც შეიცვლება.",
    draftWarning:
      "თქვენი ვებგვერდი ჯერ არ არის ონლაინ, ამიტომ ცვლილებას მხოლოდ თქვენ ნახავთ.",
    irreversible:
      "ამის დაბრუნება ვეღარ მოხერხდება. ძველ დიზაინზე დაბრუნება იგივე ცვლილებაა და აქ დაკარგულს ვერ აღადგენს.",
    keeps: "რჩება, თქვენი შიგთავსით",
    removes: "იშლება, მთელი შიგთავსითურთ",
    drops: "რჩება, მაგრამ ეს ნაწილები ახალ დიზაინს არ ერგება",
    dropsField: (section, count) => `${section} — ${count} ნაწილი`,
    moreSections: (count) => `და კიდევ ${count} სექცია`,
    nothingLost: "არაფერი იკარგება — ყველა სექცია გადმოდის.",
    featuresLost: "ეს ფუნქციები გამოირთვება",
    featureNames: {
      enquiryForm: "შეტყობინების ფორმა",
      reservations: "მაგიდის დაჯავშნა",
      newsletter: "სიახლეებზე გამოწერა",
    },
    featuresLostGeneric:
      "ზოგიერთი ჩართული ფუნქცია ამ დიზაინში არ არის და მუშაობას შეწყვეტს.",
    acknowledge: "ვიცი, რა დაიკარგება",
    confirm: "დიზაინის შეცვლა",
    switching: "იცვლება…",
    cancel: "დავტოვოთ ძველი",
    doneTitle: "დიზაინი შეიცვალა",
    doneKept: "დარჩა",
    doneRemoved: "წაიშალა",
    doneDropped: "ნაწილები, რომლებიც ვერ ჩაჯდა",
    doneOrders:
      "ონლაინ შეკვეთა ახლა გამორთულია. შეკვეთების მისაღებად დაბრუნდით თანამედროვე დიზაინზე.",
    doneNext: "რედაქტორის გახსნა",
    failed: "დიზაინი ვერ შეიცვალა. არაფერი შეცვლილა.",
    sections: {
      header: "ზედა ზოლი",
      announcement: "განცხადება",
      hero: "მთავარი ბანერი",
      features: "მთავარი უპირატესობები",
      categories: "კატეგორიები",
      products: "პროდუქტები",
      menu: "მენიუ",
      about: "ჩვენ შესახებ",
      gallery: "გალერეა",
      events: "ღონისძიებები",
      credentials: "კვალიფიკაცია",
      rates: "ფასები",
      testimonials: "შეფასებები",
      reservation: "დაჯავშნა",
      delivery: "მიტანა",
      hours: "სამუშაო საათები",
      faq: "კითხვები",
      newsletter: "სიახლეები",
      cta: "მოწოდება",
      contact: "კონტაქტი",
      footer: "ქვედა ზოლი",
    },
  },
  verify: {
    bannerTitle: "დაადასტურეთ ელფოსტა",
    bannerBody:
      "გამოგიგზავნეთ ექვსნიშნა კოდი. მის შეყვანამდე ყველაფრის რედაქტირება შეგიძლიათ — უბრალოდ ვებგვერდს ვერ გამოაქვეყნებთ.",
    resend: "წერილის ხელახლა გაგზავნა",
    resendCode: "ახალი კოდის გამოგზავნა",
    resending: "იგზავნება…",
    resent:
      "გაიგზავნა. შეამოწმეთ ელფოსტა, სპამის საქაღალდის ჩათვლით. გამოიყენეთ ბოლო წერილის კოდი — წინა კოდი ახლის გაგზავნისთანავე გაუქმდა.",
    resentAgain:
      "ხელახლა გაიგზავნა. გამოიყენეთ ბოლო წერილის კოდი; წინები აღარ მუშაობს. თუ არცერთი წერილი არ მოვიდა, პრობლემა ჩვენს მხარესაა და არა თქვენს მისამართში. მოგვწერეთ hello@bbloom.ge-ზე და ხელით დაგადასტურებთ.",
    resendFailed: "ვერ გავაგზავნეთ. სცადეთ ცოტა ხანში.",
    resendWait: (seconds) => `ხელახლა გაგზავნა ${seconds} წმ-ში`,
    resendTooSoon: "ახლახან გავგზავნეთ. მოიცადეთ ცოტა.",
    codeLabel: "შეიყვანეთ ექვსნიშნა კოდი",
    codeDigit: (position) => `ციფრი ${position}`,
    codeSubmit: "დადასტურება",
    codeChecking: "მოწმდება…",
    codeWrong: "კოდი არასწორია. გადაამოწმეთ და სცადეთ ხელახლა.",
    codeSuperseded:
      "ეს კოდი გაუქმდა, როცა ახალი გამოიგზავნა. გამოიყენეთ ბოლო წერილის კოდი.",
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
    promoLabel: "ფასდაკლების კოდი",
    promoPlaceholder: "შეიყვანეთ კოდი",
    promoApply: "გამოყენება",
    promoChecking: "მოწმდება…",
    promoClear: "მოხსნა",
    promoOn: (code) => `კოდი ${code} გააქტიურდა.`,
    promoBeaten:
      "თქვენი კოდი მოქმედია, მაგრამ ფასდაკლებული ფასი უფრო ხელსაყრელია და ის გამოვიყენეთ. კოდი დაუხარჯავი დაგრჩათ.",
    quoteTotal: "სულ",
    quoteSaving: (amount) => `დაზოგავთ ${amount}`,
    quoteFirstPurchase: (percent) =>
      `შეთავაზება ახალი მომხმარებლისთვის: −${percent}% პირველ პერიოდზე. დანარჩენი ჩვეულებრივ ფასად.`,
    cancelFailed: "განახლების გაუქმება ვერ მოხერხდა. სცადეთ თავიდან.",
    comingSoonTitle: "ბარათით გადახდა მზადდება",
    comingSoonBody:
      "ონლაინ ბარათით გადახდა ჯერ არ გვაქვს — საბანკო მხარე ჯერ ეწყობა. პაკეტი მაინც ხელმისაწვდომია: დაგვიკავშირდით და ჩვენ გაგიფორმებთ.",
    comingSoonContact: "მოგვწერეთ",
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
      "ვიზიტორები ვებგვერდიდან მოგწერენ და შეტყობინებები აქვე, თქვენს ფოსტაში მოდის.",
    ],
  },
  plans: {
    monthly: "თვეში",
    yearly: "წელიწადში",
    perMonth: "/თვე",
    perYear: "/წელი",
    featured: "ყველაზე პოპულარული",
    choose: "არჩევა",
    comingSoon: "მალე",
    comingSoonCta: "მალე დაემატება",
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
      ADDITIONAL_SITE_REQUIRES_PLAN:
        "თქვენი უფასო ვებგვერდი უკვე ონლაინ არის. ამის გამოსაქვეყნებლად ან ის მოხსენით, ან აირჩიეთ პაკეტი და ორივე ერთად იქნება ონლაინ. რედაქტირება ორივე შემთხვევაში ხელმისაწვდომია.",
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
    design: "დიზაინი",
    changeDesign: "შეცვლა",
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
  forms: {
    title: "ვებგვერდის ფორმები",
    subtitle:
      "რისი გამოგზავნაც შეუძლიათ ვიზიტორებს თქვენი ვებგვერდიდან. ყველაფერი აქვე, თქვენს ფოსტაში მოვა — ელფოსტაზე არ იგზავნება.",
    on: "ჩართული",
    off: "გამორთული",
    seePlans: "პაკეტების ნახვა",
    error: "ვერ შეინახა. სცადეთ თავიდან.",
    enquiryForm: {
      title: "შეტყობინების ფორმა",
      subtitle:
        "ვიზიტორები პირდაპირ ვებგვერდიდან მოგწერენ და კონკრეტულ პოზიციაზეც დაგისვამენ კითხვას.",
      toggle: "ვებგვერდზე შეტყობინების ფორმა გამოჩნდეს",
      pausedTitle: "ფორმა ჩართულია, მაგრამ არ მუშაობს",
      pausedBody:
        "თქვენს პაკეტში შეტყობინების ფორმა ამჟამად არ შედის, ამიტომ ვიზიტორები ვებგვერდიდან ვერ მოგწერენ. თქვენი არჩევანი შენახულია — პაკეტის გააქტიურებისთანავე ფორმა დაბრუნდება. საკონტაქტო ინფორმაცია კვლავ ჩანს.",
      inboxHint: "შეტყობინებები იხილეთ განყოფილებაში „შეტყობინებები“.",
      needsPlan: "შეტყობინების ფორმა ფასიან პაკეტს საჭიროებს.",
      lapsed:
        "თქვენი პაკეტი შეწყვეტილია, ამიტომ შეტყობინების ფორმის ჩართვა ამჟამად ვერ ხერხდება.",
    },
    reservationForm: {
      title: "მაგიდის დაჯავშნა",
      subtitle:
        "ვიზიტორები მიუთითებენ თარიღს, დროსა და სტუმრების რაოდენობას. ეს მოთხოვნაა და არა დადასტურება — დაჯავშნას თქვენ ადასტურებთ პასუხით. ტელეფონის ნომერი ყოველთვის ჩანს.",
      toggle: "ვებგვერდიდან მაგიდის მოთხოვნები მივიღო",
      pausedTitle: "დაჯავშნა ჩართულია, მაგრამ არ მუშაობს",
      pausedBody:
        "თქვენს პაკეტში მაგიდის მოთხოვნები ამჟამად არ შედის, ამიტომ ამ ბლოკში ტელეფონის ნომერი ჩანს. თქვენი არჩევანი შენახულია და პაკეტის გააქტიურებისთანავე დაბრუნდება.",
      inboxHint: "მოთხოვნები მოვა „შეტყობინებებში“, ტიპით „ჯავშანი“.",
      needsPlan: "მაგიდის დაჯავშნა ფასიან პაკეტს საჭიროებს.",
      lapsed:
        "თქვენი პაკეტი შეწყვეტილია, ამიტომ დაჯავშნის ჩართვა ამჟამად ვერ ხერხდება.",
    },
    newsletterForm: {
      title: "სიახლეების გამოწერა",
      subtitle:
        "ვიზიტორები დატოვებენ ელფოსტას, რომ სიახლეები მიიღონ. მისამართები აქვე, თქვენს ფოსტაში ინახება — თქვენი სახელით არაფერს ვაგზავნით.",
      toggle: "ვებგვერდზე ელფოსტების შეგროვება",
      pausedTitle: "გამოწერა ჩართულია, მაგრამ არ მუშაობს",
      pausedBody:
        "თქვენს პაკეტში გამოწერის ფორმა ამჟამად არ შედის, ამიტომ ამ ბლოკში ტელეფონი და სოციალური ბმულები ჩანს. თქვენი არჩევანი შენახულია და პაკეტის გააქტიურებისთანავე დაბრუნდება.",
      inboxHint: "მისამართები მოვა „შეტყობინებებში“, ტიპით „გამოწერა“.",
      needsPlan: "გამოწერის ფორმა ფასიან პაკეტს საჭიროებს.",
      lapsed:
        "თქვენი პაკეტი შეწყვეტილია, ამიტომ გამოწერის ფორმის ჩართვა ამჟამად ვერ ხერხდება.",
    },
  },
  qr: {
    title: "საბეჭდი QR კოდი",
    subtitle:
      // „ბარათი" და არა „ქარდი": ეს ხელში ასაღები, დასაბეჭდი ნივთია.
      "ბარათი, რომელსაც დაბეჭდავთ და ვიტრინაზე ან მაგიდაზე დადგამთ. მომხმარებელი ტელეფონს მიაშვერს და თქვენი ვებგვერდი გაეხსნება — არაფრის აკრეფა და ძებნა არ სჭირდება.",
    previewAlt: (businessName) => `${businessName} — QR ბარათი`,
    preparing: "მზადდება…",
    downloadPdf: "ჩამოტვირთვა დასაბეჭდად (PDF)",
    downloadPdfHint:
      "სწორედ ეს დასაბეჭდია — სტამბაშიც PDF გაგზავნეთ. ნებისმიერ ზომაზე მკვეთრი რჩება, პატარა საბარათე ზომიდან ვიტრინის პლაკატამდე.",
    downloadPng: "სურათად ჩამოტვირთვა (PNG)",
    downloadPngHint:
      "ჩვეულებრივი სურათი — სოციალურ ქსელში ან მიმოწერაში გასაზიარებლად.",
    printHint:
      "დაბეჭდვისას კოდის გარშემო თეთრი არე დატოვეთ — ტელეფონს ის სჭირდება, რომ კოდი წაიკითხოს.",
    cardLanguage: "ბარათის ენა",
    cardLanguageHint:
      "ეხება მხოლოდ ბარათზე დაბეჭდილ წარწერას. თქვენი ვებგვერდი და ეს პანელი უცვლელი რჩება.",
    languages: { ka: "ქართული", en: "ინგლისური" },
    pendingDomain: (hostname) =>
      // Word-for-word „is not verified yet" ქართულად ხმელად ჟღერს; აქ იმას
      // ვამბობთ, რაც კლიენტს აინტერესებს — რომელი მისამართი დაიბეჭდება და რატომ.
      `ბარათზე ჯერ თქვენი bbloom.ge-ის მისამართია, რადგან ${hostname} ჯერ დადასტურებული არ არის. დაბეჭდილი ბარათი ვეღარ გასწორდება, ამიტომ ჯობია დომენს დაელოდოთ, ვიდრე ისეთი მისამართი დაბეჭდოთ, რომელიც არ იხსნება.`,
    error: "ბარათი ვერ მომზადდა. სცადეთ თავიდან.",
    locked: {
      FREE_PLAN: {
        title: "QR ბარათი ფასიან პაკეტში შედის",
        body: "თქვენი ვებგვერდი ონლაინაა და უფასოდვე რჩება. საბეჭდი ბარათი ფასიან პაკეტებშია — აირჩევთ პაკეტს და ბარათს მაშინვე ჩამოტვირთავთ.",
        action: "პაკეტების ნახვა",
      },
      LAPSED: {
        title: "თქვენი პაკეტი შეწყვეტილია",
        body: "ვებგვერდი კვლავ ონლაინაა და კვლავ თქვენია. მხოლოდ ბარათი არ არის ხელმისაწვდომი, სანამ პაკეტი ისევ არ გააქტიურდება — თავიდან არაფრის მორგება არ დაგჭირდებათ.",
        action: "პაკეტის აღდგენა",
      },
    },
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
  orderStatuses: {
    AWAITING_PAYMENT: "ელოდება გადახდას",
    PAID: "გადახდილი",
    FAILED: "გადახდა ვერ შედგა",
    EXPIRED: "ვადა გავიდა",
    CANCELLED: "გაუქმებული",
    REFUNDED: "თანხა დაბრუნდა",
  },
  fulfilments: {
    NEW: "ახალი",
    IN_PROGRESS: "მზადდება",
    COMPLETED: "დასრულებული",
    CANCELLED: "გაუქმებული",
  },
  orders: {
    title: "შეკვეთები",
    subtitle: "რა იყიდეს თქვენი ვებგვერდიდან.",
    refresh: "განახლება",
    status: "გადახდა",
    fulfilment: "მიმდინარეობა",
    all: "ყველა",
    empty: "შეკვეთები ჯერ არ არის.",
    emptyFiltered: "ამ ფილტრს შეკვეთა არ შეესაბამება.",
    results: (total) => `${total} შეკვეთა`,
    prev: "წინა",
    next: "შემდეგი",
    page: (page, total) => `გვერდი ${page} / ${total}`,
    select: "აირჩიეთ შეკვეთა, რომ ნახოთ რა იყიდეს.",
    number: (order) => `შეკვეთა #${order}`,
    statsTitle: "მაღაზია ციფრებში",
    statTotal: "შეკვეთები",
    statAwaiting: "ელოდება გადახდას",
    statPaid: "გადახდილი",
    statNew: "ჯერ არ გინახავთ",
    statLast7: "ბოლო 7 დღე",
    statLast30: "ბოლო 30 დღე",
    statTakings: "სულ გადახდილი",
    takingsHint:
      "ბანკის მიერ დადასტურებული შეკვეთების ჯამი. თანხა თქვენს საკუთარ ანგარიშზე ჩადის — bbloom მას არ ინახავს.",
    blockedTitle: "ეს ვებგვერდი ჯერ არ ყიდის",
    blocked: {
      TEMPLATE_TIER:
        "ონლაინ შეკვეთებს „თანამედროვე“ დიზაინი სჭირდება. თქვენი ვებგვერდი უფრო მარტივზეა, ამიტომ მყიდველს ყიდვის ადგილი არ აქვს.",
      TEMPLATE_CATEGORY:
        "ეს ვებგვერდი მაღაზია არ არის და არც უნდა იყოს. მასწავლებლების, პროფესიონალებისა და შემოქმედებითი საქმიანობის დიზაინები იმისთვისაა, რომ მოგიყვანოთ მომართვები და ჩაწერები და არა იმისთვის, რომ თანხა მიიღოთ — ახალი კლიენტები თქვენს საკონტაქტო ფორმას მოგწერენ.",
      FEATURE_OFF:
        "ონლაინ შეკვეთები ფასიანი პაკეტის ნაწილია და ამ ვებგვერდზე ამჟამად გამორთულია.",
      NO_PAYMENT_ACCOUNT:
        "თქვენი საბანკო ანგარიში ჯერ მიერთებული არ არის. ამას ჩვენ ვაწყობთ — მოგვწერეთ და ბანკთან ერთად მოვაგვარებთ.",
    },
    blockedUnknown:
      "ამჟამად ვებგვერდი ონლაინ შეკვეთებს ვერ იღებს. მოგვწერეთ და გავარკვევთ.",
    seePlans: "პაკეტების ნახვა",
    detail: {
      placed: "შემოვიდა",
      paid: "გადახდილია",
      notPaid: "ჯერ არ არის გადახდილი",
      customer: "მყიდველი",
      noCustomer: "მყიდველმა საკონტაქტო არ დატოვა.",
      customerNote: "მყიდველის შენიშვნა",
      items: "რა იყიდეს",
      quantity: "რაოდ.",
      total: "სულ",
      provider: "ბანკი",
      language: "ენა",
      internalNote: "თქვენი ჩანაწერი",
      notePlaceholder: "ამას მხოლოდ თქვენ და თქვენი გუნდი ხედავთ.",
      save: "შენახვა",
      saving: "ინახება…",
      saved: "შენახულია",
      saveFailed: "შენახვა ვერ მოხერხდა. სცადეთ თავიდან.",
      notPaidYet:
        "ეს შეკვეთა გადახდილი არ არის. გაუქმება შეგიძლიათ, მაგრამ „მზადდება“-ზე გადაყვანა მხოლოდ მას შემდეგ იქნება შესაძლებელი, რაც ბანკი გადახდას დაადასტურებს.",
      refund: "თანხის დაბრუნების აღრიცხვა",
      refundHint:
        "ეს თანხას უკან არ აბრუნებს. ჯერ დააბრუნეთ თანხა თქვენს ბანკში, შემდეგ აქ აღრიცხეთ, რომ შეკვეთა გაყიდვად აღარ ითვლებოდეს.",
      refundConfirm:
        "აღრიცხეთ მხოლოდ მაშინ, თუ თანხა მყიდველს უკვე დაუბრუნეთ ბანკში. გავაგრძელოთ?",
      refundNotePlaceholder: "რატომ დაბრუნდა თანხა (არასავალდებულო)",
      refunding: "ინახება…",
      refundFailed: "დაბრუნების აღრიცხვა ვერ მოხერხდა. სცადეთ თავიდან.",
      refundNotPaid: "დაბრუნება მხოლოდ გადახდილ შეკვეთაზე აღირიცხება.",
      close: "დახურვა",
      reply: "პასუხი ელფოსტით",
      call: "დარეკვა",
    },
  },
  ads: {
    title: "რეკლამა",
    subtitle:
      "Facebook-ისა და Instagram-ის კამპანიები, რომლებსაც bbloom თქვენთვის უშვებს, და მათი შედეგები.",
    empty: "კამპანია ჯერ არ არის",
    emptyBody:
      "თქვენთვის ჯერ არაფერი გაშვებულა. გვითხარით, რის რეკლამა გსურთ, და ჩვენ ავაწყობთ.",
    upsellTitle: "რეკლამა ჯერ თქვენს პაკეტში არ შედის",
    upsellBody:
      "შეგვიძლია თქვენი ბიზნესისთვის Facebook-ისა და Instagram-ის კამპანიები ვაწარმოოთ — ტექსტს ჩვენ ვწერთ, ჩვენვე ვაწყობთ და ვადევნებთ თვალს, ჩვენივე სარეკლამო ანგარიშიდან. ეს საიტის პაკეტში შედის და ცალკე ანგარიში არ არის: საწყისი პაკეტი მოიცავს Facebook-ს, მის ზემოთ მყოფი პაკეტები კი Instagram-საც ამატებს და მეტ ადამიანამდე აღწევს.",
    upsellCta: "დაგვიკავშირდით რეკლამის შესახებ",
    allowanceTitle: "თქვენი ლიმიტი",
    allowanceImpressions: (used, limit) =>
      `${limit}-დან ${used} ჩვენება გამოყენებულია`,
    allowanceImpressionsUnmetered: (used) =>
      `${used} ჩვენება, თქვენს პაკეტზე ლიმიტის გარეშე`,
    allowanceChannels: (channels) => `მუშაობს: ${channels}`,
    allowanceSpent:
      "პაკეტში შემავალი ჩვენებები ამოწურეთ. გასაგრძელებლად ყველაზე სწრაფი გზა პაკეტის აწევაა.",
    allowanceStale:
      "დათვლილია Facebook-ის მონაცემებით, რომელსაც დღის განმავლობაში ვაახლებთ, ამიტომ რეალურ ჩვენებებს ჩამორჩება.",
    managed:
      "ამათ ჩვენ ვუშვებთ და ვასწორებთ, ამიტომ აქ შესაცვლელი არაფერია. მოგვწერეთ და გავაკეთებთ.",
    colName: "კამპანია",
    colStatus: "სტატუსი",
    colChannels: "სად",
    colBudget: "დღიური ბიუჯეტი",
    colSpend: "დახარჯული",
    colWhen: "დაიწყო",
    notYet: "ჯერ არა",
    asOf: (when) => `მდგომარეობით ${when}`,
    cached:
      "Facebook ციფრებს რამდენიმე საათის დაგვიანებით აჩვენებს და შემდეგ აზუსტებს, ამიტომ ეს ორიენტირად მიიჩნიეთ.",
    channels: { FACEBOOK: "Facebook", INSTAGRAM: "Instagram" },
    statuses: {
      ACTIVE: "მიმდინარე",
      PAUSED: "შეჩერებული",
      FAILED: "შეწყვეტილი",
      DELETED: "დასრულებული",
    },
    prev: "წინა",
    next: "შემდეგი",
    page: (page, total) => `გვერდი ${page} / ${total}`,
    loadFailed: "კამპანიები ვერ ჩაიტვირთა. სცადეთ თავიდან.",
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
