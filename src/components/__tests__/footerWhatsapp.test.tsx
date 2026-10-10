import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n'
import { contact } from '../../data/contact'
import Footer from '../Footer'

/**
 * The footer's WhatsApp link is icon-only, so two things it cannot be left
 * without: a hit area a finger can land on (WCAG 2.5.8 wants 24x24, and the
 * inline exception does not apply to a standalone icon link), and a visible
 * focus ring, since a hover-only affordance does not exist for a keyboard.
 */
describe('Footer WhatsApp link', () => {
  function renderFooter() {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Footer />
        </I18nProvider>
      </MemoryRouter>,
    )
    return screen.getByRole('link', { name: /whatsapp/i })
  }

  it('points at the bare-digit wa.me number and opens safely', () => {
    const wa = renderFooter()
    expect(wa).toHaveAttribute('href', 'https://wa.me/995550506004')
    expect(wa).toHaveAttribute('target', '_blank')
    expect(wa).toHaveAttribute('rel', 'noreferrer')
  })

  it('keeps the tel: link beside it, untouched', () => {
    renderFooter()
    const tel = screen.getByText(contact.phone).closest('a')
    expect(tel).toHaveAttribute('href', `tel:${contact.phoneHref}`)
    expect(tel).toHaveAttribute('dir', 'ltr')
  })

  it('carries a 24px box and a focus-visible outline', () => {
    const wa = renderFooter()
    expect(wa.className).toContain('h-6')
    expect(wa.className).toContain('w-6')
    expect(wa.className).toContain('focus-visible:outline-2')
    // The glyph stays small so it does not outshout the social marks below.
    expect(wa.querySelector('svg')?.getAttribute('class')).toBe('h-4 w-4')
  })
})
