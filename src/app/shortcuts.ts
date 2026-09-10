/**
 * Keyboard shortcut registry — one table drives the global key handler in
 * AppShell and the `?` help overlay, so the two can never drift apart.
 *
 * Every binding ignores typing contexts (inputs, textareas, selects,
 * contentEditable) and modifier-key chords unless the binding asks for one.
 */

export interface Shortcut {
  id: string;
  /** Display keys, e.g. ['⌘', 'K'] — rendered as key caps. */
  keys: string[];
  label: string;
  group: 'Navigation' | 'Transport' | 'Safety' | 'Help';
  /** Matcher against a KeyboardEvent (already filtered for typing contexts). */
  match: (e: KeyboardEvent) => boolean;
  /** Allow the binding to fire even while an input is focused (none today; kept for the registry contract). */
  alwaysActive?: boolean;
}

function isActivatable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A');
}

const noMods = (e: KeyboardEvent) => !e.metaKey && !e.ctrlKey && !e.altKey;

export const SHORTCUTS: readonly Shortcut[] = [
  {
    id: 'palette',
    keys: ['⌘/Ctrl', 'K'],
    label: 'Command palette — jump to any screen, run any action',
    group: 'Navigation',
    match: (e) => (e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K'),
  },
  {
    id: 'sidebar',
    keys: ['['],
    label: 'Cycle sidebar: full → icons → hidden',
    group: 'Navigation',
    match: (e) => noMods(e) && e.key === '[',
  },
  {
    id: 'pause',
    keys: ['Space'],
    label: 'Pause / resume the running session',
    group: 'Transport',
    // Space is the activation key for focused buttons/links — never double-fire there.
    match: (e) => noMods(e) && !e.repeat && (e.key === ' ' || e.code === 'Space') && !isActivatable(e.target),
  },
  {
    id: 'mute',
    keys: ['M'],
    label: 'Mute / unmute the output',
    group: 'Transport',
    match: (e) => noMods(e) && !e.repeat && (e.key === 'm' || e.key === 'M'),
  },
  {
    id: 'fade',
    keys: ['F'],
    label: 'Start the sleep fade now (uses the Studio fade length)',
    group: 'Transport',
    match: (e) => noMods(e) && !e.repeat && (e.key === 'f' || e.key === 'F'),
  },
  {
    id: 'panic',
    keys: ['P'],
    label: 'PANIC — hard-stop every sound, no confirmation',
    group: 'Safety',
    match: (e) => noMods(e) && !e.shiftKey && (e.key === 'p' || e.key === 'P'),
  },
  {
    id: 'panic-rehearse',
    keys: ['Shift', 'P'],
    label: 'Rehearse the panic sequence (no audio is touched)',
    group: 'Safety',
    match: (e) => noMods(e) && e.shiftKey && (e.key === 'p' || e.key === 'P'),
  },
  {
    id: 'help',
    keys: ['?'],
    label: 'Show this shortcut list',
    group: 'Help',
    match: (e) => noMods(e) && e.key === '?',
  },
  {
    id: 'escape',
    keys: ['Esc'],
    label: 'Close any overlay (palette, dialogs, this sheet)',
    group: 'Help',
    match: () => false, // handled by each overlay's a11y hook; listed for discoverability
  },
];

/** True when the event target is a typing context (shortcuts must stay inert). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable ||
    target.getAttribute('role') === 'textbox' ||
    target.getAttribute('role') === 'slider'
  );
}

/** Resolve a keydown to a shortcut id, honoring typing contexts. */
export function matchShortcut(e: KeyboardEvent, shortcuts: readonly Shortcut[] = SHORTCUTS): Shortcut | null {
  const typing = isTypingTarget(e.target);
  for (const s of shortcuts) {
    if (typing && !s.alwaysActive) continue;
    if (s.match(e)) return s;
  }
  return null;
}
