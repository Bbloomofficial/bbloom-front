import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '../../i18n'
import { contact, whatsappHref } from '../../data/contact'
import Contact from '../Contact'

/**
 * wa.me rejects anything that is not bare digits by serving a "phone number
 * shared via url is invalid" page rather than an error, so a stray `+` or
 * space ships unnoticed. These assertions pin the exact href.
 */
describe('whatsappHref', () => {
  it('strips the plus and any separators from the E.164 number', () => {
    expect(whatsappHref()).toBe('https://wa.me/995550506004')
    expect(whatsappHref('+995 550 50 60 04')).toBe('https://wa.me/995550506004')
  })

  it('derives from the shared contact data rather than a second literal', () => {
    expect(whatsappHref()).toBe(`https://wa.me/${contact.phoneHref.slice(1)}`)
  })
})

describe('Contact page phone row', () => {
  it('keeps the tel: link and adds a separate WhatsApp link beside it', () => {
    render(
      <I18nProvider>
        <Contact />
      </I18nProvider>,
    )

    const tel = screen.getByText(contact.phone).closest('a')
    expect(tel).toHaveAttribute('href', `tel:${contact.phoneHref}`)
    expect(tel).toHaveAttribute('dir', 'ltr')

    const wa = screen.getByRole('link', { name: /whatsapp/i })
    expect(wa).toHaveAttribute('href', 'https://wa.me/995550506004')
    expect(wa).toHaveAttribute('target', '_blank')
    expect(wa).toHaveAttribute('rel', 'noreferrer')
  })
})
