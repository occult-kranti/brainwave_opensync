/**
 * Service-worker registration (vite-plugin-pwa, `registerType: 'prompt'`).
 * The app shell is precached; audio assets are cached on first play. When a
 * new build is waiting we surface an "update available" event that the shell
 * turns into a status-bar chip — never a forced reload mid-session.
 */

export const PWA_UPDATE_EVENT = 'open-sync:pwa-update';

let applyUpdate: (() => void) | null = null;

export function registerPwa(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || import.meta.env.DEV) return;
  // Loaded lazily so tests and the dev server never touch the SW runtime.
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const update = registerSW({
        immediate: true,
        onNeedRefresh() {
          applyUpdate = () => update(true);
          window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT));
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
