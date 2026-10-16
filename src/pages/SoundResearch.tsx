import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Download, Headphones, Play, Square } from 'lucide-react';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { LabPresetCard } from '@/ui/components/LabPresetCard';
import { useSession } from '@/ui/session/useSession';
import { downloadBytes } from '@/ui/audio/renderExport';
import { SOUND_RESEARCH_PRESETS } from '@/data/soundResearchPresets';
import { EVIDENCE_SOURCES, RESEARCH_HYPOTHESES } from '@/sound-research/evidence';
import { CULTURAL_SOURCES } from '@/sound-research/traditions';
import { TEXT_STUDIES } from '@/sound-research/texts';
import { MECHANISMS } from '@/sound-research/mechanisms';
import { GOVERNMENT_RECORDS, GOVERNMENT_AUDIT_SCOPE } from '@/sound-research/government';
import { DEEP_QUESTIONS } from '@/sound-research/researchQuestions';
import { calculateAcoustics, buildImpedanceSweepRows, acousticsCsv, ACOUSTICS_SOURCES } from '@/sound-research/acoustics';
import {
  buildWaveformRows, buildEnvelopeRows, buildResonanceRows, buildSensitivityScenarios,
  resonatorResponse, waveformCsv, resonanceCsv,
  type WaveformRow, type ResonanceRow,
} from '@/sound-research/model';
import './sound-research.css';

type Section = 'bench' | 'mechanisms' | 'evidence' | 'government' | 'traditions' | 'questions' | 'presets';
type Country = 'All' | 'USA' | 'China' | 'Russia';
type SignalMode = 'carrier' | 'binaural' | 'am';
const SECTIONS: readonly { id: Section; label: string }[] = [
  { id: 'bench', label: 'Signal bench' }, { id: 'mechanisms', label: 'Mechanisms' },
  { id: 'evidence', label: 'Evidence' }, { id: 'government', label: 'Government records' },
  { id: 'traditions', label: 'Traditions & products' }, { id: 'questions', label: 'Research questions' },
  { id: 'presets', label: 'Original presets' },
];
const MODES: readonly { id: SignalMode; label: string; note: string }[] = [
  { id: 'carrier', label: 'Carrier only', note: 'One steady tone in both channels. A simple comparison condition.' },
  { id: 'binaural', label: 'Binaural pair', note: 'Different tones in separate ears. Stereo headphones preserve the separation; the plotted channels have no physical beat envelope.' },
  { id: 'am', label: 'Amplitude modulation', note: 'A tone with a changing amplitude in both channels. Its envelope repeats at the selected rate.' },
];
const PREVIEW_ID = 'sound-research:bench';
const OWN_PREVIEWS = new Set([PREVIEW_ID, ...SOUND_RESEARCH_PRESETS.map(preset => `preset:${preset.id}`)]);

function SourceLinks({ urls }: { urls: readonly string[] }) {
  return <ul className="sr-source-links">{urls.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noreferrer">Source {index + 1} · {new URL(url).hostname.replace(/^www\./, '')} <ArrowUpRight size={12} aria-hidden="true" /></a></li>)}</ul>;
}

function AcousticsPlot({ ratio, transmission }: { ratio: number; transmission: number }) {
  const rows = useMemo(() => buildImpedanceSweepRows(), []);
  const path = (key: 'reflectionPower' | 'transmissionPower') => rows.map((row, index) => `${index ? 'L' : 'M'}${52 + (Math.log10(row.impedanceRatio) + 2) / 4 * 650},${180 - row[key] * 140}`).join(' ');
  const cursorX = 52 + (Math.log10(ratio) + 2) / 4 * 650;
  return <figure className="sr-plot"><figcaption><strong>Power at an ideal interface</strong><span>Normal incidence · logarithmic ratio axis</span></figcaption><svg viewBox="0 0 730 245" role="img" aria-label={`Ideal transmitted and reflected power, impedance ratio ${ratio.toFixed(3)}, transmitted power ${(transmission * 100).toFixed(1)} percent`}>
    <path className="sr-grid" d="M52 40H702M52 110H702M52 180H702M52 40V180M377 40V180M702 40V180" />
    <text x="4" y="45">100%</text><text x="12" y="115">50%</text><text x="20" y="185">0%</text>
    <path className="sr-trace" data-testid="research-transmission-curve" d={path('transmissionPower')} /><path className="sr-trace sr-trace-secondary" d={path('reflectionPower')} />
    <path className="sr-cursor" d={`M${cursorX} 40V180`} /><circle className="sr-point" cx={cursorX} cy={180 - transmission * 140} r="5" />
    {[.01, .1, 1, 10, 100].map(value => <text key={value} x={52 + (Math.log10(value) + 2) / 4 * 650} y="211" textAnchor="middle">{value}</text>)}
    <text x="274" y="239">Impedance ratio · Z₂ / Z₁</text>
  </svg><p><span className="sr-key sr-key-copper" /> Transmitted <span className="sr-key sr-key-teal" /> Reflected. Ideal power fractions sum to one.</p></figure>;
}

function SignalPlot({ rows, mode, durationSec }: { rows: WaveformRow[]; mode: SignalMode; durationSec: number }) {
  const path = (key: 'carrier' | 'binauralLeft' | 'binauralRight' | 'am') => rows.map((row, index) =>
    `${index ? 'L' : 'M'}${(52 + row.timeSec / durationSec * 650).toFixed(2)},${(110 - row[key] * 67).toFixed(2)}`).join(' ');
  return <figure className="sr-plot">
    <figcaption><strong>Signal construction</strong><span>Normalized amplitude · 25 ms</span></figcaption>
    <svg viewBox="0 0 730 225" role="img" aria-label={`${MODES.find(item => item.id === mode)!.label} waveform, normalized amplitude minus one to one over 25 milliseconds`}>
      <path className="sr-grid" d="M52 42H702M52 110H702M52 178H702M52 42V178M377 42V178M702 42V178" />
      <text x="9" y="47">+1</text><text x="19" y="115">0</text><text x="9" y="183">−1</text>
      <path className="sr-trace" data-testid="research-wave-primary" d={path(mode === 'binaural' ? 'binauralLeft' : mode)} />
      {mode === 'binaural' && <path className="sr-trace sr-trace-secondary" d={path('binauralRight')} />}
      <text x="52" y="206">0</text><text x="332" y="206">Time · ms</text><text x="686" y="206">25</text>
    </svg>
    <p>{mode === 'binaural' ? <><span className="sr-key sr-key-copper" /> Left ear <span className="sr-key sr-key-teal" /> Right ear</> : 'An ideal unit-amplitude reference signal; playback adds quiet gain and fades.'}</p>
  </figure>;
}

function ResonancePlot({ rows, scenarios, ratio, response }: {
  rows: ResonanceRow[]; scenarios: ReturnType<typeof buildSensitivityScenarios>; ratio: number; response: number;
}) {
  const allRows = [...rows, ...scenarios.flatMap(scenario => scenario.rows)];
  const ceiling = Math.max(2, Math.ceil(Math.max(...allRows.map(row => row.response))));
  const path = (data: ResonanceRow[]) => data.map((row, index) =>
    `${index ? 'L' : 'M'}${(52 + row.frequencyRatio / 3 * 650).toFixed(2)},${(195 - row.response / ceiling * 151).toFixed(2)}`).join(' ');
  return <figure className="sr-plot">
    <figcaption><strong>Forced response</strong><span>Dimensionless linear oscillator</span></figcaption>
    <svg viewBox="0 0 730 245" role="img" aria-label={`Normalized displacement response over frequency ratio zero to three, current response ${response.toFixed(3)}; vertical axis zero to ${ceiling}`}>
      <path className="sr-grid" d="M52 44H702M52 119.5H702M52 195H702M52 44V195M268.67 44V195M485.33 44V195M702 44V195" />
      <text x="12" y="49">{ceiling}</text><text x="12" y="124.5">{ceiling / 2}</text><text x="20" y="200">0</text>
      {scenarios.map(scenario => <path key={scenario.id} className="sr-trace sr-trace-scenario" d={path(scenario.rows)} />)}
      <path className="sr-trace" data-testid="research-resonance" d={path(rows)} />
      <path className="sr-cursor" d={`M${52 + ratio / 3 * 650} 44V195`} />
      <circle className="sr-point" cx={52 + ratio / 3 * 650} cy={195 - response / ceiling * 151} r="5" />
      <text x="52" y="222">0</text><text x="264" y="222">1</text><text x="481" y="222">2</text><text x="696" y="222">3</text>
      <text x="263" y="242">Driving / natural frequency</text>
    </svg>
    <p><span className="sr-key sr-key-copper" /> Selected damping <span className="sr-key sr-key-muted" /> Sensitivity cases. Vertical scale adjusts to fit all curves.</p>
  </figure>;
}

export default function SoundResearch() {
  const session = useSession();
  const { previewId, stopPreview, running, muted, panicked, advisoryAcknowledged, governor } = session;
  const [section, setSection] = useState<Section>('bench');
  const [mode, setMode] = useState<SignalMode>('binaural');
  const [carrierHz, setCarrierHz] = useState(180);
  const [beatHz, setBeatHz] = useState(6);
  const [dampingRatio, setDampingRatio] = useState(0.15);
  const [frequencyRatio, setFrequencyRatio] = useState(1);
  const [acousticFrequency, setAcousticFrequency] = useState(180);
  const [soundSpeed, setSoundSpeed] = useState(343);
  const [impedanceExponent, setImpedanceExponent] = useState(0);
  const [country, setCountry] = useState<Country>('All');
  const [notice, setNotice] = useState('');
  const latestPreview = useRef<string | null>(null);
  const playing = previewId === PREVIEW_ID;
  const blocked = running || muted || panicked || governor.infantMode;
  useEffect(() => { latestPreview.current = previewId; }, [previewId]);
  useEffect(() => () => {
    if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview();
  }, [stopPreview]);
  useEffect(() => {
    if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview();
  }, [running, muted, panicked, advisoryAcknowledged, governor.infantMode, governor.maxGainDbFs, stopPreview]);
  const stopOwned = () => { if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview(); };
  const edit = () => { stopOwned(); setNotice(''); };
  const waveConfig = useMemo(() => ({ carrierHz, beatHz: mode === 'carrier' ? 0 : beatHz, modulationDepth: 1, durationSec: 0.025, sampleCount: 1200 }), [carrierHz, beatHz, mode]);
  const waveRows = useMemo(() => buildWaveformRows(waveConfig), [waveConfig]);
  const envelopeRows = useMemo(() => buildEnvelopeRows({ beatHz, modulationDepth: 1, durationSec: 1, sampleCount: 600 }), [beatHz]);
  const resonanceConfig = useMemo(() => ({ dampingRatio, maxFrequencyRatio: 3, sampleCount: 600 }), [dampingRatio]);
  const resonanceRows = useMemo(() => buildResonanceRows(resonanceConfig), [resonanceConfig]);
  const scenarios = useMemo(() => buildSensitivityScenarios(resonanceConfig), [resonanceConfig]);
  const response = resonatorResponse(frequencyRatio, dampingRatio);
  const acousticInput = useMemo(() => ({ frequencyHz: acousticFrequency, soundSpeed, impedanceRatio: 10 ** impedanceExponent }), [acousticFrequency, soundSpeed, impedanceExponent]);
  const acoustics = calculateAcoustics(acousticInput);
  const governmentRecords = country === 'All' ? GOVERNMENT_RECORDS : GOVERNMENT_RECORDS.filter(record => record.country === country);
  const play = () => {
    if (playing) { stopOwned(); return; }
    if (blocked) return;
    if (!advisoryAcknowledged) { session.openAdvisory(); setNotice('Read the listening advisory, then press Preview again.'); return; }
    session.previewPhases(PREVIEW_ID, [{ durationSec: 8, carrierHz, beatHz: mode === 'carrier' ? 0 : beatHz, mode: mode === 'am' ? 'monaural' : 'binaural', gainDb: Math.min(-30, governor.maxGainDbFs) }], 8);
    setNotice('');
  };
  const exportCsv = (kind: 'signal' | 'resonance' | 'acoustics') => {
    const csv = kind === 'signal' ? waveformCsv(waveConfig) : kind === 'resonance' ? resonanceCsv(resonanceConfig) : acousticsCsv(acousticInput);
    downloadBytes(new TextEncoder().encode(csv), `opensync-${kind}-model.csv`, 'text/csv;charset=utf-8');
    setNotice(`${kind === 'signal' ? 'Signal' : kind === 'resonance' ? 'Resonance' : 'Acoustics'} CSV downloaded with model settings and units.`);
  };

  return <div className="sound-research">
    <header className="sr-header">
      <p className="sr-eyebrow"><span /> PHYSICS / BIOLOGY / SOURCE AUDIT</p>
      <h1>Sound Research<br /><em>Laboratory</em></h1>
      <p className="sr-intro">Trace sound from its physical construction to biological measurement. Compare mechanisms, clinical evidence, government records, and historical claims; test the mathematics before extending an explanation.</p>
      <div className="sr-header-meta"><span>Literature checked · 16 Oct 2026</span><span>Selected evidence map</span><span>Original synthesized audio</span></div>
    </header>
    <div className="sr-scope"><Headphones size={18} aria-hidden="true" /><p>This bench produces listening signals and mathematical models. It does not simulate a patient, predict healing, or reproduce medical ultrasound.</p><Link to="/safety">Listening safety <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    <nav className="sr-sections" aria-label="Sound research sections">{SECTIONS.map((item, index) => <button key={item.id} type="button" aria-pressed={section === item.id} onClick={() => { edit(); setSection(item.id); }}><span>0{index + 1}</span>{item.label}</button>)}</nav>

    {section === 'bench' && <section className="sr-section" aria-label="Signal bench">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">01 / THE SIGNAL</p><h2>Signal construction and listening.</h2></div><span className="sr-status">IDEALIZED MODEL</span></div>
      <div className="sr-bench">
        <div className="sr-controls">
          <fieldset><legend>Signal type</legend><div className="sr-modes">{MODES.map(item => <button type="button" key={item.id} aria-pressed={mode === item.id} onClick={() => { edit(); setMode(item.id); }}>{item.label}</button>)}</div></fieldset>
          <p className="sr-detail">{MODES.find(item => item.id === mode)!.note}</p>
          {mode === 'am' && beatHz === 0 && <p className="sr-detail">At zero rate, this sine-envelope convention stays at half amplitude. It is not loudness-matched to the carrier-only condition.</p>}
          <label className="sr-slider"><span>Carrier <output>{carrierHz} <small>Hz</small></output></span><input aria-label="Carrier frequency" type="range" min="80" max="600" step="1" value={carrierHz} onChange={event => { edit(); setCarrierHz(Number(event.target.value)); }} /></label>
          <label className="sr-slider"><span>{mode === 'binaural' ? 'Tone spacing' : 'Modulation rate'} <output>{mode === 'carrier' ? '—' : beatHz} <small>Hz</small></output></span><input aria-label="Beat or modulation frequency" type="range" min="0" max="20" step="0.5" value={beatHz} disabled={mode === 'carrier'} onChange={event => { edit(); setBeatHz(Number(event.target.value)); }} /></label>
          <div className="sr-listen-actions"><button className="sr-primary" type="button" disabled={blocked} onClick={play}>{playing ? <Square size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{playing ? 'Stop preview' : 'Preview · 8 seconds'}</button><button className="sr-export" type="button" onClick={() => exportCsv('signal')}><Download size={14} aria-hidden="true" /> Signal CSV</button></div>
          <p className="sr-detail">Start with low device volume. Preview gain is capped by the existing governor; digital gain does not measure sound pressure at your ears.</p>
          {blocked && <p className="sr-notice" role="status">{governor.infantMode ? 'Adult research previews are unavailable in infant mode.' : panicked ? 'Panic stop is active.' : running ? 'Stop the current session to preview a comparison.' : 'Unmute in the player before previewing.'}</p>}
        </div>
        <div className="sr-instruments">
          <SignalPlot rows={waveRows} mode={mode} durationSec={waveConfig.durationSec} />
          {mode === 'am' ? <figure className="sr-envelope"><figcaption>Amplitude envelope <span>1 second · unit amplitude</span></figcaption><svg viewBox="0 0 730 126" role="img" aria-label={`Amplitude envelope at ${beatHz} hertz, zero to one over one second`}><path className="sr-grid" d="M52 15V85H702M52 15H702" /><text x="20" y="20">1</text><text x="20" y="90">0</text><path className="sr-trace sr-trace-secondary" d={envelopeRows.map((row, i) => `${i ? 'L' : 'M'}${52 + row.timeSec * 650},${85 - row.envelope * 70}`).join(' ')} /><text x="52" y="112">0 s</text><text x="682" y="112">1 s</text></svg></figure> : <dl className="sr-readouts"><div><dt>Left channel</dt><dd>{carrierHz} <small>Hz</small></dd></div><div><dt>Right channel</dt><dd>{carrierHz + (mode === 'binaural' ? beatHz : 0)} <small>Hz</small></dd></div><div><dt>Physical amplitude envelope</dt><dd>Constant</dd></div></dl>}
          <details className="sr-math"><summary>Equations and playback assumptions</summary><p><code>L(t) = sin(2πf₀t)</code>; <code>R(t) = sin(2π(f₀ + Δf)t)</code> for the binaural pair. AM multiplies the carrier by <code>E(t) = ½ + ½sin(2πΔft)</code>. Carrier-only sets both channels to the same sine.</p><p>Plots show ideal signals before gain, finite-duration fades, the device, and room response. The preview uses the shared audio engine. The CSV also includes a mathematical two-tone sum for comparison; that sum is not the AM preview.</p></details>
        </div>
      </div>

      <div className="sr-section-heading sr-subheading"><div><p className="sr-eyebrow">02 / THE MECHANICS</p><h2>Resonance needs a system.</h2></div><a href="https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations" target="_blank" rel="noreferrer">Model background <ArrowUpRight size={15} aria-hidden="true" /></a></div>
      <p className="sr-section-intro">Change damping and the driving-to-natural frequency ratio of a linear mass–spring oscillator. The response is relative to its static displacement. There are no tissue, disease, or biological parameters in this model.</p>
      <div className="sr-bench">
        <div className="sr-controls">
          <label className="sr-slider"><span>Damping ratio, ζ <output>{dampingRatio.toFixed(2)}</output></span><input type="range" aria-label="Damping ratio" min="0.05" max="1" step="0.01" value={dampingRatio} onChange={event => { edit(); setDampingRatio(Number(event.target.value)); }} /></label>
          <label className="sr-slider"><span>Frequency ratio, r <output>{frequencyRatio.toFixed(2)}</output></span><input type="range" aria-label="Driving to natural frequency ratio" min="0.1" max="3" step="0.01" value={frequencyRatio} onChange={event => { edit(); setFrequencyRatio(Number(event.target.value)); }} /></label>
          <div className="sr-response"><span>Normalized displacement</span><output data-testid="research-response">{response.toFixed(3)}<small> × static response</small></output></div>
          <button className="sr-export" type="button" onClick={() => exportCsv('resonance')}><Download size={14} aria-hidden="true" /> Resonance CSV</button>
          <p className="sr-detail">The sensitivity curves vary damping around your selection. Damping changes the peak; a frequency alone cannot specify a response.</p>
        </div>
        <div className="sr-instruments"><ResonancePlot rows={resonanceRows} scenarios={scenarios} ratio={frequencyRatio} response={response} /><details className="sr-math"><summary>Model equation, sensitivity, and limits</summary><p><code>H(r, ζ) = 1 / √[(1 − r²)² + (2ζr)²]</code>, where <code>r = f / fₙ</code>. This is a steady-state, linear, single-degree-of-freedom model.</p><ul>{scenarios.map(scenario => <li key={scenario.id}>{scenario.label}: ζ = {scenario.dampingRatio.toFixed(3)}</li>)}</ul><p>It excludes nonlinearities, spatial modes, propagation, heating, cavitation, and biological coupling. The cursor does not control audio; no tissue response is inferred.</p></details></div>
      </div>
      <p className="sr-crosslink">For actual rendered audio spectra and downloadable WAV files, open the <Link to="/nano-lab">audio measurement bench <ArrowUpRight size={14} aria-hidden="true" /></Link>.</p>

      <div className="sr-section-heading sr-subheading"><div><p className="sr-eyebrow">03 / SCALE AND TRANSMISSION</p><h2>The medium changes the wavelength.</h2></div><span className="sr-status">IDEAL LINEAR ACOUSTICS</span></div>
      <p className="sr-section-intro">A frequency sets the period. Wavelength also depends on propagation speed, while transmission depends on the boundary. Explore those dependencies separately using generic, lossless media.</p>
      <div className="sr-bench">
        <div className="sr-controls">
          <label className="sr-select"><span>Propagation medium for wavelength</span><select aria-label="Propagation medium" value={soundSpeed} onChange={event => { edit(); setSoundSpeed(Number(event.target.value)); }}><option value="343">Air · assumed 343 m/s</option><option value="1480">Water · assumed 1,480 m/s</option></select></label>
          <label className="sr-slider"><span>Frequency <output>{acousticFrequency} <small>Hz</small></output></span><input type="range" aria-label="Acoustic frequency" min="60" max="1000" step="1" value={acousticFrequency} onChange={event => { edit(); setAcousticFrequency(Number(event.target.value)); }} /></label>
          <label className="sr-slider"><span>Hypothetical Z₂ / Z₁ <output>{acousticInput.impedanceRatio.toFixed(2)}</output></span><input type="range" aria-label="Logarithm of impedance ratio" aria-valuetext={`Impedance ratio ${acousticInput.impedanceRatio.toFixed(3)}`} min="-2" max="2" step="0.01" value={impedanceExponent} onChange={event => { edit(); setImpedanceExponent(Number(event.target.value)); }} /></label>
          <p className="sr-detail">Reference speeds assume 20 °C. The impedance ratio is independent of the selected propagation speed. These settings do not describe an air–water interface, a body, or a calibrated actuator.</p>
          <button className="sr-export" type="button" onClick={() => exportCsv('acoustics')}><Download size={14} aria-hidden="true" /> Acoustics CSV</button>
        </div>
        <div className="sr-instruments">
          <dl className="sr-readouts sr-acoustics-readouts"><div><dt>Wavelength, λ</dt><dd data-testid="research-wavelength">{acoustics.wavelengthM.toFixed(3)} <small>m</small></dd></div><div><dt>Period</dt><dd>{acoustics.periodMs.toFixed(3)} <small>ms</small></dd></div><div><dt>Transmitted power</dt><dd data-testid="research-transmission">{(acoustics.transmissionPower * 100).toFixed(1)}<small>%</small></dd></div><div><dt>Reflected power</dt><dd>{(acoustics.reflectionPower * 100).toFixed(1)}<small>%</small></dd></div></dl>
          <AcousticsPlot ratio={acousticInput.impedanceRatio} transmission={acoustics.transmissionPower} />
          <details className="sr-math"><summary>Equations, units, and limits</summary><p><code>λ = c/f</code>; <code>period = 1/f</code>; <code>q = Z₂/Z₁</code>; <code>R = [(q − 1)/(q + 1)]²</code>; <code>T = 4q/(1 + q)²</code>.</p><p>R and T are power fractions for a plane wave at normal incidence between ideal, lossless fluids with positive real impedances. No absorption, finite layers, oblique incidence, or body response is modeled. Frequency-independent transmission here follows from these assumptions; it is not a general property of material interfaces.</p><SourceLinks urls={ACOUSTICS_SOURCES.slice(0, 2).map(source => source.url)} /></details>
        </div>
      </div>
    </section>}

    {section === 'mechanisms' && <section className="sr-section" aria-label="Sound and biology mechanisms">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">MECHANISM MAP / {MECHANISMS.length} CHAINS</p><h2>From physical input to measured outcome.</h2></div></div>
      <p className="sr-section-intro">Each entry separates a physical relationship, a biological hypothesis, an actual measurement, and the inference still missing. A shared frequency number is insufficient to connect these levels.</p>
      <div className="sr-reading-map"><span>01 Physical signal</span><span>02 Biological pathway</span><span>03 Measurement</span><span>04 Alternative explanation</span></div>
      <div className="sr-reading-list">{MECHANISMS.map((mechanism, index) => <article className="sr-reading-entry" key={mechanism.id}><div className="sr-reading-number">{String(index + 1).padStart(2, '0')}</div><div><h3>{mechanism.title}</h3><p className="sr-reading-finding"><strong>Measured</strong> {mechanism.measured}</p><p className="sr-reading-gap"><strong>Inference gap</strong> {mechanism.inferenceGap}</p><details><summary>Physics, biology, alternatives, and a discriminating test</summary><dl className="sr-dossier"><div><dt>Physical relationship</dt><dd>{mechanism.physics}</dd></div><div><dt>Mathematical statement</dt><dd className="sr-equation">{mechanism.equation}</dd></div><div><dt>Biological interpretation</dt><dd>{mechanism.biology}</dd></div><div><dt>Alternative explanation</dt><dd>{mechanism.alternative}</dd></div><div><dt>Discriminating test</dt><dd>{mechanism.test}</dd></div></dl><SourceLinks urls={mechanism.sourceUrls} /><p className="sr-access">{mechanism.access}</p></details></div></article>)}</div>
    </section>}

    {section === 'government' && <section className="sr-section" aria-label="Government research records">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">PUBLIC RECORD / USA · CHINA · RUSSIA</p><h2>What did the institution actually document?</h2></div></div>
      <p className="sr-section-intro">A grant, archive record, laboratory report, or device authorization answers a different question. The records below retain that distinction; government involvement alone establishes neither a mechanism nor a clinical benefit.</p>
      <p className="sr-section-intro">{GOVERNMENT_AUDIT_SCOPE}</p>
      <div className="sr-country-filters" role="group" aria-label="Filter government records by country">{(['All', 'USA', 'China', 'Russia'] as const).map(value => <button key={value} type="button" aria-pressed={country === value} onClick={() => setCountry(value)}>{value}<span>{value === 'All' ? GOVERNMENT_RECORDS.length : GOVERNMENT_RECORDS.filter(record => record.country === value).length}</span></button>)}</div>
      <p className="sr-result-count" role="status">{governmentRecords.length} public records · {country === 'All' ? 'all countries in this survey' : country}</p>
      <div className="sr-reading-list">{governmentRecords.map(record => <article className="sr-government-entry" key={record.id} data-country={record.country}><div className="sr-card-meta"><span>{record.country} · {record.agency}</span><span>{record.recordDate}</span></div><h3>{record.title}</h3><span className="sr-record-type">{record.recordType}</span><p className="sr-reading-finding"><strong>Documented</strong> {record.documented}</p><p className="sr-reading-gap"><strong>Not established</strong> {record.notEstablished}</p><div className="sr-source-footer"><a href={record.url} target="_blank" rel="noreferrer">Official record <ArrowUpRight size={14} aria-hidden="true" /></a><span>{record.access}</span></div></article>)}</div>
    </section>}

    {section === 'evidence' && <section className="sr-section" aria-label="Research evidence">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">SOURCE MAP / {EVIDENCE_SOURCES.length} RECORDS</p><h2>What was actually measured?</h2></div></div>
      <p className="sr-section-intro">Read the modality, outcome, and limit together. Evidence for a clinical procedure, tactile actuator, or music intervention cannot establish the effect of a browser tone. This is a selected research map, not an exhaustive systematic review.</p>
      <div className="sr-evidence-list">{EVIDENCE_SOURCES.map((source, index) => <article key={source.id} className="sr-source"><div className="sr-source-index">{String(index + 1).padStart(2, '0')}</div><div><div className="sr-card-meta"><span>{source.kind} · {source.year}</span><GradeBadge grade={source.grade} compact /></div><h3>{source.title}</h3><p>{source.summary}</p><p className="sr-limitation"><strong>Limit</strong> {source.limits}</p><div className="sr-source-footer"><a href={source.url} target="_blank" rel="noreferrer">Read source <ArrowUpRight size={14} aria-hidden="true" /></a><span>{source.access}</span></div></div></article>)}</div>
    </section>}

    {section === 'traditions' && <section className="sr-section" aria-label="Traditions and products">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">HISTORY / CLAIMS / COMMERCIAL METHODS</p><h2>Separate the story from the signal.</h2></div></div>
      <p className="sr-section-intro">Historical books and vendor descriptions reveal methods and claims. Their presence here does not verify an effect. Listening ideas are newly synthesized; paid recordings, proprietary protocols, and inaccessible full texts are not reproduced.</p>
      <div className="sr-reading-list sr-text-studies">{TEXT_STUDIES.map(study => <article key={study.id} className="sr-government-entry"><div className="sr-card-meta"><span>{study.author} · {study.date}</span><span>PRIMARY-TEXT READING</span></div><h3>{study.title}</h3><p className="sr-access">{study.section}</p><p className="sr-reading-finding"><strong>Textual claim</strong> {study.claim}</p><details><summary>Formalization, category error, and counterexample</summary><dl className="sr-dossier"><div><dt>Possible formalization</dt><dd>{study.formalization}</dd></div><div><dt>Category error to avoid</dt><dd>{study.categoryError}</dd></div><div><dt>Counterexample</dt><dd>{study.counterexample}</dd></div><div><dt>Testable question</dt><dd>{study.testableQuestion}</dd></div></dl><a href={study.url} target="_blank" rel="noreferrer">Read primary text <ArrowUpRight size={14} aria-hidden="true" /></a><p className="sr-access">{study.access}</p></details></article>)}</div>
      <div className="sr-section-heading sr-subheading"><div><p className="sr-eyebrow">CONTEXT AND COMMERCIAL CLAIMS</p><h2>Books, traditions, and paid products.</h2></div></div>
      <div className="sr-source-grid">{CULTURAL_SOURCES.map(source => <article className="sr-cultural-card" key={source.id}><div className="sr-card-meta"><span>{source.kind}</span><span className="sr-status">SOURCE RECORD</span></div><h3>{source.title}</h3><p>{source.claim}</p><p className="sr-limitation"><strong>Evidence boundary</strong> {source.limits}</p><div className="sr-idea"><span>Original listening idea</span><p>{source.idea}</p></div><div className="sr-source-footer"><a href={source.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={14} aria-hidden="true" /></a><span>{source.access}</span></div></article>)}</div>
    </section>}

    {section === 'questions' && <section className="sr-section" aria-label="Research questions and hypothesis ledger">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">TESTABLE QUESTIONS / NO RESULTS YET</p><h2>State what would change the conclusion.</h2></div><Link to="/quicklab">Open listening comparisons <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <p className="sr-section-intro">Each proposal states a mathematical prediction, the biological unknown, a null model, and a possible falsifier. Linked tools cover limited parts of the physics; no entry represents a completed biological experiment.</p>
      <div className="sr-reading-list">{DEEP_QUESTIONS.map(question => <article className="sr-government-entry" key={question.id}><div className="sr-card-meta"><span>{question.id}</span><span className="sr-status">{question.status} · UNTESTED</span></div><h3>{question.title}</h3><p className="sr-reading-finding">{question.hypothesis}</p><p className="sr-reading-gap"><strong>Biological unknown</strong> {question.biologicalUnknown}</p><details><summary>Prediction, null model, controls, and falsification</summary><dl className="sr-dossier"><div><dt>Mathematical prediction</dt><dd className="sr-equation">{question.mathematicalPrediction}</dd></div><div><dt>Null model</dt><dd>{question.nullModel}</dd></div><div><dt>Possible falsifier</dt><dd>{question.falsifier}</dd></div><div><dt>Control</dt><dd>{question.control}</dd></div><div><dt>Validation still needed</dt><dd>{question.validationNeeded}</dd></div></dl>{question.sourceUrls && <SourceLinks urls={question.sourceUrls} />}</details>{question.simulationLink && <div className="sr-question-action">{question.simulationLink === '/sound-research' ? <button type="button" onClick={() => { edit(); setSection('bench'); }}>Related model <ArrowUpRight size={14} aria-hidden="true" /></button> : <Link to={question.simulationLink}>Related tool <ArrowUpRight size={14} aria-hidden="true" /></Link>}<span>Partial physics or comparison tool; not biological validation.</span></div>}</article>)}</div>
      <details className="sr-listening-proposals"><summary>Four additional listening-comparison proposals · all untested</summary><div className="sr-hypotheses">{RESEARCH_HYPOTHESES.map(hypothesis => <article key={hypothesis.id}><div className="sr-card-meta"><span>{hypothesis.id}</span><span className="sr-status">{hypothesis.status}</span></div><h3>{hypothesis.title}</h3><p className="sr-prediction">{hypothesis.prediction}</p><dl><div><dt>Comparison</dt><dd>{hypothesis.comparison}</dd></div><div><dt>Measure</dt><dd>{hypothesis.measure}</dd></div><div><dt>What could mislead us?</dt><dd>{hypothesis.confounds}</dd></div></dl></article>)}</div></details>
    </section>}

    {section === 'presets' && <section className="sr-section" aria-label="Original listening presets">
      <div className="sr-section-heading"><div><p className="sr-eyebrow">{SOUND_RESEARCH_PRESETS.length} ORIGINAL SOUND STUDIES</p><h2>A listening library, with controls.</h2></div><Link to="/presets?collection=all">All sounds <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <p className="sr-section-intro">Compare tone pairs, amplitude envelopes, harmonic sequences, noise textures, and bowls. These sessions are original compositions and unvalidated listening studies. Load a sound into Studio to adjust or export it; loading stays silent.</p>
      <p className="sr-section-intro">Shared-channel recipes use sine AM in previews/exports and two-tone beating in live Studio; their spectra differ.</p>
      <p className="sr-section-intro">Grade D on these original recipes means their proposed listening outcomes are unvalidated. Historical or mathematical sources do not validate the recipe.</p>
      {governor.infantMode ? <p className="sr-notice" role="status">These adult experimental presets are unavailable in infant mode. Change the listening profile in Safety to explore them.</p> : <div className="sr-presets">{SOUND_RESEARCH_PRESETS.map(preset => <LabPresetCard key={preset.id} preset={preset} testidPrefix="research" />)}</div>}
    </section>}
    <p className="sr-feedback" role="status" aria-live="polite">{notice}</p>
    <footer className="sr-footer"><span>Keep the model, the measurement, and the claim distinct.</span><Link to="/healing">Existing healing-sound research <ArrowUpRight size={14} aria-hidden="true" /></Link></footer>
  </div>;
}
