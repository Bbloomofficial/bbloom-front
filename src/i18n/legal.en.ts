import type { Legal } from './types'

export const legal: Legal = {
  updatedLabel: 'Last updated',
  updated: '27 November 2026',
  privacy: {
    title: 'Privacy policy',
    intro: [
      'This policy explains what personal data bbloom collects when you use bbloom.ge, the bbloom dashboard and the websites we build and host for businesses, why we collect it, and what you can ask us to do with it.',
    ],
    sections: [
      {
        heading: 'Who we are',
        body: [
          'bbloom builds and hosts websites for small businesses in Georgia and runs social media advertising for them. In this policy, “bbloom”, “we” and “us” mean the operator of bbloom.ge. You can reach us at team@bbloom.ge or +995 550 50 60 04.',
        ],
      },
      {
        heading: 'What we collect',
        items: [
          'Account details. When you register: your email address, name, preferred language and a password, which we store only as a one-way hash.',
          'Messages to us. When you write to us through bbloom.ge: the name, email, phone number, business name, website and message you send, the page you came from, and your IP address and browser details.',
          'Newsletter. Your email address and language, if you subscribe.',
          'Your website. The text, images, products and settings you add to a site we host for you.',
          'Billing. What you bought, when and for how much. Card payments are made on the bank’s own payment page (Bank of Georgia or TBC Bank), so we never see or store your card number.',
          'Advertising. The content and budget of the campaigns we run for you, and the totals Meta reports back, such as impressions and clicks. We do not learn who saw your ads.',
        ],
      },
      {
        heading: 'Visitors to websites we host',
        body: [
          'When someone sends an enquiry or places an order on a website we host for a business, we store what they enter - name, email, phone number, message and order details - together with their IP address and browser details.',
          'We keep this on behalf of that business, and the business decides how it is used. If you contacted a business through its website, ask that business first; we will help it act on your request.',
        ],
      },
      {
        heading: 'Why we use it',
        items: [
          'To provide the service: your account, your website, your orders and enquiries, and your advertising.',
          'To reply when you contact us.',
          'To send the emails the service depends on - sign-in codes, alerts about new enquiries, payment confirmations - and the newsletter, if you subscribed.',
          'To keep the service secure and stop abuse, which is why forms record your IP address and browser details.',
          'To meet our legal and accounting obligations.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'We do not sell personal data. We share it only with the providers that help us run the service, and only as much as each one needs:',
        ],
        items: [
          'Hetzner, which hosts our servers and database in the European Union.',
          'Vercel, which serves the bbloom.ge website.',
          'Our email delivery provider, which sends the emails described above.',
          'Bank of Georgia and TBC Bank, which process card payments.',
          'Meta (Facebook and Instagram), where we run advertising campaigns.',
        ],
        after: [
          'Some of these providers process data outside Georgia. We may also disclose data where the law requires it.',
        ],
      },
      {
        heading: 'Cookies and browser storage',
        body: [
          'bbloom does not use advertising or analytics cookies, and does not track you across other websites.',
          'So that the site works, your browser keeps a few things on your device: whether you are signed in, your language and theme, an unsaved draft in the website editor, and a reference to an order you placed. You can clear them at any time in your browser’s settings.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'We keep your account and website data for as long as your account is open. Messages, enquiries and orders are kept for as long as they are useful to you or to us, and payment records for as long as accounting law requires.',
          'When you ask us to delete your data, we delete it, unless the law requires us to keep it.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'Under the Law of Georgia on Personal Data Protection, you can ask us to tell you what data we hold about you, to give you a copy, to correct it, to delete it, or to stop using it for a particular purpose.',
          'Write to team@bbloom.ge from the email address on your account and we will reply as soon as we can.',
        ],
      },
      {
        heading: 'Children',
        body: ['bbloom is a service for businesses and is not meant for children.'],
      },
      {
        heading: 'Changes to this policy',
        body: [
          'If we change this policy, we will publish the new version on this page and update the date at the top.',
        ],
      },
    ],
  },
  dataDeletion: {
    title: 'Deleting your data',
    intro: [
      'You can ask us at any time to delete the personal data bbloom holds about you.',
    ],
    sections: [
      {
        heading: 'How to ask',
        items: [
          'Email team@bbloom.ge with the subject “Delete my data”.',
          'Send it from the email address on your bbloom account, or tell us the email address or phone number you used, so we can find your data.',
          'If you only want part of it deleted - one website, for example - say which.',
        ],
      },
      {
        heading: 'What happens next',
        body: [
          'We confirm that we have your request, check that it really comes from you, and then delete your account, your websites and the personal data linked to them. We tell you when it is done.',
          'Records the law requires us to keep, such as payment records, are kept only for as long as required.',
        ],
      },
      {
        heading: 'Facebook and Instagram',
        body: [
          'bbloom does not offer sign-in with Facebook and does not collect personal data from your Facebook or Instagram profile. Our connection to Meta only manages advertising campaigns in bbloom’s own ad account.',
          'To have Meta delete data it holds about you, use the settings of your Facebook or Instagram account.',
        ],
      },
      {
        heading: 'If you contacted a business through their website',
        body: [
          'Enquiries and orders sent through a website we host belong to that business. Ask the business to delete them.',
        ],
      },
    ],
  },
}
