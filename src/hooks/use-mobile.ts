import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Phone-shell breakpoint (`max-width: 767px`, matching Tailwind `md`).
 *
 * Decides from the media query, never from `window.innerWidth`: on phones the
 * layout viewport grows when desktop-width content overflows, so innerWidth
 * can read 1100 px on a 390 px screen while the query still says mobile. v1
 * read innerWidth, and a lazily-loaded page could therefore mount in desktop
 * mode under a mobile shell.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
