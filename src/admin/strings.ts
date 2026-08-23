import type { Locale } from "../i18n";

/**
 * Chrome for the staff admin area. bbloom's own team works mostly in Georgian,
 * so `ka` is the primary dictionary; the shape mirrors the client dashboard's
 * so both shells stay recognisably the same product.
 */
export type AdminStrings = {
  brand: string;
  nav: { sites: string; newSite: string; system: string };
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
  };
  statuses: Record<string, string>;
  categories: Record<string, string>;
  tiers: Record<string, string>;
  /** How a language is named on its own, for checkboxes and chips. */
  languageNames: Record<string, string>;
  /** How a language reads inside "the site opens in …" — a different case in
   *  Georgian, which is why it cannot reuse `languageNames`. */
  languageAdverbs: Record<string, string>;
};

const en: AdminStrings = {
  brand: "bbloom staff",
  nav: { sites: "Sites", newSite: "New site", system: "System" },
  signedInAs: "Signed in as",
  signOut: "Sign out",
  backToBbloom: "Back to bbloom.co",
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
    help: "This is the bbloom team area. Clients sign in at /dashboard.",
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
  },
  statuses: { DRAFT: "Draft", PUBLISHED: "Published" },
  categories: { SHOP: "Online shop", RESTAURANT: "Restaurant" },
  tiers: { SIMPLE: "Simple", CLASSIC: "Classic", MODERN: "Modern" },
  languageNames: { ka: "Georgian", en: "English" },
  languageAdverbs: { ka: "Georgian", en: "English" },
};

const ka: AdminStrings = {
  brand: "bbloom გუნდი",
  nav: { sites: "საიტები", newSite: "ახალი საიტი", system: "სისტემა" },
  signedInAs: "შესული ხართ როგორც",
  signOut: "გამოსვლა",
  backToBbloom: "დაბრუნება bbloom.co-ზე",
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
    help: "ეს bbloom-ის გუნდის სივრცეა. კლიენტები შედიან /dashboard-ზე.",
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
  },
  statuses: { DRAFT: "მუშავდება", PUBLISHED: "გამოქვეყნებული" },
  categories: { SHOP: "ონლაინ მაღაზია", RESTAURANT: "რესტორანი" },
  tiers: { SIMPLE: "მარტივი", CLASSIC: "კლასიკური", MODERN: "თანამედროვე" },
  languageNames: { ka: "ქართული", en: "ინგლისური" },
  languageAdverbs: { ka: "ქართულად", en: "ინგლისურად" },
};

const dictionaries: Record<Locale, AdminStrings> = { en, ka };

export function adminStrings(locale: Locale): AdminStrings {
  return dictionaries[locale];
}
