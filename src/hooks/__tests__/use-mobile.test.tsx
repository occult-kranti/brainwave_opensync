// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useIsMobile } from '../use-mobile';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let seen: boolean | null = null;
function Probe() {
  seen = useIsMobile();
  return null;
}

function mockMedia(matches: boolean, innerWidth: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: innerWidth });
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }) as unknown as typeof window.matchMedia;
}

let root: Root | null = null;
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  seen = null;
});

async function mount() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  root = createRoot(el);
  await act(async () => root!.render(<Probe />));
}

describe('useIsMobile decides from the media query, never from innerWidth', () => {
  it('reports mobile when the query matches even though innerWidth was inflated by overflow', async () => {
    mockMedia(true, 1106);
    await mount();
    expect(seen).toBe(true);
  });

  it('reports desktop when the query does not match even at a narrow innerWidth', async () => {
    mockMedia(false, 390);
    await mount();
    expect(seen).toBe(false);
  });
});
