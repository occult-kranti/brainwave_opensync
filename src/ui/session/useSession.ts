/**
 * Session context object + consumer hooks. The provider lives in
 * SessionContext.tsx; every screen and component reads through here.
 */

import { createContext, useContext } from 'react';
import type { SessionActions, SessionSnapshot } from './types';

export const SessionCtx = createContext<(SessionSnapshot & SessionActions) | null>(null);

export function useSession(): SessionSnapshot & SessionActions {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Like useSession but returns null outside a provider (SSR smoke renders). */
export function useSessionOptional(): (SessionSnapshot & SessionActions) | null {
  return useContext(SessionCtx);
}
