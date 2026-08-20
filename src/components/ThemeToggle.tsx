import { useI18n } from '../i18n'
import { useTheme } from '../theme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      title={isDark ? t.theme.toLight : t.theme.toDark}
      className="icon-button"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-13.5a1 1 0 0 1 1 1V5a1 1 0 1 1-2 0v-.5a1 1 0 0 1 1-1Zm0 15a1 1 0 0 1 1 1v.5a1 1 0 1 1-2 0V19a1 1 0 0 1 1-1Zm8.5-6.5a1 1 0 0 1-1 1H19a1 1 0 1 1 0-2h.5a1 1 0 0 1 1 1Zm-15 0a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h.5a1 1 0 0 1 1 1Zm12.02-5.52a1 1 0 0 1 0 1.41l-.36.36a1 1 0 1 1-1.41-1.42l.35-.35a1 1 0 0 1 1.42 0ZM7.25 15.34a1 1 0 0 1 0 1.42l-.36.35a1 1 0 0 1-1.41-1.41l.35-.36a1 1 0 0 1 1.42 0Zm10.27 1.77a1 1 0 0 1-1.41 0l-.36-.35a1 1 0 0 1 1.41-1.42l.36.36a1 1 0 0 1 0 1.41ZM7.25 8.66a1 1 0 0 1-1.42 0l-.35-.36a1 1 0 0 1 1.41-1.41l.36.35a1 1 0 0 1 0 1.42Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M21.3 13.3A9 9 0 1 1 10.7 2.7a7 7 0 0 0 10.6 10.6Z" />
        </svg>
      )}
    </button>
  )
}
