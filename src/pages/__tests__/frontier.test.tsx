// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, type NavigateFunction } from 'react-router';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import BasharResearch from '../BasharResearch';
import FrequencyHypotheses from '../FrequencyHypotheses';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { seedAdvisoryAck, clearAdvisoryAck } from '@/test/helpers';
import { BASHAR_STUDY_PRESETS, FREQUENCY_STUDY_PRESETS } from '@/data/frontierPresets';
import { BASHAR_CLAIMS, FRONTIER_CONNECTIONS, FRONTIER_SOURCES, FREQUENCY_HYPOTHESES } from '@/frontier';
import * as exports from '@/ui/audio/renderExport';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;

const exhibits = [
  { name: 'Bashar research', path: '/bashar-research', other: '/frequency-hypotheses', section: 'Claims & transcripts', prefix: 'fr-bashar', presets: BASHAR_STUDY_PRESETS },
  { name: 'Frequency hypotheses', path: '/frequency-hypotheses', other: '/bashar-research', section: 'Virtual benches', prefix: 'fr-frequency', presets: FREQUENCY_STUDY_PRESETS },
] as const;

function Probe() { session = useSession(); navigate = useNavigate(); return null; }
async function mount(path = '/bashar-research') {
  await act(async () => root.render(
    <MemoryRouter initialEntries={[path]}><SessionProvider><Probe />
      <Routes>
        <Route path="/bashar-research" element={<BasharResearch />} />
        <Route path="/frequency-hypotheses" element={<FrequencyHypotheses />} />
        <Route path="/studio" element={<p>Studio destination</p>} />
        <Route path="/elsewhere" element={<p>Another page</p>} />
      </Routes>
    </SessionProvider></MemoryRouter>,
  ));
}
function button(label: string) {
  const found = Array.from(host.querySelectorAll('button')).find(item => item.textContent?.trim() === label);
  expect(found, `button: ${label}`).toBeDefined(); return found!;
}
async function click(label: string) { await act(async () => button(label).click()); }
async function select(label: string, value: string) {
  const input = host.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
  expect(input).not.toBeNull();
  await act(async () => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); });
}
async function setInput(label: string, value: string | number) {
  const input = host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
  expect(input).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function metric(label: string) {
  const term = Array.from(host.querySelectorAll('dt')).find(item => item.textContent === label);
  expect(term, `metric: ${label}`).toBeDefined(); return term!.nextElementSibling!.textContent!;
}
function previewButton(title: string) {
  const control = host.querySelector<HTMLButtonElement>(`[aria-label="Preview first 10 seconds of ${title}"]`);
  expect(control).not.toBeNull(); return control!;
}
async function preview(title: string) { await act(async () => previewButton(title).click()); }
function csvTable(csv: string) {
  const lines = csv.trim().split('\n').filter(line => !line.startsWith('#'));
  return { header: lines[0], rows: lines.slice(1).map(line => line.split(',').map(Number)) };
}

beforeEach(() => {
  window.localStorage.clear(); seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, 'stopPreviews');
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear();
});

describe('Frontier research navigation and models', () => {
  it('preserves claim attribution and limits, then filters connection relationships with cited sources', async () => {
    await mount();
    expect(host.querySelectorAll('[data-claim-id]')).toHaveLength(BASHAR_CLAIMS.length);
    const claim = BASHAR_CLAIMS[0];
    const claimRecord = host.querySelector(`[data-claim-id="${claim.id}"]`)!;
    expect(claimRecord.textContent).toContain(claim.attribution);
    expect(claimRecord.textContent).toContain(claim.missingEvidence);
    expect(claimRecord.querySelectorAll('a')).toHaveLength(claim.sourceIds.length);
    expect(host.querySelector('a[download]')!.getAttribute('href')).toContain('research/bashar-frequency-dossier.md');
    await click('Connection map');
    expect(button('Connection map').getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-claim-id]')).toBeNull();
    expect(host.querySelectorAll('details.fr-record')).toHaveLength(FRONTIER_CONNECTIONS.length);
    await select('Connection relationship', 'unsupported');
    const selected = FRONTIER_CONNECTIONS.filter(connection => connection.relation === 'unsupported');
    expect(selected.length).toBeGreaterThan(0);
    const records = Array.from(host.querySelectorAll('details.fr-record'));
    expect(records).toHaveLength(selected.length);
    for (const [index, record] of records.entries()) {
      expect(record.querySelector('.fr-tag')!.textContent).toBe('unsupported');
      expect(record.textContent).toContain(selected[index].explanation);
      expect(Array.from(record.querySelectorAll('a')).map(link => link.getAttribute('href'))).toEqual(
        selected[index].sourceIds.map(id => FRONTIER_SOURCES.find(source => source.id === id)!.url),
      );
    }
    await select('Connection relationship', 'All');
    expect(host.querySelectorAll('details.fr-record')).toHaveLength(FRONTIER_CONNECTIONS.length);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('combines normalized source search with source type and recovers from an empty result', async () => {
    await mount(); await click('Source desk');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(FRONTIER_SOURCES.length);
    const source = FRONTIER_SOURCES.find(item => item.id === 'bashar-host-interview')!;
    await select('Frontier source type', 'transcript');
    await setInput('Search frontier sources', `  ${source.title.toUpperCase()}  `);
    const records = host.querySelectorAll('[data-source-id]');
    expect(records).toHaveLength(1);
    expect(records[0].getAttribute('data-source-id')).toBe(source.id);
    expect(records[0].textContent).toContain(source.locator);
    expect(records[0].textContent).toContain(source.access);
    expect(records[0].textContent).toContain(source.limitation);
    expect(records[0].querySelector('a')!.getAttribute('href')).toBe(source.url);
    expect(host.querySelector('[role="status"]')!.textContent).toBe(`1 of ${FRONTIER_SOURCES.length} selected records`);
    await select('Frontier source type', 'repository');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(0);
    expect(host.textContent).toContain('No records match.');
    await setInput('Search frontier sources', ''); await select('Frontier source type', 'All');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(FRONTIER_SOURCES.length);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('switches from virtual benches to proposals with controls, falsifiers and source provenance', async () => {
    await mount('/frequency-hypotheses');
    expect(host.querySelector('[aria-label="Frequency model benches"]')).not.toBeNull();
    await click('Hypotheses & use cases');
    expect(host.querySelector('[aria-label="Frequency model benches"]')).toBeNull();
    expect(host.querySelectorAll('[data-hypothesis-id]')).toHaveLength(FREQUENCY_HYPOTHESES.length);
    for (const hypothesis of FREQUENCY_HYPOTHESES) {
      const record = host.querySelector(`[data-hypothesis-id="${hypothesis.id}"]`)!;
      expect(record.textContent).toContain('proposed');
      expect(record.textContent).toContain(hypothesis.control);
      expect(record.textContent).toContain(hypothesis.falsifier);
      expect(record.textContent).toContain(hypothesis.limitation);
      expect(record.querySelectorAll('a')).toHaveLength(hypothesis.sourceIds.length);
    }
    await click('Virtual benches');
    expect(host.querySelector('[aria-label="Propagation channel comparison"]')).not.toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('exports changed channel, thermal and coherence states with finite numerical rows while remaining silent', async () => {
    const download = vi.spyOn(exports, 'downloadBytes').mockImplementation(() => {});
    await mount('/frequency-hypotheses');
    const pointBefore = host.querySelector('[data-testid="frontier-sound-wavelength"]')!.getAttribute('cx');
    await setInput('Comparison frequency', 1000);
    expect(metric('Sound wavelength')).toBe('0.343 m');
    expect(host.querySelector('[data-testid="frontier-sound-wavelength"]')!.getAttribute('cx')).not.toBe(pointBefore);
    await click('Download channels CSV');
    const channels = new TextDecoder().decode(download.mock.calls[0][0]);
    expect(channels).toContain('# frequencyHz=1000\n');
    expect(csvTable(channels).header).toContain('acoustic_wavelength_m');
    expect(csvTable(channels).rows[0][2]).toBeCloseTo(.343, 12);

    await click('Thermal trap');
    const rmsBefore = metric('RMS coordinate displacement');
    for (const [label, low, high] of [['Trap stiffness', -9, -3], ['Bath temperature', 250, 350], ['Particle radius', 25, 5000], ['Dynamic viscosity', -4, -1]] as const) {
      await setInput(label, low); await setInput(label, high);
      expect(host.querySelector('[data-testid="frontier-model-curve"]')!.getAttribute('d')).not.toMatch(/NaN|Infinity/);
    }
    expect(metric('RMS coordinate displacement')).not.toBe(rmsBefore);
    await click('Download thermal CSV');
    const thermal = new TextDecoder().decode(download.mock.calls[1][0]);
    expect(thermal).toContain('# stiffnessNpm=0.001\n');
    expect(thermal).toContain('# radiusM=0.000005\n');
    expect(thermal).toContain('# temperatureK=350\n');
    expect(csvTable(thermal).header).toContain('probability_density_per_m');
    expect(csvTable(thermal).rows).toHaveLength(201);

    await click('Phase coherence');
    expect(metric('Normalized squared amplitude')).toBe('1');
    await setInput('Additional relative phase', 180);
    expect(Number(metric('Normalized squared amplitude'))).toBeCloseTo(0, 12);
    await setInput('Coherent acoustic frequency', 100000); await setInput('Path difference', 1);
    expect(host.querySelector('[data-testid="frontier-model-curve"]')!.getAttribute('d')).not.toMatch(/NaN|Infinity/);
    await click('Download coherence CSV');
    const coherence = new TextDecoder().decode(download.mock.calls[2][0]);
    expect(coherence).toContain('# phaseDeg=180\n');
    expect(coherence).toContain('# frequencyHz=100000\n');
    expect(coherence).toContain('# pathDifferenceM=1\n');
    const rows = csvTable(coherence).rows;
    expect(rows).toHaveLength(201);
    expect(rows[0][0]).toBeGreaterThan(.99); expect(rows[rows.length - 1][0]).toBe(1);
    expect(download.mock.calls.map(call => call[1])).toEqual(['opensync-frontier-channels.csv', 'opensync-frontier-thermal.csv', 'opensync-frontier-coherence.csv']);
    for (const [bytes, , mime] of download.mock.calls) {
      const csv = new TextDecoder().decode(bytes);
      expect(mime).toBe('text/csv;charset=utf-8');
      expect(csv).toContain('Deterministic model output, not measured data.');
      expect(csvTable(csv).rows.flat().every(Number.isFinite)).toBe(true);
    }
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    expect(session.running).toBe(false);
  });
});

describe.each(exhibits)('$name listening lifecycle', exhibit => {
  it('requires advisory acknowledgement and stops its preview when switching sections', async () => {
    clearAdvisoryAck(); await mount(exhibit.path); await click('Listening studies');
    expect(host.querySelectorAll(`[data-testid^="${exhibit.prefix}-preset-"]`)).toHaveLength(exhibit.presets.length);
    await preview(exhibit.presets[0].title);
    expect(session.advisoryOpen).toBe(true); expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => session.acknowledgeAdvisory()); await preview(exhibit.presets[0].title);
    expect(session.previewId).toBe(`preset:${exhibit.presets[0].id}`);
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
    vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await click(exhibit.section);
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('removes experimental recipes and stops playback when infant mode is enabled', async () => {
    await mount(exhibit.path); await click('Listening studies'); await preview(exhibit.presets[0].title);
    await act(async () => session.setGovernor({ infantMode: true }));
    expect(session.previewId).toBeNull();
    expect(host.querySelector(`[data-testid^="${exhibit.prefix}-preset-"]`)).toBeNull();
    expect(host.textContent).toContain('Experimental listening is unavailable in infant mode.');
    await act(async () => session.setGovernor({ infantMode: false }));
    expect(host.querySelectorAll(`[data-testid^="${exhibit.prefix}-preset-"]`)).toHaveLength(exhibit.presets.length);
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
  });

  it('blocks previews while muted, panicked or running and stops an owned active preview', async () => {
    await mount(exhibit.path); await click('Listening studies'); await preview(exhibit.presets[0].title);
    await act(async () => session.setMuted(true));
    expect(session.previewId).toBeNull(); expect(previewButton(exhibit.presets[0].title).disabled).toBe(true);
    await preview(exhibit.presets[0].title); expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
    await act(async () => session.setMuted(false)); await preview(exhibit.presets[0].title);
    await act(async () => session.panic());
    expect(session.previewId).toBeNull(); expect(previewButton(exhibit.presets[0].title).disabled).toBe(true);
    await preview(exhibit.presets[0].title); expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(2);
    await act(async () => session.dismissPanic()); await preview(exhibit.presets[0].title);
    await act(async () => { expect(session.start()).toBe(true); });
    expect(session.running).toBe(true); expect(session.previewId).toBeNull();
    expect(previewButton(exhibit.presets[0].title).disabled).toBe(true);
    await preview(exhibit.presets[0].title); expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(3);
    await act(async () => session.stop());
  });

  it('cleans up its preview across research routes and preserves an unrelated preview on exit', async () => {
    await mount(exhibit.path); await click('Listening studies'); await preview(exhibit.presets[0].title);
    vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await act(async () => navigate(exhibit.other));
    expect(session.previewId).toBeNull(); expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
    await act(async () => navigate(exhibit.path));
    const externalStop = vi.fn();
    await act(async () => session.togglePreview('unrelated:preview', () => externalStop));
    await act(async () => navigate('/elsewhere'));
    expect(host.textContent).toContain('Another page');
    expect(session.previewId).toBe('unrelated:preview'); expect(externalStop).not.toHaveBeenCalled();
  });

  it('loads a selected full recipe into Studio silently after stopping its preview', async () => {
    await mount(exhibit.path); await click('Listening studies'); await preview(exhibit.presets[0].title);
    await click('LOAD INTO STUDIO');
    expect(host.textContent).toContain('Studio destination');
    expect(session.presetName).toBe(exhibit.presets[0].title);
    expect(session.previewId).toBeNull(); expect(session.running).toBe(false);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
  });
});
