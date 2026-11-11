// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudioAnalysis from '../instrument/AudioAnalysis';
import type { Signal } from '../instrument/signal';

vi.mock('../instrument/analysisDraw', () => ({
  drawLevelsHistory: vi.fn(), drawSpectrogram: vi.fn(), drawSpectrum: vi.fn(),
  drawStereo: vi.fn(), drawWaveform: vi.fn(),
}));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const left = Float32Array.from({ length: 2048 }, (_, index) => .25 * Math.sin(index * Math.PI * 2 * 440 / 48000));
const signal: Signal = { left, right: left, sampleRate: 48000, hz: 440, level: .25, bands: [0, .5, 0] };
let host: HTMLDivElement;
let root: Root;
let getSignal: ReturnType<typeof vi.fn<() => Signal | null>>;

function view(overrides: Partial<Parameters<typeof AudioAnalysis>[0]> = {}) {
  root.render(<AudioAnalysis getSignal={getSignal} sourceId="session-one" sourceLabel="Music tab" sourceState="live" frozen={false} {...overrides} />);
}
function exportButton() { return [...host.querySelectorAll('button')].find((button) => button.textContent === 'Export snapshot')!; }
function button(text: string) { return [...host.querySelectorAll('button')].find((button) => button.textContent === text)!; }

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  host = document.createElement('div'); document.body.append(host);
  root = createRoot(host);
  getSignal = vi.fn(() => signal);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove(); vi.useRealTimers(); vi.clearAllMocks();
});

describe('collapsible cymatics audio analysis lifecycle', () => {
  it('discards a held snapshot across mute and recovery of the same source', async () => {
    await act(async () => view());
    expect(exportButton().disabled).toBe(false);
    await act(async () => view({ frozen: true }));
    expect(exportButton().disabled).toBe(false);
    await act(async () => view({ sourceState: 'muted', frozen: true }));
    expect(exportButton().disabled).toBe(true);
    await act(async () => view({ sourceState: 'live', frozen: true }));
    expect(exportButton().disabled).toBe(true);
    expect(host.textContent).toContain('No snapshot to hold yet');
    await act(async () => view({ frozen: false }));
    expect(exportButton().disabled).toBe(false);
  });

  it('stops sampling with every panel collapsed and resumes on Expand all', async () => {
    await act(async () => view());
    await act(async () => vi.advanceTimersByTime(500));
    const activeCalls = getSignal.mock.calls.length;
    expect(activeCalls).toBeGreaterThan(1);
    await act(async () => button('Collapse all').click());
    const heldCalls = getSignal.mock.calls.length;
    await act(async () => vi.advanceTimersByTime(1000));
    expect(getSignal).toHaveBeenCalledTimes(heldCalls);
    expect(host.querySelectorAll('details[open]')).toHaveLength(0);
    await act(async () => button('Expand all').click());
    expect(host.querySelectorAll('details[open]')).toHaveLength(5);
    await act(async () => vi.advanceTimersByTime(250));
    expect(getSignal.mock.calls.length).toBeGreaterThan(heldCalls);
  });

  it('invalidates exports on source replacement, waiting and disconnect', async () => {
    await act(async () => view());
    expect(exportButton().disabled).toBe(false);
    await act(async () => view({ sourceId: 'session-two', frozen: true }));
    expect(exportButton().disabled).toBe(true);
    await act(async () => view({ sourceId: 'session-two', sourceState: 'waiting' }));
    expect(exportButton().disabled).toBe(true);
    await act(async () => view({ sourceId: 'session-two', sourceState: 'idle' }));
    expect(exportButton().disabled).toBe(true);
  });

  it('holds a real frame while frozen and removes it when the getter has no signal', async () => {
    await act(async () => view());
    const count = getSignal.mock.calls.length;
    await act(async () => view({ frozen: true }));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(getSignal).toHaveBeenCalledTimes(count);
    expect(exportButton().disabled).toBe(false);
    getSignal.mockReturnValue(null);
    await act(async () => view({ frozen: false }));
    expect(exportButton().disabled).toBe(true);
    expect(host.textContent).toContain('Connect a source to inspect its signal');
  });
});
