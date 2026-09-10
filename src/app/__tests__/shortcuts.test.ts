// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { SHORTCUTS, isTypingTarget, matchShortcut } from '../shortcuts';

function key(init: KeyboardEventInit, target?: HTMLElement): KeyboardEvent {
  const e = new KeyboardEvent('keydown', init);
  if (target) Object.defineProperty(e, 'target', { value: target });
  return e;
}

describe('shortcut registry', () => {
  it('has unique ids and every entry has display keys', () => {
    expect(new Set(SHORTCUTS.map((s) => s.id)).size).toBe(SHORTCUTS.length);
    for (const s of SHORTCUTS) expect(s.keys.length).toBeGreaterThan(0);
  });

  it('matches the documented bindings', () => {
    expect(matchShortcut(key({ key: 'k', ctrlKey: true }))?.id).toBe('palette');
    expect(matchShortcut(key({ key: 'K', metaKey: true }))?.id).toBe('palette');
    expect(matchShortcut(key({ key: '[' }))?.id).toBe('sidebar');
    expect(matchShortcut(key({ key: ' ' }))?.id).toBe('pause');
    expect(matchShortcut(key({ key: 'm' }))?.id).toBe('mute');
    expect(matchShortcut(key({ key: 'f' }))?.id).toBe('fade');
    expect(matchShortcut(key({ key: 'p' }))?.id).toBe('panic');
    expect(matchShortcut(key({ key: 'P', shiftKey: true }))?.id).toBe('panic-rehearse');
    expect(matchShortcut(key({ key: '?', shiftKey: true }))?.id).toBe('help');
    expect(matchShortcut(key({ key: 'x' }))).toBeNull();
    // chords with alt/ctrl never trigger the plain-letter bindings
    expect(matchShortcut(key({ key: 'p', ctrlKey: true }))).toBeNull();
  });

  it('stays inert while typing and never double-fires Space on buttons', () => {
    const input = document.createElement('input');
    const div = document.createElement('div');
    div.contentEditable = 'true';
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(document.createElement('select'))).toBe(true);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(matchShortcut(key({ key: ' ' }, input))).toBeNull();
    expect(matchShortcut(key({ key: 'm' }, input))).toBeNull();
    expect(matchShortcut(key({ key: 'p' }, input))).toBeNull(); // typing "p" in a name field must not panic
    expect(matchShortcut(key({ key: '[' }, div))).toBeNull();
    expect(matchShortcut(key({ key: ' ' }, document.createElement('button')))).toBeNull();
    expect(matchShortcut(key({ key: 'm' }, document.createElement('button')))?.id).toBe('mute');
  });
});
