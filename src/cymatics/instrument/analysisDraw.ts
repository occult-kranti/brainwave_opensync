import type { AudioAnalysisFrame } from './analysis';

/** Plotting consumes bounded snapshots only; timestamps use performance.now ms. */
export interface AnalysisHistoryFrame { at: number; frame: AudioAnalysisFrame }

const BG = '#191718';
const GRID = '#463f3e';
const TEXT = '#cbbdaf';
const LEFT = '#76d2c4';
const RIGHT = '#e6be78';
const COMBINED = '#f2e9db';
const FLOOR = -120;
const HISTORY_MS = 20000;
const finite = (n: number, fallback = 0) => Number.isFinite(n) ? n : fallback;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, finite(n, lo)));
const hzLabel = (n: number) => n >= 1000 ? `${Number((n / 1000).toFixed(1))}k` : String(Math.round(n));

function plot(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 500));
  const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 220));
  const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const pw = Math.round(width * ratio), ph = Math.round(height * ratio);
  if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
  context.setTransform(pw / width, 0, 0, ph / height, 0, 0);
  context.fillStyle = BG;
  context.fillRect(0, 0, width, height);
  context.font = '10px ui-monospace, monospace';
  context.lineWidth = 1;
  context.fillStyle = TEXT;
  const x = 43, y = 18, w = Math.max(1, width - 57), h = Math.max(1, height - 52);
  return { c: context, width, height, x, y, w, h };
}

type Plot = NonNullable<ReturnType<typeof plot>>;
function horizontal(p: Plot, fraction: number, label: string) {
  const yy = p.y + p.h * fraction;
  p.c.strokeStyle = GRID;
  p.c.beginPath(); p.c.moveTo(p.x, yy); p.c.lineTo(p.x + p.w, yy); p.c.stroke();
  p.c.fillStyle = TEXT; p.c.textAlign = 'right'; p.c.fillText(label, p.x - 7, yy + 3);
  p.c.textAlign = 'left';
}
function vertical(p: Plot, fraction: number, label: string) {
  const xx = p.x + p.w * fraction;
  p.c.strokeStyle = GRID;
  p.c.beginPath(); p.c.moveTo(xx, p.y); p.c.lineTo(xx, p.y + p.h); p.c.stroke();
  p.c.fillStyle = TEXT; p.c.textAlign = fraction === 0 ? 'left' : fraction === 1 ? 'right' : 'center';
  p.c.fillText(label, xx, p.y + p.h + 17); p.c.textAlign = 'left';
}
function label(p: Plot, text: string) {
  p.c.fillStyle = TEXT; p.c.textAlign = 'left'; p.c.fillText(text, p.x, 11);
}
function clipped(p: Plot, draw: () => void) {
  p.c.save(); p.c.beginPath(); p.c.rect(p.x, p.y, p.w, p.h); p.c.clip(); draw(); p.c.restore();
}
export function clearPlot(canvas: HTMLCanvasElement, message = 'Connect an audio source to inspect this plot') {
  const p = plot(canvas);
  if (!p) return;
  horizontal(p, .5, '0');
  p.c.fillStyle = TEXT; p.c.textAlign = 'center';
  p.c.fillText(message, p.x + p.w / 2, p.y + p.h / 2 - 12, p.w - 12);
}

export function drawWaveform(canvas: HTMLCanvasElement, left: Float32Array, right: Float32Array, sampleRate: number, windowMs: number) {
  const p = plot(canvas); if (!p) return;
  const length = Math.min(left.length, right.length, Math.max(1, Math.floor(sampleRate * windowMs / 1000)));
  if (length < 2 || !(sampleRate > 0)) { clearPlot(canvas); return; }
  const ms = (length - 1) * 1000 / sampleRate;
  label(p, 'Amplitude · digital full scale');
  horizontal(p, 0, '+1'); horizontal(p, .5, '0'); horizontal(p, 1, '−1');
  for (let i = 0; i <= 4; i++) vertical(p, i / 4, `${Number((ms * i / 4).toFixed(1))}${i === 4 ? ' ms' : ''}`);
  clipped(p, () => {
    for (const [data, color] of [[left, LEFT], [right, RIGHT]] as const) {
      p.c.strokeStyle = color; p.c.globalAlpha = .92; p.c.lineWidth = 1.2; p.c.beginPath();
      for (let i = 0; i < length; i++) {
        const xx = p.x + p.w * i / (length - 1), yy = p.y + p.h * (1 - finite(data[i])) / 2;
        if (!i) p.c.moveTo(xx, yy); else p.c.lineTo(xx, yy);
      }
      p.c.stroke();
    }
  });
}

function frequencyAxis(p: Plot, high: number) {
  const span = Math.log(high / 20);
  const highLabel = `${hzLabel(high)} Hz`;
  const highLabelStart = p.w - p.c.measureText(highLabel).width;
  let previousLabelEnd = -Infinity;
  for (const hz of [20, 100, 1000, 10000]) {
    if (hz >= high) continue;
    const fraction = Math.log(hz / 20) / span;
    const text = hzLabel(hz);
    const width = p.c.measureText(text).width;
    const start = fraction === 0 ? 0 : p.w * fraction - width / 2;
    const end = start + width;
    // Reserve the right-aligned Nyquist label first. A fractional cutoff alone
    // can still place 10k over 24k Hz on a narrow mobile plot.
    if (start < previousLabelEnd + 8 || end + 8 > highLabelStart) continue;
    vertical(p, fraction, text);
    previousLabelEnd = end;
  }
  vertical(p, 1, highLabel);
}
export function drawSpectrum(canvas: HTMLCanvasElement, frame: AudioAnalysisFrame) {
  const p = plot(canvas); if (!p) return;
  const high = frame.sampleRate / 2;
  if (!(high > 20)) { clearPlot(canvas, 'Sample rate below this plot’s audible range'); return; }
  label(p, 'Spectral amplitude · dBFS');
  for (const db of [0, -30, -60, -90, -120]) horizontal(p, -db / 120, String(db));
  frequencyAxis(p, high);
  clipped(p, () => {
    for (const [data, color, width] of [[frame.leftSpectrumDb, LEFT, 1], [frame.rightSpectrumDb, RIGHT, 1], [frame.spectrumDb, COMBINED, 1.45]] as const) {
      p.c.strokeStyle = color; p.c.lineWidth = width; p.c.beginPath();
      for (let px = 0; px <= p.w; px++) {
        const hz = 20 * Math.exp(Math.log(high / 20) * px / p.w);
        const index = clamp(hz / frame.binHz, 1, data.length - 1);
        const low = Math.floor(index), upper = Math.min(data.length - 1, low + 1);
        const v = finite(data[low], FLOOR) + (finite(data[upper], FLOOR) - finite(data[low], FLOOR)) * (index - low);
        const yy = p.y + p.h * (-clamp(v, FLOOR, 0) / 120);
        if (!px) p.c.moveTo(p.x, yy); else p.c.lineTo(p.x + px, yy);
      }
      p.c.stroke();
    }
  });
}

function heat(db: number) {
  const t = clamp((db + 120) / 120, 0, 1);
  // Ink → teal → warm gold, with a fixed dB scale across every frame.
  const stops = [[25, 23, 24], [35, 92, 90], [118, 210, 196], [235, 189, 113], [255, 242, 215]];
  const segment = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const f = t * (stops.length - 1) - segment;
  const a = stops[segment], b = stops[segment + 1];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(',')})`;
}
export function drawSpectrogram(canvas: HTMLCanvasElement, history: AnalysisHistoryFrame[], now: number) {
  const p = plot(canvas); if (!p) return;
  const recent = history.filter((item) => now - item.at >= 0 && now - item.at <= HISTORY_MS).slice(-160);
  const high = recent.at(-1)?.frame.sampleRate ? recent.at(-1)!.frame.sampleRate / 2 : 24000;
  if (!(high > 20)) { clearPlot(canvas); return; }
  label(p, 'Frequency · Hz (logarithmic)');
  clipped(p, () => {
    for (const item of recent) {
      const fraction = 1 - (now - item.at) / HISTORY_MS;
      const xx = p.x + p.w * fraction;
      // Draw only the observed PCM window, not the unsampled time between
      // snapshots. Longer inactive gaps remain blank as well.
      const columnWidth = Math.max(1, p.w * Math.min(125, item.frame.durationMs) / HISTORY_MS);
      for (let row = 0; row < p.h; row += 2) {
        const hz = 20 * Math.exp(Math.log(high / 20) * (1 - row / p.h));
        const bin = Math.round(hz / item.frame.binHz);
        const db = item.frame.spectrumDb[Math.min(item.frame.spectrumDb.length - 1, Math.max(1, bin))];
        p.c.fillStyle = heat(finite(db, FLOOR));
        p.c.fillRect(xx - columnWidth, p.y + row, columnWidth + .25, 2);
      }
    }
  });
  for (const hz of [20, 100, 1000, 10000]) {
    if (hz >= high) continue;
    const fraction = 1 - Math.log(hz / 20) / Math.log(high / 20);
    if (fraction * p.h < 13) continue; // Keep the top Nyquist label legible.
    horizontal(p, fraction, hzLabel(hz));
  }
  p.c.fillStyle = TEXT; p.c.textAlign = 'right'; p.c.fillText(`${hzLabel(high)}`, p.x - 7, p.y + 3); p.c.textAlign = 'left';
  for (let i = 0; i <= 4; i++) vertical(p, i / 4, i === 4 ? 'now' : `${-20 + i * 5}s`);
}

export function drawStereo(canvas: HTMLCanvasElement, left: Float32Array, right: Float32Array) {
  const p = plot(canvas); if (!p) return;
  const side = Math.max(1, Math.min(p.w, p.h)), xx = p.x + (p.w - side) / 2, yy = p.y + (p.h - side) / 2;
  label(p, 'Left / Right · digital full scale');
  p.c.strokeStyle = GRID;
  p.c.strokeRect(xx, yy, side, side);
  p.c.beginPath(); p.c.moveTo(xx, yy + side / 2); p.c.lineTo(xx + side, yy + side / 2);
  p.c.moveTo(xx + side / 2, yy); p.c.lineTo(xx + side / 2, yy + side); p.c.stroke();
  p.c.setLineDash([3, 4]); p.c.beginPath(); p.c.moveTo(xx, yy + side); p.c.lineTo(xx + side, yy); p.c.stroke(); p.c.setLineDash([]);
  p.c.fillStyle = TEXT; p.c.fillText('R +1', xx + side + 4, yy + 7);
  p.c.fillText('R −1', xx + side + 4, yy + side); p.c.textAlign = 'center';
  p.c.fillText('L −1', xx, yy + side + 17); p.c.fillText('L +1', xx + side, yy + side + 17); p.c.textAlign = 'left';
  p.c.save(); p.c.beginPath(); p.c.rect(xx, yy, side, side); p.c.clip();
  p.c.strokeStyle = LEFT; p.c.globalAlpha = .78; p.c.lineWidth = 1; p.c.beginPath();
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const x = xx + side * (1 + finite(left[i])) / 2, y = yy + side * (1 - finite(right[i])) / 2;
    if (!i) p.c.moveTo(x, y); else p.c.lineTo(x, y);
  }
  p.c.stroke(); p.c.restore();
}

export function drawLevelsHistory(canvas: HTMLCanvasElement, history: AnalysisHistoryFrame[], now: number) {
  const p = plot(canvas); if (!p) return;
  label(p, 'Short-window levels · dBFS');
  for (const db of [0, -30, -60, -90, -120]) horizontal(p, -db / 120, String(db));
  for (let i = 0; i <= 4; i++) vertical(p, i / 4, i === 4 ? 'now' : `${-20 + i * 5}s`);
  clipped(p, () => {
    for (const [key, color] of [['rmsDb', LEFT], ['peakDb', RIGHT]] as const) {
      p.c.strokeStyle = color; p.c.lineWidth = 1.3; p.c.beginPath();
      let previous = -Infinity;
      for (const item of history) {
        const age = now - item.at;
        if (age < 0 || age > HISTORY_MS) continue;
        const x = p.x + p.w * (1 - age / HISTORY_MS), y = p.y + p.h * (-clamp(item.frame[key] ?? FLOOR, FLOOR, 0) / 120);
        if (item.at - previous > 250) p.c.moveTo(x, y); else p.c.lineTo(x, y);
        previous = item.at;
      }
      p.c.stroke();
    }
  });
}
