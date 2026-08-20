export type Service = {
  slug: string
  title: string
  tagline: string
  description: string
  deliverables: string[]
}

export type Step = { number: string; title: string; description: string }

export type Plan = {
  id: string
  name: string
  summary: string
  features: string[]
  featured?: boolean
  cta: string
}

export type Faq = { question: string; answer: string }

export type Dict = {
  meta: { title: string; description: string }
  nav: {
    services: string
    pricing: string
    about: string
    contact: string
    cta: string
    openMenu: string
    closeMenu: string
    home: string
  }
  theme: { toLight: string; toDark: string }
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
    mostPopular: string
    pricePending: string
    note: string
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
    contact: string
    rights: string
    tagline: string
  }
  services: Service[]
  steps: Step[]
  plans: Plan[]
  faqs: Faq[]
}
