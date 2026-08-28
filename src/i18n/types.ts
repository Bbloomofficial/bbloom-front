export type Service = {
  slug: string
  title: string
  tagline: string
  description: string
  deliverables: string[]
}

export type Step = { number: string; title: string; description: string }

export type Faq = { question: string; answer: string }

/**
 * Sales copy for a website template, keyed by the backend's template code. The
 * API describes each template in Georgian only, so the bilingual marketing site
 * keeps its own pitch and falls back to the API text for anything new.
 */
export type TemplateCopy = { name: string; tagline: string; description: string }

export type Dict = {
  meta: { title: string; description: string }
  nav: {
    services: string
    templates: string
    pricing: string
    about: string
    contact: string
    cta: string
    signIn: string
    /**
     * Where a client who is already signed in goes: their own websites, which
     * are now what `/` renders for them. Replaces sign-in and sign-up in the
     * bar rather than joining them — offering "sign in" to someone who is
     * signed in is the sort of thing that makes a site feel like two sites.
     */
    dashboard: string
    /**
     * Sign-up, sitting beside sign-in rather than replacing `start`: `start`
     * opens the anonymous editor, which asks for an account only once there is
     * something to save. This is for someone who has already decided.
     */
    register: string
    start: string
    openMenu: string
    closeMenu: string
    /** Dismisses the sign-in dialog. */
    close: string
    home: string
  }
  theme: { toLight: string; toDark: string }
  password: { show: string; hide: string }
  language: { label: string }
  hero: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    badges: string[]
    showcase: {
      adLabel: string
      handle: string
      siteLabel: string
      siteUrl: string
    }
  }
  problem: {
    eyebrow: string
    title: string
    description: string
    items: { title: string; body: string }[]
  }
  servicesSection: { eyebrow: string; title: string; description: string; seeAll: string }
  process: { eyebrow: string; title: string; pageTitle: string }
  whyUs: {
    eyebrow: string
    title: string
    description: string
    items: { title: string; body: string }[]
    cta: string
  }
  faqSection: {
    eyebrow: string
    title: string
    beforeYouAsk: string
    pricingQuestions: string
  }
  ctaBand: {
    title: string
    description: string
    primary: string
    secondary: string
    aboutTitle: string
    pricingTitle: string
    pricingDescription: string
  }
  servicesPage: { eyebrow: string; title: string; description: string }
  pricingPage: {
    eyebrow: string
    title: string
    description: string
    freeTierIntro: string
    mostPopular: string
    comingSoon: string
    comingSoonCta: string
    /**
     * The new-customer offer, worded per billing period because the offer
     * covers one period and "first month" on a yearly plan would be eleven
     * months of overclaim.
     *
     * The prefix is what the discount badge adds to the percentage — "−50%
     * first month" against a sale's bare "−50%". The functions are the fallback
     * sentence for when the API advertises a percentage but sends no figure to
     * put beside it.
     */
    firstPurchaseMonthPrefix: string
    firstPurchaseYearPrefix: string
    firstPurchaseMonth: (percent: number) => string
    firstPurchaseYear: (percent: number) => string
    perMonth: string
    perYear: string
    signUp: string
    contactUs: string
    loading: string
    loadFailed: string
    note: string
  }
  templatesPage: {
    eyebrow: string
    title: string
    description: string
    filterAll: string
    flagship: string
    viewDemo: string
    useTemplate: string
    demoPending: string
    previewAlt: string
    loading: string
    error: string
    retry: string
    note: string
    categories: Record<string, string>
    tiers: Record<string, string>
  }

  aboutPage: {
    eyebrow: string
    title: string
    description: string
    storyTitle: string
    story: string[]
    valuesEyebrow: string
    valuesTitle: string
    values: { title: string; body: string }[]
  }
  contactPage: {
    eyebrow: string
    title: string
    description: string
    detailsTitle: string
    emailLabel: string
    phoneLabel: string
    hoursLabel: string
    hours: string
  }
  notFound: { eyebrow: string; title: string; body: string; cta: string }
  footer: {
    blurb: string
    servicesTitle: string
    companyTitle: string
    contactTitle: string
    about: string
    pricing: string
    templates: string
    contact: string
    rights: string
    tagline: string
  }
  services: Service[]
  steps: Step[]
  /**
   * No `plans` here on purpose. The pricing tiers, their copy and their prices
   * come from `GET /plans/website` and are edited by staff at `/admin/plans`;
   * a second copy in the bundle is a price that changes only on a deploy.
   */
  faqs: Faq[]
  templateCopy: Record<string, TemplateCopy>
}
