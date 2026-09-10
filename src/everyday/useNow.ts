/**
 * Wall-clock seconds as an external store (react-hooks/purity forbids
 * Date.now() during render). Subscribers re-render once a second.
 */

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function getSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

/** Current time in whole seconds since the epoch (ticks every second). */
export function useNowSec(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
