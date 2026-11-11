import { useEffect, useRef, useState, type ReactNode } from 'react';
import { analyzeFrame, exportAnalysisFrame, type AudioAnalysisFrame } from './analysis';
import type { Signal } from './signal';
import { drawLevelsHistory, drawSpectrogram, drawSpectrum, drawStereo, drawWaveform } from './analysisDraw';
import './audioAnalysis.css';

type SourceState = 'live' | 'muted' | 'waiting' | 'idle' | 'paused' | 'demo';
interface Props {
  getSignal: () => Signal | null;
  sourceId: string;
  sourceLabel: string;
  sourceState: SourceState;
  frozen: boolean;
  onToggleFreeze?: () => void;
}
interface Snapshot { sourceId: string; at: number; sampledAt: string; frame: AudioAnalysisFrame; history: HistoryEntry[] }
interface HistoryEntry { at: number; frame: AudioAnalysisFrame }
type PanelId = 'waveform' | 'spectrum' | 'spectrogram' | 'levels' | 'shape';
const PANELS: PanelId[] = ['waveform', 'spectrum', 'spectrogram', 'levels', 'shape'];
const EMPTY = new Float32Array(0);
const format = (value: number | null | undefined, digits = 1) => value == null || !Number.isFinite(value) ? '—' : value.toFixed(digits);
const hz = (value: number | null | undefined) => value == null ? '—' : value >= 1000 ? `${format(value / 1000, 2)} kHz` : `${format(value, 1)} Hz`;

function Plot({ label, draw, caption, square = false }: { label: string; draw: (canvas: HTMLCanvasElement) => void; caption: ReactNode; square?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(draw);
  useEffect(() => {
    latest.current = draw;
    if (canvas.current) draw(canvas.current);
  }, [draw]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const paint = () => latest.current(element);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(paint);
    observer?.observe(element);
    window.addEventListener('resize', paint);
    return () => { observer?.disconnect(); window.removeEventListener('resize', paint); };
  }, []);
  return <figure className={`ci-analysis-plot${square ? ' ci-analysis-plot-square' : ''}`}>
    <canvas ref={canvas} width="800" height="250" role="img" aria-label={label} />
    <figcaption>{caption}</figcaption>
  </figure>;
}

function Metric({ label, value, unit, explanation }: { label: string; value: string; unit?: string; explanation?: string }) {
  return <div className="ci-analysis-metric"><dt>{label}</dt><dd>{value}{unit && <small>{unit}</small>}{explanation && <p>{explanation}</p>}</dd></div>;
}

export default function AudioAnalysis({ getSignal, sourceId, sourceLabel, sourceState, frozen, onToggleFreeze }: Props) {
  const host = useRef<HTMLElement>(null);
  const getter = useRef(getSignal);
  const history = useRef<HistoryEntry[]>([]);
  const historySource = useRef(sourceId);
  const [open, setOpen] = useState<PanelId[]>(['waveform']);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [windowMs, setWindowMs] = useState(20);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const [error, setError] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const hasOpenPanel = open.length > 0;
  const available = sourceState === 'live' || sourceState === 'demo' || sourceState === 'paused';
  const current = available && snapshot?.sourceId === sourceId ? snapshot : null;
  const frame = current?.frame ?? null;
  const entries = current?.history ?? [];
  const held = frozen || sourceState === 'paused';
  const sampling = hasOpenPanel && visible && pageVisible && !held && (sourceState === 'live' || sourceState === 'demo');

  useEffect(() => { getter.current = getSignal; }, [getSignal]);
  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const change = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (historySource.current !== sourceId || !available) {
      history.current = [];
      historySource.current = sourceId;
      if (!available) queueMicrotask(() => {
        if (!cancelled) setSnapshot(null);
      });
    }
    return () => { cancelled = true; };
  }, [sourceId, available]);
  useEffect(() => {
    if (!sampling) return;
    const sample = () => {
      const signal = getter.current();
      if (!signal) {
        history.current = [];
        setSnapshot(null);
        return;
      }
      try {
        const next = analyzeFrame(signal.left, signal.right, signal.sampleRate);
        const at = performance.now();
        if (historySource.current !== sourceId) { history.current = []; historySource.current = sourceId; }
        // Keep frequency/level history, not a growing audio recording. Only the
        // current frame retains waveform samples. Storage is bounded to 160 rows.
        const compact: AudioAnalysisFrame = { ...next, waveformLeft: EMPTY, waveformRight: EMPTY, leftSpectrumDb: EMPTY, rightSpectrumDb: EMPTY };
        history.current = [...history.current.filter((entry) => at - entry.at <= 20000), { at, frame: compact }].slice(-160);
        setSnapshot({ sourceId, at, sampledAt: new Date().toISOString(), frame: next, history: history.current });
        setError('');
      } catch (reason) {
        history.current = [];
        setSnapshot(null);
        setError(reason instanceof Error ? reason.message : 'This audio frame could not be analyzed.');
      }
    };
    sample();
    const interval = window.setInterval(sample, 125);
    return () => window.clearInterval(interval);
  }, [sampling, sourceId]);

  const toggle = (id: PanelId, isOpen: boolean) => setOpen((currentOpen) => isOpen ? currentOpen.includes(id) ? currentOpen : [...currentOpen, id] : currentOpen.filter((item) => item !== id));
  const panel = (id: PanelId, number: string, title: string, description: string, readout: string, children: ReactNode) => <details className="ci-analysis-panel" open={open.includes(id)} onToggle={(event) => toggle(id, event.currentTarget.open)}>
    <summary><span className="ci-analysis-panel-number" aria-hidden="true">{number}</span><span className="ci-analysis-panel-heading"><strong>{title}</strong><small>{description}</small></span><span className="ci-analysis-panel-readout">{readout}</span><span className="ci-analysis-panel-mark" aria-hidden="true">+</span></summary>
    {open.includes(id) && <div className="ci-analysis-panel-body">{children}</div>}
  </details>;
  const empty = <div className="ci-analysis-empty"><strong>{sourceState === 'waiting' ? 'Waiting for your audio source' : sourceState === 'muted' ? 'The audio source is muted' : held ? 'No snapshot to hold yet' : 'Connect a source to inspect its signal'}</strong><p>{sourceState === 'demo' ? 'The reference tone will appear when this analysis is visible and resumed.' : 'Choose Browser tab, Laptop audio, Audio input, File or Studio above. Capture starts only when you connect a source.'}</p></div>;
  const stateText = held && current ? 'Frozen snapshot' : sourceState === 'demo' ? 'Synthetic tone demo' : sourceState === 'paused' ? 'Playback paused' : sourceState === 'muted' ? 'Source muted' : sourceState === 'waiting' ? 'Waiting for permission' : sourceState === 'live' ? !hasOpenPanel ? 'Analysis collapsed' : !visible || !pageVisible ? 'Analysis offscreen' : current ? 'Live analysis' : 'Waiting for signal' : 'No source connected';
  const balanceText = !frame || frame.rmsDb == null ? '—' : Math.abs(frame.balance) < 0.01 ? 'Centered' : `${Math.round(Math.abs(frame.balance) * 100)}% ${frame.balance > 0 ? 'right' : 'left'}`;

  const exportCurrent = () => {
    if (!current) return;
    const data = exportAnalysisFrame(current.frame) as Record<string, unknown>;
    delete data.waveformLeft;
    delete data.waveformRight;
    const blob = new Blob([JSON.stringify({ schema: 'opensync.cymatics.audio-snapshot.v1', source: { id: sourceId, label: sourceLabel, state: sourceState, synthetic: sourceState === 'demo' }, sampledAt: current.sampledAt, held: held || !sampling, analysisPaused: !sampling, scope: 'One analysis frame; not a full recording. Waveform samples are omitted.', analysis: data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'cymatics-audio-snapshot.json'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportStatus('Current measurements and spectrum saved as JSON.');
  };

  return <section ref={host} className="ci-analysis" aria-labelledby="ci-analysis-heading">
    <header className="ci-analysis-header">
      <div><span className="ci-kicker">SIGNAL WORKBENCH</span><h2 id="ci-analysis-heading">See what you hear.</h2><p>Waveforms, frequency content and stereo measurements from the same selected source.</p></div>
      <div className="ci-analysis-actions">
        <button type="button" onClick={() => setOpen([...PANELS])}>Expand all</button>
        <button type="button" onClick={() => setOpen([])}>Collapse all</button>
        {onToggleFreeze && <button type="button" onClick={onToggleFreeze} aria-pressed={frozen}>{frozen ? 'Resume analysis' : 'Freeze analysis'}</button>}
        <button type="button" disabled={!current} onClick={exportCurrent}>Export snapshot</button>
      </div>
    </header>
    <div className="ci-analysis-source"><span className="ci-analysis-state" data-live={sampling && !!current}><i aria-hidden="true" />{stateText}</span><span>{sourceLabel || 'Choose an audio source above'}</span><small>{frame ? `${frame.sampleRate.toLocaleString()} Hz · ${frame.fftSize}-sample FFT · ${format(frame.durationMs, 1)} ms block` : 'Local analysis · no audio upload'}</small></div>
    <p className="ci-analysis-method">{sourceState === 'demo' ? 'This is a synthetic reference, including when the tone preview is silent. Connect a live input to measure actual audio. ' : ''}Analysis takes up to eight snapshots per second while an expanded panel is visible. Freeze holds every analysis plot. Collapse all pauses analysis.</p>
    {error && <p className="ci-analysis-error" role="alert">{error}</p>}

    {panel('waveform', '01', 'Waveforms & stereo trace', 'Time-domain channels and their relationship', frame ? `${format(frame.durationMs, 1)} ms` : 'No frame', frame ? <>
      <div className="ci-analysis-toolbar"><label>Time window <select value={windowMs} onChange={(event) => setWindowMs(Number(event.target.value))}><option value="5">5 ms</option><option value="20">20 ms</option><option value="40">40 ms</option></select></label><span className="ci-analysis-legend"><i className="left" />Left <i className="right" />Right</span></div>
      <div className="ci-analysis-wave-grid">
        <Plot label="Left and right audio waveform, time in milliseconds and amplitude relative to full scale" draw={(canvas) => drawWaveform(canvas, frame.waveformLeft, frame.waveformRight, frame.sampleRate, windowMs)} caption="Fixed amplitude scale −1 to +1; trace window is limited to the current sample block." />
        <Plot square label="Stereo phase trace plotting left amplitude horizontally against right amplitude vertically" draw={(canvas) => drawStereo(canvas, frame.waveformLeft, frame.waveformRight)} caption="Stereo trace: left on X, right on Y. A diagonal is correlated audio; a circle or wide shape indicates channel differences." />
      </div>
    </> : empty)}

    {panel('spectrum', '02', 'Frequency spectrum & peaks', 'Log-frequency FFT with channel overlays', frame ? hz(frame.peakHz) : 'No frame', frame ? <>
      <span className="ci-analysis-legend"><i className="combined" />Combined power <i className="left" />Left <i className="right" />Right</span>
      <Plot label="Log-frequency audio spectrum in hertz and dBFS, with combined power and left/right overlays" draw={(canvas) => drawSpectrum(canvas, frame)} caption={`Hann-windowed ${frame.fftSize}-sample FFT · ${format(frame.binHz, 2)} Hz bins. Channel power is combined without canceling opposite-phase signals.`} />
      <div className="ci-analysis-table-wrap"><table><caption>Strongest local spectral peaks. A peak is not necessarily a fundamental or a separate instrument.</caption><thead><tr><th scope="col">Peak</th><th scope="col">Frequency</th><th scope="col">Level</th><th scope="col">Ratio to strongest</th></tr></thead><tbody>{frame.peaks.length ? frame.peaks.map((peak, index) => <tr key={index}><th scope="row">{String(index + 1).padStart(2, '0')}</th><td>{hz(peak.hz)}</td><td>{format(peak.db)} dBFS</td><td>{frame.peakHz ? `${format(peak.hz / frame.peakHz, 3)}×` : '—'}</td></tr>) : <tr><td colSpan={4}>No spectral peak above the analysis floor.</td></tr>}</tbody></table></div>
      <p className="ci-analysis-caption">Nearest musical note to the strongest peak: <strong>{frame.note ?? '—'}{frame.cents != null ? ` (${frame.cents >= 0 ? '+' : ''}${format(frame.cents, 1)} cents)` : ''}</strong>. This labels a spectral peak; it does not estimate a melody’s fundamental pitch.</p>
    </> : empty)}

    {panel('spectrogram', '03', 'Spectrogram', 'A short history of changing frequency content', `${entries.length} snapshots`, frame ? <>
      <Plot label="Rolling spectrogram showing the last twenty elapsed seconds, log frequency and spectral level" draw={(canvas) => drawSpectrogram(canvas, entries, current!.at)} caption="Twenty-second view of timestamped spectral snapshots. Gaps remain blank when analysis is paused, collapsed or offscreen; this is not a continuous audio recording." />
      <div className="ci-analysis-color-key"><span>−120 dBFS</span><i aria-hidden="true" /><span>0 dBFS</span></div>
    </> : empty)}

    {panel('levels', '04', 'Levels & stereo measurements', 'Amplitude, headroom and channel balance', frame ? `${format(frame.rmsDb)} dBFS RMS` : 'No frame', frame ? <>
      <dl className="ci-analysis-metrics">
        <Metric label="Combined RMS" value={format(frame.rmsDb)} unit="dBFS" explanation="Mean channel power; not a calibrated sound-pressure level." />
        <Metric label="Sample peak" value={format(frame.peakDb)} unit="dBFS" explanation="Largest measured sample; this is not a true-peak measurement." />
        <Metric label="Crest factor" value={format(frame.crestDb)} unit="dB" explanation="Sample peak minus combined RMS for this block." />
        <Metric label="Channel correlation" value={format(frame.correlation, 3)} explanation="−1 opposite polarity · 0 uncorrelated · +1 identical. Undefined for a silent channel." />
        <Metric label="Left RMS / peak" value={`${format(frame.leftRmsDb)} / ${format(frame.leftPeakDb)}`} unit="dBFS" />
        <Metric label="Right RMS / peak" value={`${format(frame.rightRmsDb)} / ${format(frame.rightPeakDb)}`} unit="dBFS" />
        <Metric label="Power balance" value={balanceText} explanation="Relative channel-power difference; not a pan-knob position." />
        <Metric label="Near full scale" value={format(frame.nearFullScaleFraction * 100, 2)} unit="% samples" explanation="Samples at or above |0.999|. This can indicate limited headroom; it does not prove clipping." />
        <Metric label="Mid energy" value={frame.rmsDb == null ? '—' : format(frame.midPowerFraction * 100, 1)} unit="%" />
        <Metric label="Side energy" value={frame.rmsDb == null ? '—' : format(frame.sidePowerFraction * 100, 1)} unit="%" />
        <Metric label="DC offset · left" value={format(frame.dcLeft, 5)} unit="amplitude" />
        <Metric label="DC offset · right" value={format(frame.dcRight, 5)} unit="amplitude" />
      </dl>
      <span className="ci-analysis-legend"><i className="left" />RMS <i className="right" />Sample peak</span>
      <Plot label="Recent combined RMS and sample peak measurements over the last twenty elapsed seconds" draw={(canvas) => drawLevelsHistory(canvas, entries, current!.at)} caption="Level history uses the same snapshots as the spectrogram. Lower values are quieter digital signal levels; they do not measure your speaker volume." />
    </> : empty)}

    {panel('shape', '05', 'Spectral shape & frequency bands', 'Energy distribution and texture', frame ? `${format(frame.centroidHz, 0)} Hz centroid` : 'No frame', frame ? <>
      <dl className="ci-analysis-metrics">
        <Metric label="Spectral centroid" value={format(frame.centroidHz, 0)} unit="Hz" explanation="Power-weighted frequency center of this frame." />
        <Metric label="Spectral spread" value={format(frame.spreadHz, 0)} unit="Hz" explanation="Power-weighted spread around the centroid." />
        <Metric label="85% rolloff" value={format(frame.rolloff85Hz, 0)} unit="Hz" explanation="Frequency below which 85% of analyzed spectral power lies." />
        <Metric label="Spectral flatness" value={format(frame.flatness, 4)} explanation="Geometric / arithmetic mean power, 0 to 1. This is a frame statistic, not a genre classification." />
      </dl>
      <div className="ci-analysis-bands" aria-label="Octave-band shares of spectral power">{frame.bands.map((band) => <div key={band.label}><span>{band.label}<small>{format(band.lowHz, 0)}–{format(band.highHz, 0)} Hz</small></span><meter min="0" max="1" value={band.powerFraction} aria-label={`${band.label} band share of spectral power`} /><b>{format(band.powerFraction * 100, 1)}%</b></div>)}</div>
      <p className="ci-analysis-caption">Bands are limited by the current sample rate. Nyquist frequency: <strong>{hz(frame.sampleRate / 2)}</strong>. Frequencies and levels describe the captured digital signal, not a physical plate response or a listener’s physiology.</p>
    </> : empty)}
    <footer className="ci-analysis-footer"><p>{frame ? `Snapshot ${current!.sampledAt.replace('T', ' ').replace('Z', ' UTC')} · ${frame.sanitizedSamples ? `${frame.sanitizedSamples} non-finite samples replaced` : 'Digital measurements only'}` : 'No snapshot is retained across source changes or disconnection.'}</p><p role="status">{exportStatus}</p></footer>
  </section>;
}
