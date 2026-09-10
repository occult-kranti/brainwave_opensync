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
  /**
   * Where the binding is live. `plain` (default): inert in any typing or
   * value-editing context. `controls`: fires from selects / sliders / knobs,
   * inert only in real text entry (the emergency stop). `anywhere`: modifier
   * chords, which cannot collide with typing.
   */
  scope?: 'plain' | 'controls' | 'anywhere';
}

const ACTIVATABLE_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'slider', 'switch', 'tab', 'menuitem', 'option']);

/** Elements that Space/Enter activate natively or by ARIA contract. */
function isActivatable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY' || tag === 'INPUT') return true;
  const role = target.getAttribute('role');
  return !!role && ACTIVATABLE_ROLES.has(role);
}

const noMods = (e: KeyboardEvent) => !e.metaKey && !e.ctrlKey && !e.altKey;

export const SHORTCUTS: readonly Shortcut[] = [
  {
    id: 'palette',
    keys: ['⌘/Ctrl', 'K'],
    label: 'Command palette — jump to any screen, run any action',
    group: 'Navigation',
    match: (e) => (e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K'),
    scope: 'anywhere',
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
    // Space activates focused buttons/links/ARIA widgets — never double-fire there.
    match: (e) => noMods(e) && !e.repeat && !e.defaultPrevented && (e.key === ' ' || e.code === 'Space') && !isActivatable(e.target),
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
    label: 'PANIC — hard-stop every sound, no confirmation (works from any control, not while typing)',
    group: 'Safety',
    match: (e) => noMods(e) && !e.shiftKey && (e.key === 'p' || e.key === 'P'),
    scope: 'controls',
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

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'password', 'number', 'tel', '']);

/** True for real text entry: typing letters here must never trigger a letter binding (P included). */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') return TEXT_INPUT_TYPES.has(((target as HTMLInputElement).type || '').toLowerCase());
  return target.isContentEditable || target.getAttribute('role') === 'textbox';
}

/** True when the event target is any typing/value-editing context (plain-letter shortcuts stay inert). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (isTextEntryTarget(target)) return true;
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'SELECT' || target.getAttribute('role') === 'slider' || target.getAttribute('role') === 'spinbutton';
}

/** Resolve a keydown to a shortcut id, honoring typing contexts. */
export function matchShortcut(e: KeyboardEvent, shortcuts: readonly Shortcut[] = SHORTCUTS): Shortcut | null {
  const textEntry = isTextEntryTarget(e.target);
  const typing = textEntry || isTypingTarget(e.target);
  for (const s of shortcuts) {
    const scope = s.scope ?? 'plain';
    if (scope === 'plain' && typing) continue;
    if (scope === 'controls' && textEntry) continue;
    if (s.match(e)) return s;
  }
  return null;
}
