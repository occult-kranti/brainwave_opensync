// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, type NavigateFunction } from 'react-router';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import NewtonTeslaLab from '../NewtonTeslaLab';
import { SessionProvider } from '@/ui/session/SessionContext';
import { useSession } from '@/ui/session/useSession';
import { LiveEngine } from '@/ui/audio/liveEngine';
import { seedAdvisoryAck, clearAdvisoryAck } from '@/test/helpers';
import { NETWORK_NODES, NETWORK_EDGES } from '@/newton-tesla/network';
import { NEWTON_TESLA_PRESETS } from '@/data/newtonTeslaPresets';
import * as exports from '@/ui/audio/renderExport';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;
function Probe() { session = useSession(); navigate = useNavigate(); return null; }
async function mount() { await act(async () => root.render(<MemoryRouter initialEntries={['/newton-tesla']}><SessionProvider><Probe /><Routes><Route path="/newton-tesla" element={<NewtonTeslaLab />} /><Route path="/studio" element={<p>Studio destination</p>} /><Route path="/elsewhere" element={<p>Another page</p>} /></Routes></SessionProvider></MemoryRouter>)); }
function button(label: string) { const found = Array.from(host.querySelectorAll('button')).find(item => item.textContent?.includes(label)); expect(found).toBeDefined(); return found!; }
async function click(label: string) { await act(async () => button(label).click()); }
async function select(label: string, value: string) { const input = host.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!; await act(async () => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); }); }
async function slide(label: string, value: number) { const input = host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, String(value)); input.dispatchEvent(new Event('input', { bubbles: true })); }); }
beforeEach(() => { window.localStorage.clear(); seedAdvisoryAck(); vi.spyOn(LiveEngine.prototype, 'playBuffer').mockReturnValue(true); vi.spyOn(LiveEngine.prototype, 'start').mockReturnValue(true); host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); window.localStorage.clear(); });

describe('Newton Tesla research laboratory', () => {
  it('selects nodes by keyboard and filters the text edge audit without losing source limits', async () => {
    await mount();
    expect(host.querySelectorAll('.nt-node')).toHaveLength(NETWORK_NODES.length);
    expect(host.querySelector('a[download]')!.getAttribute('href')).toContain('research/newton-tesla-network.md');
    const target = NETWORK_NODES.find(node => node.id === 'tesla-rotating-field')!;
    await act(async () => host.querySelector(`[aria-label="Select ${target.label}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(host.querySelector<HTMLSelectElement>('[aria-label="Selected concept"]')!.value).toBe(target.id);
    const unsupported = NETWORK_EDGES.find(edge => edge.status === 'unsupported')!;
    await select('Selected concept', unsupported.from);
    await select('Connection status', 'unsupported');
    const records = host.querySelectorAll('[data-edge-status]');
    expect(records.length).toBeGreaterThan(0);
    expect(Array.from(records).every(record => record.getAttribute('data-edge-status') === 'unsupported')).toBe(true);
    expect(host.textContent).toContain(unsupported.missingBridge);
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('updates the field locus, exports the chosen model and keeps circuit power accounting visible', async () => {
    const download = vi.spyOn(exports, 'downloadBytes').mockImplementation(() => {});
    await mount(); await click('Mathematical bench');
    expect(host.querySelector('[data-testid="nt-field-shape"]')!.textContent).toBe('circle');
    const initial = host.querySelector('[data-testid="nt-field-locus"]')!.getAttribute('d');
    await slide('Relative phase', 0);
    expect(host.querySelector('[data-testid="nt-field-shape"]')!.textContent).toBe('line');
    expect(host.querySelector('[data-testid="nt-field-locus"]')!.getAttribute('d')).not.toBe(initial);
    await click('Download model CSV');
    expect(download.mock.calls[0][1]).toBe('opensync-newton-tesla-field.csv');
    await click('Series RLC');
    const before = host.querySelector('[data-testid="nt-current"]')!.textContent;
    await slide('Resistance', 1000);
    expect(host.querySelector('[data-testid="nt-current"]')!.textContent).not.toBe(before);
    expect(host.textContent).toContain('Resistor dissipation');
    expect(host.textContent).toContain('passive model creates no net energy');
  });

  it('handles total internal reflection and never draws an impossible propagating ray', async () => {
    await mount(); await click('Mathematical bench'); await click('Refraction');
    expect(host.querySelector('[data-testid="nt-transmitted-ray"]')).not.toBeNull();
    await slide('Incident refractive index', 1.5);
    await slide('Transmitted refractive index', 1);
    await slide('Angle from normal', 60);
    expect(host.querySelector('[data-testid="nt-refraction-result"]')!.textContent).toBe('Total internal reflection');
    expect(host.querySelector('[data-testid="nt-transmitted-ray"]')).toBeNull();
    expect(LiveEngine.prototype.playBuffer).not.toHaveBeenCalled();
  });

  it('keeps original listening previews gated and stops them on section exit', async () => {
    clearAdvisoryAck(); await mount(); await click('Listening studies');
    const preset = NEWTON_TESLA_PRESETS[0];
    const preview = () => host.querySelector<HTMLButtonElement>(`[aria-label="Preview first 10 seconds of ${preset.title}"]`)!;
    await act(async () => preview().click());
    expect(session.advisoryOpen).toBe(true); expect(session.previewId).toBeNull();
    await act(async () => session.acknowledgeAdvisory());
    await act(async () => preview().click());
    expect(session.previewId).toBe(`preset:${preset.id}`);
    await click('Newton readings');
    expect(session.previewId).toBeNull();
    expect(host.textContent).toContain('Missing bridge');
    await click('Listening studies');
    await act(async () => session.setGovernor({ infantMode: true }));
    expect(host.querySelector('[data-testid^="nt-preset-"]')).toBeNull();
  });

  it('loads a recipe silently into Studio and preserves unrelated previews on exit', async () => {
    await mount(); await click('Listening studies'); await click('LOAD INTO STUDIO');
    expect(host.textContent).toContain('Studio destination');
    expect(session.presetName).toBe(NEWTON_TESLA_PRESETS[0].title);
    expect(session.running).toBe(false); expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
    await act(async () => navigate('/newton-tesla'));
    const externalStop = vi.fn();
    await act(async () => session.togglePreview('unrelated:preview', () => externalStop));
    await act(async () => navigate('/elsewhere'));
    expect(session.previewId).toBe('unrelated:preview'); expect(externalStop).not.toHaveBeenCalled();
  });

  it('routes every selectable connection around unrelated node boxes', async () => {
    await mount();
    for (const selectedNode of NETWORK_NODES) {
      await select('Selected concept', selectedNode.id);
      const boxes = Array.from(host.querySelectorAll<SVGRectElement>('.nt-node rect')).map((rect, index) => ({
        id: NETWORK_NODES[index].id,
        x: Number(rect.getAttribute('x')), y: Number(rect.getAttribute('y')),
        width: Number(rect.getAttribute('width')), height: Number(rect.getAttribute('height')),
      }));
      for (const path of host.querySelectorAll<SVGPathElement>('.nt-edge')) {
        const edge = NETWORK_EDGES.find(item => item.id === path.getAttribute('data-edge-id'))!;
        expect(path.getAttribute('marker-end')).toContain('url(#');
        const numbers = path.getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        for (let i = 0; i < numbers.length - 2; i += 2) {
          const [x1, y1, x2, y2] = numbers.slice(i, i + 4);
          expect(x1 === x2 || y1 === y2).toBe(true);
          for (const box of boxes.filter(item => item.id !== edge.from && item.id !== edge.to)) {
            const left = box.x - 2, right = box.x + box.width + 2;
            const top = box.y - 2, bottom = box.y + box.height + 2;
            const crosses = y1 === y2
              ? y1 > top && y1 < bottom && Math.max(Math.min(x1, x2), left) < Math.min(Math.max(x1, x2), right)
              : x1 > left && x1 < right && Math.max(Math.min(y1, y2), top) < Math.min(Math.max(y1, y2), bottom);
            expect(crosses, `${edge.id} must clear unrelated ${box.id}`).toBe(false);
          }
        }
      }
    }
  });

});
