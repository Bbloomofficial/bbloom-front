/** Single source of truth for contact details — used by the contact page and the footer. */
export const contact = {
  email: 'team@bbloom.ge',
  /** Local Georgian mobile number, as displayed. */
  phone: '550 50 60 04',
  /** E.164 form for tel: links, so the number works when dialled from abroad. */
  phoneHref: '+995550506004',
  /** Public social profile URLs, linked from the footer. */
  instagram: 'https://www.instagram.com/bbloom.ge/',
  facebook: 'https://www.facebook.com/profile.php?id=61593673766383',
} as const

/**
 * wa.me wants bare digits: a `+` or a space in the path 404s silently rather
 * than failing loudly, so the number is derived from `phoneHref` instead of
 * being written out a second time.
 */
export function whatsappHref(phone: string = contact.phoneHref): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
