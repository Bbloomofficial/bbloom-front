import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { I18nProvider } from './i18n'
import { ThemeProvider } from './theme'
import { panelHostExit } from './routes'
import './index.css'

// The client dashboard used to be its own website on `panel.bbloom.ge`. It is
// part of the main site now, so that hostname forwards path-for-path. This
// happens before the app mounts rather than inside a route, so nobody sees a
// frame of the old panel first, and `replace` keeps the dead address out of the
// visitor's history.
//
// Sessions are per-origin, so anyone signed in on the old hostname signs in
// again on the new one. That is the cost of the move and it is paid once.
const exit = panelHostExit()
if (exit) {
  window.location.replace(exit)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
