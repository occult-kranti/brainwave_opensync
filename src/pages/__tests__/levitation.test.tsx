// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, type NavigateFunction } from 'react-router';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import LevitationLab from '../LevitationLab';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { seedAdvisoryAck, clearAdvisoryAck } from '@/test/helpers';
import { LEVITATION_PRESETS } from '@/data/levitationPresets';
import { LEVITATION_SOURCES } from '@/levitation';
import { CONNECTIONS } from '@/levitation/connections';
import * as exports from '@/ui/audio/renderExport';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;

function Probe() { session = useSession(); navigate = useNavigate(); return null; }
async function mount() {
  await act(async () => root.render(
    <MemoryRouter initialEntries={['/levitation']}><SessionProvider><Probe />
      <Routes>
        <Route path="/levitation" element={<LevitationLab />} />
        <Route path="/studio" element={<p>Studio destination</p>} />
        <Route path="/elsewhere" element={<p>Another page</p>} />
      </Routes>
    </SessionProvider></MemoryRouter>,
  ));
}
function button(label: string) {
  const found = Array.from(host.querySelectorAll('button')).find(item => item.textContent?.includes(label));
  expect(found, `button: ${label}`).toBeDefined();
  return found!;
}
async function click(label: string) { await act(async () => button(label).click()); }
async function select(label: string, value: string) {
  const input = host.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
  await act(async () => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); });
}
async function search(value: string) {
  const input = host.querySelector<HTMLInputElement>('[aria-label="Search levitation sources"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function metric(label: string) {
  const term = Array.from(host.querySelectorAll('dt')).find(item => item.textContent === label);
  expect(term, `metric: ${label}`).toBeDefined();
  return term!.nextElementSibling!.textContent;
}
async function previewFirst() {
  const title = LEVITATION_PRESETS[0].title;
  const control = host.querySelector<HTMLButtonElement>(`[aria-label="Preview first 10 seconds of ${title}"]`);
  expect(control).not.toBeNull();
  await act(async () => control!.click());
}
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

describe('Levitation research laboratory', () => {
  it('combines country and normalized query filters, retains source limits and recovers from no matches', async () => {
    await mount(); await click('Sources & media');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(LEVITATION_SOURCES.length);
    expect(host.querySelector('a[download]')!.getAttribute('href')).toContain('research/levitation-network.md');
    await select('Source country', 'China');
    const chinese = host.querySelectorAll('[data-source-id]');
    expect(chinese.length).toBeGreaterThan(1);
    expect(Array.from(chinese).every(record => record.getAttribute('data-source-country') === 'China')).toBe(true);
    await search('  PATENT  ');
    const records = host.querySelectorAll('[data-source-id]');
    expect(records).toHaveLength(1);
    expect(records[0].getAttribute('data-source-id')).toBe('lev-china-acoustic-patent');
    const source = LEVITATION_SOURCES.find(item => item.id === 'lev-china-acoustic-patent')!;
    expect(records[0].textContent).toContain(source.limitations);
    expect(records[0].querySelector('a')!.getAttribute('href')).toBe(source.url);
    expect(host.querySelector('[role="status"]')!.textContent).toBe(`1 of ${LEVITATION_SOURCES.length} selected source records`);
    await search('no-such-levitation-source');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(0);
    expect(host.textContent).toContain('No records match these filters.');
    await search(''); await select('Source country', 'All');
    expect(host.querySelectorAll('[data-source-id]')).toHaveLength(LEVITATION_SOURCES.length);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('filters connection status while preserving the missing evidence and cited sources', async () => {
    await mount();
    expect(host.querySelectorAll('[data-connection-status]')).toHaveLength(CONNECTIONS.length);
    await select('Connection status', 'unsupported');
    const records = Array.from(host.querySelectorAll('[data-connection-status]'));
    expect(records.length).toBeGreaterThan(0);
    expect(records.every(record => record.getAttribute('data-connection-status') === 'unsupported')).toBe(true);
    const connection = CONNECTIONS.find(item => item.id === 'listening-apparatus')!;
    const record = records.find(item => item.textContent?.includes(connection.missingBridge))!;
    expect(record).toBeDefined();
    expect(record.querySelectorAll('a')).toHaveLength(connection.sourceIds.length);
    await select('Connection status', 'documented');
    expect(Array.from(host.querySelectorAll('[data-connection-status]')).every(item => item.getAttribute('data-connection-status') === 'documented')).toBe(true);
    expect(host.textContent).not.toContain(connection.missingBridge);
    await select('Connection status', 'All');
    expect(host.querySelectorAll('[data-connection-status]')).toHaveLength(CONNECTIONS.length);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('exports all three changed model states with units and finite rows without starting sound', async () => {
    const download = vi.spyOn(exports, 'downloadBytes').mockImplementation(() => {});
    await mount(); await click('Acoustic bench'); await click('No acoustic drive');
    expect(host.querySelector<HTMLInputElement>('[aria-label="Virtual peak pressure"]')!.value).toBe('0');
    expect(host.querySelector('[data-testid="acoustic-trap-status"]')!.textContent).toContain('No axial equilibrium');
    expect(metric('Vertical stiffness')).toBe('0 N/m');
    expect(metric('Restoring position')).toBe('None');
    await click('Download acoustic CSV');
    const acoustic = new TextDecoder().decode(download.mock.calls[0][0]);
    expect(acoustic).toContain('# pressurePeakPa=0\n');
    const acousticTable = csvTable(acoustic);
    expect(acousticTable.header).toContain('pressure_rms_pa');
    expect(acousticTable.rows.length).toBeGreaterThan(100);
    expect(acousticTable.rows.every(row => row[1] === 0 && row[2] === 0 && row[4] === 0 && row[5] < 0)).toBe(true);
    expect(host.textContent).toContain('Acoustic CSV downloaded with parameters, units and assumptions.');

    await click('Magnetic & control bench'); await click('Zero vertical gradient');
    expect(metric('Magnetic force')).toBe('0 µN');
    await click('Download magnetic CSV');
    const magnetic = new TextDecoder().decode(download.mock.calls[1][0]);
    expect(magnetic).toContain('# fieldSquaredGradientT2PerM=0\n');
    expect(magnetic).toContain('Each row is an independent hypothetical local gradient');
    expect(csvTable(magnetic).header).toContain('gradient_b_squared_t2_per_m');

    await click('Zero vibration drive');
    expect(metric('Selected displacement')).toBe('0 mm peak');
    expect(metric('Mean input / loss power')).toBe('0 / 0 W');
    expect(Number.parseFloat(metric('Static downward sag')!)).toBeGreaterThan(0);
    await click('Download vibration CSV');
    const vibration = new TextDecoder().decode(download.mock.calls[2][0]);
    expect(vibration).toContain('# forcePeakN=0\n');
    expect(csvTable(vibration).rows.every(row => row[2] === 0 && row[4] === 0 && row[5] === 0)).toBe(true);
    expect(download.mock.calls.map(call => call[1])).toEqual([
      'opensync-levitation-acoustic.csv', 'opensync-levitation-magnetic.csv', 'opensync-levitation-vibration.csv',
    ]);
    for (const [bytes, , mime] of download.mock.calls) {
      expect(mime).toBe('text/csv;charset=utf-8');
      const csv = new TextDecoder().decode(bytes);
      expect(csv).toContain('Deterministic virtual teaching model; no measured data.');
      expect(csvTable(csv).rows.flat().every(Number.isFinite)).toBe(true);
    }
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    expect(session.running).toBe(false);
  });

  it('requires advisory acknowledgement and stops an owned preview when leaving its section', async () => {
    clearAdvisoryAck(); await mount(); await click('Listening collection');
    expect(host.querySelectorAll('[data-testid^="lv-preset-"]')).toHaveLength(4);
    await previewFirst();
    expect(session.advisoryOpen).toBe(true); expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
    await act(async () => session.acknowledgeAdvisory()); await previewFirst();
    expect(session.previewId).toBe(`preset:${LEVITATION_PRESETS[0].id}`);
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
    vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await click('Overview');
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });

  it('stops a preview and removes experimental recipes when infant mode is enabled', async () => {
    await mount(); await click('Listening collection'); await previewFirst();
    expect(session.previewId).not.toBeNull();
    await act(async () => session.setGovernor({ infantMode: true }));
    expect(session.previewId).toBeNull();
    expect(host.querySelector('[data-testid^="lv-preset-"]')).toBeNull();
    expect(host.textContent).toContain('Experimental listening is unavailable in infant mode.');
    await act(async () => session.setGovernor({ infantMode: false }));
    expect(host.querySelectorAll('[data-testid^="lv-preset-"]')).toHaveLength(4);
    expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
  });

  it('stops its preview on page unmount while preserving an unrelated preview on exit', async () => {
    await mount(); await click('Listening collection'); await previewFirst();
    vi.mocked(LiveEngine.prototype.stopPreviews).mockClear();
    await act(async () => navigate('/elsewhere'));
    expect(host.textContent).toContain('Another page'); expect(session.previewId).toBeNull();
    expect(LiveEngine.prototype.stopPreviews).toHaveBeenCalled();
    await act(async () => navigate('/levitation'));
    const externalStop = vi.fn();
    await act(async () => session.togglePreview('unrelated:preview', () => externalStop));
    await act(async () => navigate('/elsewhere'));
    expect(session.previewId).toBe('unrelated:preview');
    expect(externalStop).not.toHaveBeenCalled();
  });

  it('stops an active preview and loads a recipe into Studio silently', async () => {
    await mount(); await click('Listening collection'); await previewFirst();
    expect(session.previewId).not.toBeNull();
    await click('LOAD INTO STUDIO');
    expect(host.textContent).toContain('Studio destination');
    expect(session.presetName).toBe(LEVITATION_PRESETS[0].title);
    expect(session.previewId).toBeNull(); expect(session.running).toBe(false);
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    expect(LiveEngine.prototype.playBuffer).toHaveBeenCalledTimes(1);
  });
});
