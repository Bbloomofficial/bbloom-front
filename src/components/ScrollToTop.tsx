import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * @param path Which change counts as a new page. Defaults to the address bar,
 *   but the marketing app passes the route rendered *behind* its sign-in dialog
 *   — opening that dialog changes the URL without changing the page, and
 *   scrolling then would lose the reader's place for the whole time it is open.
 */
export default function ScrollToTop({ path }: { path?: string }) {
  const { pathname } = useLocation()
  const key = path ?? pathname
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [key])
  return null
}
