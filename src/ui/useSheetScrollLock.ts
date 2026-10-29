import { useEffect } from 'react';

let sheetLocks = 0;
let bodyOverflow = '';
let rootOverflow = '';

/** A sheet scrolls within its own viewport; closing it restores the page position. */
export function useSheetScrollLock(open: boolean): void {
  useEffect(() => {
    if (!open) return;
    if (sheetLocks === 0) {
      bodyOverflow = document.body.style.overflow;
      rootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    sheetLocks += 1;
    return () => {
      sheetLocks -= 1;
      if (sheetLocks === 0) {
        document.body.style.overflow = bodyOverflow;
        document.documentElement.style.overflow = rootOverflow;
      }
    };
  }, [open]);
}
