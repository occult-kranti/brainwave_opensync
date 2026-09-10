/**
 * Shared UI-layer hooks (W13 UX polish). Kept component-free so the
 * react-refresh fast-refresh rule stays clean.
 */

import { useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';

/**
 * Minimal modal a11y contract for the app's custom (non-Radix) overlays
 * (P0-4): Esc closes, focus moves inside on open, and focus returns to the
 * trigger element on close. Radix Dialog/Sheet surfaces get this for free;
 * this hook is for the hand-rolled ones (panic overlay, save-preset modal,
 * evidence sheet, MORE drawer, command palette). Pair with role="dialog" +
 * aria-modal.
 */
/** Open modals, bottom = oldest. Only the top-most one answers Escape and traps Tab. */
const modalStack: symbol[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y(
  open: boolean,
  onClose: () => void,
  initialFocus?: React.RefObject<HTMLElement | null>,
  /** Dialog root: when given, Tab / Shift+Tab wrap inside it (focus trap). */
  root?: React.RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const id = Symbol('modal');
    modalStack.push(id);
    const isTop = () => modalStack[modalStack.length - 1] === id;
    const restore = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const target = initialFocus?.current ?? root?.current;
      if (target) target.focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && root?.current) {
        const nodes = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement);
        if (nodes.length === 0) {
          e.preventDefault();
          root.current.focus();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const inside = !!active && root.current.contains(active);
        if (e.shiftKey && (!inside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      const i = modalStack.indexOf(id);
      if (i >= 0) modalStack.splice(i, 1);
      if (restore && document.contains(restore)) restore.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

const DENSITY_KEY = STORAGE_KEYS.density;

/**
 * P2 density preference: 'comfortable' (default) | 'compact', persisted in
 * localStorage and applied as `data-density` on <html>. Compact trims panel
 * padding/type only — the 44px hit-slop rules (knobs, faders, chips) are
 * untouched so touch targets stay ≥44px.
 */
export function useDensity(): ['comfortable' | 'compact', () => void] {
  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => {
    try {
      return window.localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable';
    } catch {
      return 'comfortable';
    }
  });
  useEffect(() => {
    document.documentElement.dataset.density = density;
    try {
      window.localStorage.setItem(DENSITY_KEY, density);
    } catch {
      /* private mode */
    }
  }, [density]);
  return [density, () => setDensity((d) => (d === 'compact' ? 'comfortable' : 'compact'))];
}

// ---------------------------------------------------------------------------
// v2: Screen Wake Lock
// ---------------------------------------------------------------------------

interface WakeLockSentinelLike {
  release(): Promise<void>;
}

function wakeLockApi(): { request(type: 'screen'): Promise<WakeLockSentinelLike> } | null {
  try {
    const wl = (navigator as unknown as { wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> } }).wakeLock;
    return wl && typeof wl.request === 'function' ? wl : null;
  } catch {
    return null;
  }
}

/**
 * Keep the display awake while `active` (a session is running) so a long
 * sleep-onset plan on a phone is not cut off by the screen locking — which
 * also suspends the AudioContext on some platforms. Re-acquires when the tab
 * returns to the foreground; releases on stop/pause. No-op without the API.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const api = wakeLockApi();
    if (!api) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let disposed = false;
    const acquire = async () => {
      if (disposed || document.visibilityState !== 'visible') return;
      try {
        const lock = await api.request('screen');
        if (disposed) {
          // The session ended while the request was in flight — never keep a dead lock.
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch {
        sentinel = null; // low battery / policy — silently degrade
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const s = sentinel;
      sentinel = null;
      void s?.release().catch(() => {});
    };
  }, [active]);
}
