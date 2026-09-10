/**
 * Everyday theme setting (Auto / Dark / Light) → `data-theme` on <html>.
 *
 * Persistence exception: src/lib/storage.ts is the app's key registry, but
 * it is owned by the lab and this module may not edit it. The theme is a
 * per-device cosmetic preference, so it is kept under its own literal key
 * with try/catch guards (private mode, quota, no window). If the registry
 * later gains an everyday-theme entry, move this key there unchanged.
 */

export type ThemeSetting = 'auto' | 'dark' | 'light';

export const THEME_SETTINGS: readonly ThemeSetting[] = ['auto', 'dark', 'light'];

export const THEME_STORAGE_KEY = 'open-sync:everyday-theme.v1';

export function isThemeSetting(v: unknown): v is ThemeSetting {
  return v === 'auto' || v === 'dark' || v === 'light';
}

export function readTheme(): ThemeSetting {
  try {
    if (typeof localStorage === 'undefined') return 'auto';
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeSetting(raw) ? raw : 'auto';
  } catch {
    return 'auto';
  }
}

export function writeTheme(theme: ThemeSetting): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (theme === 'auto') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage blocked — the in-memory setting still applies */
  }
}

/** Stamp (or clear, for Auto) `data-theme` on the root element. */
export function applyTheme(theme: ThemeSetting, root: HTMLElement | null = typeof document === 'undefined' ? null : document.documentElement): void {
  if (!root) return;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}
