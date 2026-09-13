// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Preset } from '@/data/presets';
import { memoryStorage } from '@/lib/storage';
import { seedAdvisoryAck } from '@/test/helpers';
import { LiveEngine } from '@/ui/audio/liveEngine';
import * as exportAudio from '@/ui/audio/renderExport';
import { SessionProvider } from '../SessionContext';
import { useSession } from '../useSession';
import { ALL_NOISE_OFF, DEFAULT_FRONT_PANEL } from '../sessionDefaults';
import { buildExportPhases, completePhaseOverrides, presetPreviewPhases, type UiPhase } from '../sessionMath';
import { loadFrontPanel, saveFrontPanel, sanitizeFrontPanel } from '../sessionPersistence';
import { decodeShare, encodeShare, toBase64Url } from '../shareLink';
import { loadUserPresets, userPresetAsPreset } from '../userPresets';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const PHI = (1 + Math.sqrt(5)) / 2;
const PROGRAM: Preset = {
  id: 'phase-program-regression', title: 'Phase program regression', category: 'Experimental',
  grade: 'D', rationale: 'A software fixture.', citations: [],
  spec: {
    autoShutoff: true,
    phases: [
      { name: 'low', durationSec: 3, carrierHz: 110, beatHz: 29.2, gainDbFs: -16, mode: 'binaural', rampSec: 20 },
      { name: 'high', durationSec: 3, carrierHz: 110 * PHI, beatHz: 40, gainDbFs: -16, mode: 'monaural', rampSec: 20 },
      { name: 'plain', durationSec: 3, carrierHz: 110 * PHI ** 2, beatHz: 0, gainDbFs: -16, mode: 'binaural', rampSec: 20 },
    ],
  },
};

const NO_LAYERS = {
  noiseDb: ALL_NOISE_OFF, noiseOn: false, nature: DEFAULT_FRONT_PANEL.nature,
  bowls: [], bellEveryMin: 0, layersOn: false,
};

let session: ReturnType<typeof useSession>;
let root: Root | null = null;
let host: HTMLDivElement | null = null;
function Probe() { session = useSession(); return null; }

async function mount() {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => root!.render(<SessionProvider><Probe /></SessionProvider>));
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'updateConfig');
  vi.spyOn(LiveEngine.prototype, 'setOutputDb');
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  host?.remove();
  root = null;
  host = null;
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.localStorage.clear();
});

describe('per-phase live programs', () => {
  it('same-tick load and START apply the first mode/carrier immediately, then switch at the boundary', async () => {
    await mount();
    act(() => {
      session.setMode('isochronic');
      session.setCarrierHz(800);
      session.loadPreset(PROGRAM);
      expect(session.start()).toBe(true);
    });
    expect(session.mode).toBe('binaural');
    expect(session.carrierHz).toBe(110);
    expect(session.volumeDb).toBe(-16);
    expect(session.phases[1]).toMatchObject({ carrierHz: 110 * PHI, mode: 'monaural', gainDbFs: -16, rampSec: 20 });
    await act(async () => { vi.advanceTimersByTime(3000); });
    // The new monaural mode is selected before the live glide exceeds 30 Hz.
    expect(session.mode).toBe('monaural');
    expect(session.beatHz).toBe(29.2);
    expect(session.carrierHz).toBe(110 * PHI);
    expect(LiveEngine.prototype.updateConfig).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'monaural', carrierHz: 110 * PHI }));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(session.beatHz).toBeGreaterThan(30);
    expect(session.mode).toBe('monaural');
    act(() => { session.stop(); session.start(); });
    expect(session.activePhaseIdx).toBe(0);
    expect(session.carrierHz).toBe(110);
    expect(session.mode).toBe('binaural');
  });

  it('explicit global edits clear only their matching imported overrides', async () => {
    await mount();
    act(() => { session.loadPreset(PROGRAM); session.start(); });
    act(() => session.setMode('isochronic'));
    expect(session.phases.every((p) => p.mode === undefined)).toBe(true);
    expect(session.phases[1].carrierHz).toBe(110 * PHI);
    act(() => session.setCarrierHz(432));
    expect(session.phases.every((p) => p.carrierHz === undefined)).toBe(true);
    await act(async () => { vi.advanceTimersByTime(4000); });
    expect(session.mode).toBe('isochronic');
    expect(session.carrierHz).toBe(432);
    const shared = decodeShare(session.getShareLink().split('#s=')[1])!;
    expect(shared.mode).toBe('isochronic');
    expect(shared.carrierHz).toBe(432);
    expect(shared.phases.every((p) => p.mode === undefined && p.carrierHz === undefined)).toBe(true);
  });

  it('preserves zero-beat carrier ladders through save, share, reload and START', async () => {
    await mount();
    const ladder: Preset = { ...PROGRAM, spec: { ...PROGRAM.spec, phases: PROGRAM.spec.phases.map((p) => ({ ...p, beatHz: 0, mode: 'binaural' })) } };
    act(() => session.loadPreset(ladder));
    act(() => { session.saveCurrentAsPreset('Saved ladder'); });
    const saved = loadUserPresets()[0];
    expect(saved.spec.phases.map((p) => p.carrierHz)).toEqual(ladder.spec.phases.map((p) => p.carrierHz));
    expect(saved.spec.phases.every((p) => p.beatHz === 0 && p.gainDbFs === -16 && p.rampSec === 20)).toBe(true);
    const shared = decodeShare(session.getShareLink().split('#s=')[1])!;
    expect(shared.phases[2].carrierHz).toBe(110 * PHI ** 2);
    expect(shared.phases.every((p) => p.beatHz === 0)).toBe(true);
    act(() => { session.resetFrontPanel(); session.applyShare(shared); session.start(); });
    expect(session.beatHz).toBe(0);
    expect(session.volumeDb).toBe(-16);
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(session.beatHz).toBe(0);
    expect(session.carrierHz).toBe(110 * PHI);
    act(() => { session.stop(); session.loadPreset(userPresetAsPreset(saved)); });
    expect(session.phases[2].carrierHz).toBe(110 * PHI ** 2);
  });

  it('adopts authored duration and conservative gain without extending a live limit', async () => {
    await mount();
    const thirtyFive: Preset = { ...PROGRAM, spec: { autoShutoff: true, phases: Array.from({ length: 7 }, () => ({ ...PROGRAM.spec.phases[0], durationSec: 300 })) } };
    act(() => session.loadPreset(thirtyFive));
    expect(session.limitMin).toBe(35);
    expect(session.volumeDb).toBe(-16);
    act(() => { session.setLimitMin(10); session.setVolumeDb(-30); session.start(); });
    act(() => session.loadPreset(thirtyFive));
    expect(session.limitMin).toBe(10);
    expect(session.volumeDb).toBe(-30);
    act(() => { session.stop(); session.setGovernor({ maxSessionMin: 12 }); session.loadPreset(thirtyFive); });
    expect(session.limitMin).toBe(12);
  });

  it('exports relative phase gains under the current governor-clamped master without double attenuation', async () => {
    await mount();
    const exportSpy = vi.spyOn(exportAudio, 'renderExportAsync').mockResolvedValue({ wav: new Uint8Array(44), sampleRate: 48000, hash: 'fixture', totalDurationSec: 9, warnings: [] });
    vi.spyOn(exportAudio, 'downloadBytes').mockImplementation(() => {});
    act(() => session.loadPreset(PROGRAM));
    await act(async () => { expect(await session.exportWav()).toBe(true); });
    let spec = exportSpy.mock.calls.at(-1)![0];
    expect(spec.masterGainDb).toBe(-16);
    expect(spec.phases.map((p) => p.gainDb)).toEqual([0, 0, 0]);
    expect(spec.phases.map((p) => p.mode)).toEqual(['binaural', 'monaural', 'binaural']);
    expect(spec.phases[2].carrierHz).toBe(110 * PHI ** 2);
    act(() => session.setGovernor({ maxGainDbFs: -24 }));
    await act(async () => { await session.exportWav(); });
    spec = exportSpy.mock.calls.at(-1)![0];
    expect(spec.masterGainDb).toBe(-24);
  });
});

describe('phase program serialization and offline adaptation', () => {
  it('keeps absent legacy overrides absent but resolves partial plans once against globals', () => {
    const phases: UiPhase[] = [{ id: 'a', durationSec: 3, beatHz: 0 }, { id: 'b', durationSec: 3, beatHz: 40, carrierHz: 330, mode: 'monaural' }];
    expect(completePhaseOverrides([phases[0]], 200, 'binaural')).toEqual([phases[0]]);
    const completed = completePhaseOverrides(phases, 200, 'binaural');
    expect(completed[0]).toMatchObject({ carrierHz: 200, mode: 'binaural' });
    expect(completed[1]).toMatchObject({ carrierHz: 330, mode: 'monaural' });
    expect(phases[0].carrierHz).toBeUndefined();
  });

  it('front-panel persistence retains exact carrier, mode, zero beat and authored metadata', () => {
    const phases = PROGRAM.spec.phases.map((p, i) => ({ id: `p${i}`, durationSec: p.durationSec, carrierHz: p.carrierHz, mode: p.mode === 'noise' ? 'binaural' as const : p.mode, beatHz: 0, gainDbFs: p.gainDbFs, rampSec: p.rampSec }));
    const panel = { ...DEFAULT_FRONT_PANEL, beatHz: 0, phases };
    const storage = memoryStorage();
    saveFrontPanel(panel, storage);
    expect(loadFrontPanel(DEFAULT_FRONT_PANEL, storage)).toEqual(panel);
    const hostile = sanitizeFrontPanel({ ...panel, phases: [{ id: 'x', durationSec: 60, beatHz: 0, carrierHz: Infinity, mode: 'laser', gainDbFs: 50, rampSec: -1 }] }, DEFAULT_FRONT_PANEL);
    expect(hostile.phases).toEqual([{ id: 'x', durationSec: 60, beatHz: 0, gainDbFs: 0, rampSec: 0 }]);
  });

  it('share decoding retains phase values and rejects invalid zero-like inputs', async () => {
    await mount();
    act(() => session.loadPreset(PROGRAM));
    const decoded = decodeShare(session.getShareLink().split('#s=')[1])!;
    expect(decodeShare(encodeShare(decoded))).toEqual(decoded);
    const bad = decodeShare(toBase64Url(JSON.stringify({ v: 2, m: 'binaural', c: 200, w: 'sine', p: [[60, null], [60, false], [60, 0, 1e9, 'laser', 12, -2]] })))!;
    expect(bad.phases).toEqual([{ durationSec: 60, beatHz: 0, carrierHz: 1000, gainDbFs: 0, rampSec: 0 }]);
  });

  it('export preserves carrier/mode and relative gains, including carrier-locked bowls', () => {
    const phases: UiPhase[] = [
      { id: 'a', durationSec: 3, carrierHz: 110, mode: 'binaural', beatHz: 0, gainDbFs: -16 },
      { id: 'b', durationSec: 3, carrierHz: 330, mode: 'monaural', beatHz: 40, gainDbFs: -20 },
    ];
    const exported = buildExportPhases(phases, 200, 'isochronic', {
      ...NO_LAYERS, layersOn: true, bowls: [{ ...DEFAULT_FRONT_PANEL.bowls[0], on: true, lock: true }], bellEveryMin: 1,
    });
    expect(exported.map((p) => p.carrierHz)).toEqual([110, 330]);
    expect(exported.map((p) => p.mode)).toEqual(['binaural', 'monaural']);
    expect(exported.map((p) => p.gainDb)).toEqual([0, -4]);
    expect(exported.map((p) => p.bowls!.map((b) => b.baseHz))).toEqual([[110, 110], [330, 330]]);
    const preview = presetPreviewPhases(PROGRAM, 9);
    expect(preview.map((p) => p.mode)).toEqual(['binaural', 'monaural', 'binaural']);
    expect(preview[2].carrierHz).toBe(110 * PHI ** 2);
  });
});
