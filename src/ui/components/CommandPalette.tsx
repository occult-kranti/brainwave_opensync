/**
 * ⌘K command palette (ux_improvement_spec §3.1, P1-1). One keystroke to every
 * module plus the transport/session actions. Built on cmdk (already a dep)
 * inside a hand-rolled dialog shell that honors the P0-4 contract via
 * useModalA11y: Esc closes, focus returns to the invoking element.
 */

import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Compass,
  Keyboard,
  Link2,
  MoonStar,
  RotateCcw,
  Download,
  OctagonX,
  PanelLeft,
  Pause,
  Play,
  Baby,
  Square,
} from 'lucide-react';
import { useSession } from '../session/useSession';
import { useModalA11y } from '../hooks';
import { NAVIGATION_CATEGORIES, NAVIGATION_ENTRIES, navigationMatches } from '../../app/navigation';


/** Hint chip for the status bar: visible, focusable, opens the palette. */
export function PaletteHint({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      data-testid="palette-hint"
      aria-label="Open command palette (Ctrl+K)"
      onClick={onOpen}
      className="chip"
      style={{ height: 24, padding: '0 8px', fontSize: 10 }}
      title="Find a tool or run an action"
    >
      FIND
    </button>
  );
}

export function CommandPalette({
  open,
  onClose,
  onShowShortcuts,
  onToggleSidebar,
}: {
  open: boolean;
  onClose: () => void;
  /** Desktop shell only: cycles the collapsible module rail (full → icon → hidden). */
  onToggleSidebar?: () => void;
  /** Open the `?` keyboard-shortcuts sheet. */
  onShowShortcuts?: () => void;
}) {
  const s = useSession();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  // P0-4 contract: Esc closes; input focused on open; focus returns to trigger.
  useModalA11y(open, onClose, inputRef);

  const actions = useMemo(
    () =>
      [
        ...(onToggleSidebar
          ? [
              {
                id: 'sidebar',
                label: 'TOGGLE SIDEBAR',
                icon: PanelLeft,
                hint: '[',
                run: onToggleSidebar,
              } as const,
            ]
          : []),
        {
          id: 'transport',
          label: s.running ? 'STOP SESSION' : 'START SESSION',
          icon: s.running ? Square : Play,
          hint: 'transport',
          run: () => (s.running ? s.stop() : s.start()),
        },
        {
          id: 'pause',
          label: s.paused ? 'RESUME SESSION' : 'PAUSE SESSION',
          icon: s.paused ? Play : Pause,
          hint: 'Space · no-op while idle',
          run: () => s.togglePause(),
        },
        {
          id: 'export',
          label: 'EXPORT SESSION AS WAV',
          icon: Download,
          hint: 'worker render · capped at the limit',
          run: () => void s.exportWav(),
        },
        {
          id: 'share',
          label: 'COPY SHARE LINK FOR THIS SETUP',
          icon: Link2,
          hint: 'reproduces the front panel anywhere',
          run: () => {
            const url = s.getShareLink();
            void navigator.clipboard?.writeText?.(url).catch(() => window.prompt('Share link', url));
          },
        },
        ...(s.running && !s.fading
          ? [
              {
                id: 'fade',
                label: 'SLEEP FADE NOW',
                icon: MoonStar,
                hint: 'F · ramp to silence, then stop',
                run: () => void s.startSleepFade(),
              } as const,
            ]
          : []),
        {
          id: 'reset-panel',
          label: 'RESET FRONT PANEL TO DEFAULTS',
          icon: RotateCcw,
          hint: s.running ? 'stop the session first' : 'presets and dose are kept',
          run: () => {
            if (!s.running) s.resetFrontPanel();
          },
        },
        ...(onShowShortcuts
          ? [
              {
                id: 'shortcuts',
                label: 'KEYBOARD SHORTCUTS',
                icon: Keyboard,
                hint: '?',
                run: onShowShortcuts,
              } as const,
            ]
          : []),
        {
          id: 'infant',
          label: s.governor.infantMode ? 'INFANT MODE: OFF' : 'INFANT MODE: ON',
          icon: Baby,
          hint: 'safety governor',
          run: () => s.setGovernor({ infantMode: !s.governor.infantMode }),
        },
        {
          id: 'guide-entry',
          label: 'READ THE GUIDE — HOW EVERY FEATURE WORKS',
          icon: Compass,
          hint: 'docs',
          run: () => navigate('/guide'),
        },
      ],
    [s, navigate, onToggleSidebar, onShowShortcuts],
  );

  const runAndClose = (run: () => void) => {
    run();
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-testid="command-palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(11,12,13,0.7)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 'min(18vh, 160px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, calc(100vw - 32px))',
              background: 'var(--ink-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', borderBottom: '1px solid var(--line-1)' }}>
              <span className="t-body-sm text-2">Find a tool</span>
              <button type="button" className="chip" data-testid="palette-stop-all" onClick={() => runAndClose(() => s.panic())}
                style={{ minHeight: 44, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                <OctagonX size={15} aria-hidden="true" />Stop all sound
              </button>
            </div>
            <Command label="Command palette" loop shouldFilter={false}>
              <Command.Input
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Find a tool: chord, recording, Bashar…"
                className="font-mono2"
                style={{
                  width: '100%',
                  background: 'var(--ink-1)',
                  border: 'none',
                  borderBottom: '1px solid var(--line-1)',
                  color: 'var(--text-1)',
                  padding: '12px 14px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <Command.List style={{ maxHeight: 400, overflowY: 'auto', padding: 6 }}>
                {!actions.some((action) => `${action.label} ${action.hint}`.toLowerCase().includes(query.trim().toLowerCase())) && !NAVIGATION_ENTRIES.some((entry) => navigationMatches(entry, query)) && (
                  <div className="t-body-sm text-3" style={{ padding: '12px 14px' }} role="status">
                    No tools or actions match “{query}”. <button type="button" className="chip" onClick={() => setQuery('')}>Clear search</button>
                  </div>
                )}
                <Command.Group
                  heading="ACTIONS"
                  style={{ ['--cmdk-group-heading-color' as string]: 'var(--text-3)' } as React.CSSProperties}
                >
                  {actions.filter((action) => `${action.label} ${action.hint}`.toLowerCase().includes(query.trim().toLowerCase())).map((a) => (
                    <PaletteItem key={a.id} onSelect={() => runAndClose(a.run)} hint={a.hint}>
                      <a.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                      {a.label}
                    </PaletteItem>
                  ))}
                </Command.Group>
                {NAVIGATION_CATEGORIES.map((category) => {
                  const entries = NAVIGATION_ENTRIES.filter((entry) => entry.category === category.id && navigationMatches(entry, query));
                  return entries.length > 0 && <Command.Group key={category.id} heading={category.title}>
                    {entries.map(({ route, title, description }) => <PaletteItem key={route.path} value={route.path} onSelect={() => runAndClose(() => navigate(route.path))}>
                      <route.icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                      <span style={{ minWidth: 0 }}><span>{title}</span><span className="t-caption text-2" style={{ display: 'block', marginTop: 4, lineHeight: 1.4, letterSpacing: 0 }}>{description}</span></span>
                    </PaletteItem>)}
                  </Command.Group>;
                })}
              </Command.List>
              <div
                className="t-caption text-3 flex items-center gap-4"
                style={{ padding: '8px 14px', borderTop: '1px solid var(--line-1)' }}
              >
                <span>↑↓ navigate</span>
                <span>↵ run</span>
                <span>esc close</span>
                <span style={{ marginLeft: 'auto' }}>⌘K / Ctrl+K anywhere</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({
  children,
  hint,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  value?: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="t-label"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px',
        minHeight: 44,
        borderRadius: 2,
        cursor: 'pointer',
        color: 'var(--text-2)',
      }}
      data-hint={hint}
    >
      {children}
      {hint && (
        <span className="t-caption text-3" style={{ marginLeft: 'auto' }}>
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
