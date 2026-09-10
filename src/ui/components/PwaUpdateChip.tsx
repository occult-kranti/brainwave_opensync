/**
 * Status-bar chip shown when a new service-worker build is waiting. Applying
 * reloads the page, so it is never automatic — a running session is never
 * interrupted by an update.
 */

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PWA_UPDATE_EVENT, applyPwaUpdate, hasPendingPwaUpdate } from '@/app/pwa';
import { useSessionOptional } from '../session/useSession';

export function PwaUpdateChip() {
  const [ready, setReady] = useState(hasPendingPwaUpdate);
  const running = useSessionOptional()?.running ?? false;
  useEffect(() => {
    const on = () => setReady(true);
    window.addEventListener(PWA_UPDATE_EVENT, on);
    return () => window.removeEventListener(PWA_UPDATE_EVENT, on);
  }, []);
  if (!ready) return null;
  return (
    <button
      type="button"
      className="chip chip-active"
      data-testid="pwa-update"
      onClick={applyPwaUpdate}
      disabled={running}
      title={running ? 'A new version is ready — stop the session to apply it (applying reloads the app)' : 'A new version is ready — reloads the app'}
      style={{ height: 24, padding: '0 8px', fontSize: 10 }}
    >
      <RefreshCw size={11} /> UPDATE
    </button>
  );
}
