import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Aperture, ArrowDownToLine, ArrowUpRight, AudioLines, ChevronDown, Circle, Focus, Maximize, Mic, Monitor, Pause, Play, Radio, RotateCcw, SlidersHorizontal, Square, Waves } from 'lucide-react';
import { VIRTUAL_PLATES } from '../chladni';
import { bounded, DEFAULT_LOOK, parseLook, QUICK_HZ, SCENES, sceneLook, type Effect, type Input, type Look, type Scene, type View, type Waveform } from './scenes';
import { makeDemoSignal, signalReader, type Analysers, type Signal } from './signal';
import AudioAnalysis from './AudioAnalysis';
import { useAnalysisSample } from './useAnalysisSample';
import { createRenderer } from './render';
import { useInstrumentInput } from './useInstrumentInput';
import { downloadBlob, startCapture } from './Capture';
import './instrument.css';

interface Props {
  getStudioSignal: () => Analysers | null;
  playTone: (hz: number, wave: Waveform) => void;
  stopTone: () => void;
  tonePlaying: boolean;
  sessionRunning: boolean;
  sessionPaused: boolean;
  panicked: boolean;
  advanced: ReactNode;
  fileAnalysis?: (file: File | null) => ReactNode;
}

const VIEW_CHOICES: { id: View; label: string; icon: typeof Circle }[] = [
  { id: 'sand', label: 'Sand', icon: Circle },
  { id: 'water', label: 'Liquid', icon: Waves },
  { id: 'scope', label: 'Lissajous', icon: AudioLines },
  { id: 'ink', label: 'Nodal Ink', icon: Aperture },
];
const SOURCE_CHOICES: { id: Input; label: string }[] = [
  { id: 'tone', label: 'Tone' }, { id: 'studio', label: 'Studio' }, { id: 'file', label: 'File' },
  { id: 'tab', label: 'Browser tab' }, { id: 'system', label: 'Laptop audio' }, { id: 'mic', label: 'Audio input' },
];
const EFFECTS: { id: Effect; name: string }[] = [
  { id: 'natural', name: 'Natural' }, { id: 'mono', name: 'Monochrome' },
  { id: 'mirror', name: 'Mirror' }, { id: 'halftone', name: 'Halftone' },
];
const MODELS = {
  sand: ['Chladni plate', 'A simulated plate response. Grains highlight the regions with the least motion.'],
  ink: ['Nodal ink', 'The same plate model, drawn as fine lines.'],
  water: ['Liquid interference', 'An artistic ripple field driven by frequency and level.'],
  scope: ['Stereo phase', 'Live inputs plot the two waveform channels. The Tone demo draws a synthetic curve.'],
};
const SAVED_LOOK = 'opensync.cymatics.instrument-look.v1';

function startingLook() {
  try {
    const params = new URLSearchParams(location.search);
    const recipe = params.get('look');
    if (recipe && recipe.length <= 1400) return parseLook(JSON.parse(recipe));
    const scene = SCENES.find((item) => item.id === params.get('scene'));
    if (scene) return sceneLook(scene);
  } catch {
    // Malformed shared links fall back to the default instrument.
  }
  return DEFAULT_LOOK;
}

function SceneMark({ scene }: { scene: Scene }) {
  const petals = scene.id === 'stage' ? 9 : scene.id === 'liquid' ? 5 : 7;
  const paths = Array.from({ length: 4 }, (_, ring) => {
    const points = Array.from({ length: 89 }, (_, index) => {
      const angle = index * Math.PI / 44;
      const radius = 8 + ring * 3 + Math.cos(angle * petals + ring * 0.55) * (3.1 + ring * 0.75);
      return [22 + Math.cos(angle) * radius, 22 + Math.sin(angle) * radius].map((n) => n.toFixed(2)).join(',');
    });
    return 'M' + points.join('L') + 'Z';
  });
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" style={{ background: scene.colors[2], color: scene.colors[0] }}>
      <circle cx="22" cy="22" r="21" fill="none" stroke="currentColor" opacity=".32" />
      {scene.id === 'signal'
        ? <path d="M22 8C39 0 40 38 22 36S4 4 22 8 39 36 22 36 4 4 22 8Z" fill="none" stroke="currentColor" />
        : paths.map((path, index) => <path key={path} d={path} fill="none" stroke="currentColor" opacity={0.48 + index * 0.16} strokeWidth=".7" />)}
    </svg>
  );
}

function Dial({ name, value, change, max = 100 }: { name: string; value: number; change: (value: number) => void; max?: number }) {
  const angle = (value / max) * 270;
  return (
    <label className="ci-dial">
      <span className="ci-dial-face" aria-hidden="true" style={{ '--angle': `${angle - 135}deg`, '--fill': `${angle}deg` } as CSSProperties}><i /></span>
      <span className="ci-dial-value">{name}<b>{Math.round(value)}{max === 180 ? '°' : ''}</b></span>
      <input aria-label={name} type="range" min="0" max={max} value={value} onChange={(event) => change(Number(event.target.value))} />
    </label>
  );
}

export default function Instrument(props: Props) {
  const [look, setLook] = useState(startingLook);
  const [input, setInput] = useState<Input>('tone');
  const [frozen, setFrozen] = useState(() => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [settings, setSettings] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [stage, setStage] = useState(false);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [draftHz, setDraftHz] = useState<string | null>(null);
  const [meter, setMeter] = useState({ hz: 0, level: 0, bands: [0, 0, 0] });
  const [quietInput, setQuietInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileReportVisited, setFileReportVisited] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const capture = useRef<ReturnType<typeof startCapture>>(null);
  const draw = useRef<ReturnType<typeof createRenderer> | null>(null);
  const time = useRef(0);
  const latest = useRef(props);
  const analysisSignal = useRef<Signal | null>(null);
  const { connection, status, filename, active, waiting, sourceLabel, sourceVersion, muted, stop, start } = useInstrumentInput(props.panicked);
  const demo = useMemo(() => makeDemoSignal(look.hz, look.wave), [look.hz, look.wave]);
  const getAnalysisSignal = useCallback(() => analysisSignal.current, []);
  const sourceState = props.panicked ? 'idle' : input === 'tone' ? 'demo' : input === 'studio'
    ? props.sessionRunning ? props.sessionPaused ? 'paused' : 'live' : 'idle'
    : waiting ? 'waiting' : active ? muted ? 'muted' : 'live' : 'idle';
  const analysisSourceId = `${input}:${sourceVersion}:${input === 'studio' ? props.sessionRunning : ''}:${props.panicked}`;
  const receiveSample = useCallback((sample: File) => { setSelectedFile(sample); setFileReportVisited(true); }, []);
  const audioSample = useAnalysisSample(`${analysisSourceId}:${sourceState === 'live' ? 'live' : 'inactive'}`, receiveSample);
  const liveCapture = input === 'tab' || input === 'system' || input === 'mic';
  const signalPresent = meter.level >= 0.006;
  const checkSilence = liveCapture && active && !waiting && !frozen && !muted && !signalPresent;

  useEffect(() => {
    const timer = window.setTimeout(() => setQuietInput(checkSilence), checkSilence ? 5000 : 0);
    return () => window.clearTimeout(timer);
  }, [checkSilence]);

  useEffect(() => { latest.current = props; }, [props]);
  useEffect(() => () => {
    capture.current?.discard();
    if (latest.current.tonePlaying) latest.current.stopTone();
  }, []);
  useEffect(() => {
    if (props.panicked && capture.current) capture.current.stop();
  }, [props.panicked]);

  const scene = SCENES.find((item) => item.id === look.scene) ?? SCENES[0];
  const plates = VIRTUAL_PLATES.filter((plate) => plate.shape === (look.shape === 'round' ? 'circular' : 'square'));
  const plate = plates.find((choice) => choice.id === look.plate) ?? plates[0];
  const set = <Key extends keyof Look>(key: Key, value: Look[Key]) => setLook((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (advanced || !canvas.current) return;
    draw.current ??= createRenderer(canvas.current);
    const paint = draw.current;
    const read = signalReader();
    let frame = 0;
    let previous = 0;
    let published = 0;
    const tick = (now: number) => {
      if (!frozen) frame = requestAnimationFrame(tick);
      if (previous && now - previous < 29) return;
      if (previous) time.current += Math.min(0.07, (now - previous) / 1000);
      previous = now;
      const nodes = input === 'studio' ? latest.current.getStudioSignal() : input === 'tone' ? null : connection.current?.nodes;
      const signal = nodes ? read(nodes, look.response) : null;
      analysisSignal.current = input === 'tone' && !latest.current.panicked ? demo : signal;
      paint(look, scene, plate, time.current, signal);
      if (now - published > 160) {
        published = now;
        const next = { hz: Math.round(signal?.hz ?? (input === 'tone' ? look.hz : 0)), level: signal?.level ?? 0, bands: signal?.bands ?? [0, 0, 0] };
        setMeter((old) => old.hz === next.hz && Math.abs(old.level - next.level) < 0.01 &&
          old.bands.every((value, index) => Math.abs(value - next.bands[index]) < 0.02) ? old : next);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [look, scene, plate, frozen, input, connection, advanced, active, demo]);

  const pickInput = (next: Input) => {
    if (next === input) return;
    stop();
    analysisSignal.current = null;
    setQuietInput(false);
    if (props.tonePlaying) props.stopTone();
    setInput(next);
  };
  const pickLook = (next: Look) => {
    if (props.tonePlaying) props.stopTone();
    setDraftHz(null);
    setLook(next);
  };
  const commitFrequency = (hz: number) => {
    if (props.tonePlaying && hz !== look.hz) props.stopTone();
    set('hz', hz);
    setDraftHz(null);
  };
  const toggleStage = useCallback(() => {
    if (document.fullscreenElement === surface.current) {
      void document.exitFullscreen().catch(() => {});
      setStage(false);
      return;
    }
    if (stage) {
      setStage(false);
      return;
    }
    setStage(true);
    void surface.current?.requestFullscreen?.().catch(() => {});
  }, [stage]);
  useEffect(() => {
    const syncFullscreen = () => { if (!document.fullscreenElement) setStage(false); };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (advanced || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, button, [contenteditable]')) return;
      if (event.key.toLowerCase() === 'f') toggleStage();
      if (event.key.toLowerCase() === 'h' && !document.fullscreenElement) setStage((value) => !value);
      if (event.key === 'Escape' && stage) setStage(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advanced, stage, toggleStage]);

  const snapshot = () => canvas.current?.toBlob((blob) => {
    if (blob) downloadBlob(blob, `opensync-${scene.id}.png`);
    else setMessage('The browser could not save this frame.');
  }, 'image/png');
  const record = () => {
    if (capture.current) {
      capture.current.stop();
      return;
    }
    if (!canvas.current) return;
    capture.current = startCapture(canvas.current, (blob) => {
      capture.current = null;
      setRecording(false);
      if (blob) downloadBlob(blob, `opensync-${scene.id}.${blob.type.startsWith('video/mp4') ? 'mp4' : 'webm'}`);
      else setMessage('The browser could not finish the clip.');
    });
    setRecording(Boolean(capture.current));
    if (!capture.current) setMessage('Video capture is unavailable in this browser. PNG is available.');
  };
  const saveLook = () => {
    try {
      localStorage.setItem(SAVED_LOOK, JSON.stringify({ version: 1, look }));
      setMessage('Look saved on this device.');
    } catch {
      setMessage('This browser did not allow local storage.');
    }
  };
  const loadLook = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_LOOK) ?? 'null');
      if (saved?.version === 1) pickLook(parseLook(saved.look));
      setMessage(saved?.version === 1 ? 'Saved look loaded.' : 'Save a look first.');
    } catch {
      setMessage('The saved look could not be read.');
    }
  };
  const share = async () => {
    const url = new URL(location.href);
    url.searchParams.delete('scene');
    url.searchParams.set('look', JSON.stringify(look));
    try {
      await navigator.clipboard.writeText(url.href);
      setMessage('Scene link copied.');
    } catch {
      setMessage('Clipboard access is unavailable.');
    }
  };

  if (advanced) return (
    <>
      <div className="ci-lab-return"><button type="button" onClick={() => { draw.current = null; setAdvanced(false); }}><ChevronDown size={16} /> Back to the instrument</button></div>
      {props.advanced}
    </>
  );

  return (
    <div className="ci" data-scene={scene.id}>
      <header className="ci-header">
        <div className="ci-heading">
          <span className="ci-kicker"><span /> OPEN SYNC / VISUAL INSTRUMENTS</span>
          <h1 aria-label="Cymatic Studio">Cymatic <em>Studio</em></h1>
          <p>Give your music a visible form. Explore a tone or connect live audio.</p>
        </div>
        <div className="ci-header-actions">
          <button type="button" onClick={() => {
            stop();
            if (props.tonePlaying) props.stopTone();
            capture.current?.stop();
            setAdvanced(true);
          }}>Precision lab <ArrowUpRight size={14} aria-hidden="true" /></button>
          <button type="button" className="ci-settings-toggle" onClick={() => setSettings(!settings)} aria-expanded={settings}><SlidersHorizontal size={16} /> Settings</button>
        </div>
      </header>

      <nav className="ci-scenes" aria-label="Scene templates">
        {SCENES.map((item) => (
          <button type="button" key={item.id} aria-pressed={look.scene === item.id} onClick={() => pickLook(sceneLook(item))} title={item.note}>
            <SceneMark scene={item} />
            <span><small>{item.number} / {item.source}</small><strong>{item.name}</strong></span>
          </button>
        ))}
      </nav>

      <div className="ci-instrument">
        <div className="ci-main">
          <div className="ci-view-picker" aria-label="Visualization">
            {VIEW_CHOICES.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={look.view === id} onClick={() => set('view', id)}><Icon size={16} />{label}</button>)}
          </div>
          <div ref={surface} className={`ci-surface${stage ? ' ci-is-stage' : ''}`}>
            <div className="ci-reticle" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="ci-figure-label"><span>FIG. {scene.number}</span><strong>{MODELS[look.view][0]}</strong></div>
            <div className="ci-surface-status"><i data-on={!frozen} />{frozen ? 'FROZEN' : 'LIVE VIEW'}</div>
            <canvas ref={canvas} width="960" height="960" role="img" aria-label={`${MODELS[look.view][0]} visualization`} />
            <span className="ci-figure-index">{input === 'tone' ? `${look.hz.toFixed(1)} Hz / TONE` : `${meter.hz || '—'} Hz / ${input.toUpperCase()}`}</span>
            {stage && <button type="button" className="ci-stage-exit" onClick={toggleStage}>Exit stage</button>}
          </div>
          <div className="ci-capture-bar">
            <p>{MODELS[look.view][1]}</p>
            <div>
              <button type="button" onClick={() => setFrozen(!frozen)} aria-pressed={frozen}>{frozen ? <Play size={15} /> : <Pause size={15} />}{frozen ? 'Resume' : 'Freeze'}</button>
              <button type="button" onClick={snapshot}><ArrowDownToLine size={15} /> PNG</button>
              <button type="button" onClick={record} aria-pressed={recording}><Radio size={15} />{recording ? 'Stop clip' : 'Clip'}</button>
              <button type="button" onClick={toggleStage}><Maximize size={15} /> Stage</button>
            </div>
          </div>
        </div>

        <aside className="ci-controls" aria-label="Instrument controls">
          <section>
            <h2><span>01</span> Signal <AudioLines size={17} /></h2>
            <div className="ci-segments ci-sources" aria-label="Sound source">
              {SOURCE_CHOICES.map(({ id, label }) => <button type="button" key={id} aria-pressed={input === id} onClick={() => pickInput(id)}>{label}</button>)}
            </div>
            {input === 'tone' && <>
              <label className="ci-frequency"><span>Drive frequency</span><span><input aria-label="Drive frequency" type="number" min="20" max="1200" step="0.1"
                value={draftHz ?? look.hz}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraftHz(value);
                  const hz = Number(value);
                  if (value && hz >= 20 && hz <= 1200) {
                    if (props.tonePlaying) props.stopTone();
                    set('hz', hz);
                  }
                }}
                onBlur={() => commitFrequency(bounded(draftHz?.trim() ? Number(draftHz) : look.hz, 20, 1200, look.hz))}
                onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
              /> <b>Hz</b></span></label>
              <input className="ci-range" type="range" aria-label="Sweep frequency" min="20" max="1200" value={look.hz} onChange={(event) => commitFrequency(Number(event.target.value))} />
              <div className="ci-quick" aria-label="Quick frequencies">
                {QUICK_HZ.map((hz) => <button type="button" key={hz} aria-pressed={look.hz === hz} onClick={() => commitFrequency(hz)}>{hz}</button>)}
              </div>
              <button type="button" className="ci-play ci-source-action" disabled={props.sessionRunning || props.panicked} onClick={() => props.tonePlaying ? props.stopTone() : props.playTone(look.hz, look.wave)}>
            {props.tonePlaying ? <Square size={14} /> : <Play size={14} />} {props.tonePlaying ? 'Stop tone' : 'Hear pattern'}
          </button>
            </>}
            {input === 'studio' && <p className="ci-source-note">{props.sessionRunning ? 'Listening to the active Open Sync session.' : 'Start playback in Open Sync Studio to drive the figure.'}</p>}
            {liveCapture && <div className="ci-live-input">
              <p className="ci-source-note" id="ci-capture-guide">
                {input === 'tab'
                  ? 'For YouTube or Spotify web: open the player in another tab. Capture it below, select that tab and enable Share tab audio.'
                  : input === 'system'
                    ? 'For desktop apps: choose Entire screen and enable system audio if your browser offers it. If no audio option appears, use Browser tab or an audio loopback input.'
                    : 'Connect your default microphone or audio input. For desktop playback on a loopback device, select that device as the system’s default recording input first.'}
              </p>
              <button className={`ci-source-action${!active && !waiting ? ' ci-play' : ''}`} type="button" disabled={props.panicked} aria-describedby="ci-capture-guide" onClick={() => {
                setQuietInput(false);
                if (active || waiting) stop();
                else void start(input);
              }}>
                {active || waiting ? <Square size={16} /> : input === 'mic' ? <Mic size={16} /> : <Monitor size={16} />}
                {active ? 'Stop capture' : waiting ? 'Cancel connection' : input === 'mic' ? 'Connect audio input' : input === 'tab' ? 'Capture browser tab' : 'Capture laptop audio'}
              </button>
              <div className="ci-input-status" role="status" aria-live="polite" data-state={active ? muted ? 'muted' : 'connected' : waiting ? 'waiting' : 'idle'}>
                <i aria-hidden="true" />
                <span>{waiting ? 'Choose a source in the browser’s sharing dialog.' : active ? <><strong>{muted ? 'Audio temporarily muted' : 'Connected'}</strong>{sourceLabel && <small>{sourceLabel}</small>}</> : 'Ready to connect'}</span>
              </div>
              {quietInput && checkSilence && <p className="ci-input-hint" role="status">No audio detected yet. Start playback, check the player’s volume and confirm that audio sharing is enabled. Stop capture to select a different source.</p>}
              {frozen && active && <p className="ci-source-note">Capture is connected. Resume the view to see the live signal.</p>}
              {(input === 'tab' || input === 'system') && <details className="ci-input-help">
                <summary>Compatibility &amp; privacy</summary>
                <p>Use desktop Chrome or Edge for browser-tab audio. Whole-laptop audio depends on the browser and operating system; Windows and ChromeOS commonly offer it. On macOS or Linux, use Spotify web or a configured loopback input.</p>
                <p>The browser asks for display-sharing permission, but this instrument only analyzes the audio locally. Shared screen frames are not processed or uploaded. Your music keeps playing in its original app; the instrument does not play a second copy.</p>
              </details>}
            </div>}
            {input === 'file' && <>
              <input ref={file} hidden type="file" accept="audio/*,.m4a,.wav,.mp3,.flac,.ogg" onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) { setSelectedFile(selected); void start('file', selected); }
                event.target.value = '';
              }} />
              <button className="ci-source-action" type="button" onClick={() => file.current?.click()}><ArrowDownToLine size={16} /> Choose audio file</button>
              {active && <button type="button" className="ci-text-button" onClick={stop}>Stop file</button>}
              {filename && <p className="ci-source-note" title={filename}>{filename}</p>}
            </>}
            {status && <p className="ci-source-note" role="status">{status}</p>}
          </section>

          <section>
            <h2><span>02</span> Matter <Aperture size={17} /></h2>
            {look.view === 'scope' ? <div className="ci-segments">
              <button type="button" aria-pressed={look.stereo === 'xy'} onClick={() => set('stereo', 'xy')}>Left / Right</button>
              <button type="button" aria-pressed={look.stereo === 'ms'} onClick={() => set('stereo', 'ms')}>Mid / Side</button>
            </div> : <div className="ci-segments">
              <button type="button" aria-pressed={look.shape === 'round'} onClick={() => set('shape', 'round')}><Circle size={14} /> Round</button>
              <button type="button" aria-pressed={look.shape === 'square'} onClick={() => set('shape', 'square')}><Square size={14} /> Square</button>
            </div>}
            {look.view === 'sand' || look.view === 'ink' ? <label className="ci-select"><span>Virtual plate</span><select value={plate.id} onChange={(event) => set('plate', event.target.value)}>
              {plates.map((choice) => <option key={choice.id} value={choice.id}>{choice.label.toLowerCase()}</option>)}
            </select></label> : null}
            <div className="ci-dials">
              <Dial name={look.view === 'sand' ? 'Grain' : 'Detail'} value={look.detail} change={(value) => set('detail', value)} />
              <Dial name={look.view === 'scope' ? 'Phase' : look.view === 'water' ? 'Flow' : 'Nodal width'} max={look.view === 'scope' ? 180 : 100} value={look.view === 'scope' ? look.phase : look.view === 'water' ? look.response : look.depth} change={(value) => look.view === 'scope' ? set('phase', value) : look.view === 'water' ? set('response', value) : set('depth', value)} />
              <Dial name="Light" value={look.light} change={(value) => set('light', value)} />
            </div>
          </section>

          <section>
            <h2><span>03</span> Appearance <Focus size={17} /></h2>
            <div className="ci-quick ci-effects">
              {EFFECTS.map(({ id, name }) => <button type="button" key={id} aria-pressed={look.effect === id} onClick={() => set('effect', id)}>{name}</button>)}
            </div>
            <label className="ci-mix"><span>Layer blend <b>{Math.round(look.mix)}%</b></span><input className="ci-range" type="range" min="0" max="100" value={look.mix} onChange={(event) => set('mix', Number(event.target.value))} /></label>
          </section>
        </aside>
      </div>

      <div className="ci-transport">
        <div className="ci-transport-signal"><span className="ci-kicker"><i /> {SOURCE_CHOICES.find((choice) => choice.id === input)?.label.toUpperCase()} INPUT</span>
          <span className="ci-meter" role="img" aria-label={input === 'tone' ? 'Synthetic tone input' : `Signal level ${Math.round(meter.level * 100)} percent`}>
            {Array.from({ length: 18 }, (_, index) => <i key={index} data-active={index < (input === 'tone' ? (props.tonePlaying ? 11 : 0) : Math.round(meter.level * 18))} />)}
          </span>
        </div>
        <div className="ci-transport-note">{input === 'tone' ? 'Silent until you play a short preview.' : liveCapture ? 'Local audio analysis · no extra playback · stop capture any time' : 'Inputs are analyzed locally. Files are analyzed without playback.'}</div>
        <div className="ci-transport-actions">
          <button type="button" onClick={() => { pickLook(sceneLook(scene)); setFrozen(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false); }}> <RotateCcw size={15} /> Reset look</button>
        </div>
      </div>

      <AudioAnalysis
        getSignal={getAnalysisSignal}
        sourceId={analysisSourceId}
        sourceLabel={input === 'tone' ? 'Tone model · synthetic' : sourceLabel || SOURCE_CHOICES.find((choice) => choice.id === input)?.label || 'Audio input'}
        sourceState={sourceState}
        frozen={frozen}
        onToggleFreeze={() => setFrozen((value) => !value)}
      />

      {props.fileAnalysis && <details className="ci-file-report" onToggle={(event) => {
        if (event.currentTarget.open) {
          setFileReportVisited(true);
          requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
        }
      }}>
        <summary><span>06 / RECORDING REPORT</span><strong>Full file analysis</strong><small>{audioSample.recording ? `Sampling audio · ${audioSample.secondsLeft} seconds remaining` : 'Tempo, pitch, loudness, modulation and loop analysis'}</small></summary>
        <div className="ci-file-report-body">
          <p>Analyze a complete local recording here. This report uses the file selected above, or a separate file you choose below; it is independent of the current live input. Live panels above inspect short signal windows.</p>
          <div className="ci-recording-sample">
            <button type="button" disabled={!audioSample.recording && (!liveCapture || !active || muted || waiting || props.panicked)} onClick={() => {
              if (audioSample.recording) audioSample.cancel();
              else audioSample.start(connection.current?.stream ?? null, sourceLabel || 'Live audio');
            }}>{audioSample.recording ? 'Cancel audio sample' : 'Sample 10 seconds of live audio'}</button>
            <p role="status">{audioSample.recording ? `Sampling audio locally · ${audioSample.secondsLeft} seconds remaining` : audioSample.status}</p>
            <small>For a continuous sample, connect Browser tab, Laptop audio or Audio input above. Only audio is sampled; playback and sharing continue. The sample stays in this page’s memory for the report.</small>
          </div>
          {fileReportVisited && props.fileAnalysis(selectedFile)}
        </div>
      </details>}

      {settings && <section className="ci-settings" aria-label="Additional settings">
        <h2>Instrument settings</h2>
        <div className="ci-settings-grid">
          <label className="ci-select"><span>Tone waveform</span><select value={look.wave} onChange={(event) => {
            if (props.tonePlaying) props.stopTone();
            set('wave', event.target.value as Waveform);
          }}><option value="sine">Sine</option><option value="triangle">Triangle</option><option value="square">Square</option><option value="sawtooth">Sawtooth</option></select></label>
          <label className="ci-mix"><span>Signal response <b>{Math.round(look.response)}%</b></span><input className="ci-range" type="range" min="0" max="100" value={look.response} onChange={(event) => set('response', Number(event.target.value))} /></label>
          <label className="ci-mix"><span>Visual depth <b>{Math.round(look.depth)}%</b></span><input className="ci-range" type="range" min="0" max="100" value={look.depth} onChange={(event) => set('depth', Number(event.target.value))} /></label>
        </div>
        <div className="ci-settings-actions">
          <button type="button" onClick={saveLook}>Save look</button>
          <button type="button" onClick={loadLook}>Load look</button>
          <button type="button" onClick={() => void share()}>Copy scene link</button>
        </div>
      </section>}

      <div className="ci-foot">
        <details><summary>About the models and templates</summary><p>Plate patterns depend on material, shape, and boundary conditions. The visual drive follows a peak within 20–1,200 Hz; analysis panels inspect the full available spectrum. Liquid and layer effects are artistic visualizations. Clips save up to 30 seconds of the picture without audio. Press F for fullscreen or H for a clean stage.</p></details>
        <span role="status">{message}</span>
        <span className="ci-kicker">OPEN SYNC · VISUAL LAB</span>
      </div>
    </div>
  );
}
