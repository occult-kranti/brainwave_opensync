/**
 * First-run safety advisory (v2). The SafetyGovernor refuses every session
 * until the driving / machinery warning is acknowledged — v1 shipped that
 * rule but never enforced it at START. This dialog is the acknowledgment
 * surface: headphones + level, driving, seizure, medication precaution,
 * crisis line. One tap records the acknowledgment (persisted) and, when the
 * dialog was raised by START, continues into the session.
 */

import { useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, ShieldAlert } from 'lucide-react';
import { SafetyGovernor } from '@/safety/governor';
import { useSession } from '../session/useSession';
import { useModalA11y } from '../hooks';
import { PanicButton } from './Panic';

/**
 * Above the panic overlay (z-90) but BELOW the phone bottom bar (z-100) so the
 * bar's PANIC segment stays tappable; the desktop rail/status-bar PANIC is
 * covered by the backdrop, so the sheet carries its own PANIC button.
 */
const ADVISORY_Z = 95;

export function AdvisoryDialog() {
  const s = useSession();
  const open = s.advisoryOpen;
  const sheetRef = useRef<HTMLDivElement>(null);
  // Initial focus lands on the sheet itself, never on the affirmative button:
  // a held Enter on START must not acknowledge the advisory by key repeat.
  useModalA11y(open, s.closeAdvisory, sheetRef, sheetRef);
  const texts = useMemo(() => new SafetyGovernor().advisoryTexts(), []);
  const pendingStart = s.advisoryPendingStart;

  const items = [
    {
      title: 'Headphones, low level',
      body: 'Binaural sessions need one tone per ear. Start quiet — comfort beats intensity; the fader is capped at −6 dBFS and the weekly dose meter tracks every minute.',
    },
    { title: 'Never while driving', body: texts.driving },
    { title: 'Seizure-disorder notice', body: texts.seizure },
    { title: 'Medication precaution', body: texts.medication },
    { title: 'If you are in crisis', body: texts.crisis },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="advisory"
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisory-title"
          data-testid="advisory-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: ADVISORY_Z,
            background: 'rgba(11,12,13,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 16px calc(16px + 56px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            className="panel"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: 'min(640px, 100%)', maxHeight: 'calc(100vh - 32px - 56px)', overflow: 'auto', borderTop: '2px solid var(--amber)', outline: 'none' }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <ShieldAlert size={18} style={{ color: 'var(--amber)' }} />
              <h2 id="advisory-title" className="t-h3" style={{ color: 'var(--text-1)', flex: 1 }}>
                {pendingStart ? 'Before your first session' : 'Safety advisory'}
              </h2>
              <PanicButton />
            </div>
            <p className="t-body-sm" style={{ color: 'var(--text-2)', marginBottom: 16 }}>
              Open Sync is a wellness-tier audio instrument, not a medical device. Read these once; the
              acknowledgment is remembered on this device and can be reviewed any time in the Safety Center.
            </p>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
              {items.map((it, i) => (
                <li key={it.title} className="flex gap-3">
                  <span className="t-readout-sm" style={{ color: 'var(--amber)', minWidth: 22 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="t-label" style={{ color: 'var(--text-1)', marginBottom: 2 }}>
                      {i === 0 && <Headphones size={11} style={{ display: 'inline', marginRight: 6, verticalAlign: '-1px' }} />}
                      {it.title}
                    </div>
                    <p className="t-body-sm" style={{ color: 'var(--text-2)', margin: 0 }}>
                      {it.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex gap-2" style={{ marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-amber"
                data-testid="advisory-accept"
                onKeyDown={(e) => {
                  if (e.repeat) e.preventDefault();
                }}
                onClick={() => s.acknowledgeAdvisory({ andStart: pendingStart })}
              >
                {pendingStart ? 'I UNDERSTAND — START' : 'I UNDERSTAND'}
              </button>
              <button type="button" className="btn-ghost" data-testid="advisory-dismiss" onClick={s.closeAdvisory}>
                {pendingStart ? 'NOT NOW' : 'CLOSE'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
