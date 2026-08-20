import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from './en'
import { ka } from './ka'
import type { Dict } from './types'

export const locales = [
  { code: 'ka', label: 'ქართული', short: 'KA' },
  { code: 'en', label: 'English', short: 'EN' },
] as const

export type Locale = (typeof locales)[number]['code']

const dictionaries: Record<Locale, Dict> = { en, ka }

const STORAGE_KEY = 'bbloom:locale'

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ka'
}

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'ka'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : 'ka'
}

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dict
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = dictionaries[locale].meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', dictionaries[locale].meta.description)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside an I18nProvider')
  return context
}
