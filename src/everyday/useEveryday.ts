/**
 * Everyday app context object + consumer hook. The provider component lives
 * in state.tsx (react-refresh: a .tsx exports components only).
 */

import { createContext, useContext } from 'react';
import type { IntentId } from './intents';
import type { ThemeSetting } from './theme';

/** The `beforeinstallprompt` event (not in lib.dom). */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface EverydayState {
  /** The intent the user chose (null until the first tap). */
  intent: IntentId | null;
  setIntent: (id: IntentId | null) => void;
  theme: ThemeSetting;
  setTheme: (t: ThemeSetting) => void;
  /** True while the browser offers an install prompt we captured. */
  canInstall: boolean;
  promptInstall: () => void;
}

export const EverydayCtx = createContext<EverydayState | null>(null);

export function useEveryday(): EverydayState {
  const ctx = useContext(EverydayCtx);
  if (!ctx) throw new Error('useEveryday must be used inside EverydayProvider');
  return ctx;
}
