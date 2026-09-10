import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

const getServerSnapshot = (): boolean => false;

/**
 * Phone-shell breakpoint (`max-width: 767px`, matching Tailwind `md`).
 *
 * Decides from the media query, never from `window.innerWidth`: on phones the
 * layout viewport grows when desktop-width content overflows, so innerWidth
 * can read 1100 px on a 390 px screen while the query still says mobile. v1
 * read innerWidth, and a lazily-loaded page could therefore mount in desktop
 * mode under a mobile shell. Read through useSyncExternalStore so the first
 * render already knows (no effect → setState round trip).
 */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
