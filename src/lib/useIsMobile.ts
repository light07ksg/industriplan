import { useEffect, useState } from 'react'

export const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)'

export function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
}

/** Reactive viewport check for the phone/desktop layout split — unlike the one-shot matchMedia
 * read used for initial theme, this needs to track orientation/resize changes while mounted. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(isMobileViewport)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
