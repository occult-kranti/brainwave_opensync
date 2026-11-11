// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SampleLab from '@/pages/SampleLab';
import { AnalysisCancelled, type AnalysisReport } from '@/samplelab/analysis';

const analysis = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('@/samplelab/analysis', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/samplelab/analysis')>(),
  analyzeAudio: analysis.run,
}));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
// These tests cover file ownership, not happy-dom's incomplete Web Animations.
vi.mock('framer-motion', () => ({ motion: { div: ({ children }: { children?: ReactNode }) => <div>{children}</div> } }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const readers: Reader[] = [];
class Reader {
  static LOADING = 1;
  readyState = 0;
  result: ArrayBuffer | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  abort = vi.fn(() => { this.readyState = 2; });
  readAsArrayBuffer = vi.fn(() => { this.readyState = 1; });
  constructor() { readers.push(this); }
  finish() { this.readyState = 2; this.result = new ArrayBuffer(16); this.onload?.(); }
}
const contexts: Context[] = [];
class Context {
  state = 'running';
  decode = deferred<AudioBuffer>();
  decodeAudioData = vi.fn(() => this.decode.promise);
  close = vi.fn(async () => { this.state = 'closed'; });
  constructor() { contexts.push(this); }
}
const buffer = () => ({ numberOfChannels: 1, sampleRate: 48000, getChannelData: () => new Float32Array(2048) }) as unknown as AudioBuffer;
const file = (name: string) => new File(['fixture'], name, { type: 'audio/wav' });
let root: Root;
let host: HTMLDivElement;
async function render(initialFile?: File | null, embedded = true) {
  await act(async () => { root.render(<SampleLab embedded={embedded} initialFile={initialFile} />); });
}
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find((node) => node.textContent?.trim() === label);
  expect(button, label).toBeTruthy();
  await act(async () => { button!.click(); });
}
beforeEach(() => {
  readers.length = 0; contexts.length = 0; analysis.run.mockReset();
  analysis.run.mockImplementation(() => new Promise(() => {}));
  vi.stubGlobal('FileReader', Reader); vi.stubGlobal('AudioContext', Context);
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove(); vi.unstubAllGlobals();
});

describe('embedded recording report and owned asynchronous work', () => {
  it('uses an inline heading and retains standalone page semantics', async () => {
    await render();
    expect(host.querySelector('h1')).toBeNull();
    expect(host.querySelector('button button')).toBeNull();
    expect(host.querySelector('h3')?.textContent).toBe('Complete recording report');
    expect(host.querySelector<HTMLElement>('[data-testid="sample-lab"]')?.style.padding).toBe('0px');
    await render(undefined, false);
    expect(host.querySelector('h1')?.textContent).toBe('Recording analysis');
  });

  it('starts the supplied file once and closes decode resources before DSP', async () => {
    const selected = file('selected.wav');
    await render(selected); expect(readers).toHaveLength(1);
    await render(selected); expect(readers).toHaveLength(1);
    await act(async () => readers[0].finish());
    expect(contexts).toHaveLength(1);
    analysis.run.mockImplementation(() => {
      expect(contexts[0].close).toHaveBeenCalledOnce();
      return new Promise(() => {});
    });
    await act(async () => contexts[0].decode.resolve(buffer()));
    expect(analysis.run).toHaveBeenCalledOnce();
  });

  it('ignores a replaced file whose decode resolves after the next file starts', async () => {
    await render(file('old.wav')); await act(async () => readers[0].finish());
    await render(file('new.wav'));
    expect(contexts[0].close).toHaveBeenCalledOnce();
    await act(async () => contexts[0].decode.resolve(buffer()));
    expect(analysis.run).not.toHaveBeenCalled();
    expect(host.querySelector('[data-testid="sample-lab-progress"]')).not.toBeNull();
    expect(host.querySelector('[role="alert"]')).toBeNull();
    await act(async () => readers[1].finish());
    await act(async () => contexts[1].decode.resolve(buffer()));
    expect(analysis.run).toHaveBeenCalledOnce();
  });

  it('cancels a pending decode without later starting analysis', async () => {
    await render(file('cancelled.wav')); await act(async () => readers[0].finish());
    await click('CANCEL');
    expect(contexts[0].close).toHaveBeenCalledOnce();
    await act(async () => contexts[0].decode.resolve(buffer()));
    expect(analysis.run).not.toHaveBeenCalled();
    expect(host.querySelector('[data-testid="sample-lab-progress"]')).toBeNull();
  });

  it('does not publish or mutate a late DSP result after cancellation', async () => {
    const run = deferred<AnalysisReport>(); analysis.run.mockReturnValue(run.promise);
    await render(file('cancelled.wav')); await act(async () => readers[0].finish());
    await act(async () => contexts[0].decode.resolve(buffer())); await click('CANCEL');
    const stale = {} as AnalysisReport;
    await act(async () => run.resolve(stale));
    expect(stale.fileName).toBeUndefined();
    expect(host.querySelector('[data-testid="sample-lab-dropzone"]')).not.toBeNull();
  });

  it('does not let an old cancelled analysis hide a new file’s progress', async () => {
    const old = deferred<AnalysisReport>(); analysis.run.mockReturnValue(old.promise);
    await render(file('old.wav')); await act(async () => readers[0].finish());
    await act(async () => contexts[0].decode.resolve(buffer()));
    await render(file('new.wav'));
    await act(async () => old.reject(new AnalysisCancelled()));
    expect(host.querySelector('[data-testid="sample-lab-progress"]')).not.toBeNull();
  });

  it('aborts reading and ignores its stale read error on replacement', async () => {
    await render(file('old.wav')); const stale = readers[0];
    await render(file('new.wav')); expect(stale.abort).toHaveBeenCalledOnce();
    await act(async () => stale.onerror?.());
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelector('[data-testid="sample-lab-progress"]')).not.toBeNull();
  });

  it('closes a pending decode on unmount and discards its eventual result', async () => {
    await render(file('unmounted.wav')); await act(async () => readers[0].finish());
    await act(async () => root.unmount());
    expect(contexts[0].close).toHaveBeenCalledOnce();
    await act(async () => contexts[0].decode.resolve(buffer()));
    expect(analysis.run).not.toHaveBeenCalled();
    root = createRoot(host);
  });
});
