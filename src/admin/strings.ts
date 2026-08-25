import type { Locale } from "../i18n";

/**
 * Chrome for the staff admin area. bbloom's own team works mostly in Georgian,
 * so `ka` is the primary dictionary; the shape mirrors the client dashboard's
 * so both shells stay recognisably the same product.
 */
export type AdminStrings = {
  brand: string;
  nav: { sites: string; newSite: string; system: string; accounts: string };
  signedInAs: string;
  signOut: string;
  backToBbloom: string;
  loading: string;
  retry: string;
  cancel: string;
  save: string;
  saving: string;
  saved: string;
  copy: string;
  copied: string;
  yes: string;
  no: string;
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
  sites: {
    title: string;
    subtitle: string;
    search: string;
    searchPlaceholder: string;
    create: string;
    business: string;
    template: string;
    status: string;
    address: string;
    updated: string;
    empty: string;
    emptyFiltered: string;
    demo: string;
    demoHint: string;
    pending: string;
    pendingHint: string;
    results: (total: number) => string;
    prev: string;
    next: string;
    page: (page: number, total: number) => string;
    open: string;
  };
  wizard: {
    title: string;
    subtitle: string;
    steps: { template: string; business: string; options: string; review: string };
    back: string;
    next: string;
    templateTitle: string;
    templateHint: string;
    flagship: string;
    noPreview: string;
    preview: string;
    previewNote: string;
    chooseTemplate: string;
    closePreview: string;
    demo: string;
    demoNote: string;
    selectedTemplate: string;
    businessTitle: string;
    businessName: string;
    businessNameHint: string;
    slug: string;
    slugHint: string;
    slugAuto: string;
    slugEdit: string;
    slugInvalid: string;
    slugTaken: string;
    slugReserved: string;
    optionsTitle: string;
    languages: string;
    languagesHint: string;
    languageOrderHint: string;
    opensIn: (language: string) => string;
    moveUp: string;
    needOneLanguage: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    sampleContent: string;
    sampleContentHint: string;
    reviewTitle: string;
    reviewHint: string;
    submit: string;
    submitting: string;
    failed: string;
  };
  detail: {
    back: string;
    viewSite: string;
    clientDashboard: string;
    publish: string;
    unpublish: string;
    publishHint: string;
    unpublishHint: string;
    justPublished: (address: string) => string;
    justUnpublished: string;
    pendingTitle: string;
    pendingHint: string;
    publishChanges: string;
    justPublishedChanges: string;
    overview: string;
    template: string;
    products: string;
    created: string;
    published: string;
    updated: string;
    notPublished: string;
    settings: string;
    settingsHint: string;
    businessName: string;
    languages: string;
    currency: string;
    contactEmail: string;
    contactPhone: string;
    addressKa: string;
    addressEn: string;
    mapUrl: string;
    notifications: string;
    notificationsHint: string;
    notificationEmail: string;
    notificationFallback: (email: string) => string;
    notificationNobody: string;
    invalidEmail: string;
    seo: string;
    seoTitleKa: string;
    seoTitleEn: string;
    seoDescriptionKa: string;
    seoDescriptionEn: string;
    noChanges: string;
    domains: string;
    domainsHint: string;
    hostname: string;
    addDomain: string;
    makePrimary: string;
    primary: string;
    verified: string;
    unverified: string;
    remove: string;
    noDomains: string;
    users: string;
    usersHint: string;
    handover: string;
    addUser: string;
    userEmail: string;
    userName: string;
    userPassword: string;
    userRole: string;
    roleOwner: string;
    roleEditor: string;
    createUser: string;
    creating: string;
    enable: string;
    disable: string;
    disabled: string;
    resetPassword: string;
    newPassword: string;
    passwordTooShort: string;
    passwordReset: string;
    noUsers: string;
    lastLogin: string;
    never: string;
    danger: string;
    dangerHint: string;
    deleteSite: string;
    deleteConfirm: (slug: string) => string;
    deleting: string;
  };
  system: {
    title: string;
    subtitle: string;
    snapshotNote: string;
    checkedAt: string;
    refresh: string;
    mailTitle: string;
    mailStatuses: Record<string, string>;
    offNote: string;
    okNote: string;
    lastSuccess: string;
    latestFailure: string;
    unknown: string;
    consecutive: (count: number) => string;
    waitingTitle: (count: number) => string;
    waitingAtLeastTitle: (count: number) => string;
    truncatedNote: (shown: number, hidden: number) => string;
    owedTitle: (count: number) => string;
    owedBody: string;
    owedAllShownNote: string;
    owedTruncatedNote: (shown: number, hidden: number) => string;
    /** What a list of known failures cannot cover. */
    owedLimit: string;
    waitingBody: string;
    listNote: string;
    allShownNote: string;
    colTime: string;
    colRecipient: string;
    colSubject: string;
    colReason: string;
    noneWaiting: string;
    bannerAction: string;
    test: {
      title: string;
      body: string;
      recipientLabel: string;
      recipientHint: string;
      languageLabel: string;
      send: string;
      sending: string;
      sendingNote: string;
      badAddress: string;
      undeliverableAddress: string;
      addressRefused: string;
      rateLimited: string;
      rateLimitedUntil: (when: string) => string;
      notPermitted: string;
      requestFailed: string;
      sentTitle: string;
      sentBody: string;
      failedTitle: string;
      failedBody: string;
      notConfiguredTitle: string;
      notConfiguredBody: string;
      reference: string;
      referenceNote: string;
      referenceFailedNote: string;
      noReference: string;
      attemptedAt: string;
      clearedTitle: (count: number) => string;
      clearedBody: string;
    };
  };
  statuses: Record<string, string>;
  categories: Record<string, string>;
  tiers: Record<string, string>;
  /** How a language is named on its own, for checkboxes and chips. */
  languageNames: Record<string, string>;
  /** How a language reads inside "the site opens in …" — a different case in
   *  Georgian, which is why it cannot reuse `languageNames`. */
  languageAdverbs: Record<string, string>;
  accounts: {
    title: string;
    subtitle: string;
    search: string;
    searchPlaceholder: string;
    email: string;
    fullName: string;
    created: string;
    lastLogin: string;
    never: string;
    verified: string;
    unverified: string;
    freeUsage: string;
    atLimit: string;
    empty: string;
    emptyFiltered: string;
    results: (total: number) => string;
    prev: string;
    next: string;
    page: (page: number, total: number) => string;
    back: string;
    emailStatus: string;
    accountStatus: string;
    confirmEmail: string;
    confirming: string;
    confirmed: string;
    resendConfirmation: string;
    resending: string;
    resent: string;
    resendTooSoon: (minutes: number) => string;
    resendDailyLimit: string;
    freeAllowance: string;
    freeAllowanceHint: string;
    freeAllowanceCount: (n: number) => string;
    freeAllowanceUsed: (used: number, total: number) => string;
    freeAllowanceNoEffect: string;
    updateAllowance: string;
    updating: string;
    sitesTitle: string;
    siteSlug: string;
    siteStatus: string;
    siteRole: string;
    sitePlan: string;
    freeSlot: string;
    paidPlan: string;
    noPlan: string;
    noSites: string;
    roles: Record<string, string>;
    failed: string;
    enabled: string;
    disabled: string;
    language: string;
  };
};

const en: AdminStrings = {
  brand: "bbloom staff",
  nav: { sites: "Sites", newSite: "New site", system: "System", accounts: "Accounts" },
  signedInAs: "Signed in as",
  signOut: "Sign out",
  backToBbloom: "Back to bbloom.ge",
  loading: "Loading…",
  retry: "Try again",
  cancel: "Cancel",
  save: "Save changes",
  saving: "Saving…",
  saved: "Saved",
  copy: "Copy",
  copied: "Copied",
  yes: "Yes",
  no: "No",
  login: {
    title: "Staff sign in",
    subtitle: "Build and manage client websites.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    failed: "We could not sign you in. Check your email and password.",
    help: "This is the bbloom team area. Clients sign in at panel.bbloom.ge.",
  },
  sites: {
    title: "Client sites",
    subtitle: "Every website bbloom has built.",
    search: "Search",
    searchPlaceholder: "Business name or slug",
    create: "New site",
    business: "Business",
    template: "Template",
    status: "Status",
    address: "Address",
    updated: "Updated",
    empty: "No sites yet. Create the first one.",
    emptyFiltered: "Nothing matches that search.",
    demo: "Demo",
    demoHint: "A bbloom showcase site, not a client's.",
    pending: "Unpublished edits",
    pendingHint:
      "Page edits are saved, but visitors still see the previous version. Product and image changes are live immediately and are not counted here.",
    results: (total) => `${total} site${total === 1 ? "" : "s"}`,
    prev: "Previous",
    next: "Next",
    page: (page, total) => `Page ${page} of ${total}`,
    open: "Manage",
  },
  wizard: {
    title: "New client site",
    subtitle: "Pick a template, name the business, and we build the site.",
    steps: {
      template: "Template",
      business: "Business",
      options: "Options",
      review: "Review",
    },
    back: "Back",
    next: "Continue",
    templateTitle: "Choose a template",
    templateHint:
      "Three levels of richness per category. Modern is the flagship.",
    flagship: "Flagship",
    noPreview: "Preview coming soon",
    preview: "Preview",
    previewNote:
      "The real layout, colours and sample photos. The grey bars are where your own text goes.",
    chooseTemplate: "Choose this template",
    closePreview: "Close",
    demo: "Live demo",
    demoNote:
      "Opens a real, finished site built from this template — the best thing to show a client.",
    selectedTemplate: "Chosen template",
    businessTitle: "About the business",
    businessName: "Business name",
    businessNameHint: "Shown as the site's title.",
    slug: "Address",
    slugHint: "Lowercase letters, numbers and dashes only.",
    slugAuto: "Derived from the business name",
    slugEdit: "Edit",
    slugInvalid: "Use lowercase letters, numbers and dashes only.",
    slugTaken: "That address is already taken. Choose another one.",
    slugReserved: "That address is reserved by bbloom. Choose another one.",
    optionsTitle: "How the site works",
    languages: "Languages",
    languagesHint: "Which languages the website is available in.",
    languageOrderHint:
      "The first language is the one the site opens in. Drag it to the top to change that.",
    opensIn: (language) => `The site opens in ${language}.`,
    moveUp: "Make default",
    needOneLanguage: "Pick at least one language.",
    currency: "Currency",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    sampleContent: "Fill with sample content",
    sampleContentHint:
      "Adds sample products, categories and copy, plus around 22 generated placeholder images, so the site looks finished from the first load.",
    reviewTitle: "Ready to build",
    reviewHint: "Check it over — everything can be changed afterwards.",
    submit: "Create site",
    submitting: "Building the site…",
    failed: "The site could not be created.",
  },
  detail: {
    back: "All sites",
    viewSite: "View site",
    clientDashboard: "Client dashboard",
    publish: "Publish",
    unpublish: "Unpublish",
    publishHint: "Publishing makes the site visible to everyone.",
    unpublishHint: "The site is live.",
    justPublished: (address) => `Published. The site is now live at ${address}`,
    justUnpublished: "Unpublished. The site is no longer visible to the public.",
    pendingTitle: "Unpublished changes",
    pendingHint:
      "Page edits are saved, but visitors still see the previous version.",
    publishChanges: "Publish changes",
    justPublishedChanges: "The changes are now live.",
    overview: "Overview",
    template: "Template",
    products: "Products",
    created: "Created",
    published: "Published",
    updated: "Updated",
    notPublished: "Not published yet",
    settings: "Settings",
    settingsHint: "Only the fields you change are sent.",
    businessName: "Business name",
    languages: "Languages",
    currency: "Currency",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    addressKa: "Address (Georgian)",
    addressEn: "Address (English)",
    mapUrl: "Map link",
    notifications: "Enquiry notifications",
    notificationsHint:
      "Who is emailed when an enquiry or reservation arrives. The email is written in the site's own language, so the owner always reads it in the same one, and replying answers the customer directly.",
    notificationEmail: "Notification email",
    notificationFallback: (email) => `Empty, so enquiries go to ${email}.`,
    notificationNobody:
      "Empty, and there is no contact email either — nobody is told when an enquiry arrives.",
    invalidEmail: "That does not look like an email address.",
    seo: "Search engines",
    seoTitleKa: "Title (Georgian)",
    seoTitleEn: "Title (English)",
    seoDescriptionKa: "Description (Georgian)",
    seoDescriptionEn: "Description (English)",
    noChanges: "Nothing has changed yet.",
    domains: "Custom domains",
    domainsHint: "Point the client's own domain at their site.",
    hostname: "Domain",
    addDomain: "Add domain",
    makePrimary: "Use as the primary address",
    primary: "Primary",
    verified: "Verified",
    unverified: "Not verified",
    remove: "Remove",
    noDomains: "No custom domain yet.",
    users: "Client accounts",
    usersHint:
      "Creating the owner's login is the last step of handing the site over.",
    handover: "Hand over to the client",
    addUser: "Create an account",
    userEmail: "Email",
    userName: "Full name",
    userPassword: "Password",
    userRole: "Role",
    roleOwner: "Owner — everything",
    roleEditor: "Editor — content only",
    createUser: "Create account",
    creating: "Creating…",
    enable: "Enable",
    disable: "Disable",
    disabled: "Disabled",
    resetPassword: "Reset password",
    newPassword: "New password",
    passwordTooShort: "At least 8 characters.",
    passwordReset: "Password changed",
    noUsers: "No client account yet — the client cannot sign in.",
    lastLogin: "Last sign in",
    never: "Never",
    danger: "Danger zone",
    dangerHint:
      "Deleting a site removes its content, its client accounts and its stored images. This cannot be undone.",
    deleteSite: "Delete this site",
    deleteConfirm: (slug) => `Type ${slug} to confirm`,
    deleting: "Deleting…",
  },
  system: {
    title: "System",
    subtitle: "What the API is doing right now.",
    snapshotNote:
      "This is the running server's own memory, so it resets whenever the API is deployed. It answers what is wrong now, not what happened last week.",
    checkedAt: "Checked",
    refresh: "Refresh",
    mailTitle: "Outgoing email",
    mailStatuses: {
      OK: "Sending",
      DEGRADED: "Some mail is failing",
      FAILING: "Not sending",
      OFF: "Turned off",
    },
    offNote:
      "No from-address is configured, so email is deliberately doing nothing. That is the expected state outside production.",
    okNote: "Sending is working right now.",
    lastSuccess: "Last successful send",
    latestFailure: "Most recent failure",
    unknown: "Unknown",
    consecutive: (count) =>
      count === 1
        ? "1 failure in a row"
        : `${count} failures in a row`,
    waitingTitle: (count) =>
      count === 1
        ? "1 person is waiting for an email that never sent"
        : `${count} people are waiting for an email that never sent`,
    waitingAtLeastTitle: (count) =>
      count === 1
        ? "At least 1 person is waiting for an email that never sent"
        : `At least ${count} people are waiting for an email that never sent`,
    truncatedNote: (shown, hidden) =>
      `The ${shown} earliest failures are kept, so these are the people who have been waiting longest. ${hidden} later failures are not shown.`,
    waitingBody:
      "Confirming an email address is the only thing standing between a client and a published website. Until this is fixed they cannot proceed, and nothing on their screen tells them why.",
    owedTitle: (count) =>
      count === 1
        ? "1 person never received their email"
        : `${count} people never received their email`,
    owedBody:
      "These people are still owed a message, whether or not sending works again now. Mail recovering does not reach them — someone has to. A person drops off this list only when they receive something, not when the next send succeeds.",
    owedAllShownNote:
      "Everyone we know to be owed is listed, longest wait first.",
    owedTruncatedNote: (shown, hidden) =>
      `${shown} are listed, longest wait first among them. ${hidden} more are owed and not shown — this list drops the longest waits to make room, so those ${hidden} have been waiting longer than anyone here.`,
    owedLimit:
      "This covers messages the server could not hand over. If one was accepted and bounced afterwards, nothing comes back to us — and that person is dropped from this list exactly as though they had been reached.",
    listNote:
      "This list is cleared by the next successful send, so everyone still on it is still waiting.",
    allShownNote:
      "Every failure is listed. The most recent is not necessarily the one that matters.",
    colTime: "Time",
    colRecipient: "Recipient",
    colSubject: "Email",
    colReason: "Reason",
    noneWaiting: "Nothing is failing to send right now.",
    bannerAction: "See who",
    test: {
      title: "Send a test email",
      body: "Sends one real message and reports what the mail server did with it. Safe to send to a client's address: it carries no links and asks for nothing.",
      recipientLabel: "Send to",
      recipientHint:
        "Your own address, unless you change it. Sending to yourself is the only way to check the message actually arrives.",
      languageLabel: "Language of the message",
      send: "Send test",
      sending: "Sending…",
      sendingNote:
        "This waits for the mail server to answer, which can take up to half a minute when something is wrong. A slow reply is itself a finding.",
      badAddress: "That does not look like an email address.",
      undeliverableAddress:
        "The address is well formed, but its domain does not accept mail. The message was not sent: it would have bounced back into our own inbox.",
      addressRefused: "This address was refused, so nothing was sent.",
      rateLimited:
        "Too many test sends in the last hour. Tests spend the same sending quota as the confirmation emails clients are waiting on, so this limit protects them, not us.",
      rateLimitedUntil: (when) => `You can send another test at ${when}.`,
      notPermitted: "This account may not send test emails.",
      requestFailed: "The test could not be run. Try again.",
      sentTitle: "Accepted for delivery",
      sentBody:
        "The mail server took the message. That is not the same as it arriving — nothing after this point is visible to us.",
      failedTitle: "The mail server refused it",
      failedBody:
        "This is the same failure a client's confirmation email would hit right now.",
      notConfiguredTitle: "Nothing was sent",
      notConfiguredBody:
        "No from-address is configured, so no message was composed and nothing was attempted. Nothing is broken and there is no password to go and check — email is simply switched off.",
      reference: "Check code",
      referenceNote:
        "This code is in the subject line. Open the message and check it matches: two tests produce near-identical emails, and an older one sitting in the inbox will make a failed test look like it worked.",
      referenceFailedNote:
        "This code identifies the attempt in the server log. Nothing was delivered, so there is no message to go and look for.",
      noReference:
        "No code was issued for this attempt, so there is nothing to match in an inbox.",
      attemptedAt: "Attempted",
      clearedTitle: (count) =>
        count === 1
          ? "This test cleared 1 failed delivery"
          : `This test cleared ${count} failed deliveries`,
      clearedBody:
        "A successful send empties the failure list, so these rows have just left the failure panel on this page. The people are still owed a message — they stay on the list of everyone still owed until they personally receive something.",
    },
  },
  statuses: { DRAFT: "Draft", PUBLISHED: "Published" },
  categories: { SHOP: "Online shop", RESTAURANT: "Restaurant" },
  tiers: { SIMPLE: "Simple", CLASSIC: "Classic", MODERN: "Modern" },
  languageNames: { ka: "Georgian", en: "English" },
  languageAdverbs: { ka: "Georgian", en: "English" },
  accounts: {
    title: "Client accounts",
    subtitle: "Everyone who has signed up on bbloom.",
    search: "Search",
    searchPlaceholder: "Email, name or website",
    email: "Email",
    fullName: "Full name",
    created: "Created",
    lastLogin: "Last sign in",
    never: "Never",
    verified: "Verified",
    unverified: "Unverified",
    freeUsage: "Free",
    atLimit: "At limit",
    empty: "No accounts yet.",
    emptyFiltered: "Nothing matches that search.",
    results: (total) => `${total} account${total === 1 ? "" : "s"}`,
    prev: "Previous",
    next: "Next",
    page: (page, total) => `Page ${page} of ${total}`,
    back: "All accounts",
    emailStatus: "Email status",
    accountStatus: "Account status",
    confirmEmail: "Confirm email",
    confirming: "Confirming…",
    confirmed: "Email confirmed",
    resendConfirmation: "Resend confirmation",
    resending: "Sending…",
    resent: "Confirmation sent",
    resendTooSoon: (minutes) => `Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    resendDailyLimit: "Daily resend limit reached. Try again tomorrow.",
    freeAllowance: "Free allowance",
    freeAllowanceHint: "How many websites this client may keep online for free.",
    freeAllowanceCount: (n) => `${n} free`,
    freeAllowanceUsed: (used, total) => `${used} / ${total} used`,
    freeAllowanceNoEffect: "Changing this does not take any website offline that is already live.",
    updateAllowance: "Update",
    updating: "Updating…",
    sitesTitle: "Sites",
    siteSlug: "Address",
    siteStatus: "Status",
    siteRole: "Role",
    sitePlan: "Plan",
    freeSlot: "Free slot",
    paidPlan: "Paid",
    noPlan: "No plan",
    noSites: "No sites yet.",
    roles: { SITE_OWNER: "Owner", SITE_EDITOR: "Editor" },
    failed: "Something went wrong.",
    enabled: "Active",
    disabled: "Disabled",
    language: "Language",
  },
};

const ka: AdminStrings = {
  brand: "bbloom გუნდი",
  nav: { sites: "საიტები", newSite: "ახალი საიტი", system: "სისტემა", accounts: "ანგარიშები" },
  signedInAs: "შესული ხართ როგორც",
  signOut: "გამოსვლა",
  backToBbloom: "დაბრუნება bbloom.ge-ზე",
  loading: "იტვირთება…",
  retry: "ხელახლა ცდა",
  cancel: "გაუქმება",
  save: "შენახვა",
  saving: "ინახება…",
  saved: "შენახულია",
  copy: "კოპირება",
  copied: "დაკოპირდა",
  yes: "დიახ",
  no: "არა",
  login: {
    title: "გუნდის შესვლა",
    subtitle: "კლიენტების საიტების შექმნა და მართვა.",
    email: "ელფოსტა",
    password: "პაროლი",
    submit: "შესვლა",
    submitting: "მიმდინარეობს შესვლა…",
    failed: "ვერ შეხვედით. შეამოწმეთ ელფოსტა და პაროლი.",
    help: "ეს bbloom-ის გუნდის სივრცეა. კლიენტები შედიან panel.bbloom.ge-ზე.",
  },
  sites: {
    title: "კლიენტების საიტები",
    subtitle: "ყველა ვებგვერდი, რომელიც bbloom-მა შექმნა.",
    search: "ძიება",
    searchPlaceholder: "ბიზნესის სახელი ან მისამართი",
    create: "ახალი საიტი",
    business: "ბიზნესი",
    template: "შაბლონი",
    status: "სტატუსი",
    address: "მისამართი",
    updated: "განახლდა",
    empty: "საიტები ჯერ არ არის. შექმენით პირველი.",
    emptyFiltered: "ამ ძიებას არაფერი შეესაბამება.",
    demo: "დემო",
    demoHint: "bbloom-ის საჩვენებელი საიტია, არა კლიენტის.",
    pending: "გამოუქვეყნებელი ცვლილებები",
    pendingHint:
      "გვერდის ცვლილებები შენახულია, მაგრამ ვიზიტორები ჯერ ისევ წინა ვერსიას ხედავენ. პროდუქტებისა და სურათების ცვლილებები მაშინვე ქვეყნდება და აქ არ ითვლება.",
    results: (total) => `${total} საიტი`,
    prev: "წინა",
    next: "შემდეგი",
    page: (page, total) => `გვერდი ${page} / ${total}`,
    open: "მართვა",
  },
  wizard: {
    title: "ახალი კლიენტის საიტი",
    subtitle:
      "აირჩიეთ შაბლონი, მიუთითეთ ბიზნესის სახელი და საიტი მზად იქნება.",
    steps: {
      template: "შაბლონი",
      business: "ბიზნესი",
      options: "პარამეტრები",
      review: "შემოწმება",
    },
    back: "უკან",
    next: "გაგრძელება",
    templateTitle: "აირჩიეთ შაბლონი",
    templateHint:
      "თითო კატეგორიაში სამი დონეა. „თანამედროვე“ ყველაზე მდიდარია.",
    flagship: "საუკეთესო",
    noPreview: "სურათი მალე დაემატება",
    preview: "გადახედვა",
    previewNote:
      "ნამდვილი განლაგება, ფერები და სანიმუშო ფოტოები. ნაცრისფერი ზოლების ადგილს თქვენი ტექსტი დაიკავებს.",
    chooseTemplate: "ამ შაბლონის არჩევა",
    closePreview: "დახურვა",
    demo: "ცოცხალი დემო",
    demoNote:
      "იხსნება ამ შაბლონით აწყობილი ნამდვილი, დასრულებული საიტი — საუკეთესო საჩვენებელი კლიენტისთვის.",
    selectedTemplate: "არჩეული შაბლონი",
    businessTitle: "ბიზნესის შესახებ",
    businessName: "ბიზნესის სახელი",
    businessNameHint: "გამოჩნდება საიტის სათაურად.",
    slug: "მისამართი",
    slugHint: "მხოლოდ პატარა ლათინური ასოები, ციფრები და დეფისი.",
    slugAuto: "ავტომატურად ბიზნესის სახელიდან",
    slugEdit: "შეცვლა",
    slugInvalid: "გამოიყენეთ პატარა ლათინური ასოები, ციფრები და დეფისი.",
    slugTaken: "ეს მისამართი დაკავებულია. აირჩიეთ სხვა.",
    slugReserved: "ეს მისამართი დაცულია bbloom-ის მიერ. აირჩიეთ სხვა.",
    optionsTitle: "როგორ იმუშავებს საიტი",
    languages: "ენები",
    languagesHint: "რომელ ენებზე იქნება ხელმისაწვდომი ვებგვერდი.",
    languageOrderHint:
      "პირველი ენა არის ის, რომლითაც საიტი იხსნება. თანმიმდევრობის შესაცვლელად აწიეთ სასურველი ენა ზემოთ.",
    opensIn: (language) => `საიტი გაიხსნება ${language}.`,
    moveUp: "მთავარად დაყენება",
    needOneLanguage: "აირჩიეთ სულ მცირე ერთი ენა.",
    currency: "ვალუტა",
    contactEmail: "საკონტაქტო ელფოსტა",
    contactPhone: "საკონტაქტო ტელეფონი",
    sampleContent: "ნიმუშის შიგთავსით შევსება",
    sampleContentHint:
      "დაამატებს სანიმუშო პროდუქტებს, კატეგორიებსა და ტექსტს, დაახლოებით 22 ავტომატურად შექმნილ სურათთან ერთად — საიტი პირველივე გახსნაზე დასრულებულად გამოიყურება.",
    reviewTitle: "მზადაა შესაქმნელად",
    reviewHint: "გადაამოწმეთ — ყველაფრის შეცვლა შემდეგაც შესაძლებელია.",
    submit: "საიტის შექმნა",
    submitting: "საიტი იქმნება…",
    failed: "საიტის შექმნა ვერ მოხერხდა.",
  },
  detail: {
    back: "ყველა საიტი",
    viewSite: "საიტის ნახვა",
    clientDashboard: "კლიენტის კაბინეტი",
    publish: "გამოქვეყნება",
    unpublish: "გამოქვეყნების გაუქმება",
    publishHint: "გამოქვეყნების შემდეგ საიტს ყველა დაინახავს.",
    unpublishHint: "საიტი გამოქვეყნებულია.",
    justPublished: (address) =>
      `გამოქვეყნდა. საიტი ხელმისაწვდომია მისამართზე ${address}`,
    justUnpublished: "გამოქვეყნება გაუქმდა. საიტი აღარ ჩანს.",
    pendingTitle: "გამოუქვეყნებელი ცვლილებები",
    pendingHint:
      "გვერდის ცვლილებები შენახულია, მაგრამ ვიზიტორები ჯერ ისევ წინა ვერსიას ხედავენ.",
    publishChanges: "ცვლილებების გამოქვეყნება",
    justPublishedChanges: "ცვლილებები გამოქვეყნდა.",
    overview: "მიმოხილვა",
    template: "შაბლონი",
    products: "პროდუქტები",
    created: "შეიქმნა",
    published: "გამოქვეყნდა",
    updated: "განახლდა",
    notPublished: "ჯერ არ გამოქვეყნებულა",
    settings: "პარამეტრები",
    settingsHint: "იგზავნება მხოლოდ ის ველები, რომლებიც შეცვალეთ.",
    businessName: "ბიზნესის სახელი",
    languages: "ენები",
    currency: "ვალუტა",
    contactEmail: "საკონტაქტო ელფოსტა",
    contactPhone: "საკონტაქტო ტელეფონი",
    addressKa: "მისამართი (ქართულად)",
    addressEn: "მისამართი (ინგლისურად)",
    mapUrl: "რუკის ბმული",
    notifications: "შეტყობინებები მოთხოვნებზე",
    notificationsHint:
      "ვის ეგზავნება წერილი, როცა შემოვა მოთხოვნა ან ჯავშანი. წერილი იწერება საიტის ენაზე, ამიტომ მფლობელი ყოველთვის ერთსა და იმავე ენაზე კითხულობს, პასუხი კი პირდაპირ მომხმარებელს მიდის.",
    notificationEmail: "შეტყობინების ელფოსტა",
    notificationFallback: (email) =>
      `ცარიელია, ამიტომ მოთხოვნები მიდის მისამართზე ${email}.`,
    notificationNobody:
      "ცარიელია და საკონტაქტო ელფოსტაც არ არის — მოთხოვნის შემოსვლისას ვერავინ გაიგებს.",
    invalidEmail: "ეს ელფოსტის მისამართს არ ჰგავს.",
    seo: "საძიებო სისტემები",
    seoTitleKa: "სათაური (ქართულად)",
    seoTitleEn: "სათაური (ინგლისურად)",
    seoDescriptionKa: "აღწერა (ქართულად)",
    seoDescriptionEn: "აღწერა (ინგლისურად)",
    noChanges: "ჯერ არაფერი შეცვლილა.",
    domains: "საკუთარი დომენები",
    domainsHint: "მიაბით კლიენტის საკუთარი დომენი მის საიტს.",
    hostname: "დომენი",
    addDomain: "დომენის დამატება",
    makePrimary: "მთავარ მისამართად გამოყენება",
    primary: "მთავარი",
    verified: "დადასტურებულია",
    unverified: "დაუდასტურებელი",
    remove: "წაშლა",
    noDomains: "საკუთარი დომენი ჯერ არ არის.",
    users: "კლიენტის ანგარიშები",
    usersHint:
      "მფლობელის ანგარიშის შექმნა საიტის გადაცემის ბოლო ნაბიჯია.",
    handover: "საიტის კლიენტისთვის გადაცემა",
    addUser: "ანგარიშის შექმნა",
    userEmail: "ელფოსტა",
    userName: "სახელი და გვარი",
    userPassword: "პაროლი",
    userRole: "როლი",
    roleOwner: "მფლობელი — ყველაფერი",
    roleEditor: "რედაქტორი — მხოლოდ შიგთავსი",
    createUser: "ანგარიშის შექმნა",
    creating: "იქმნება…",
    enable: "ჩართვა",
    disable: "გათიშვა",
    disabled: "გათიშულია",
    resetPassword: "პაროლის შეცვლა",
    newPassword: "ახალი პაროლი",
    passwordTooShort: "მინიმუმ 8 სიმბოლო.",
    passwordReset: "პაროლი შეიცვალა",
    noUsers: "კლიენტის ანგარიში ჯერ არ არის — კლიენტი ვერ შევა.",
    lastLogin: "ბოლო შესვლა",
    never: "არასდროს",
    danger: "საშიში ზონა",
    dangerHint:
      "საიტის წაშლა წაშლის მის შიგთავსს, კლიენტის ანგარიშებსა და ატვირთულ სურათებს. მოქმედება შეუქცევადია.",
    deleteSite: "საიტის წაშლა",
    deleteConfirm: (slug) => `დასადასტურებლად აკრიფეთ ${slug}`,
    deleting: "იშლება…",
  },
  system: {
    title: "სისტემა",
    subtitle: "რას აკეთებს API ამ წუთში.",
    snapshotNote:
      "ეს სერვერის მიმდინარე მეხსიერებაა და ნულდება ყოველი განახლებისას. ის პასუხობს კითხვას „რა არ მუშაობს ახლა“, და არა „რა მოხდა გასულ კვირას“.",
    checkedAt: "შემოწმდა",
    refresh: "განახლება",
    mailTitle: "გამავალი ელფოსტა",
    mailStatuses: {
      OK: "იგზავნება",
      DEGRADED: "ნაწილი ვერ გაიგზავნა",
      FAILING: "არ იგზავნება",
      OFF: "გამორთულია",
    },
    offNote:
      "გამგზავნი მისამართი მითითებული არ არის, ამიტომ ელფოსტა განზრახ არაფერს აკეთებს. სატესტო გარემოში ეს გამართული მდგომარეობაა.",
    okNote: "გაგზავნა ამჟამად მუშაობს.",
    lastSuccess: "ბოლო წარმატებული გაგზავნა",
    latestFailure: "ბოლო შეცდომა",
    unknown: "უცნობია",
    consecutive: (count) => `ზედიზედ ${count} წარუმატებელი მცდელობა`,
    waitingTitle: (count) =>
      `${count} ადამიანი ელოდება წერილს, რომელიც არ გაიგზავნა`,
    waitingAtLeastTitle: (count) =>
      `სულ მცირე ${count} ადამიანი ელოდება წერილს, რომელიც არ გაიგზავნა`,
    truncatedNote: (shown, hidden) =>
      `ინახება ყველაზე ადრინდელი ${shown} ჩანაწერი — სწორედ ესენი ელოდებიან ყველაზე დიდხანს. კიდევ ${hidden} მოგვიანებითი წერილი ვერ გაიგზავნა და აქ არ ჩანს.`,
    waitingBody:
      "ელფოსტის დადასტურება ერთადერთია, რაც კლიენტსა და გამოქვეყნებულ საიტს შორის დგას. სანამ ეს არ გასწორდება, ისინი ვერაფერს გააკეთებენ — და მათ ეკრანზე არაფერი ამბობს, რატომ.",
    owedTitle: (count) =>
      count === 1
        ? "1 ადამიანს წერილი ვერ მიუვიდა"
        : `${count} ადამიანს წერილი ვერ მიუვიდა`,
    owedBody:
      "ამ ადამიანებს წერილი კვლავ ერგებათ — მიუხედავად იმისა, გაგზავნა ახლა მუშაობს თუ არა. ელფოსტის აღდგენა მათთან არ აღწევს; ვიღაცამ უნდა მიაწვდინოს. სიიდან ადამიანი მაშინ ქრება, როცა თავად მიიღებს წერილს და არა მაშინ, როცა შემდეგი გაგზავნა გამოვა.",
    owedAllShownNote:
      "ყველა, ვისზეც ვიცით, რომ წერილი ერგება, სიაშია — ყველაზე დიდხანს მოლოდინი პირველად.",
    owedTruncatedNote: (shown, hidden) =>
      `მათგან ${shown} ჩანს, ყველაზე დიდხანს მოლოდინი პირველად. კიდევ ${hidden} ადამიანს ერგება წერილი და აქ არ ჩანს — სია ადგილის გასათავისუფლებლად სწორედ ყველაზე დიდხანს მოლოდინებს შლის, ამიტომ ეს ${hidden} ყველაზე მეტ ხანს ელოდება.`,
    owedLimit:
      "აქ მხოლოდ ის წერილებია, რომელთა გაგზავნაც სერვერმა ვერ შეძლო. თუ წერილი მიღებულ იქნა და შემდეგ დაბრუნდა, ამის შესახებ ჩვენამდე არაფერი აღწევს — და ის ადამიანი სიიდან ისე ქრება, თითქოს წერილი მიეღოს.",
    listNote:
      "სია იწმინდება პირველივე წარმატებული გაგზავნისას, ამიტომ ყველა, ვინც აქ წერია, ჯერ კიდევ ელოდება.",
    allShownNote:
      "ნაჩვენებია ყველა ჩანაწერი. ბოლო აუცილებლად არ ნიშნავს მთავარს.",
    colTime: "დრო",
    colRecipient: "მიმღები",
    colSubject: "წერილი",
    colReason: "მიზეზი",
    noneWaiting: "ამჟამად წერილების გაგზავნა არ იშლება.",
    bannerAction: "ნახეთ ვინ",
    test: {
      title: "სატესტო წერილის გაგზავნა",
      body: "აგზავნის ერთ ნამდვილ წერილს და გიბრუნებთ, რა უყო მას ფოსტის სერვერმა. კლიენტის მისამართზეც უსაფრთხოა: წერილში ბმულები არ არის და არაფერს ითხოვს.",
      recipientLabel: "ვის გაეგზავნოს",
      recipientHint:
        "თქვენივე მისამართი, თუ არ შეცვლით. საკუთარ თავზე გაგზავნა ერთადერთი გზაა შესამოწმებლად, რომ წერილი მართლა მოდის.",
      languageLabel: "წერილის ენა",
      send: "გაგზავნა",
      sending: "იგზავნება…",
      sendingNote:
        "ველოდებით ფოსტის სერვერის პასუხს — გაუმართაობისას ეს ნახევარ წუთამდე გრძელდება. ნელი პასუხიც შედეგია.",
      badAddress: "ეს ელფოსტის მისამართს არ ჰგავს.",
      undeliverableAddress:
        "მისამართი გამართულია, მაგრამ მის დომენს ფოსტა არ მიაქვს. წერილი არ გაგზავნილა — ის ჩვენსავე ფოსტაში დაბრუნდებოდა.",
      addressRefused: "ეს მისამართი უარყოფილია — წერილი არ გაგზავნილა.",
      rateLimited:
        "ბოლო საათში ძალიან ბევრი სატესტო წერილი გაიგზავნა. ტესტები იმავე ლიმიტს ხარჯავს, რომლითაც კლიენტების დამადასტურებელი წერილები იგზავნება — ეს შეზღუდვა მათ იცავს.",
      rateLimitedUntil: (when) =>
        `შემდეგი ტესტის გაგზავნა შესაძლებელი იქნება ${when}-ზე.`,
      notPermitted: "ამ ანგარიშს სატესტო წერილის გაგზავნა არ შეუძლია.",
      requestFailed: "ტესტი ვერ შესრულდა. სცადეთ ხელახლა.",
      sentTitle: "მიღებულია გასაგზავნად",
      sentBody:
        "ფოსტის სერვერმა წერილი ჩაიბარა. ეს არ ნიშნავს, რომ ის მივიდა — ამის შემდეგ მომხდარი ჩვენთვის აღარ ჩანს.",
      failedTitle: "ფოსტის სერვერმა უარი თქვა",
      failedBody:
        "ზუსტად ამ შეცდომას წააწყდებოდა ახლა კლიენტის დამადასტურებელი წერილიც.",
      notConfiguredTitle: "წერილი არ გაგზავნილა",
      notConfiguredBody:
        "გამგზავნის მისამართი მითითებული არ არის, ამიტომ წერილი არც შედგენილა და არაფერი უცდია სისტემას. არაფერია გაფუჭებული და პაროლის შემოწმება არ სჭირდება — ფოსტა უბრალოდ გამორთულია.",
      reference: "საკონტროლო კოდი",
      referenceNote:
        "ეს კოდი წერილის სათაურშია. გახსენით წერილი და შეადარეთ: ორი ტესტი თითქმის ერთნაირ წერილებს აგზავნის და ძველი, ფოსტაში დარჩენილი წერილი წარუმატებელ ტესტსაც წარმატებულად გამოაჩენს.",
      referenceFailedNote:
        "ამ კოდით მოიძებნება ეს მცდელობა სერვერის ჟურნალში. წერილი არ ჩაბარებულა, ამიტომ ფოსტაში საძებნელი არაფერია.",
      noReference:
        "ამ მცდელობას კოდი არ მინიჭებია, ამიტომ ფოსტაში შესადარებელი არაფერია.",
      attemptedAt: "მცდელობა",
      clearedTitle: (count) =>
        count === 1
          ? "ამ ტესტმა 1 წარუმატებელი გაგზავნა ჩამოშალა"
          : `ამ ტესტმა ${count} წარუმატებელი გაგზავნა ჩამოშალა`,
      clearedBody:
        "წარმატებული გაგზავნა ასუფთავებს შეცდომების სიას, ამიტომ ეს ჩანაწერები ახლახან გაქრა ამ გვერდის შეცდომების პანელიდან. ადამიანებს წერილი კვლავ ერგებათ — ისინი რჩებიან დავალიანების სიაში, სანამ რეალურად არ მიიღებენ რაიმეს.",
    },
  },
  statuses: { DRAFT: "მუშავდება", PUBLISHED: "გამოქვეყნებული" },
  categories: { SHOP: "ონლაინ მაღაზია", RESTAURANT: "რესტორანი" },
  tiers: { SIMPLE: "მარტივი", CLASSIC: "კლასიკური", MODERN: "თანამედროვე" },
  languageNames: { ka: "ქართული", en: "ინგლისური" },
  languageAdverbs: { ka: "ქართულად", en: "ინგლისურად" },
  accounts: {
    title: "კლიენტების ანგარიშები",
    subtitle: "ყველა, ვინც bbloom-ზე დარეგისტრირდა.",
    search: "ძიება",
    searchPlaceholder: "ელფოსტა, სახელი ან ვებგვერდი",
    email: "ელფოსტა",
    fullName: "სახელი და გვარი",
    created: "შეიქმნა",
    lastLogin: "ბოლო შესვლა",
    never: "არასდროს",
    verified: "დადასტურებული",
    unverified: "დაუდასტურებელი",
    freeUsage: "უფასო",
    atLimit: "ლიმიტზე",
    empty: "ანგარიშები ჯერ არ არის.",
    emptyFiltered: "ამ ძიებას არაფერი შეესაბამება.",
    results: (total) => `${total} ანგარიში`,
    prev: "წინა",
    next: "შემდეგი",
    page: (page, total) => `გვერდი ${page} / ${total}`,
    back: "ყველა ანგარიში",
    emailStatus: "ელფოსტის სტატუსი",
    accountStatus: "ანგარიშის სტატუსი",
    confirmEmail: "ელფოსტის დადასტურება",
    confirming: "მოწმდება…",
    confirmed: "ელფოსტა დადასტურდა",
    resendConfirmation: "ხელახლა გაგზავნა",
    resending: "იგზავნება…",
    resent: "დადასტურების წერილი გაიგზავნა",
    resendTooSoon: (minutes) => `სცადეთ ${minutes} წუთში.`,
    resendDailyLimit: "დღიური ლიმიტი ამოიწურა. სცადეთ ხვალ.",
    freeAllowance: "უფასო ლიმიტი",
    freeAllowanceHint: "რამდენი ვებგვერდი შეუძლია კლიენტს უფასოდ ჰქონდეს ონლაინ.",
    freeAllowanceCount: (n) => `${n} უფასო`,
    freeAllowanceUsed: (used, total) => `${used} / ${total} გამოყენებული`,
    freeAllowanceNoEffect: "ეს არ გათიშავს უკვე გამოქვეყნებულ ვებგვერდს.",
    updateAllowance: "შეცვლა",
    updating: "იცვლება…",
    sitesTitle: "საიტები",
    siteSlug: "მისამართი",
    siteStatus: "სტატუსი",
    siteRole: "როლი",
    sitePlan: "პაკეტი",
    freeSlot: "უფასო ადგილი",
    paidPlan: "ფასიანი",
    noPlan: "პაკეტის გარეშე",
    noSites: "საიტები ჯერ არ არის.",
    roles: { SITE_OWNER: "მფლობელი", SITE_EDITOR: "რედაქტორი" },
    failed: "შეცდომა მოხდა.",
    enabled: "აქტიური",
    disabled: "გათიშული",
    language: "ენა",
  },
};

const dictionaries: Record<Locale, AdminStrings> = { en, ka };

export function adminStrings(locale: Locale): AdminStrings {
  return dictionaries[locale];
}
