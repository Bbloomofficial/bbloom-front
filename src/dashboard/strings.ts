import type { Locale } from "../i18n";
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
    noTemplate: string;
    preview: string;
    demo: string;
    afterHint: string;
  };
  verify: {
    bannerTitle: string;
    bannerBody: string;
    resend: string;
    resending: string;
    resent: string;
    resendFailed: string;
    resendWait: (seconds: number) => string;
    resendTooSoon: string;
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
    bankTitle: string;
    bankHint: string;
    redirecting: string;
    done: string;
    pendingTitle: string;
    pendingBody: (amount: string, plan: string) => string;
    pendingNotPaid: string;
    pendingReplace: string;
    pendingSince: (date: string) => string;
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
  };
  gate: {
    blocked: Record<PublishBlock, string>;
    title: string;
    choosePlan: string;
    askOwner: string;
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
    reply: string;
    call: string;
    close: string;
  };
  types: Record<string, string>;
  statuses: Record<string, string>;
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
      "You can edit everything straight away. You only pay when you want your website online.",
  },
  sites: {
    title: "Your websites",
    subtitle: "Everything you own or help edit.",
    emptyTitle: "Let's build your first website",
    emptyBody:
      "Pick a design, name your business, and start editing. Nothing goes public until you choose a plan.",
    create: "Create a website",
    open: "Open",
    manage: "Manage",
    addAnother: "Add another website",
    switcher: "Switch website",
    draftChanges: "Unpublished edits",
    trialEnds: (date) => `Trial ends ${date}`,
    renewsOn: (date) => `Renews ${date}`,
    graceUntil: (date) => `Payment overdue — offline after ${date}`,
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
    noTemplate: "Choose a design to continue.",
    preview: "Preview",
    demo: "Live demo",
    afterHint:
      "Your website starts private. Choose a plan when you want it online.",
  },
  verify: {
    bannerTitle: "Confirm your email address",
    bannerBody:
      "It only takes a moment. Until you do, you can edit everything — you just cannot put a website online.",
    resend: "Send the link again",
    resending: "Sending…",
    resent: "Sent. Check your inbox.",
    resendFailed: "We could not send it. Try again shortly.",
    resendWait: (seconds) => `Send again in ${seconds}s`,
    resendTooSoon: "We just sent one. Give it a moment.",
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
    subtitle: "Your website goes online once a plan is paid for.",
    status: "Status",
    plan: "Plan",
    noPlan: "No plan yet",
    provider: "Payment method",
    trialEnds: "Trial ends",
    renews: "Renews",
    graceEnds: "Offline after",
    cancelAtPeriodEnd: "Stops at the end of this period",
    cancelAtPeriodEndOn: (date) => `Your website stays online until ${date}.`,
    choosePlan: "Choose a plan",
    changePlan: "Change plan",
    payments: "Payments",
    noPayments: "No payments yet.",
    cancelPlan: "Stop renewing",
    cancelling: "Stopping…",
    cancelConfirm:
      "Your website stays online until the end of the period you have paid for, then goes offline. Continue?",
    cancelHint: "You keep everything you have edited either way.",
    ownerOnly: "Only the website's owner can change the plan.",
    periods: "How long",
    period: (count) => `${count} month${count === 1 ? "" : "s"}`,
    checkoutTitle: "Payment",
    checkoutStarting: "Preparing…",
    bankTitle: "Bank transfer",
    bankHint: "Your website goes online as soon as the payment reaches us.",
    redirecting: "Taking you to the payment page…",
    done: "Done",
    pendingTitle: "Waiting for your payment",
    pendingBody: (amount, plan) =>
      `We are waiting for ${amount} for the ${plan} plan. Your website goes online once it reaches us.`,
    pendingNotPaid:
      "We have not received it yet, so your website is still private.",
    pendingReplace:
      "Choosing a different plan replaces this — you will never be asked for both.",
    pendingSince: (date) => `Requested ${date}`,
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
  },
  gate: {
    blocked: {
      TRIAL:
        "Your website is on a free trial, so it is not online yet. Choose a plan to publish it.",
      EXPIRED:
        "This website's plan has expired, so it is offline. Renew it to put it back online.",
      CANCELLED:
        "This website's plan was stopped, so it is offline. Start a new one to put it back online.",
      NO_SUBSCRIPTION:
        "This website does not have a plan yet. Choose one to put it online.",
      EMAIL_UNVERIFIED:
        "Confirm your email address before putting your website online.",
    },
    title: "Not online yet",
    choosePlan: "Choose a plan",
    askOwner:
      "Only the website's owner can choose a plan — ask them to pick one.",
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
      "რედაქტირება მაშინვე შეგიძლიათ. გადახდა მხოლოდ მაშინ დაგჭირდებათ, როცა ვებგვერდის გამოქვეყნებას მოისურვებთ.",
  },
  sites: {
    title: "თქვენი ვებგვერდები",
    subtitle: "ყველაფერი, რასაც ფლობთ ან რედაქტირებაში ეხმარებით.",
    emptyTitle: "მოდი, პირველი ვებგვერდი შევქმნათ",
    emptyBody:
      "აირჩიეთ დიზაინი, მიუთითეთ ბიზნესის სახელი და დაიწყეთ რედაქტირება. სანამ პაკეტს არ აირჩევთ, ვებგვერდი არავის უჩანს.",
    create: "ვებგვერდის შექმნა",
    open: "გახსნა",
    manage: "მართვა",
    addAnother: "კიდევ ერთი ვებგვერდი",
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
    noTemplate: "გასაგრძელებლად აირჩიეთ დიზაინი.",
    preview: "გადახედვა",
    demo: "ცოცხალი დემო",
    afterHint:
      "ვებგვერდი თავიდან დახურულია. აირჩიეთ პაკეტი, როცა გამოქვეყნებას მოისურვებთ.",
  },
  verify: {
    bannerTitle: "დაადასტურეთ ელფოსტა",
    bannerBody:
      "ერთი წუთის საქმეა. მანამდე ყველაფრის რედაქტირება შეგიძლიათ — უბრალოდ ვებგვერდს ვერ გამოაქვეყნებთ.",
    resend: "ბმულის ხელახლა გაგზავნა",
    resending: "იგზავნება…",
    resent: "გაიგზავნა. შეამოწმეთ ელფოსტა.",
    resendFailed: "ვერ გავაგზავნეთ. სცადეთ ცოტა ხანში.",
    resendWait: (seconds) => `ხელახლა გაგზავნა ${seconds} წმ-ში`,
    resendTooSoon: "ახლახან გავგზავნეთ. მოიცადეთ ცოტა.",
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
    subtitle: "ვებგვერდი ქვეყნდება მას შემდეგ, რაც პაკეტი გადახდილი იქნება.",
    status: "სტატუსი",
    plan: "პაკეტი",
    noPlan: "პაკეტი ჯერ არ არის",
    provider: "გადახდის მეთოდი",
    trialEnds: "საცდელი პერიოდი მთავრდება",
    renews: "განახლდება",
    graceEnds: "გაითიშება",
    cancelAtPeriodEnd: "შეწყდება მიმდინარე პერიოდის ბოლოს",
    cancelAtPeriodEndOn: (date) => `ვებგვერდი ონლაინ რჩება ${date}-მდე.`,
    choosePlan: "პაკეტის არჩევა",
    changePlan: "პაკეტის შეცვლა",
    payments: "გადახდები",
    noPayments: "გადახდები ჯერ არ არის.",
    cancelPlan: "განახლების შეწყვეტა",
    cancelling: "წყდება…",
    cancelConfirm:
      "ვებგვერდი ონლაინ დარჩება გადახდილი პერიოდის ბოლომდე, შემდეგ კი გაითიშება. გავაგრძელოთ?",
    cancelHint: "ნებისმიერ შემთხვევაში, დარედაქტირებული შიგთავსი გრჩებათ.",
    ownerOnly: "პაკეტის შეცვლა მხოლოდ ვებგვერდის მფლობელს შეუძლია.",
    periods: "რა ვადით",
    period: (count) => `${count} თვე`,
    checkoutTitle: "გადახდა",
    checkoutStarting: "მზადდება…",
    bankTitle: "საბანკო გადარიცხვა",
    bankHint: "ვებგვერდი გამოქვეყნდება, როგორც კი თანხა ჩამოგვივა.",
    redirecting: "გადაგიყვანთ გადახდის გვერდზე…",
    done: "მზადაა",
    pendingTitle: "ველოდებით თქვენს გადახდას",
    pendingBody: (amount, plan) =>
      `ველოდებით ${amount}-ს პაკეტისთვის „${plan}“. ვებგვერდი გამოქვეყნდება, როგორც კი თანხა ჩამოგვივა.`,
    pendingNotPaid: "თანხა ჯერ არ მიგვიღია, ამიტომ ვებგვერდი ისევ დახურულია.",
    pendingReplace:
      "სხვა პაკეტის არჩევა ამას ჩაანაცვლებს — ორივეს გადახდა არასდროს მოგიწევთ.",
    pendingSince: (date) => `მოთხოვნილია ${date}`,
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
  },
  gate: {
    blocked: {
      TRIAL:
        "თქვენი ვებგვერდი საცდელ პერიოდშია, ამიტომ ჯერ არ არის ონლაინ. გამოსაქვეყნებლად აირჩიეთ პაკეტი.",
      EXPIRED:
        "ამ ვებგვერდის პაკეტს ვადა გაუვიდა, ამიტომ ის გათიშულია. ხელახლა გასააქტიურებლად განაახლეთ პაკეტი.",
      CANCELLED:
        "ამ ვებგვერდის პაკეტი შეწყვეტილია, ამიტომ ის გათიშულია. ხელახლა გასააქტიურებლად აირჩიეთ ახალი პაკეტი.",
      NO_SUBSCRIPTION:
        "ამ ვებგვერდს ჯერ პაკეტი არ აქვს. გამოსაქვეყნებლად აირჩიეთ ერთ-ერთი.",
      EMAIL_UNVERIFIED:
        "ვებგვერდის გამოქვეყნებამდე დაადასტურეთ თქვენი ელფოსტა.",
    },
    title: "ჯერ არ არის ონლაინ",
    choosePlan: "პაკეტის არჩევა",
    askOwner:
      "პაკეტის არჩევა მხოლოდ ვებგვერდის მფლობელს შეუძლია — სთხოვეთ მას.",
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
