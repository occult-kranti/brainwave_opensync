/**
 * EverydayProvider — the little state the calm half keeps beside the shared
 * session: the chosen intent, the theme setting, and a captured install
 * prompt. Exports only the provider (react-refresh rule); the hook is in
 * useEveryday.ts.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { IntentId } from './intents';
import { applyTheme, readTheme, writeTheme, type ThemeSetting } from './theme';
import { EverydayCtx, type EverydayState, type InstallPromptEvent } from './useEveryday';

export function EverydayProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [theme, setThemeState] = useState<ThemeSetting>(readTheme);
  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);

  // The theme is a DOM attribute on <html>: applied in an effect, never during render.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeSetting) => {
    writeTheme(t);
    setThemeState(t);
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (!installEvt) return;
    void installEvt.prompt().catch(() => {
      /* the browser declined to show it — the hint row takes over */
    });
    setInstallEvt(null);
  }, [installEvt]);

  const value = useMemo<EverydayState>(
    () => ({ intent, setIntent, theme, setTheme, canInstall: installEvt !== null, promptInstall }),
    [intent, theme, setTheme, installEvt, promptInstall],
  );

  return <EverydayCtx.Provider value={value}>{children}</EverydayCtx.Provider>;
}
