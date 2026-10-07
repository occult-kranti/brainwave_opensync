/** Shared on/off state for the Field4D ambient backdrop (stored per device). */
import { useState } from 'react';

const STORAGE_KEY = 'opensync.field4d';

export function useField4d(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState<boolean>(() => {
    try { return window.localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });
  const set = (next: boolean) => {
    setOn(next);
    try { window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* storage optional */ }
  };
  return [on, set];
}
