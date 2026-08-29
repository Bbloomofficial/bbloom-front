import type { Locale } from "../i18n";

/**
 * Chrome for the staff admin area. bbloom's own team works mostly in Georgian,
 * so `ka` is the primary dictionary; the shape mirrors the client dashboard's
 * so both shells stay recognisably the same product.
 */
export type AdminStrings = {
  brand: string;
  nav: { sites: string; newSite: string; system: string; accounts: string; plans: string; promoCodes: string; newCustomerOffer: string; ads: string };
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
  /**
   * Connecting a client's bank merchant account.
   *
   * Worded throughout to keep one fact in front of whoever is typing: these
   * credentials belong to the client's own contract with their bank, and every
   * lari a customer spends lands in the client's account without passing
   * through bbloom. Staff transcribe them; staff do not own them.
   */
  payments: {
    title: string;
    hint: string;
    /** Said loudly, because it is the thing a hurried person will assume wrongly. */
    ownership: string;
    /** That filling this in is what switches selling on for the site. */
    consequence: string;
    connected: string;
    notConnected: string;
    provider: string;
    providerHint: string;
    status: string;
    statuses: Record<string, string>;
    merchantRef: string;
    merchantRefHint: string;
    currency: string;
    returnUrl: string;
    returnUrlHint: string;
    connectedAt: string;
    clientId: string;
    clientSecret: string;
    /**
     * Shown where a secret would be if it could be read back. It cannot: the
     * API never returns one, so the form is write-only and replacing an account
     * means retyping both halves rather than editing one.
     */
    secretWriteOnly: string;
    extraTitle: string;
    extraHint: string;
    baseUrl: string;
    baseUrlHint: string;
    tokenUrl: string;
    tokenUrlHint: string;
    callbackPublicKey: string;
    callbackPublicKeyHint: string;
    connect: string;
    replace: string;
    saving: string;
    saved: string;
    disable: string;
    disableConfirm: string;
    disableHint: string;
    disabling: string;
    noProviders: string;
    required: string;
    /** The server has no credential key, so nothing can be stored at all yet. */
    notConfigured: string;
    unknownProvider: string;
    failed: string;
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
  /**
   * Facebook and Instagram advertising. Its own section rather than a corner of
   * `system` because the test tool here spends money, which nothing else on the
   * staff side does.
   */
  ads: {
    title: string;
    subtitle: string;
    loadFailed: string;
    retry: string;
    channels: Record<string, string>;
    statuses: Record<string, string>;
    status: {
      title: string;
      checkedAt: string;
      refresh: string;
      configured: string;
      notConfigured: string;
      configuredNote: string;
      notConfiguredNote: string;
      disabledNote: string;
      reachable: string;
      unreachable: string;
      unreachableNote: string;
      unaskedNote: string;
      instagramOn: string;
      instagramOff: string;
      accountStatus: string;
      /** Keyed by Meta's numeric account status, as a string. */
      accountStatuses: Record<string, string>;
      accountStatusUnknown: string;
      accountStatusNote: string;
      adAccount: string;
      apiVersion: string;
      page: string;
      instagram: string;
      tokenOwner: string;
      timezone: string;
      budgetCeiling: string;
      budgetCeilingNoCurrency: string;
      liveCampaigns: (count: number) => string;
      noneLive: string;
      liveTestTitle: (count: number) => string;
      liveTestBody: string;
    };
    test: {
      title: string;
      body: string;
      warning: string;
      channelLabel: string;
      pickChannel: string;
      instagramUnavailable: string;
      destinationLabel: string;
      destinationHint: string;
      badUrl: string;
      launch: string;
      launching: string;
      launchingNote: string;
      confirm: string;
      launchedTitle: string;
      launchedBody: string;
      failedTitle: string;
      failedBody: string;
      notConfiguredTitle: string;
      notConfiguredBody: string;
      stillSpendingTitle: string;
      tokenDeadNoSpend: string;
      stillSpendingBody: string;
      attemptedAt: string;
      budget: string;
      rateLimited: string;
      rateLimitedUntil: (when: string) => string;
      notPermitted: string;
      requestFailed: string;
    };
    testList: {
      title: string;
      body: string;
      empty: string;
      colWhen: string;
      colName: string;
      colChannels: string;
      colBudget: string;
      colStatus: string;
      colAction: string;
      spending: string;
      delete: string;
      deleting: string;
      deleteConfirm: string;
      deleteFailed: string;
    };
    /** Staff wording for the server's 409 codes. Keyed by the code itself. */
    refusals: Record<string, string>;
    tools: string;
    backToCampaigns: string;
    campaigns: {
      title: string;
      subtitle: string;
      none: string;
      create: string;
      filterStatus: string;
      filterAll: string;
      colWhen: string;
      colSite: string;
      colName: string;
      colChannels: string;
      colBudget: string;
      colSpend: string;
      colStatus: string;
      notYet: string;
      asOf: (when: string) => string;
      spending: string;
      pageOf: (page: number, total: number) => string;
      prev: string;
      next: string;
    };
    form: {
      title: string;
      subtitle: string;
      warning: string;
      confirm: string;
      siteLabel: string;
      siteHint: string;
      sitePlaceholder: string;
      nameLabel: string;
      nameHint: string;
      channelLabel: string;
      pickChannel: string;
      budgetLabel: string;
      budgetHint: string;
      budgetCeiling: (amount: string) => string;
      budgetOverCeiling: string;
      budgetTooSmall: string;
      destinationLabel: string;
      destinationHint: string;
      badUrl: string;
      headlineLabel: string;
      primaryTextLabel: string;
      imageLabel: string;
      countryLabel: string;
      cityLabel: string;
      cityHint: string;
      ageLabel: string;
      ageTo: string;
      required: string;
      create: string;
      creating: string;
      creatingNote: string;
      cancel: string;
      createFailed: string;
      allowanceTitle: string;
      allowanceNone: string;
      allowanceImpressions: (used: string, limit: string) => string;
      allowanceImpressionsUnmetered: (used: string) => string;
      allowanceChannels: (channels: string) => string;
      allowanceSpent: string;
      allowanceOver: (used: string, limit: string) => string;
      allowanceStale: string;
      channelNotInPlan: string;
    };
    detail: {
      pause: string;
      pausing: string;
      pauseConfirm: string;
      resume: string;
      resuming: string;
      resumeConfirm: string;
      delete: string;
      deleting: string;
      deleteConfirm: string;
      actionFailed: string;
      spendingTitle: string;
      spendingBody: string;
      notLaunched: string;
      site: string;
      createdBy: string;
      destination: string;
      headline: string;
      primaryText: string;
      audience: string;
      ages: (from: number, to: number) => string;
      launched: string;
      paused: string;
      deletedAt: string;
      created: string;
      budget: string;
      metaTitle: string;
      metaCampaign: string;
      metaAdSet: string;
      metaCreative: string;
      metaAd: string;
      notFound: string;
    };
    insights: {
      title: string;
      refresh: string;
      notYet: string;
      notYetBody: string;
      emptyReport: string;
      asOf: (when: string) => string;
      cached: string;
      impressions: string;
      reach: string;
      clicks: string;
      ctr: string;
      cpc: string;
      spend: string;
      loadFailed: string;
      loadFailedNeverRead: string;
      notLaunched: string;
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
  plans: {
    title: string;
    subtitle: string;
    create: string;
    empty: string;
    back: string;
    newTitle: string;
    editTitle: string;
    code: string;
    codeHint: string;
    price: string;
    priceHint: string;
    currency: string;
    billingPeriod: string;
    periods: Record<string, string>;
    sortOrder: string;
    sortOrderHint: string;
    featured: string;
    featuredHint: string;
    active: string;
    activeHint: string;
    purchasable: string;
    purchasableHint: string;
    comingSoon: string;
    comingSoonHint: string;
    comingSoonBeatsFeatured: string;
    comingSoonHidden: string;
    status: string;
    translations: string;
    translationsHint: string;
    name: string;
    displayPrice: string;
    displayPriceHint: string;
    displayPriceAuto: string;
    cadence: string;
    cadenceHint: string;
    summary: string;
    cta: string;
    features: string;
    featuresHint: string;
    addFeature: string;
    removeFeature: string;
    languageNames: Record<string, string>;
    edit: string;
    delete: string;
    deleting: string;
    deleteConfirm: string;
    deleteBlocked: string;
    codeRequired: string;
    priceInvalid: string;
    nameRequired: string;
    saveFailed: string;
    discount: string;
    discountHint: string;
    discountPercent: string;
    discountPercentHint: string;
    discountStarts: string;
    discountStartsHint: string;
    discountEnds: string;
    discountEndsHint: string;
    discountPreview: string;
    discountNotLive: string;
    discountInvalid: string;
    discountNotPurchasable: string;
    discountWindowWithoutPercent: string;
    discountWindowBackwards: string;
  };
  promoCodes: {
    title: string;
    subtitle: string;
    create: string;
    empty: string;
    back: string;
    newTitle: string;
    editTitle: string;
    code: string;
    codeHint: string;
    percentOff: string;
    percentHint: string;
    expiresAt: string;
    expiresHint: string;
    expires: string;
    maxRedemptions: string;
    maxHint: string;
    used: string;
    created: string;
    active: string;
    activeHint: string;
    status: string;
    usable: string;
    notUsable: string;
    appliesTo: string;
    appliesToHint: string;
    allPlans: string;
    allPlansNotice: string;
    edit: string;
    delete: string;
    deleting: string;
    deleteConfirm: string;
    deleteBlocked: string;
    codeRequired: string;
    percentInvalid: string;
    maxInvalid: string;
    saveFailed: string;
  };
  newCustomerOffer: {
    title: string;
    subtitle: string;
    percentOff: string;
    percentHint: string;
    active: string;
    activeHint: string;
    status: string;
    running: string;
    notRunning: string;
    updated: string;
    neverUpdated: string;
    rules: string;
    percentInvalid: string;
    loadFailed: string;
    saveFailed: string;
  };
};

const en: AdminStrings = {
  brand: "bbloom staff",
  nav: { sites: "Sites", newSite: "New site", system: "System", accounts: "Accounts", plans: "Plans", promoCodes: "Discounts", newCustomerOffer: "New customers", ads: "Ads" },
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
    help: "This is the bbloom team area. Clients sign in at bbloom.ge.",
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
      "Who would be emailed when an enquiry or reservation arrives. Sending is switched off across the whole server right now, so nothing is actually sent and this is only the address it would go to. The email is written in the site's own language, so the owner always reads it in the same one, and replying answers the customer directly.",
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
  payments: {
    title: "Bank account for online orders",
    hint: "The merchant credentials from the client's own contract with their bank.",
    ownership:
      "This is the client's bank account. Customers pay the client directly — the money never passes through bbloom, and we cannot refund it from here.",
    consequence:
      "Connecting an account is what lets this website take online orders. Removing it stops new ones.",
    connected: "Connected",
    notConnected: "No bank account connected — this website cannot sell.",
    provider: "Bank",
    providerHint: "Which gateway these credentials belong to.",
    status: "Status",
    statuses: {
      PENDING: "Stored, not live yet",
      ACTIVE: "Live",
      DISABLED: "Switched off",
    },
    merchantRef: "Merchant ID",
    merchantRefHint: "The shop identifier the bank gave the client.",
    currency: "Currency",
    returnUrl: "Return address",
    returnUrlHint:
      "Where the customer lands after paying. Leave empty to use the website's own thank-you page.",
    connectedAt: "Connected on",
    clientId: "Client ID",
    clientSecret: "Client secret",
    secretWriteOnly:
      "A secret is stored. It cannot be read back, so replacing this account means typing both the ID and the secret again.",
    extraTitle: "Bank-specific settings",
    extraHint: "Leave these empty unless the bank gave the client different ones.",
    baseUrl: "API address",
    baseUrlHint: "Only if the client is on a test or non-standard endpoint.",
    tokenUrl: "Token address",
    tokenUrlHint: "Where BOG issues access tokens.",
    callbackPublicKey: "Callback public key",
    callbackPublicKeyHint:
      "BOG signs its payment callbacks with this. Without it we cannot tell a real confirmation from a forged one.",
    connect: "Connect account",
    replace: "Replace account",
    saving: "Saving…",
    saved: "Connected. This website can now take online orders.",
    disable: "Disconnect",
    disableConfirm:
      "This website stops taking new orders. Orders already at the bank are left alone. Continue?",
    disableHint:
      "The account is switched off rather than deleted, so old orders can still say which bank took the money.",
    disabling: "Disconnecting…",
    noProviders: "This server has no payment gateways configured.",
    required: "Both the client ID and the secret are needed.",
    notConfigured:
      "This server has no credential key configured, so bank credentials cannot be stored yet. Set bbloom.payments.credential-key first.",
    unknownProvider: "This server does not have a gateway for that bank.",
    failed: "We could not save the account. Please try again.",
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
  ads: {
    title: "Ads",
    subtitle:
      "Facebook and Instagram campaigns, run for clients out of the bbloom ad account.",
    loadFailed: "We could not read the advertising status.",
    retry: "Try again",
    channels: { FACEBOOK: "Facebook", INSTAGRAM: "Instagram" },
    statuses: {
      ACTIVE: "Running",
      PAUSED: "Paused",
      FAILED: "Failed",
      DELETED: "Deleted",
    },
    status: {
      title: "Advertising",
      checkedAt: "Checked",
      refresh: "Refresh",
      configured: "Set up",
      notConfigured: "Not set up",
      configuredNote: "Our Meta credentials are complete.",
      notConfiguredNote:
        "No Meta credentials, so nothing here can launch anything. This is a setting on our side, not a fault at Meta — there is nothing to go and check in the ad account.",
      disabledNote:
        "Advertising is switched off in the server config. The credentials are there; nothing will use them.",
      reachable: "Meta answered",
      unreachable: "Meta did not answer",
      unreachableNote:
        "Our settings look complete but the ad account could not be read just now. Campaigns already running are unaffected — this stops us launching and stops us reporting, not the ads themselves.",
      unaskedNote: "Meta was not asked, because we are not set up to ask.",
      instagramOn: "Instagram connected",
      instagramOff: "Facebook only",
      accountStatus: "Account status",
      accountStatuses: {
        "1": "Active",
        "2": "Disabled",
        "3": "Unsettled — a payment has failed",
        "7": "Pending risk review",
        "8": "Pending settlement",
        "9": "In grace period",
        "100": "Pending closure",
        "101": "Closed",
      },
      accountStatusUnknown: "Meta reports a status we do not have a name for.",
      accountStatusNote:
        "Anything other than Active will stop campaigns without warning, usually by rejecting the next charge.",
      adAccount: "Ad account",
      apiVersion: "API version",
      page: "Facebook page",
      instagram: "Instagram account",
      tokenOwner: "Token belongs to",
      timezone: "Ad account timezone",
      budgetCeiling: "Daily budget ceiling",
      budgetCeilingNoCurrency:
        "The ceiling is in the ad account's currency, which we could not read.",
      liveCampaigns: (count) =>
        count === 1
          ? "1 campaign is spending money right now"
          : `${count} campaigns are spending money right now`,
      noneLive: "Nothing is running.",
      liveTestTitle: (count) =>
        count === 1
          ? "1 test campaign is live and billing us"
          : `${count} test campaigns are live and billing us`,
      liveTestBody:
        "Test campaigns are ours, not a client's, so this spend comes out of bbloom. Somebody launched a test and did not delete it. Delete it below.",
    },
    test: {
      title: "Launch a test campaign",
      body: "Runs the whole path we use for a client — campaign, ad set, creative, ad — against the real ad account, and reports what Meta did with it.",
      warning:
        "This is not a dry run. It creates a live campaign at the smallest budget the account allows and it starts spending immediately. Delete it when you have your answer.",
      channelLabel: "Where to run it",
      pickChannel: "Choose at least one.",
      instagramUnavailable:
        "No Instagram account is connected, so only Facebook can be tested.",
      destinationLabel: "Where the ad points",
      destinationHint:
        "Optional. Leave it blank and the server picks a destination — you do not need to send real traffic anywhere to learn whether this works.",
      badUrl: "That needs to be a full address starting http:// or https://.",
      launch: "Launch a real test campaign",
      launching: "Launching…",
      launchingNote:
        "This waits for Meta to build four objects in turn, which takes a few seconds.",
      confirm:
        "This launches a REAL campaign that starts spending money immediately. You will need to delete it afterwards. Continue?",
      launchedTitle: "Launched — and spending",
      launchedBody:
        "Meta accepted the whole chain, which is the answer this button exists to give. It is now live. Delete it below.",
      failedTitle: "Meta refused it",
      failedBody:
        "This is the same failure a client's campaign would hit right now.",
      notConfiguredTitle: "Nothing was launched",
      notConfiguredBody:
        "No Meta credentials are configured, so nothing was attempted and nothing is spending. There is no fault to go and find.",
      stillSpendingTitle: "Something is live at Meta",
      tokenDeadNoSpend:
        "Nothing was created, so there is nothing here to delete. Reconnect the account and run this again.",
      stillSpendingBody:
        "It failed part-way through, after the campaign already existed. It is running and costing money despite the failure. Delete it now.",
      attemptedAt: "Attempted",
      budget: "Daily budget",
      rateLimited:
        "That is as many test campaigns as one admin may launch in an hour. The limit is there because each one spends money.",
      rateLimitedUntil: (when) => `You can launch another test at ${when}.`,
      notPermitted: "This account may not launch test campaigns.",
      requestFailed: "The test could not be run. Try again.",
    },
    testList: {
      title: "Test campaigns",
      body: "Every test ever launched, newest first. A deleted row is the evidence somebody dealt with it, which is why they stay here.",
      empty: "No test campaigns have been launched.",
      colWhen: "Launched",
      colName: "Name",
      colChannels: "Where",
      colBudget: "Daily budget",
      colStatus: "Status",
      colAction: "",
      spending: "Spending",
      delete: "Delete at Meta",
      deleting: "Deleting…",
      deleteConfirm:
        "Delete this campaign at Meta? It stops spending as soon as this goes through.",
      deleteFailed: "We could not delete that campaign.",
    },
    refusals: {
      ADS_PLAN_REQUIRED:
        "This site's plan does not include advertising. Move it to a plan that does before launching anything.",
      ADS_PLAN_INACTIVE:
        "This site's subscription has lapsed, so advertising is off. Settle it before launching anything.",
      PLAN_WITHOUT_ADS:
        "That plan does not include advertising. Choose one that does.",
      ADS_NOT_IN_PLAN:
        "That plan does not include advertising. Choose one that does.",
      ADS_CHANNEL_NOT_IN_PLAN:
        "This site's plan does not sell that channel. Simple is Facebook only — Instagram needs Classic or above.",
      ADS_IMPRESSION_LIMIT:
        "This site has used the impressions its plan includes. Move it up a plan, or wait for the next period.",
      ADS_NOT_CONFIGURED:
        "Meta credentials are not set up, so nothing can be launched. This is ours to fix, not the client's.",
      INSTAGRAM_NOT_CONFIGURED:
        "No Instagram account is connected. Launch this on Facebook only, or connect one first.",
      CAMPAIGN_NOT_LIVE: "That campaign is not running, so this does nothing.",
      CAMPAIGN_NOT_LAUNCHED:
        "This campaign never reached Meta, so there is nothing there to read or change.",
      META_TOKEN_INVALID:
        "Meta says our access token is no longer valid, so nothing can reach the ad account. Reconnect the Facebook account — this is ours to fix and takes minutes.",
      META_UNAVAILABLE:
        "Meta refused the request. Nothing here is wrong with the client's plan, so retry, or change the campaign if Meta names something in it:",
      RATE_LIMITED: "Too many requests. Wait a moment and try again.",
    },
    tools: "Test tools",
    backToCampaigns: "Back to campaigns",
    campaigns: {
      title: "Campaigns",
      subtitle:
        "Client advertising. Test campaigns are kept out of this list — they are ours, and one sitting here gets mistaken for work somebody paid for.",
      none: "No campaigns yet.",
      create: "New campaign",
      filterStatus: "Status",
      filterAll: "All",
      colWhen: "Launched",
      colSite: "Site",
      colName: "Name",
      colChannels: "Where",
      colBudget: "Daily",
      colSpend: "Spent",
      colStatus: "Status",
      notYet: "Not yet",
      asOf: (when) => `as of ${when}`,
      spending: "Spending",
      pageOf: (page, total) => `Page ${page} of ${total}`,
      prev: "Previous",
      next: "Next",
    },
    form: {
      title: "New campaign",
      subtitle:
        "Builds the campaign, ad set, creative and ad at Meta in one go, for one client.",
      warning:
        "There is no draft and no paused-first step. The moment this goes through, the client's money is being spent. Check the budget before you press it.",
      confirm:
        "This launches the campaign immediately and starts spending the client's money today. Continue?",
      siteLabel: "Client site",
      siteHint:
        "The advertising counts against this site's plan, and a blank destination points at this site.",
      sitePlaceholder: "Choose a site",
      nameLabel: "Campaign name",
      nameHint: "Ours, for finding it later. Visitors never see it.",
      channelLabel: "Where to run it",
      pickChannel: "Choose at least one.",
      budgetLabel: "Daily budget",
      budgetHint:
        "What Meta may spend each day, in the ad account's currency. Enter it in full units — 50 means fifty.",
      budgetCeiling: (amount) => `The ceiling is ${amount} a day.`,
      budgetOverCeiling: "That is above the daily ceiling.",
      budgetTooSmall: "The daily budget has to be more than nothing.",
      destinationLabel: "Where the ad points",
      destinationHint:
        "Optional. Leave it blank to send people to the client's own site.",
      badUrl: "That needs to be a full address starting http:// or https://.",
      headlineLabel: "Headline",
      primaryTextLabel: "Ad text",
      imageLabel: "Image link",
      countryLabel: "Country",
      cityLabel: "City",
      cityHint: "Optional. Leave blank to cover the whole country.",
      ageLabel: "Ages",
      ageTo: "to",
      required: "Fill this in.",
      create: "Launch this campaign",
      creating: "Launching…",
      creatingNote: "Meta builds four objects in turn; this takes a few seconds.",
      cancel: "Cancel",
      createFailed: "The campaign could not be launched.",
      allowanceTitle: "What this site may run",
      allowanceNone: "This site's plan does not include advertising.",
      allowanceImpressions: (used, limit) =>
        `${used} of ${limit} impressions used`,
      allowanceImpressionsUnmetered: (used) =>
        `${used} impressions delivered, on an unmetered plan`,
      allowanceChannels: (channels) => `Channels: ${channels}`,
      allowanceSpent:
        "This site has used the impressions its plan includes. Launching will be refused until the next period.",
      allowanceOver: (used, limit) =>
        `Over the plan: ${used} delivered against ${limit} included. Campaigns are checked at launch and never reserved, so the last one of a period can run past the ceiling — worth a word with the client before the next launch.`,
      allowanceStale:
        "Counts only what Meta has reported back to us. Reported campaigns refresh hourly, but one whose figures have never arrived contributes nothing at all rather than a partial number — so this is a floor, not an audit.",
      channelNotInPlan: "Not included in this site's plan.",
    },
    detail: {
      pause: "Pause",
      pausing: "Pausing…",
      pauseConfirm: "Pause this campaign? It stops spending straight away.",
      resume: "Resume",
      resuming: "Resuming…",
      resumeConfirm:
        "Resume this campaign? It starts spending again immediately.",
      delete: "Delete at Meta",
      deleting: "Deleting…",
      deleteConfirm:
        "Delete this campaign at Meta? This cannot be undone and the client will need a new one.",
      actionFailed: "That did not go through.",
      spendingTitle: "This is spending money right now",
      spendingBody:
        "It failed part-way through, after the campaign already existed at Meta — so it is running despite the failure. Pause or delete it.",
      notLaunched:
        "This campaign never reached Meta, so there is nothing running and nothing to read.",
      site: "Site",
      createdBy: "Launched by",
      destination: "Points at",
      headline: "Headline",
      primaryText: "Ad text",
      audience: "Audience",
      ages: (from, to) => `ages ${from}–${to}`,
      launched: "Launched",
      paused: "Paused",
      deletedAt: "Deleted",
      created: "Created",
      budget: "Daily budget",
      metaTitle: "Meta identifiers",
      metaCampaign: "Campaign",
      metaAdSet: "Ad set",
      metaCreative: "Creative",
      metaAd: "Ad",
      notFound: "We could not find that campaign.",
    },
    insights: {
      title: "Results",
      refresh: "Read again",
      notYet: "Nothing reported yet",
      notYetBody:
        "Meta has not sent figures for this campaign. That is normal for the first hours — it does not mean nothing is happening, and it is not the same as a zero.",
      emptyReport:
        "Meta answered but every figure was empty. A campaign that has plainly been running for hours should not read like this — it points at us asking Meta for the wrong fields, not at a quiet campaign. Worth someone looking.",
      asOf: (when) => `Read ${when}`,
      cached:
        "Meta's own reporting lags by hours and gets restated afterwards, so treat these as an indication rather than a bill.",
      impressions: "Impressions",
      reach: "People reached",
      clicks: "Clicks",
      ctr: "Click rate",
      cpc: "Cost per click",
      spend: "Spent",
      loadFailed: "We could not read the results.",
      loadFailedNeverRead:
        "This campaign has never been read successfully either, so the same failure has most likely been happening since it launched. Nothing else shows this: the hourly refresh logs a failure and moves on, the list still reads \"not yet\", and the site's impression count leaves this campaign out entirely. Worth checking the logs rather than waiting.",
      notLaunched: "This campaign never reached Meta, so there is nothing to read.",
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
  plans: {
    title: "Pricing plans",
    subtitle: "What the pricing page offers and what the panel charges.",
    create: "New plan",
    empty: "No plans yet. Create the first one.",
    back: "All plans",
    newTitle: "New plan",
    editTitle: "Edit plan",
    code: "Code",
    codeHint:
      "The identifier subscriptions are recorded against. Changing it on a plan clients already bought will orphan their records.",
    price: "Price",
    priceHint:
      "What the client is actually charged. Enter it in whole currency, e.g. 199 — the copy below is never billed against.",
    currency: "Currency",
    billingPeriod: "Billing period",
    periods: { MONTHLY: "Monthly", YEARLY: "Yearly" },
    sortOrder: "Position",
    sortOrderHint: "Lower numbers come first on the pricing page.",
    featured: "Highlight as most popular",
    featuredHint: "Only one plan should carry this.",
    active: "Shown on the pricing page",
    activeHint: "Turn this off to retire a plan without deleting it.",
    purchasable: "Clients can buy it themselves",
    purchasableHint:
      "Turn this off for a negotiated tier: it stays on the pricing page with its contact-us wording, but no checkout.",
    comingSoon: "Coming soon",
    comingSoonHint:
      "Advertises the plan in full — price, features and all — with the buy button switched off. Checkout is refused, not just hidden. Anyone already subscribed keeps their plan and keeps renewing, so this only closes the door to new sign-ups. A sale can be set up now and will be running the day you turn this off.",
    comingSoonBeatsFeatured:
      "This plan is also marked most popular. Only the coming-soon badge will show, since a plan nobody can buy yet cannot be the popular choice.",
    comingSoonHidden:
      "This plan is not shown on the pricing page, so nobody will see that it is coming. Turn on \"Shown on the pricing page\" as well if you meant to announce it.",
    status: "Status",
    translations: "Copy",
    translationsHint:
      "Both languages are edited here. A missing language falls back to the plan code on the public site.",
    name: "Name",
    displayPrice: "Displayed price",
    displayPriceHint:
      'What visitors read, e.g. "$199" or "negotiable". Copy only — never billed.',
    displayPriceAuto:
      "Worked out from Price and Currency, so it cannot drift when someone reprices. Only a negotiated tier needs wording of its own here.",
    cadence: "Cadence wording",
    cadenceHint: 'Shown after the price, e.g. "per month". Leave empty for none.',
    summary: "Summary",
    cta: "Button label",
    features: "Features",
    featuresHint: "One per line, in the order they should appear.",
    addFeature: "Add feature",
    removeFeature: "Remove",
    languageNames: { en: "English", ka: "Georgian" },
    edit: "Edit",
    delete: "Delete plan",
    deleting: "Deleting…",
    deleteConfirm:
      "Delete this plan? Only do this to remove a mistake. To withdraw a plan clients have already bought, turn off “Shown on the pricing page” instead.",
    deleteBlocked:
      "This plan can't be deleted: a subscription or a past payment still names it — including payments from subscriptions that have since been cancelled, which is why it may not appear on any site today. Deleting it would leave those payments with nothing to explain them. Turn off “Shown on the pricing page” and “Clients can buy it themselves” instead: that withdraws it completely and keeps the history readable.",
    codeRequired: "Give the plan a code.",
    priceInvalid: "Enter the price as a number, e.g. 199.",
    nameRequired: "Every language needs a name.",
    saveFailed: "The plan could not be saved.",
    discount: "Sale price",
    discountHint:
      "Takes a percentage off this plan for everyone, on the pricing page and at checkout. Leave the percentage blank for no sale.",
    discountPercent: "Percent off",
    discountPercentHint: "A whole number from 1 to 100. Blank means no sale.",
    discountStarts: "First day",
    discountStartsHint: "Leave blank to start straight away.",
    discountEnds: "Last day",
    discountEndsHint:
      "The last day the sale runs, included. Leave blank to run until you stop it.",
    discountPreview: "Clients will pay",
    discountNotLive:
      "Not running right now — this is what the price will be during the sale.",
    discountInvalid: "Enter the discount as a whole number from 1 to 100.",
    discountNotPurchasable:
      "A plan that clients cannot buy has no listed price to discount. Turn on “Clients can buy this” first.",
    discountWindowWithoutPercent:
      "Set a percentage, or clear the sale dates.",
    discountWindowBackwards: "The sale must end after it starts.",
  },
  promoCodes: {
    title: "Discounts",
    subtitle:
      "Codes clients type at checkout. A sale price on a plan and a code never add up — whichever is better for the client is the one that applies.",
    create: "New code",
    empty: "No codes yet.",
    back: "← All codes",
    newTitle: "New code",
    editTitle: "Edit code",
    code: "Code",
    codeHint:
      "What the client types. Saved in capitals, and matched however they type it.",
    percentOff: "Percent off",
    percentHint: "A whole number from 1 to 100.",
    expiresAt: "Expires",
    expiresHint:
      "The last day the code works, included. Leave blank to never expire.",
    expires: "Expires",
    maxRedemptions: "Use limit",
    maxHint: "Leave blank for no limit.",
    used: "Used",
    created: "Created",
    active: "Code is switched on",
    activeHint:
      "Off means it stops working, without deleting it or losing the record of who used it.",
    status: "Status",
    usable: "Working",
    notUsable: "Not working",
    appliesTo: "Plans",
    appliesToHint:
      "Tick plans to limit the code to them. Tick nothing and it works on every plan.",
    allPlans: "All plans",
    allPlansNotice: "Nothing ticked, so this code works on every plan.",
    edit: "Edit",
    delete: "Delete code",
    deleting: "Deleting…",
    deleteConfirm:
      "Delete this code? If anyone has used it, switch it off instead.",
    deleteBlocked:
      "This code cannot be deleted because it has been used on a payment. Switch it off instead.",
    codeRequired: "Give the code a name clients can type.",
    percentInvalid: "Enter the discount as a whole number from 1 to 100.",
    maxInvalid: "The use limit must be a whole number, or blank for no limit.",
    saveFailed: "The code could not be saved.",
  },
  newCustomerOffer: {
    title: "New customer offer",
    subtitle:
      "A discount on a client's very first paid plan. It applies once per account, ever, and only to the first billing period — every renewal after that is the usual price.",
    percentOff: "Percent off",
    percentHint: "A whole number from 1 to 99.",
    active: "Offer is switched on",
    activeHint:
      "Off means new clients stop being offered it. Discounts already given are untouched, and nobody is re-charged.",
    status: "Status",
    running: "Running",
    notRunning: "Not running",
    updated: "Last changed",
    neverUpdated: "Never changed",
    rules:
      "Only a client who has never paid for a plan qualifies, and buying a second plan later is full price. It never adds up with a sale price or a discount code — whichever is best for the client is the one that applies.",
    percentInvalid: "Enter the discount as a whole number from 1 to 99.",
    loadFailed: "The offer could not be loaded.",
    saveFailed: "The offer could not be saved.",
  },
};

const ka: AdminStrings = {
  brand: "bbloom გუნდი",
  nav: { sites: "საიტები", newSite: "ახალი საიტი", system: "სისტემა", accounts: "ანგარიშები", plans: "პაკეტები", promoCodes: "ფასდაკლებები", newCustomerOffer: "ახალი კლიენტები", ads: "რეკლამა" },
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
    help: "ეს bbloom-ის გუნდის სივრცეა. კლიენტები შედიან bbloom.ge-ზე.",
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
      "ვის გაეგზავნებოდა წერილი, როცა შემოვა მოთხოვნა ან ჯავშანი. გაგზავნა ამჟამად სერვერზე მთლიანად გამორთულია, ანუ წერილი რეალურად არ იგზავნება და ეს მხოლოდ მისამართია, სადაც წავიდოდა. წერილი იწერება საიტის ენაზე, ამიტომ მფლობელი ყოველთვის ერთსა და იმავე ენაზე კითხულობს, პასუხი კი პირდაპირ მომხმარებელს მიდის.",
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
  payments: {
    title: "საბანკო ანგარიში ონლაინ შეკვეთებისთვის",
    hint: "კლიენტის საკუთარი საბანკო ხელშეკრულების მერჩანტის მონაცემები.",
    ownership:
      "ეს კლიენტის საბანკო ანგარიშია. მყიდველი პირდაპირ კლიენტს უხდის — თანხა bbloom-ს არ გადმოსდის და აქედან მისი დაბრუნება შეუძლებელია.",
    consequence:
      "ანგარიშის მიერთება სწორედ ის ნაბიჯია, რომელიც ამ ვებგვერდს ონლაინ შეკვეთების მიღების საშუალებას აძლევს. მოხსნა ახალ შეკვეთებს აჩერებს.",
    connected: "მიერთებულია",
    notConnected: "საბანკო ანგარიში მიერთებული არ არის — ვებგვერდი ვერ გაყიდის.",
    provider: "ბანკი",
    providerHint: "რომელ გეითვეის ეკუთვნის ეს მონაცემები.",
    status: "სტატუსი",
    statuses: {
      PENDING: "შენახულია, ჯერ არ მუშაობს",
      ACTIVE: "აქტიურია",
      DISABLED: "გამორთულია",
    },
    merchantRef: "მერჩანტის ID",
    merchantRefHint: "მაღაზიის იდენტიფიკატორი, რომელიც ბანკმა კლიენტს მისცა.",
    currency: "ვალუტა",
    returnUrl: "დაბრუნების მისამართი",
    returnUrlHint:
      "სად აღმოჩნდება მყიდველი გადახდის შემდეგ. ცარიელი დატოვეთ, რომ ვებგვერდის საკუთარი გვერდი გამოიყენოს.",
    connectedAt: "მიერთების თარიღი",
    clientId: "Client ID",
    clientSecret: "Client secret",
    secretWriteOnly:
      "საიდუმლო შენახულია. მისი უკან წაკითხვა შეუძლებელია, ამიტომ ანგარიშის შეცვლისას ID-ც და საიდუმლოც თავიდან უნდა აკრიფოთ.",
    extraTitle: "ბანკის სპეციფიკური პარამეტრები",
    extraHint: "დატოვეთ ცარიელი, თუ ბანკმა კლიენტს სხვა მისამართები არ მისცა.",
    baseUrl: "API-ის მისამართი",
    baseUrlHint: "მხოლოდ მაშინ, თუ კლიენტი სატესტო ან არასტანდარტულ მისამართზეა.",
    tokenUrl: "ტოკენის მისამართი",
    tokenUrlHint: "სად გასცემს BOG წვდომის ტოკენს.",
    callbackPublicKey: "Callback-ის საჯარო გასაღები",
    callbackPublicKeyHint:
      "BOG ამ გასაღებით ხელს აწერს გადახდის დადასტურებებს. მის გარეშე ნამდვილ დადასტურებას გაყალბებულისგან ვერ გავარჩევთ.",
    connect: "ანგარიშის მიერთება",
    replace: "ანგარიშის ჩანაცვლება",
    saving: "ინახება…",
    saved: "მიერთდა. ვებგვერდს ახლა ონლაინ შეკვეთების მიღება შეუძლია.",
    disable: "მოხსნა",
    disableConfirm:
      "ვებგვერდი ახალ შეკვეთებს აღარ მიიღებს. ბანკში უკვე დაწყებულ შეკვეთებს ეს არ შეეხება. გავაგრძელოთ?",
    disableHint:
      "ანგარიში იშლება არა, არამედ ითიშება — რომ ძველმა შეკვეთებმა შეძლონ თქვან, რომელმა ბანკმა მიიღო თანხა.",
    disabling: "იხსნება…",
    noProviders: "ამ სერვერზე გადახდის გეითვეი კონფიგურირებული არ არის.",
    required: "საჭიროა ორივე — client ID და საიდუმლო.",
    notConfigured:
      "სერვერზე კრედენშალების გასაღები არ არის მითითებული, ამიტომ საბანკო მონაცემების შენახვა ჯერ შეუძლებელია. ჯერ დააყენეთ bbloom.payments.credential-key.",
    unknownProvider: "ამ სერვერს ამ ბანკის გეითვეი არ აქვს.",
    failed: "ანგარიშის შენახვა ვერ მოხერხდა. სცადეთ თავიდან.",
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
  ads: {
    title: "რეკლამა",
    subtitle:
      "Facebook-ისა და Instagram-ის კამპანიები, რომლებსაც კლიენტებისთვის bbloom-ის სარეკლამო ანგარიშიდან ვუშვებთ.",
    loadFailed: "რეკლამის სტატუსის წაკითხვა ვერ მოხერხდა.",
    retry: "კიდევ სცადეთ",
    channels: { FACEBOOK: "Facebook", INSTAGRAM: "Instagram" },
    statuses: {
      ACTIVE: "მიმდინარე",
      PAUSED: "შეჩერებული",
      FAILED: "ჩავარდა",
      DELETED: "წაშლილი",
    },
    status: {
      title: "რეკლამა",
      checkedAt: "შემოწმდა",
      refresh: "განახლება",
      configured: "მორგებულია",
      notConfigured: "არ არის მორგებული",
      configuredNote: "Meta-ს მონაცემები სრულადაა შევსებული.",
      notConfiguredNote:
        "Meta-ს მონაცემები არ არის, ამიტომ აქედან ვერაფერი გაეშვება. ეს ჩვენი მხარის პარამეტრია და არა შეცდომა Meta-ში — სარეკლამო ანგარიშში შესამოწმებელი არაფერია.",
      disabledNote:
        "რეკლამა სერვერის კონფიგურაციაში გამორთულია. მონაცემები ადგილზეა, უბრალოდ არავინ იყენებს.",
      reachable: "Meta გვიპასუხა",
      unreachable: "Meta არ გვიპასუხა",
      unreachableNote:
        "ჩვენი პარამეტრები სრულია, მაგრამ სარეკლამო ანგარიში ამ წუთში ვერ წაიკითხა. უკვე მიმდინარე კამპანიებზე ეს არ მოქმედებს — ჩერდება გაშვება და ანგარიშგება, თავად რეკლამები არა.",
      unaskedNote: "Meta-ს არ ვკითხეთ, რადგან კითხვისთვის მორგებული არ ვართ.",
      instagramOn: "Instagram მიერთებულია",
      instagramOff: "მხოლოდ Facebook",
      accountStatus: "ანგარიშის სტატუსი",
      accountStatuses: {
        "1": "აქტიური",
        "2": "გათიშული",
        "3": "დავალიანება — გადახდა ჩავარდა",
        "7": "რისკის შემოწმების მოლოდინში",
        "8": "ანგარიშსწორების მოლოდინში",
        "9": "საშეღავათო პერიოდში",
        "100": "დახურვის მოლოდინში",
        "101": "დახურული",
      },
      accountStatusUnknown: "Meta აბრუნებს სტატუსს, რომლის სახელიც ჩვენთან არ არის.",
      accountStatusNote:
        "„აქტიურის“ გარდა ნებისმიერი მდგომარეობა კამპანიებს გაფრთხილების გარეშე გააჩერებს — ჩვეულებრივ შემდეგი გადახდის უარყოფით.",
      adAccount: "სარეკლამო ანგარიში",
      apiVersion: "API-ის ვერსია",
      page: "Facebook გვერდი",
      instagram: "Instagram ანგარიში",
      tokenOwner: "ტოკენის მფლობელი",
      timezone: "სარეკლამო ანგარიშის დროის სარტყელი",
      budgetCeiling: "დღიური ბიუჯეტის ჭერი",
      budgetCeilingNoCurrency:
        "ჭერი სარეკლამო ანგარიშის ვალუტაშია, რომელიც ვერ წავიკითხეთ.",
      liveCampaigns: (count) => `${count} კამპანია ახლა ხარჯავს ფულს`,
      noneLive: "არაფერი მიმდინარეობს.",
      liveTestTitle: (count) => `${count} სატესტო კამპანია გაშვებულია და ფულს გვხარჯავს`,
      liveTestBody:
        "სატესტო კამპანიები ჩვენია და არა კლიენტის, ამიტომ ამ ხარჯს bbloom იხდის. ვიღაცამ ტესტი გაუშვა და არ წაშალა. წაშალეთ ქვემოთ.",
    },
    test: {
      title: "სატესტო კამპანიის გაშვება",
      body: "გადის მთელ იმ გზას, რომელსაც კლიენტისთვის ვიყენებთ — კამპანია, სარეკლამო ჯგუფი, კრეატივი, რეკლამა — რეალურ სარეკლამო ანგარიშზე და გვეუბნება, რა უყო მას Meta-მ.",
      warning:
        "ეს არ არის სიმულაცია. იქმნება ცოცხალი კამპანია ანგარიშისთვის დაშვებული ყველაზე მცირე ბიუჯეტით და მაშინვე იწყებს ხარჯვას. პასუხის მიღების შემდეგ წაშალეთ.",
      channelLabel: "სად გავუშვათ",
      pickChannel: "აირჩიეთ მინიმუმ ერთი.",
      instagramUnavailable:
        "Instagram ანგარიში მიერთებული არ არის, ამიტომ მხოლოდ Facebook-ის ტესტირებაა შესაძლებელი.",
      destinationLabel: "სად მიჰყავს რეკლამას",
      destinationHint:
        "სურვილისამებრ. თუ ცარიელს დატოვებთ, მისამართს სერვერი აირჩევს — იმის გასაგებად, მუშაობს თუ არა ეს, რეალური ტრაფიკის გაგზავნა საჭირო არაა.",
      badUrl: "საჭიროა სრული მისამართი, რომელიც http:// ან https://-ით იწყება.",
      launch: "რეალური სატესტო კამპანიის გაშვება",
      launching: "იშვება…",
      launchingNote:
        "ელოდება, სანამ Meta თანმიმდევრობით ოთხ ობიექტს შექმნის — რამდენიმე წამი სჭირდება.",
      confirm:
        "ეს უშვებს რეალურ კამპანიას, რომელიც მაშინვე იწყებს ფულის ხარჯვას. შემდეგ თქვენ მოგიწევთ მისი წაშლა. გავაგრძელოთ?",
      launchedTitle: "გაშვებულია — და ხარჯავს",
      launchedBody:
        "Meta-მ მთელი ჯაჭვი მიიღო — სწორედ ეს პასუხი გვინდოდა ამ ღილაკისგან. ახლა ის ცოცხალია. წაშალეთ ქვემოთ.",
      failedTitle: "Meta-მ უარი თქვა",
      failedBody: "ზუსტად ამ შეცდომას წააწყდებოდა ახლა კლიენტის კამპანიაც.",
      notConfiguredTitle: "არაფერი გაშვებულა",
      notConfiguredBody:
        "Meta-ს მონაცემები არ არის მითითებული, ამიტომ ცდა არ ყოფილა და არაფერი იხარჯება. საძებნელი შეცდომა არ არსებობს.",
      stillSpendingTitle: "Meta-ში რაღაც ცოცხალია",
      tokenDeadNoSpend:
        "არაფერი შექმნილა, ამიტომ წასაშლელიც არაფერია. თავიდან მიაერთეთ ანგარიში და ისევ სცადეთ.",
      stillSpendingBody:
        "შუა გზაზე ჩავარდა, მას შემდეგ რაც კამპანია უკვე შეიქმნა. ჩავარდნის მიუხედავად ის მუშაობს და ფულს ხარჯავს. წაშალეთ ახლავე.",
      attemptedAt: "ცდა",
      budget: "დღიური ბიუჯეტი",
      rateLimited:
        "ერთ საათში ერთ ადმინს ამაზე მეტი სატესტო კამპანიის გაშვება არ შეუძლია. ლიმიტი იმიტომაა, რომ თითოეული ფულს ხარჯავს.",
      rateLimitedUntil: (when) => `შემდეგი ტესტის გაშვება შეგეძლებათ ${when}.`,
      notPermitted: "ამ ანგარიშს სატესტო კამპანიის გაშვება არ შეუძლია.",
      requestFailed: "ტესტი ვერ შესრულდა. სცადეთ თავიდან.",
    },
    testList: {
      title: "სატესტო კამპანიები",
      body: "ყველა ოდესმე გაშვებული ტესტი, ახლიდან ძველისკენ. წაშლილი ჩანაწერი იმის დასტურია, რომ ვიღაცამ მოაგვარა — ამიტომ რჩება აქ.",
      empty: "სატესტო კამპანია არ გაშვებულა.",
      colWhen: "გაშვებული",
      colName: "დასახელება",
      colChannels: "სად",
      colBudget: "დღიური ბიუჯეტი",
      colStatus: "სტატუსი",
      colAction: "",
      spending: "ხარჯავს",
      delete: "წაშლა Meta-ში",
      deleting: "იშლება…",
      deleteConfirm:
        "წავშალოთ ეს კამპანია Meta-ში? შესრულებისთანავე ხარჯვას შეწყვეტს.",
      deleteFailed: "კამპანიის წაშლა ვერ მოხერხდა.",
    },
    refusals: {
      ADS_PLAN_REQUIRED:
        "ამ საიტის პაკეტი რეკლამას არ მოიცავს. გაშვებამდე გადაიყვანეთ ისეთ პაკეტზე, რომელიც მოიცავს.",
      ADS_PLAN_INACTIVE:
        "ამ საიტის გამოწერა შეწყვეტილია, ამიტომ რეკლამა გამორთულია. გაშვებამდე მოაწესრიგეთ.",
      PLAN_WITHOUT_ADS:
        "ეს პაკეტი რეკლამას არ მოიცავს. აირჩიეთ ისეთი, რომელიც მოიცავს.",
      ADS_NOT_IN_PLAN:
        "ეს პაკეტი რეკლამას არ მოიცავს. აირჩიეთ ისეთი, რომელიც მოიცავს.",
      ADS_CHANNEL_NOT_IN_PLAN:
        "ამ საიტის პაკეტი ამ არხს არ მოიცავს. Simple მხოლოდ Facebook-ია — Instagram-ისთვის საჭიროა Classic ან ზემოთ.",
      ADS_IMPRESSION_LIMIT:
        "ამ საიტმა პაკეტში შემავალი ჩვენებები ამოწურა. აწიეთ პაკეტი ან დაელოდეთ შემდეგ პერიოდს.",
      ADS_NOT_CONFIGURED:
        "Meta-ს მონაცემები არ არის მითითებული, ამიტომ ვერაფერი გაეშვება. ეს ჩვენი გამოსასწორებელია და არა კლიენტის.",
      INSTAGRAM_NOT_CONFIGURED:
        "Instagram ანგარიში მიერთებული არ არის. გაუშვით მხოლოდ Facebook-ზე ან ჯერ მიაერთეთ ანგარიში.",
      CAMPAIGN_NOT_LIVE: "ეს კამპანია არ მიმდინარეობს, ამიტომ ეს ვერაფერს შეცვლის.",
      CAMPAIGN_NOT_LAUNCHED:
        "ეს კამპანია Meta-მდე არ მისულა, ამიტომ იქ წასაკითხი ან შესაცვლელი არაფერია.",
      META_TOKEN_INVALID:
        "Meta ამბობს, რომ ჩვენი წვდომის ტოკენი აღარ მოქმედებს, ამიტომ სარეკლამო ანგარიშამდე ვერაფერი აღწევს. თავიდან მიაერთეთ Facebook-ის ანგარიში — ეს ჩვენი გამოსასწორებელია და რამდენიმე წუთს იღებს.",
      META_UNAVAILABLE:
        "Meta-მ მოთხოვნა უარყო. კლიენტის პაკეტს ამასთან კავშირი არ აქვს — სცადეთ თავიდან, ან შეცვალეთ კამპანია, თუ Meta მასში კონკრეტულ რამეს ასახელებს:",
      RATE_LIMITED: "ძალიან ბევრი მოთხოვნა. დაიცადეთ და სცადეთ თავიდან.",
    },
    tools: "სატესტო ხელსაწყოები",
    backToCampaigns: "კამპანიებზე დაბრუნება",
    campaigns: {
      title: "კამპანიები",
      subtitle:
        "კლიენტების რეკლამა. სატესტო კამპანიები ამ სიაში არ ხვდება — ისინი ჩვენია და აქ მოხვედრილს ადვილად ჩათვლიან ანაზღაურებულ სამუშაოდ.",
      none: "კამპანია ჯერ არ არის.",
      create: "ახალი კამპანია",
      filterStatus: "სტატუსი",
      filterAll: "ყველა",
      colWhen: "გაშვებული",
      colSite: "საიტი",
      colName: "დასახელება",
      colChannels: "სად",
      colBudget: "დღიური",
      colSpend: "დახარჯული",
      colStatus: "სტატუსი",
      notYet: "ჯერ არა",
      asOf: (when) => `მდგომარეობით ${when}`,
      spending: "ხარჯავს",
      pageOf: (page, total) => `გვერდი ${page} / ${total}`,
      prev: "წინა",
      next: "შემდეგი",
    },
    form: {
      title: "ახალი კამპანია",
      subtitle:
        "ერთ ჯერზე ქმნის კამპანიას, სარეკლამო ჯგუფს, კრეატივსა და რეკლამას Meta-ში, ერთი კლიენტისთვის.",
      warning:
        "მონახაზი და „ჯერ შეჩერებული“ ეტაპი არ არსებობს. შესრულებისთანავე იხარჯება კლიენტის ფული. დაჭერამდე გადაამოწმეთ ბიუჯეტი.",
      confirm:
        "ეს მაშინვე უშვებს კამპანიას და დღესვე იწყებს კლიენტის ფულის ხარჯვას. გავაგრძელოთ?",
      siteLabel: "კლიენტის საიტი",
      siteHint:
        "რეკლამა ამ საიტის პაკეტში ითვლება, ცარიელი მისამართი კი სწორედ ამ საიტზე მიუთითებს.",
      sitePlaceholder: "აირჩიეთ საიტი",
      nameLabel: "კამპანიის დასახელება",
      nameHint: "ჩვენთვის, მოგვიანებით მოსაძებნად. ვიზიტორები ამას ვერ ხედავენ.",
      channelLabel: "სად გავუშვათ",
      pickChannel: "აირჩიეთ მინიმუმ ერთი.",
      budgetLabel: "დღიური ბიუჯეტი",
      budgetHint:
        "რამდენის დახარჯვა შეუძლია Meta-ს დღეში, სარეკლამო ანგარიშის ვალუტაში. მიუთითეთ მთელ ერთეულებში — 50 ნიშნავს ორმოცდაათს.",
      budgetCeiling: (amount) => `ჭერია ${amount} დღეში.`,
      budgetOverCeiling: "ეს დღიურ ჭერს აღემატება.",
      budgetTooSmall: "დღიური ბიუჯეტი ნულზე მეტი უნდა იყოს.",
      destinationLabel: "სად მიჰყავს რეკლამას",
      destinationHint:
        "სურვილისამებრ. ცარიელი დატოვეთ და ხალხი კლიენტის საკუთარ საიტზე მივა.",
      badUrl: "საჭიროა სრული მისამართი, რომელიც http:// ან https://-ით იწყება.",
      headlineLabel: "სათაური",
      primaryTextLabel: "რეკლამის ტექსტი",
      imageLabel: "სურათის ბმული",
      countryLabel: "ქვეყანა",
      cityLabel: "ქალაქი",
      cityHint: "სურვილისამებრ. ცარიელი დატოვეთ მთელი ქვეყნისთვის.",
      ageLabel: "ასაკი",
      ageTo: "—",
      required: "შეავსეთ ეს ველი.",
      create: "კამპანიის გაშვება",
      creating: "იშვება…",
      creatingNote: "Meta თანმიმდევრობით ოთხ ობიექტს ქმნის — რამდენიმე წამი სჭირდება.",
      cancel: "გაუქმება",
      createFailed: "კამპანიის გაშვება ვერ მოხერხდა.",
      allowanceTitle: "რისი გაშვება შეუძლია ამ საიტს",
      allowanceNone: "ამ საიტის პაკეტი რეკლამას არ მოიცავს.",
      allowanceImpressions: (used, limit) =>
        `${limit}-დან ${used} ჩვენება გამოყენებულია`,
      allowanceImpressionsUnmetered: (used) =>
        `${used} ჩვენება, ულიმიტო პაკეტზე`,
      allowanceChannels: (channels) => `არხები: ${channels}`,
      allowanceSpent:
        "ამ საიტმა პაკეტში შემავალი ჩვენებები ამოწურა. გაშვება შემდეგ პერიოდამდე უარყოფილი იქნება.",
      allowanceOver: (used, limit) =>
        `პაკეტს გადააჭარბა: ${limit}-ის ნაცვლად ${used} ჩვენება. კამპანიები გაშვებისას მოწმდება და წინასწარ არ ჯავშნება, ამიტომ პერიოდის ბოლო კამპანიას ლიმიტის გადაჭარბება შეუძლია — ღირს კლიენტთან შეთანხმება შემდეგ გაშვებამდე.`,
      allowanceStale:
        "ითვლება მხოლოდ ის, რაც Meta-მ დაგვიბრუნა. დაფიქსირებული კამპანიები საათში ერთხელ ახლდება, მაგრამ კამპანია, რომლის ციფრებიც არასდროს მოსულა, ნაწილობრივ კი არა, საერთოდ არ ითვლება — ამიტომ ეს ქვედა ზღვარია და არა ზუსტი აღრიცხვა.",
      channelNotInPlan: "ამ საიტის პაკეტში არ შედის.",
    },
    detail: {
      pause: "შეჩერება",
      pausing: "ჩერდება…",
      pauseConfirm: "შევაჩეროთ ეს კამპანია? ხარჯვა მაშინვე შეწყდება.",
      resume: "გაგრძელება",
      resuming: "გრძელდება…",
      resumeConfirm: "გავაგრძელოთ ეს კამპანია? ხარჯვა მაშინვე განახლდება.",
      delete: "წაშლა Meta-ში",
      deleting: "იშლება…",
      deleteConfirm:
        "წავშალოთ ეს კამპანია Meta-ში? ამის დაბრუნება შეუძლებელია და კლიენტს ახალი დასჭირდება.",
      actionFailed: "ვერ შესრულდა.",
      spendingTitle: "ეს ახლა ფულს ხარჯავს",
      spendingBody:
        "შუა გზაზე ჩავარდა, მას შემდეგ რაც კამპანია Meta-ში უკვე შეიქმნა — ანუ ჩავარდნის მიუხედავად მუშაობს. შეაჩერეთ ან წაშალეთ.",
      notLaunched:
        "ეს კამპანია Meta-მდე არ მისულა, ამიტომ არაფერი მიმდინარეობს და წასაკითხიც არაფერია.",
      site: "საიტი",
      createdBy: "გაუშვა",
      destination: "მიუთითებს",
      headline: "სათაური",
      primaryText: "რეკლამის ტექსტი",
      audience: "აუდიტორია",
      ages: (from, to) => `ასაკი ${from}–${to}`,
      launched: "გაშვებული",
      paused: "შეჩერებული",
      deletedAt: "წაშლილი",
      created: "შექმნილი",
      budget: "დღიური ბიუჯეტი",
      metaTitle: "Meta-ს იდენტიფიკატორები",
      metaCampaign: "კამპანია",
      metaAdSet: "სარეკლამო ჯგუფი",
      metaCreative: "კრეატივი",
      metaAd: "რეკლამა",
      notFound: "ასეთი კამპანია ვერ ვიპოვეთ.",
    },
    insights: {
      title: "შედეგები",
      refresh: "თავიდან წაკითხვა",
      notYet: "ჯერ არაფერია დაფიქსირებული",
      notYetBody:
        "Meta-ს ამ კამპანიაზე ციფრები არ გამოუგზავნია. პირველ საათებში ეს ნორმალურია — არ ნიშნავს, რომ არაფერი ხდება, და ნულის ტოლიც არ არის.",
      emptyReport:
        "Meta-მ პასუხი გასცა, მაგრამ ყველა ციფრი ცარიელი იყო. კამპანია, რომელიც აშკარად საათებია მუშაობს, ასე არ უნდა გამოიყურებოდეს — ეს იმაზე მიუთითებს, რომ Meta-ს არასწორ ველებს ვთხოვთ, და არა იმაზე, რომ კამპანია ჩუმადაა. ღირს გადამოწმება.",
      asOf: (when) => `წაკითხულია ${when}`,
      cached:
        "Meta-ს ანგარიშგება საათებით იგვიანებს და შემდეგ ზუსტდება, ამიტომ ეს ორიენტირია და არა ანგარიშ-ფაქტურა.",
      impressions: "ჩვენებები",
      reach: "მოცული ადამიანები",
      clicks: "დაჭერები",
      ctr: "დაჭერის მაჩვენებელი",
      cpc: "ერთი დაჭერის ფასი",
      spend: "დახარჯული",
      loadFailed: "შედეგების წაკითხვა ვერ მოხერხდა.",
      loadFailedNeverRead:
        "ეს კამპანია წარმატებით არასდროს წაგვიკითხავს, ამიტომ იგივე შეცდომა სავარაუდოდ გაშვებიდან მეორდება. სხვაგან ეს არსად ჩანს: საათობრივი განახლება შეცდომას ჩაიწერს ჟურნალში და გააგრძელებს, სიაში კვლავ „ჯერ არაფერია“ წერია, საიტის ჩვენებების ჯამში კი ეს კამპანია საერთოდ არ ითვლება. ჯობია ჟურნალი შეამოწმოთ, ვიდრე დაელოდოთ.",
      notLaunched: "ეს კამპანია Meta-მდე არ მისულა, ამიტომ წასაკითხი არაფერია.",
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
  plans: {
    title: "ფასების პაკეტები",
    subtitle: "რას სთავაზობს ფასების გვერდი და რას ახდევინებს პანელი.",
    create: "ახალი პაკეტი",
    empty: "პაკეტები ჯერ არ არის. შექმენით პირველი.",
    back: "ყველა პაკეტი",
    newTitle: "ახალი პაკეტი",
    editTitle: "პაკეტის რედაქტირება",
    code: "კოდი",
    codeHint:
      "იდენტიფიკატორი, რომელზეც გამოწერები ინახება. თუ შეცვლით უკვე გაყიდულ პაკეტს, კლიენტების ჩანაწერები დაიკარგება.",
    price: "ფასი",
    priceHint:
      "რეალურად ჩამოსაჭრელი თანხა. შეიყვანეთ მთელ ვალუტაში, მაგ. 199 — ქვემოთ მოცემული ტექსტი არასდროს გამოიყენება ბილინგისთვის.",
    currency: "ვალუტა",
    billingPeriod: "ბილინგის პერიოდი",
    periods: { MONTHLY: "თვიური", YEARLY: "წლიური" },
    sortOrder: "პოზიცია",
    sortOrderHint: "ნაკლები რიცხვი ფასების გვერდზე წინ ჩნდება.",
    featured: "გამოიკვეთოს როგორც ყველაზე პოპულარული",
    featuredHint: "ეს მხოლოდ ერთ პაკეტს უნდა ჰქონდეს.",
    active: "ჩანს ფასების გვერდზე",
    activeHint: "გამორთეთ, რომ პაკეტი წაშლის გარეშე გააჩეროთ.",
    purchasable: "კლიენტს შეუძლია თავად შეიძინოს",
    purchasableHint:
      "გამორთეთ მოსალაპარაკებელი პაკეტისთვის: ფასების გვერდზე დარჩება „დაგვიკავშირდით“ ტექსტით, ყიდვის გარეშე.",
    comingSoon: "მალე",
    comingSoonHint:
      "პაკეტი სრულად გამოჩნდება — ფასითა და ფუნქციებით — ყიდვის ღილაკი კი გამორთული იქნება. ყიდვა აიკრძალება და არა უბრალოდ დაიმალება. ვისაც უკვე შეძენილი აქვს, პაკეტი რჩება და განახლებაც გრძელდება — ეს მხოლოდ ახალ შეძენებს კეტავს. ფასდაკლება ახლაც შეგიძლიათ დააყენოთ და ის უკვე იმუშავებს იმ დღეს, როცა ამას გამორთავთ.",
    comingSoonBeatsFeatured:
      "ეს პაკეტი ამავდროულად ყველაზე პოპულარადაა მონიშნული. გამოჩნდება მხოლოდ „მალე“ — პაკეტი, რომლის ყიდვაც ჯერ არავის შეუძლია, პოპულარული არჩევანი ვერ იქნება.",
    comingSoonHidden:
      "ეს პაკეტი ფასების გვერდზე არ ჩანს, ამიტომ ვერავინ ნახავს, რომ ის მალე დაემატება. თუ გამოცხადება გინდოდათ, ჩართეთ „ჩანს ფასების გვერდზე“ კიდეც.",
    status: "სტატუსი",
    translations: "ტექსტები",
    translationsHint:
      "ორივე ენა აქ იწერება. თუ ენა აკლია, საიტზე პაკეტის კოდი გამოჩნდება.",
    name: "დასახელება",
    displayPrice: "ნაჩვენები ფასი",
    displayPriceHint:
      'რასაც ვიზიტორი კითხულობს, მაგ. „$199“ ან „მოსალაპარაკებელი“. მხოლოდ ტექსტი — ბილინგში არ მონაწილეობს.',
    displayPriceAuto:
      "გამოითვლება „ფასისა“ და ვალუტისგან, ამიტომ ფასის შეცვლისას ვეღარ აცდება. საკუთარი ტექსტი მხოლოდ მოსალაპარაკებელ პაკეტს სჭირდება.",
    cadence: "პერიოდის ტექსტი",
    cadenceHint: 'ჩნდება ფასის შემდეგ, მაგ. „თვეში“. ცარიელი დატოვეთ, თუ არ გჭირდებათ.',
    summary: "მოკლე აღწერა",
    cta: "ღილაკის ტექსტი",
    features: "მახასიათებლები",
    featuresHint: "თითო ხაზზე თითო, იმ თანმიმდევრობით, როგორც უნდა გამოჩნდეს.",
    addFeature: "მახასიათებლის დამატება",
    removeFeature: "წაშლა",
    languageNames: { en: "ინგლისური", ka: "ქართული" },
    edit: "რედაქტირება",
    delete: "პაკეტის წაშლა",
    deleting: "იშლება…",
    deleteConfirm:
      "წავშალოთ ეს პაკეტი? წაშლა მხოლოდ შეცდომით შექმნილისთვისაა. თუ პაკეტი კლიენტებს უკვე ჰქონდათ ნაყიდი, სანაცვლოდ გამორთეთ „ჩანს ფასების გვერდზე“.",
    deleteBlocked:
      "პაკეტი ვერ წაიშლება: მას კვლავ იყენებს გამოწერა ან ძველი გადახდა — მათ შორის უკვე გაუქმებული გამოწერების გადახდები, ამიტომ შესაძლოა დღეს არცერთ საიტზე არ ჩანდეს. წაშლის შემთხვევაში ამ გადახდებს ახსნა აღარ ექნებათ. სანაცვლოდ გამორთეთ „ჩანს ფასების გვერდზე“ და „კლიენტებს შეუძლიათ თავად შეიძინონ“: ასე პაკეტი სრულად იხურება და ისტორია ხელუხლებელი რჩება.",
    codeRequired: "მიუთითეთ პაკეტის კოდი.",
    priceInvalid: "ფასი შეიყვანეთ რიცხვად, მაგ. 199.",
    nameRequired: "თითოეულ ენას დასახელება სჭირდება.",
    saveFailed: "პაკეტი ვერ შეინახა.",
    discount: "ფასდაკლება",
    discountHint:
      "აკლებს პროცენტს ამ პაკეტის ფასს ყველასთვის — ფასების გვერდზეც და გადახდისასაც. თუ ფასდაკლება არ გინდათ, დატოვეთ პროცენტი ცარიელი.",
    discountPercent: "პროცენტი",
    discountPercentHint:
      "მთელი რიცხვი 1-დან 100-მდე. ცარიელი ნიშნავს ფასდაკლების გარეშე.",
    discountStarts: "პირველი დღე",
    discountStartsHint: "ცარიელი — მაშინვე იწყება.",
    discountEnds: "ბოლო დღე",
    discountEndsHint:
      "ბოლო დღე, როცა ფასდაკლება მოქმედებს — ჩათვლით. ცარიელი — გაგრძელდება, სანამ თქვენ არ გამორთავთ.",
    discountPreview: "კლიენტი გადაიხდის",
    discountNotLive:
      "ამჟამად არ მოქმედებს — ეს ის ფასია, რომელიც ფასდაკლების პერიოდში იქნება.",
    discountInvalid: "ფასდაკლება შეიყვანეთ მთელ რიცხვად 1-დან 100-მდე.",
    discountNotPurchasable:
      "პაკეტს, რომელსაც კლიენტი ვერ ყიდულობს, ფასი არ აქვს გამოსაკლები. ჯერ ჩართეთ „კლიენტს შეუძლია შეძენა“.",
    discountWindowWithoutPercent:
      "მიუთითეთ პროცენტი, ან წაშალეთ ფასდაკლების თარიღები.",
    discountWindowBackwards:
      "ფასდაკლება დაწყების შემდეგ უნდა სრულდებოდეს.",
  },
  promoCodes: {
    title: "ფასდაკლებები",
    subtitle:
      "კოდები, რომლებსაც კლიენტი გადახდისას წერს. პაკეტის ფასდაკლება და კოდი არ ჯამდება — მოქმედებს ის, რომელიც კლიენტისთვის უფრო ხელსაყრელია.",
    create: "ახალი კოდი",
    empty: "კოდები ჯერ არ არის.",
    back: "← ყველა კოდი",
    newTitle: "ახალი კოდი",
    editTitle: "კოდის რედაქტირება",
    code: "კოდი",
    codeHint:
      "ის, რასაც კლიენტი წერს. ინახება მაღალი რეგისტრით და მუშაობს ნებისმიერი აკრეფისას.",
    percentOff: "პროცენტი",
    percentHint: "მთელი რიცხვი 1-დან 100-მდე.",
    expiresAt: "ვადა",
    expiresHint:
      "ბოლო დღე, როცა კოდი მუშაობს — ჩათვლით. ცარიელი — ვადა არ ეწურება.",
    expires: "ვადა",
    maxRedemptions: "გამოყენების ლიმიტი",
    maxHint: "ცარიელი — ლიმიტის გარეშე.",
    used: "გამოყენებულია",
    created: "შექმნილია",
    active: "კოდი ჩართულია",
    activeHint:
      "გამორთვა აჩერებს კოდის მუშაობას ისე, რომ არ იშლება და გამოყენების ისტორია რჩება.",
    status: "სტატუსი",
    usable: "მუშაობს",
    notUsable: "არ მუშაობს",
    appliesTo: "პაკეტები",
    appliesToHint:
      "მონიშნეთ პაკეტები, რომ კოდი მხოლოდ მათზე მოქმედებდეს. თუ არაფერს მონიშნავთ, ყველა პაკეტზე იმუშავებს.",
    allPlans: "ყველა პაკეტი",
    allPlansNotice:
      "არაფერია მონიშნული, ამიტომ კოდი ყველა პაკეტზე მუშაობს.",
    edit: "რედაქტირება",
    delete: "კოდის წაშლა",
    deleting: "იშლება…",
    deleteConfirm:
      "წავშალოთ ეს კოდი? თუ ვინმემ უკვე გამოიყენა, სჯობს გამორთოთ.",
    deleteBlocked:
      "კოდი ვერ წაიშლება, რადგან გადახდაშია გამოყენებული. სანაცვლოდ გამორთეთ.",
    codeRequired: "მიუთითეთ კოდი, რომელსაც კლიენტი აკრეფს.",
    percentInvalid: "ფასდაკლება შეიყვანეთ მთელ რიცხვად 1-დან 100-მდე.",
    maxInvalid:
      "გამოყენების ლიმიტი მთელი რიცხვი უნდა იყოს, ან ცარიელი — ლიმიტის გარეშე.",
    saveFailed: "კოდი ვერ შეინახა.",
  },
  newCustomerOffer: {
    title: "შეთავაზება ახალი მომხმარებლისთვის",
    subtitle:
      "ფასდაკლება კლიენტის პირველივე ფასიან პაკეტზე. მოქმედებს ერთხელ ერთ ანგარიშზე და მხოლოდ პირველ საანგარიშო პერიოდზე — შემდეგი განახლებები ჩვეულებრივ ფასადაა.",
    percentOff: "პროცენტი",
    percentHint: "მთელი რიცხვი 1-დან 99-მდე.",
    active: "შეთავაზება ჩართულია",
    activeHint:
      "გამორთვის შემდეგ ახალ კლიენტებს აღარ შესთავაზება. უკვე გაცემული ფასდაკლებები რჩება და თანხა არავის ერიცხება თავიდან.",
    status: "სტატუსი",
    running: "მოქმედებს",
    notRunning: "არ მოქმედებს",
    updated: "ბოლო ცვლილება",
    neverUpdated: "არ შეცვლილა",
    rules:
      "მოქმედებს მხოლოდ იმ კლიენტზე, ვისაც პაკეტში ჯერ არასდროს გადაუხდია; მეორე პაკეტი უკვე სრულ ფასადაა. არ ჯამდება ფასდაკლებულ ფასთან ან კოდთან — მოქმედებს ის, რომელიც კლიენტისთვის უფრო ხელსაყრელია.",
    percentInvalid: "ფასდაკლება შეიყვანეთ მთელ რიცხვად 1-დან 99-მდე.",
    loadFailed: "შეთავაზება ვერ ჩაიტვირთა.",
    saveFailed: "შეთავაზება ვერ შეინახა.",
  },
};

const dictionaries: Record<Locale, AdminStrings> = { en, ka };

export function adminStrings(locale: Locale): AdminStrings {
  return dictionaries[locale];
}
