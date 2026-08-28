import type { Dict } from './types'

export const en: Dict = {
  meta: {
    title: 'bbloom — Grow your small business online',
    description:
      'bbloom helps small businesses get more customers with Instagram and Facebook advertising, plus fast, conversion-focused websites.',
  },

  nav: {
    services: 'Services',
    templates: 'Templates',
    pricing: 'Pricing',
    about: 'About',
    contact: 'Contact',
    cta: 'Get in touch',
    signIn: 'Sign in',
    dashboard: 'My websites',
    register: 'Sign up',
    start: 'Create your website',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    close: 'Close',
    home: 'bbloom home',
  },

  theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },

  password: { show: 'Show password', hide: 'Hide password' },

  language: { label: 'Change language' },

  hero: {
    eyebrow: 'Ads + websites for small businesses',
    titleLine1: 'Grow your business,',
    titleLine2: 'win more customers.',
    subtitle:
      'bbloom runs your Instagram and Facebook advertising and builds the website behind it — so the people who discover you actually become paying customers.',
    primaryCta: 'Get in touch',
    secondaryCta: 'See what we do',
    badges: ['No long contracts', 'You own your accounts', 'Reporting in plain English'],
    showcase: {
      adLabel: 'Your ad',
      handle: '@yourbusiness',
      siteLabel: 'Your website',
      siteUrl: 'yourbusiness.com',
    },
  },

  problem: {
    eyebrow: 'Sound familiar?',
    title: "Small businesses don't have a marketing problem — they have a clarity problem",
    description:
      'You are busy running the business. Marketing gets whatever time is left. We take it off your plate and make it measurable.',
    items: [
      {
        title: 'You post, but nothing happens',
        body: 'Organic reach is tiny now. Without paid distribution your best content is seen by almost nobody.',
      },
      {
        title: 'Your website loses people',
        body: 'Slow, hard to use on a phone, no clear next step. Visitors leave and you never hear from them.',
      },
      {
        title: 'You have no idea what works',
        body: 'Money goes out, some customers come in, and nothing connects the two. So you cannot scale it.',
      },
    ],
  },

  servicesSection: {
    eyebrow: 'What we do',
    title: 'Everything you need to be found and chosen',
    description:
      'Two things move the needle for a small business: getting in front of the right people, and giving them somewhere good to land. We do both.',
    seeAll: 'See all services',
  },

  process: {
    eyebrow: 'How it works',
    title: 'From first conversation to first customers in four steps',
    pageTitle: 'Simple, transparent, no jargon',
  },

  whyUs: {
    eyebrow: 'How we work',
    title: 'Built around your business, not our retainer',
    description:
      'We are a young agency and we would rather earn trust with how we work than with numbers you cannot verify.',
    items: [
      {
        title: 'You keep everything',
        body: 'We build inside your own Meta Business Manager and your own domain. If you ever leave, nothing breaks and nothing is held hostage.',
      },
      {
        title: 'One person, not a queue',
        body: 'You get a direct line to the person actually running your account. No ticket systems, no scripted account managers.',
      },
      {
        title: 'Reporting you can check',
        body: 'Tracking is set up in your accounts, so every number we report is one you can open and verify yourself.',
      },
      {
        title: 'We say no when it fits',
        body: 'If advertising is not the right next step for your business, we will tell you straight instead of selling you a package.',
      },
    ],
    cta: 'Get in touch',
  },

  faqSection: {
    eyebrow: 'FAQ',
    title: 'Questions we get asked a lot',
    beforeYouAsk: 'Before you ask',
    pricingQuestions: 'Pricing questions',
  },

  ctaBand: {
    title: 'Ready to get more customers?',
    description:
      'Tell us about your business and we will come back with what we would actually do — whether you hire us or not.',
    primary: 'Get in touch',
    secondary: 'See pricing',
    aboutTitle: "Let's grow your business together",
    pricingTitle: 'Not sure which plan fits?',
    pricingDescription:
      'Tell us about your business and we will recommend the smallest plan that gets you results.',
  },

  servicesPage: {
    eyebrow: 'Services',
    title: 'Ads that get seen. Websites that get chosen.',
    description:
      'Pick one piece or let us run the whole thing. Everything is built around one measurement: how many new customers you get.',
  },

  pricingPage: {
    eyebrow: 'Pricing',
    title: 'Build free. Pay when you grow.',
    description:
      'Create your website and publish it free at bbloom.ge — no card required. Upgrade when you want your own domain or features like order management and customer accounts.',
    freeTierIntro:
      'Every website starts free. Pick a template, fill in your products and photos, and go live on a bbloom.ge address in minutes. Upgrade when you need more.',
    mostPopular: 'Most popular',
    comingSoon: 'Coming soon',
    comingSoonCta: 'Coming soon',
    firstPurchaseMonth: (percent) => `${percent}% off your first month`,
    firstPurchaseYear: (percent) => `${percent}% off your first year`,
    perMonth: 'per month',
    perYear: 'per year',
    signUp: 'Get started',
    contactUs: 'Contact us',
    loading: 'Loading plans…',
    loadFailed: 'We could not load the plans just now. Please try again shortly.',
    note: 'Your advertising budget is separate and paid directly to Meta. Contact us if you would like us to build the site for you.',
  },

  templatesPage: {
    eyebrow: 'Templates',
    title: 'Six websites. Pick the one that fits.',
    description:
      'Every template below is a real, working website — not a mockup. Open any demo, scroll it, filter the catalogue, try it on your phone. Yours is built on the same foundation with your products, photos and words.',
    filterAll: 'All templates',
    flagship: 'Our best work',
    viewDemo: 'Open live demo',
    useTemplate: 'Start with this template',
    demoPending: 'Demo coming soon',
    previewAlt: 'Preview of the {name} template',
    loading: 'Loading templates…',
    error: 'We could not load the templates just now.',
    retry: 'Try again',
    note: 'Colours, fonts and photography are yours — each template adapts to your brand rather than the other way round.',
    categories: {
      SHOP: 'Shops',
      RESTAURANT: 'Restaurants & cafés',
    },
    tiers: {
      SIMPLE: 'Simple',
      CLASSIC: 'Classic',
      MODERN: 'Modern',
    },
  },

  aboutPage: {
    eyebrow: 'About bbloom',
    title: 'We help small businesses bloom',
    description:
      'bbloom started because too many good local businesses were invisible online while worse ones with bigger budgets got all the attention. We level that out.',
    storyTitle: 'A marketing partner that behaves like part of your team',
    story: [
      'Most agencies sell you a package and disappear behind a dashboard. We work the other way around: we learn your business, your margins and your capacity, then build campaigns that bring the kind of customers you actually want.',
      'We keep the toolkit deliberately small — Instagram and Facebook advertising, and websites that convert. Doing two things exceptionally well beats doing ten things adequately.',
      'Every client gets a direct line to the person running their account. No ticket queues, no account managers reading a script.',
    ],
    valuesEyebrow: 'What we believe',
    valuesTitle: 'Four things we will not compromise on',
    values: [
      {
        title: 'Small business first',
        body: 'We do not chase enterprise retainers. Everything we build is designed for owners who count every dollar.',
      },
      {
        title: 'Numbers over noise',
        body: 'Impressions do not pay wages. We report on leads, sales and cost per customer — nothing else.',
      },
      {
        title: 'No lock-in',
        body: 'Your ad accounts, your domain, your website. If you ever leave, you take everything with you.',
      },
      {
        title: 'Honest advice',
        body: 'If ads are not the right move for you yet, we will say so up front and tell you what is.',
      },
    ],
  },

  contactPage: {
    eyebrow: 'Contact',
    title: 'Get in touch',
    description:
      'Send us a message or give us a call and tell us what your business needs. We will get back to you.',
    detailsTitle: 'How to reach us',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    hoursLabel: 'Hours',
    hours: 'Monday - Friday, 10:00 - 19:00',
  },

  notFound: {
    eyebrow: '404',
    title: "This page hasn't bloomed yet",
    body: 'The page you are looking for moved or never existed. Let us get you back on track.',
    cta: 'Back to home',
  },

  footer: {
    blurb:
      'We help small businesses get more customers through social media advertising and websites that actually convert.',
    servicesTitle: 'Services',
    companyTitle: 'Company',
    contactTitle: 'Get in touch',
    about: 'About us',
    pricing: 'Pricing',
    templates: 'Templates',
    contact: 'Contact',
    rights: 'All rights reserved.',
    tagline: 'Grow your business, win more customers.',
  },

  services: [
    {
      slug: 'instagram-ads',
      title: 'Instagram Ads',
      tagline: 'Reach buyers where they already scroll',
      description:
        'We plan, design and run Instagram campaigns built around one goal: turning local attention into booked jobs, orders and walk-ins.',
      deliverables: [
        'Audience & competitor research',
        'Scroll-stopping creative (image + reel)',
        'Campaign setup, targeting and pixel tracking',
        'Weekly optimisation and budget reallocation',
      ],
    },
    {
      slug: 'facebook-ads',
      title: 'Facebook Ads',
      tagline: 'Fill your inbox with real enquiries',
      description:
        'Lead forms, Messenger campaigns and local awareness ads that put your offer in front of the people most likely to buy it.',
      deliverables: [
        'Lead-gen and Messenger campaigns',
        'Offer and landing page strategy',
        'Retargeting for warm audiences',
        'Lead quality reporting',
      ],
    },
    {
      slug: 'websites',
      title: 'Website Design & Build',
      tagline: 'A site that sells while you sleep',
      description:
        'Fast, mobile-first websites designed to convert. Built for small businesses that need results, not a 40-page brochure.',
      deliverables: [
        'Custom design in your brand',
        'Mobile-first and fast to load',
        'Booking, WhatsApp and payment integrations',
        'On-page SEO and Google Business setup',
      ],
    },
    {
      slug: 'content',
      title: 'Content & Creative',
      tagline: 'Assets your audience actually stops for',
      description:
        'Reels, photos, and ad creative produced monthly so your feed and your campaigns never run dry.',
      deliverables: [
        'Monthly reel and photo pack',
        'Ad copy in your tone of voice',
        'Creative testing framework',
        'Content calendar you can reuse',
      ],
    },
    {
      slug: 'analytics',
      title: 'Tracking & Reporting',
      tagline: 'Know exactly what every dollar returns',
      description:
        'We wire up proper tracking so you can see cost per lead, cost per sale and where your budget is actually working.',
      deliverables: [
        'Meta Pixel & Conversions API',
        'Google Analytics 4 setup',
        'Live dashboard you can check anytime',
        'Plain-English monthly report',
      ],
    },
    {
      slug: 'growth',
      title: 'Growth Partnership',
      tagline: 'An in-house marketing team, for less',
      description:
        'Ongoing strategy, ads and website iteration with a dedicated contact who knows your business.',
      deliverables: [
        'Monthly strategy call',
        'Quarterly growth roadmap',
        'Continuous A/B testing',
        'Priority support on WhatsApp',
      ],
    },
  ],

  steps: [
    {
      number: '01',
      title: 'Getting to know you',
      description:
        'We learn about your business, your customers and what growth would actually mean for you. No slide decks.',
    },
    {
      number: '02',
      title: 'Proposal & scope',
      description:
        'We follow up with a proposal: recommended channels, budget, creative direction and the numbers we are aiming for.',
    },
    {
      number: '03',
      title: 'Build & launch',
      description:
        'We produce the creative, build the site or landing page, set up tracking and put your campaigns live.',
    },
    {
      number: '04',
      title: 'Optimise & scale',
      description:
        'Every week we review the data, cut what does not work and put more budget behind what does.',
    },
  ],

  faqs: [
    {
      question: 'How quickly will I see results?',
      answer:
        'It depends on your offer, your market and your budget, so we will not promise you a date. What we will do is agree the targets with you up front and show you real data every week, so you can judge progress yourself rather than take our word for it.',
    },
    {
      question: 'Do I need a big budget to start?',
      answer:
        'No. We work with modest ad budgets and will tell you honestly if yours is too small to be worth spending yet. What matters more than budget size is a clear offer and good creative — we help with both.',
    },
    {
      question: 'Who owns the website and ad accounts?',
      answer:
        'You do, always. We build inside your own Meta Business Manager and hand over full access to your website and domain. No lock-in.',
    },
    {
      question: 'Are there long contracts?',
      answer:
        'We ask for an initial three months so the campaigns have time to work, then it is month to month. Cancel any time with 30 days notice.',
    },
    {
      question: 'Do you work with my industry?',
      answer:
        'We focus on local and small businesses: cafés, salons, clinics, trades, boutiques and small online brands. If we are not the right fit, we will tell you up front.',
    },
  ],

  templateCopy: {
    'shop-simple': {
      name: 'Simple shop',
      tagline: 'Clean, quick, straight to the point',
      description:
        'Your products in a clear grid, with prices and an enquiry form. Nothing to distract from what you sell — ideal for a small range you want online fast.',
    },
    'shop-classic': {
      name: 'Classic shop',
      tagline: 'Warm and trustworthy',
      description:
        'Categories, a story about your workshop, a gallery and customer reviews. Built for makers whose craft is half the reason people buy.',
    },
    'shop-modern': {
      name: 'Modern shop',
      tagline: 'Our most powerful template',
      description:
        'Search, category filters, sorting, a gallery, reviews and an FAQ — a full dark-mode experience with tasteful motion, designed to turn traffic from your ads into customers.',
    },
    'restaurant-simple': {
      name: 'Simple restaurant',
      tagline: 'Your menu, always up to date',
      description:
        'The menu, opening hours and directions on one clear page. Everything a hungry visitor checks on their phone before deciding where to eat.',
    },
    'restaurant-classic': {
      name: 'Classic restaurant',
      tagline: 'Traditional and welcoming',
      description:
        'A full menu with sections, your story, a gallery of the room and a table reservation form. Warm and familiar, the way a Georgian table should feel.',
    },
    'restaurant-modern': {
      name: 'Modern restaurant',
      tagline: 'A restaurant that looks the part',
      description:
        "Chef's picks, a menu with sticky section tabs and dietary tags, an events calendar, reviews and reservations — the full experience, on a dark, cinematic canvas.",
    },
  },
}
