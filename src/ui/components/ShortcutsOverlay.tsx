/**
 * `?` keyboard-shortcut sheet — rendered from the registry in
 * src/app/shortcuts.ts so the list is always exactly what the shell binds.
 */

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { SHORTCUTS } from '@/app/shortcuts';
import { useModalA11y } from '../hooks';

/** Below the phone bottom bar (z-100) so PANIC stays tappable; above the panic overlay (z-90). */
const OVERLAY_Z = 96;
const GROUPS = ['Navigation', 'Transport', 'Safety', 'Help'] as const;

export function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  useModalA11y(open, onClose, closeRef, sheetRef);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="shortcuts"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          data-testid="shortcuts-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: OVERLAY_Z,
            background: 'rgba(11,12,13,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 16px calc(16px + 56px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <motion.div
            ref={sheetRef}
            className="panel"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ width: 'min(560px, 100%)', maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <Keyboard size={16} style={{ color: 'var(--amber)' }} />
              <span className="t-label" style={{ color: 'var(--text-1)', flex: 1 }}>
                KEYBOARD SHORTCUTS
              </span>
              <button ref={closeRef} type="button" className="chip" onClick={onClose} aria-label="Close shortcuts" style={{ padding: '0 8px' }}>
                <X size={12} />
              </button>
            </div>
            {GROUPS.map((g) => (
              <div key={g} style={{ marginBottom: 14 }}>
                <div className="t-caption font-mono2" style={{ color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6 }}>
                  {g.toUpperCase()}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SHORTCUTS.filter((s) => s.group === g).map((s) => (
                    <li key={s.id} className="flex items-center gap-3">
                      <span className="flex gap-1" style={{ minWidth: 112 }}>
                        {s.keys.map((k) => (
                          <kbd key={k} className="kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                      <span className="t-body-sm" style={{ color: 'var(--text-2)' }}>
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
