/**
 * Service-worker registration (vite-plugin-pwa, `registerType: 'prompt'`).
 * The app shell is precached; audio assets are cached on first play. When a
 * new build is waiting we surface an "update available" event that the shell
 * turns into a status-bar chip — never a forced reload mid-session.
 */

export const PWA_UPDATE_EVENT = 'open-sync:pwa-update';

let applyUpdate: (() => void) | null = null;
let pending = false;
/** Returns true while a reload would interrupt a live session (registered by the session provider). */
let reloadGuard: (() => boolean) | null = null;
let deferredReload = false;

export function setPwaReloadGuard(guard: (() => boolean) | null): void {
  reloadGuard = guard;
}

/** Called by the session layer when a session ends: perform a reload that was held back. */
export function flushDeferredPwaReload(): void {
  if (!deferredReload) return;
  deferredReload = false;
  window.location.reload();
}

/** True once a new build is waiting (survives chip remounts across breakpoints). */
export function hasPendingPwaUpdate(): boolean {
  return pending;
}

export function registerPwa(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || import.meta.env.DEV) return;
  // Loaded lazily so tests and the dev server never touch the SW runtime.
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const update = registerSW({
        immediate: true,
        onNeedRefresh() {
          pending = true;
          applyUpdate = () => update(true);
          window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT));
        },
        // Another tab applied the update: the new worker now controls this
        // tab too. Reload only when no session is running here; otherwise
        // wait for it to end (the old assets keep working until then).
        onNeedReload() {
          if (reloadGuard?.()) deferredReload = true;
          else window.location.reload();
        },
      });
    })
    .catch(() => {
      /* SW unsupported / blocked — the app works without it */
    });
}

/** Apply a waiting update (reloads the page). No-op when none is pending. */
export function applyPwaUpdate(): void {
  applyUpdate?.();
}
