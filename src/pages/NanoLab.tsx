import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSession } from '@/ui/session/useSession';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { InfoPopover } from '@/ui/components/InfoPopover';
import { downloadBytes } from '@/ui/audio/renderExport';
import { assetUrl } from '@/lib/assetUrl';
import { DEFAULT_NANO_RECIPE, NANO_KINDS, NANO_LABELS, exportNanoSignal, renderNanoSignal, type NanoRender, type NanoSignalKind } from '@/nanolab/model';
import '@/nanolab/nanolab.css';

const EQUATIONS: Record<NanoSignalKind, string> = {
  'two-tone': 'x(t) = g × [sin(2π(fc − r/2)t) + sin(2π(fc + r/2)t)] / 2',
  am: 'x(t) = g × [0.5 + 0.5 sin(2πrt)] × sin(2πfct)',
  baseband: 'x(t) = g × sin(2πrt)',
  carrier: 'x(t) = g × sin(2πfct)',
};
function SignalPlots({ sound }: { sound: NanoRender }) {
  const { spectrum, recipe } = sound;
  const xmax = recipe.kind === 'baseband' ? 100 : recipe.carrierHz + recipe.rateHz + 100;
  const path = spectrum.points.filter(p => p.hz <= xmax).map((p, i) => `${i ? 'L' : 'M'}${50 + p.hz / xmax * 700},${25 + Math.min(120, Math.max(0, -p.dbFs)) / 120 * 180}`).join(' ');
  // Min/max buckets preserve fast oscillations instead of aliasing a decimated trace.
  const count = Math.round(.2 * sound.sampleRate), offset = Math.floor(sound.left.length / 2), ceiling = 10 ** (-18 / 20);
  const wave = Array.from({ length: 700 }, (_, i) => {
    let lo = Infinity, hi = -Infinity;
    for (let j = Math.floor(i * count / 700); j < Math.floor((i + 1) * count / 700); j++) { const x = sound.left[offset + j]; lo = Math.min(lo, x); hi = Math.max(hi, x); }
    return `M${50 + i},${80 - lo / ceiling * 55}L${50 + i},${80 - hi / ceiling * 55}`;
  }).join(' ');
  return <div className="nano-plots">
    <figure><figcaption>Waveform · identical left and right</figcaption><svg viewBox="0 0 780 180" role="img" aria-label="Two hundred milliseconds of digital waveform with fixed amplitude scale"><path className="nano-grid" d="M50 25V140H750M50 80H750" /><text x="0" y="28">+0.126</text><text x="28" y="84">0</text><text x="0" y="141">−0.126</text><path className="nano-trace" d={wave} /><text x="50" y="160">0</text><text x="370" y="160">Time · ms</text><text x="721" y="160">200</text></svg><p>Amplitude in digital full scale, fixed ±0.126. Each column shows its sample minimum and maximum; no automatic level normalization.</p></figure>
    <figure><figcaption>Measured digital spectrum</figcaption><svg viewBox="0 0 780 250" role="img" aria-label={`Hann spectrum from zero to ${xmax} Hz and zero to minus one hundred twenty dBFS`}><path className="nano-grid" d="M50 25V205H750M50 115H750" /><text x="8" y="29">0</text><text x="0" y="119">−60</text><text x="0" y="209">−120</text><path className="nano-trace" d={path} /><text x="50" y="231">0</text><text x="330" y="231">Frequency · Hz</text><text x="715" y="231">{xmax}</text></svg><p>Vertical: dBFS sinusoidal amplitude. Periodic Hann window, {spectrum.fftSize.toLocaleString()} samples, {spectrum.observationSec.toFixed(3)} s, {spectrum.binHz.toFixed(3)} Hz bins. Leakage broadens off-bin lines.</p></figure>
  </div>;
}

export default function NanoLab() {
  const { previewId, togglePreview, stopPreview, engineRef, governor, running, panicked, muted, advisoryAcknowledged, openAdvisory } = useSession();
  const [kind, setKind] = useState<NanoSignalKind>('two-tone');
  const [draft, setDraft] = useState({ carrierHz: String(DEFAULT_NANO_RECIPE.carrierHz), rateHz: String(DEFAULT_NANO_RECIPE.rateHz), durationSec: String(DEFAULT_NANO_RECIPE.durationSec), gainDb: String(DEFAULT_NANO_RECIPE.gainDb) });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const owner = useRef<number | null>(null), generation = useRef(0), exportGeneration = useRef(0), mounted = useRef(true);
  const blocked = running || panicked || muted || governor.infantMode;
  const playing = previewId === 'nano:preview';
  const result = useMemo(() => {
    try {
      if (Object.values(draft).some(value => value.trim() === '')) throw new RangeError('Complete every numeric setting before generating a signal.');
      const gainDb = Math.min(Number(draft.gainDb), governor.maxGainDbFs);
      // Validate the requested gain too: a malformed high gain cannot hide behind the governor.
      if (!Number.isFinite(Number(draft.gainDb)) || Number(draft.gainDb) < -60 || Number(draft.gainDb) > -18) throw new RangeError('Requested gain must be between −60 and −18 dBFS.');
      return { sound: renderNanoSignal({ kind, carrierHz: Number(draft.carrierHz), rateHz: Number(draft.rateHz), durationSec: Number(draft.durationSec), gainDb }), error: '' };
    } catch (e) { return { sound: null, error: e instanceof Error ? e.message : 'Invalid signal settings.' }; }
  }, [kind, draft, governor.maxGainDbFs]);
  useEffect(() => { mounted.current = true; const epoch = exportGeneration; return () => { mounted.current = false; epoch.current++; if (owner.current !== null) { owner.current = null; stopPreview(); } }; }, [stopPreview]);
  useEffect(() => { exportGeneration.current++; if (owner.current !== null) { owner.current = null; stopPreview(); } }, [running, panicked, muted, advisoryAcknowledged, governor.infantMode, governor.maxGainDbFs, stopPreview]);
  const stopOwned = () => { if (owner.current !== null) { owner.current = null; stopPreview(); } };
  const edit = () => { stopOwned(); exportGeneration.current++; setFeedback(''); setError(''); };
  const play = () => {
    if (playing) { stopOwned(); return; }
    if (blocked || busy || !result.sound) return;
    if (!advisoryAcknowledged) { openAdvisory(); setFeedback('Read the listening advisory, then press Play preview again.'); return; }
    const sound = result.sound, token = ++generation.current;
    try {
      let started = false;
      togglePreview('nano:preview', () => {
        owner.current = token;
        started = engineRef.current.playBuffer(sound.left, sound.right, sound.sampleRate, 0, () => { if (owner.current === token) { owner.current = null; stopPreview(); } });
        return () => { if (owner.current === token) owner.current = null; };
      });
      if (!started) { stopOwned(); setError('Audio could not start. Try again or download a WAV.'); }
      else { setError(''); setFeedback(`Playing ${sound.recipe.durationSec} seconds at ${sound.recipe.gainDb} dBFS master gain.`); }
    } catch (e) { stopOwned(); setError(e instanceof Error ? e.message : 'Audio failed.'); }
  };
  const download = async (format: 'wav' | 'json') => {
    if (!result.sound || busy || governor.infantMode) return;
    stopOwned(); const token = ++exportGeneration.current, sound = result.sound; setBusy(true); setError(''); setFeedback('');
    try {
      const file = await exportNanoSignal(sound);
      if (mounted.current && token === exportGeneration.current) { downloadBytes(format === 'wav' ? file.wav : file.manifest, `opensync-nano-${sound.recipe.kind}-${sound.recipe.durationSec}s.${format}`, format === 'wav' ? 'audio/wav' : 'application/json'); setFeedback(format === 'wav' ? 'WAV downloaded. Download its manifest with the same settings to retain the SHA-256 checksum.' : 'Manifest downloaded with waveform checksum, settings, units, and measurements.'); }
    } catch (e) { if (mounted.current && token === exportGeneration.current) setError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { if (mounted.current) setBusy(false); }
  };
  const sound = result.sound;
  return <div className="nano-page">
    <header className="nano-heading"><div><p className="nano-kicker">AUDIO · MEASUREMENT · CONTROLS</p><h1>NanoLab audio bench</h1><p>Test the difference between a beat envelope, amplitude modulation, and a real low-frequency signal.</p></div><InfoPopover featureId="nano-audio-bench" /></header>
    <p className="nano-scope">This is an acoustic analogy for the nanoparticle research branch. Audio samples specify neither a magnetic field nor an optical exposure; they do not establish nanoparticle response or treatment.</p>
    <a href={assetUrl('research/#nanoparticles')} onClick={stopOwned}>Read the five nanoparticle research rounds and their evidence →</a>
    <section className="nano-bench" aria-label="Frequency experiment controls">
      <div className="nano-title"><h2>Build a controlled signal</h2><GradeBadge grade="A" citation={{ verdict: 'Grade A applies to the signal algebra only.', summary: 'No material or biological response is inferred.', source: 'https://openstax.org/books/university-physics-volume-1/pages/17-6-beats' }} /></div>
      <div className="nano-kind">{NANO_KINDS.map(value => <button key={value} aria-pressed={kind === value} onClick={() => { edit(); setKind(value); }}>{NANO_LABELS[value]}</button>)}</div>
      <div className="nano-controls">{([['carrierHz', 'Carrier · Hz', 80, 1000], ['rateHz', 'Rate / tone spacing · Hz', 1, 80], ['durationSec', 'Length · seconds', 2, 30], ['gainDb', 'Requested master gain · dBFS', -60, -18]] as const).map(([key, label, min, max]) => <label key={key}><span>{label}</span><input type="number" aria-label={label} value={draft[key]} min={min} max={max} step="any" aria-invalid={draft[key].trim() === '' || !Number.isFinite(Number(draft[key])) || Number(draft[key]) < min || Number(draft[key]) > max} onChange={event => { edit(); setDraft(current => ({ ...current, [key]: event.target.value })); }} /></label>)}</div>
      <p className="nano-equation">{EQUATIONS[kind]}</p><p className="nano-small">fc = carrier, r = selected rate, t = seconds, g = 10^(master gain / 20). A 50 ms raised-cosine fade is applied at each end. Carrier is unused for the baseband signal; rate is unused for the carrier control.</p>
      <div className="nano-actions"><button disabled={blocked || busy || !sound} onClick={play}>{playing ? 'Stop preview' : 'Play preview'}</button><button disabled={!sound || busy || governor.infantMode} onClick={() => void download('wav')}>Download WAV</button><button disabled={!sound || busy || governor.infantMode} onClick={() => void download('json')}>Download manifest</button></div>
      <p className="nano-small">Start with low device volume. Frequencies below 20 Hz may be inaudible; do not raise the level to chase them. Previews bypass the Studio fader and dose log, so this bench applies its own quiet gain under the governor ceiling. These digital levels are not calibrated sound-pressure levels.</p>
      {blocked && <p role="status">{governor.infantMode ? 'NanoLab playback and downloads are unavailable in infant mode.' : panicked ? 'Panic is active. Keep sound off in the stop dialog before trying another preview.' : running ? 'Stop the Studio session before previewing this signal.' : 'Unmute the Studio before previewing this signal.'}</p>}
      {busy && <p role="status">Preparing waveform checksum…</p>}{feedback && <p role="status">{feedback}</p>}{(result.error || error) && <p role="alert" className="nano-error">{result.error || error}</p>}
      {sound && <><dl className="nano-readouts"><div><dt>Sample rate / Nyquist</dt><dd>48,000 / 24,000 Hz</dd></div><div><dt>Effective master gain</dt><dd>{sound.recipe.gainDb} dBFS</dd></div><div><dt>Sample peak / RMS</dt><dd>{sound.peakDbFs.toFixed(2)} / {sound.rmsDbFs.toFixed(2)} dBFS</dd></div><div><dt>Frames / channel</dt><dd>{sound.left.length.toLocaleString()}</dd></div><div><dt>Actual length</dt><dd>{(sound.left.length / sound.sampleRate).toFixed(5)} s</dd></div><div><dt>Output</dt><dd>PCM16 · identical L/R</dd></div></dl><SignalPlots sound={sound} /><div className="nano-tables"><div><h3>Predicted stationary components</h3><table><thead><tr><th>Component</th><th>Hz</th><th>Amplitude · FS</th></tr></thead><tbody>{sound.predictedLines.map(line => <tr key={line.label}><td>{line.label}</td><td>{line.hz.toFixed(3)}</td><td>{line.amplitude.toPrecision(4)}</td></tr>)}</tbody></table></div><div><h3>Strongest measured local peaks</h3><table><thead><tr><th>FFT bin · Hz</th><th>dBFS</th></tr></thead><tbody>{sound.spectrum.strongestBins.map(peak => <tr key={peak.hz}><td>{peak.hz.toFixed(3)}</td><td>{peak.dbFs.toFixed(2)}</td></tr>)}</tbody></table></div></div><p className="nano-small">Measured tables use the floating-point signal before PCM16 quantization. WAV uses these same samples rounded to 16-bit values. Sample peak is not reconstructed true peak. The checksum identifies the exact encoded WAV. Signals share a peak ceiling, not matched RMS or perceived loudness.</p></>}
    </section>
    <section className="nano-notes"><article><h2>What should the test show?</h2><p>Two-tone superposition has lines at fc − r/2 and fc + r/2. Its envelope magnitude repeats at r; linear superposition creates no additional difference-frequency line. AM has a carrier and two sidebands at fc ± r. A source tone or sideband can coincide with r for some settings, so inspect the listed frequencies. The baseband control places a line at r itself. These are stationary components; finite fades and analysis windows spread their spectra.</p><p>Squaring, rectifying, or a nonlinear transducer can create difference-frequency components. Identical left and right channels make these physical sums, rather than separate tones delivered to different ears.</p><a href="https://openstax.org/books/university-physics-volume-1/pages/17-6-beats" target="_blank" rel="noreferrer">OpenStax: superposition and beats ↗</a><a href="https://www.cs.cmu.edu/~15322/book/ch06/03.html" target="_blank" rel="noreferrer">Carnegie Mellon: amplitude modulation ↗</a></article><article><h2>Take it to a measurement bench</h2><ol><li>Keep carrier, rate, length, and gain fixed while comparing all four conditions.</li><li>Download each WAV and its manifest, then inspect the file in <Link to="/sample-lab">Recording analysis</Link>.</li><li>For an acoustic test, measure the speaker–room–microphone response, noise floor, clipping, and repeatability with a calibrated chain.</li><li>Any nanoparticle experiment additionally needs an independently specified actuator, field or pressure calibration, material properties, and controls. This audio bench supplies none of those measurements.</li></ol><p>The atlas reports executed model tests separately from proposed physical experiments. Creating this tool does not count as a completed research round.</p></article></section>
  </div>;
}
