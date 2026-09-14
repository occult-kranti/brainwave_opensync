/**
 * PanicButton (status-bar quick variant + full Safety-Center variant) and the
 * PanicOverlay (safety.md): single-press, no confirm, instant mute, dim
 * overlay that keeps sound off unless Studio playback is explicitly chosen.
 */

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OctagonX } from 'lucide-react';
import { useSession } from '../session/useSession';
import { useModalA11y } from '../hooks';

/** Compact status-bar panic button (danger outline). */
export function PanicButton() {
  const { panic } = useSession();
  return (
    <button
      type="button"
      onClick={panic}
      title="Stop all sound (P). Stops sessions and previews immediately."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        padding: '0 12px',
        border: '1px solid var(--danger)',
        borderRadius: 2,
        color: 'var(--danger)',
        background: 'rgba(196,99,79,0.1)',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
        cursor: 'pointer',
      }}
    >
      <OctagonX size={13} />
      Stop all sound
    </button>
  );
}

/**
 * Bottom-bar panic button (mobile shell): ≥56px tall persistent segment pinned
 * at the trailing end of the bottom nav. Single tap, no confirm — the touch
 * replacement for the `P` hotkey. Rendered inside a bar whose z-index (100)
 * clears the grain overlay (z-60) AND the PanicOverlay (z-90), so panic is
 * never behind an overlay.
 */
export function MobilePanicButton() {
  const { panic } = useSession();
  return (
    <button
      type="button"
      data-testid="mobile-panic"
      aria-label="Stop all sound. Stops sessions and previews immediately."
      onClick={panic}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100%',
        minHeight: 56,
        height: '100%',
        padding: '0 8px',
        border: 'none',
        borderLeft: '1px solid var(--danger)',
        color: 'var(--danger)',
        background: 'rgba(196,99,79,0.14)',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 9.5,
        lineHeight: 1.2,
        whiteSpace: 'normal',
        fontWeight: 600,
        letterSpacing: '0.03em',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      <OctagonX size={16} />
      <span>Stop all sound</span>
    </button>
  );
}

/** Full-width Safety Center panic button (96px, danger fill). */
export function PanicButtonLarge() {
  const { panic } = useSession();
  return (
    <button
      type="button"
      onClick={panic}
      style={{
        position: 'relative',
        width: '100%',
        height: 96,
        background: 'var(--danger)',
        color: 'var(--text-inv)',
        border: '2px solid var(--danger-hi)',
        borderRadius: 2,
        fontFamily: '"Space Grotesk", sans-serif',
        fontWeight: 600,
        fontSize: 20,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(196,99,79,0.25)',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 2,
          height: 8,
          background: 'var(--text-inv)',
          opacity: 0.7,
        }}
      />
      Stop all sound
    </button>
  );
}

/** Full-screen dim overlay shown after a panic stop. */
export function PanicOverlay() {
  const { panicked, resumeSafely, running, dismissPanic } = useSession();
  const open = panicked && !running;
  const keepOffRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Closing or accepting the default action never starts audio.
  useModalA11y(open, dismissPanic, keepOffRef, dialogRef);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="sound-stopped-backdrop"
          onClick={(event) => { if (event.target === event.currentTarget) dismissPanic(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(11,12,13,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px 88px',
          }}
        >
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="sound-stopped-title" tabIndex={-1}
            className="panel" style={{ width: 'min(480px, 100%)', maxHeight: 'calc(100dvh - 112px)', overflow: 'auto', padding: 24 }}>
            <h2 id="sound-stopped-title" className="t-h2" style={{ color: 'var(--text-1)', marginBottom: 12 }}>Sound is off</h2>
            <p className="t-body-sm text-2" style={{ marginBottom: 20 }}>Keep sound off returns to the page. Play Studio quietly starts or continues the current Studio session at a reduced output level. Stopped previews stay off.</p>
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              ref={keepOffRef}
              onClick={dismissPanic}
              className="btn-amber"
              style={{ minHeight: 44 }}
            >
              Keep sound off
            </button>
            <button
              type="button"
              onKeyDown={(event) => { if (event.repeat) event.preventDefault(); }}
              onClick={resumeSafely}
              style={{
                minHeight: 44,
                padding: '0 16px',
                border: '1px solid var(--line-2)',
                borderRadius: 2,
                color: 'var(--text-1)',
                background: 'transparent',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.03em',
                cursor: 'pointer',
              }}
            >
              Play Studio quietly
            </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
