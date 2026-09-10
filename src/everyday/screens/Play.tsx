/**
 * Play (#/): wordmark + evidence pill, four intent cards (one tap applies
 * the intent and starts), the player while running. A PWA shortcut may
 * land here as #/?intent=sleep — that intent is applied once and the
 * query is cleared.
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { copy } from '../copy';
import { applyIntent, intentById, intentFromPresetName, intentPreset, isIntentId, type Intent } from '../intents';
import { useEveryday } from '../useEveryday';
import { EvidenceSheet } from '../components/EvidenceSheet';
import { IntentCards, IntentChips } from '../components/IntentCards';
import { Player } from '../components/Player';

export default function Play() {
  const s = useSession();
  const ev = useEveryday();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [params, setParams] = useSearchParams();

  const current = ev.intent ? intentById(ev.intent) : intentFromPresetName(s.presetName);
  const grade = current ? intentPreset(current).grade : null;

  const pick = (intent: Intent) => {
    ev.setIntent(intent.id);
    applyIntent(s, intent);
  };

  // The router commits the cleared query in a transition; the session
  // setters are default-priority updates. Without the "handled" guard every
  // re-run would re-apply the intent and starve that transition forever.
  const wanted = params.get('intent');
  const handledRef = useRef<string | null>(null);
  const { setIntent } = ev;
  useEffect(() => {
    if (!isIntentId(wanted)) {
      handledRef.current = null;
      return;
    }
    if (handledRef.current === wanted) return;
    handledRef.current = wanted;
    setIntent(wanted);
    applyIntent(s, intentById(wanted));
    setParams({}, { replace: true });
  }, [wanted, s, setIntent, setParams]);

  return (
    <div className="ev-page" data-testid="screen-play">
      <header className="ev-top">
        <span className="ev-wordmark">{copy.app.wordmark}</span>
        <button type="button" className="ev-pill" data-testid="evidence-pill" onClick={() => setEvidenceOpen(true)}>
          {copy.evidence.pill}
          {grade ? ` ${grade}` : ''}
        </button>
      </header>

      {s.running ? (
        <>
          <IntentChips active={current?.id ?? null} onPick={pick} />
          <Player />
        </>
      ) : (
        <>
          <IntentCards onPick={pick} />
          {s.startBlocked.length > 0 && (
            <div className="ev-danger-row" role="alert" data-testid="start-blocked">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>{s.startBlocked[0]}</span>
            </div>
          )}
        </>
      )}

      <EvidenceSheet open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </div>
  );
}
