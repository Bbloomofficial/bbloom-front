/** Single source of truth for contact details — used by the contact page and the footer. */
export const contact = {
  email: 'team@bbloom.ge',
  /** Local Georgian mobile number, as displayed. */
  phone: '550 50 60 04',
  /** E.164 form for tel: links, so the number works when dialled from abroad. */
  phoneHref: '+995550506004',
} as const
