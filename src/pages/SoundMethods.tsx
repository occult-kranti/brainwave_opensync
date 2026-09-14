import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Download, Headphones, Play, Square, Upload } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { InfoPopover } from '@/ui/components/InfoPopover';
import { downloadBytes } from '@/ui/audio/renderExport';
import { METHOD_SOURCES, SOUND_METHODS, recipeFile, sourcesForMethod, signalSummary } from '@/soundmethods/catalog';
import { renderSoundRecipe, validateSoundRecipe, type SoundRecipe } from '@/soundmethods/model';
import { exportMethodWav } from '@/soundmethods/export';
import '@/soundmethods/methods.css';

function Numeric({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const [previous, setPrevious] = useState(value);
  if (previous !== value) { setPrevious(value); setDraft(String(value)); }
  const valid = draft.trim() !== '' && Number.isFinite(Number(draft)) && Number(draft) >= min && Number(draft) <= max;
  const commit = () => { if (valid) onChange(Number(draft)); else setDraft(String(value)); };
  return <label className="method-field"><span>{label}</span><input type="number" value={draft} min={min} max={max} step={step} aria-invalid={!valid} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>;
}

function Waveform({ recipe }: { recipe: SoundRecipe }) {
  const paths = useMemo(() => {
    const audio = renderSoundRecipe({ ...recipe, durationSec: 2, gainDb: -18 });
    return [audio.left, audio.right].map((samples) => Array.from({ length: 440 }, (_, i) => {
      const sample = samples[4800 + Math.round(i / 439 * 1920)];
      return `${i ? 'L' : 'M'}${i},${45 - sample / 10 ** (-18 / 20) * 36}`;
    }).join(' '));
  }, [recipe]);
  return <div className="method-wave"><div><span>Left</span><span>Right</span></div><svg viewBox="0 0 440 90" role="img" aria-label="Generated left and right waveforms over 40 milliseconds, after the starting fade"><path d={paths[0]} stroke="var(--amber)" /><path d={paths[1]} stroke="var(--teal-hi, #66a89d)" /></svg><p>40 ms of generated audio. Relative amplitude; no EEG measurement.</p></div>;
}

export default function SoundMethods() {
  const { previewId, togglePreview, stopPreview, engineRef, governor, running, panicked, muted, advisoryAcknowledged, openAdvisory } = useSession();
  const [methodId, setMethodId] = useState(SOUND_METHODS[0].id);
  const [recipe, setRecipe] = useState<SoundRecipe>(() => structuredClone(SOUND_METHODS[0].recipe));
  const [previewSeconds, setPreviewSeconds] = useState(20);
  const [modified, setModified] = useState(false);
  const [sourceKind, setSourceKind] = useState('All');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const owner = useRef<string | null>(null);
  const job = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const importGeneration = useRef(0);
  const playGeneration = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const method = SOUND_METHODS.find((item) => item.id === methodId)!;
  const effectiveGain = Math.min(recipe.gainDb, governor.maxGainDbFs);
  const effectiveRecipe = { ...recipe, gainDb: effectiveGain };
  const blocked = running || panicked || muted || governor.infantMode;
  const playing = previewId === 'sound-method:preview';
  const pureNoise = recipe.kind === 'noise-comb' || recipe.kind === 'noise-am';
  const requiresStereo = ['phase-mod', 'noise-comb', 'pan'].includes(recipe.kind) || (recipe.kind === 'pairs' && recipe.pairs.some((pair) => pair.leftHz !== pair.rightHz));
  const wavDurations = [...new Set([10, 20, 30, 60, 180, 300, recipe.durationSec])].sort((a, b) => a - b);

  useEffect(() => { mounted.current = true; const pendingImport = importGeneration; return () => { mounted.current = false; pendingImport.current++; if (owner.current) { owner.current = null; stopPreview(); } job.current?.abort(); job.current = null; }; }, [stopPreview]);
  useEffect(() => {
    if (owner.current) { owner.current = null; stopPreview(); }
    job.current?.abort(); job.current = null;
  }, [running, panicked, muted, governor.infantMode, governor.maxGainDbFs, stopPreview]);

  const stopOwned = () => { if (owner.current) { owner.current = null; stopPreview(); } };
  const cancel = () => { job.current?.abort(); job.current = null; setBusy(false); };
  const update = (patch: Partial<SoundRecipe>) => {
    importGeneration.current++;
    stopOwned(); cancel(); setMessage(''); setError('');
    try { setRecipe((current) => validateSoundRecipe({ ...current, ...patch })); setModified(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Invalid setting.'); }
  };
  const select = (id: string) => {
    importGeneration.current++;
    const next = SOUND_METHODS.find((item) => item.id === id)!;
    stopOwned(); cancel(); setRecipe(structuredClone(next.recipe)); setMethodId(id); setModified(false); setError(''); setMessage('');
  };
  const play = () => {
    if (playing) { stopOwned(); return; }
    if (blocked || busy) return;
    if (!advisoryAcknowledged) { openAdvisory(); setMessage('Read the listening advisory, then press Play again.'); return; }
    try {
      setError(''); setMessage('');
      const sound = renderSoundRecipe({ ...effectiveRecipe, durationSec: previewSeconds });
      const ownershipId = `sound-method:${++playGeneration.current}`;
      let started = false;
      togglePreview('sound-method:preview', () => {
        owner.current = ownershipId;
        started = engineRef.current.playBuffer(sound.left, sound.right, sound.sampleRate, 0, () => {
          if (owner.current === ownershipId) { owner.current = null; stopPreview(); }
        });
        return () => { if (owner.current === ownershipId) owner.current = null; };
      });
      if (!started) { stopOwned(); setError('Audio could not start. Try again or export a WAV.'); }
      else setMessage(`Preview: ${previewSeconds} seconds. Sample peak ${sound.peakDb.toFixed(1)} dBFS.`);
    } catch (e) { stopOwned(); setError(e instanceof Error ? e.message : 'Audio rendering failed.'); }
  };
  const exportWav = async () => {
    stopOwned(); cancel(); setError(''); setMessage('');
    const controller = new AbortController(); job.current = controller; setBusy(true);
    try {
      const wav = await exportMethodWav(effectiveRecipe, controller.signal);
      if (!controller.signal.aborted) { downloadBytes(wav, `opensync-${methodId}-${recipe.durationSec}s.wav`); setMessage('WAV exported with the displayed output ceiling.'); }
    } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) setError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { if (mounted.current && (!job.current || job.current === controller)) { job.current = null; setBusy(false); } }
  };
  const importRecipe = async (file: File) => {
    const generation = ++importGeneration.current;
    try {
      if (file.size > 65536) throw new Error('Recipe file is too large. Use an OpenSync JSON recipe under 64 KB.');
      const data = JSON.parse(await file.text());
      if (!mounted.current || generation !== importGeneration.current) return;
      if (data.format !== 'opensync-sound-method' || data.version !== 1 || data.sampleRate !== 48000 || !SOUND_METHODS.some((item) => item.id === data.methodId)) throw new Error('Use a version 1 OpenSync sound-method recipe.');
      const next = validateSoundRecipe(data.recipe);
      if (next.kind !== SOUND_METHODS.find((item) => item.id === data.methodId)!.recipe.kind) throw new Error('The recipe method does not match its source card.');
      stopOwned(); cancel(); setMethodId(data.methodId); setRecipe(next); setModified(true); setError(''); setMessage('Recipe loaded. Check its settings before playing.');
    } catch (e) { if (mounted.current && generation === importGeneration.current) setError(e instanceof Error ? e.message : 'Could not read recipe.'); }
  };
  const visibleSources = METHOD_SOURCES.filter((source) => (sourceKind === 'All' || source.kind === sourceKind) && `${source.title} ${source.finding} ${source.limit}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="methods-page">
    <header className="methods-header"><div><p className="methods-kicker">MONROE · GATEWAY · AUDIO RESEARCH</p><h1>Sound Methods</h1><p>Hear sounds made from published methods. Check the settings, change them, and export your own audio.</p></div><InfoPopover featureId="sound-methods-player" /></header>
    <nav className="methods-nav" aria-label="Sound Methods sections"><a href="#listen-methods">Listen</a><a href="#method-evidence">What the evidence says</a><a href="#method-sources">Sources and tools</a></nav>
    <p className="methods-intro">All sounds are generated here. The Monroe examples use public disclosures; they do not contain commercial recordings or voice scripts.</p>

    <section id="listen-methods" className="methods-workspace" aria-label="Sound method player">
      <div className="methods-choices"><h2>Choose a sound <span>{SOUND_METHODS.length}</span></h2>{SOUND_METHODS.map((item) => <button className="method-choice" key={item.id} aria-pressed={methodId === item.id} onClick={() => select(item.id)}><span className="method-category">{item.family}</span><strong>{item.title}</strong><span>{item.description}</span></button>)}</div>
      <div className="method-player"><div className="method-player-heading"><div><p className="method-category">{modified ? `Based on: ${method.title}` : 'Original recipe'}</p><h2>{modified ? 'Custom sound' : method.title}</h2></div><GradeBadge grade="A" citation={{ verdict: 'A applies to the signal equations and frequency arithmetic.', summary: 'These examples do not establish a mental or health effect.', source: sourcesForMethod(method)[0].url }} /></div>
        <p>{modified ? 'Your current channel and modulation settings are shown below.' : method.basis}</p><p className="method-current">{signalSummary(recipe)}</p><Waveform recipe={recipe} />
        <div className="method-transport"><button className="method-play" disabled={blocked || busy} onClick={play}>{playing ? <Square size={18} /> : <Play size={18} />}{playing ? 'Stop preview' : 'Play preview'}</button><label className="method-inline">Preview length<select aria-label="Preview length" value={previewSeconds} onChange={(event) => { stopOwned(); setPreviewSeconds(Number(event.target.value)); }}>{[10, 20, 30].map((n) => <option key={n} value={n}>{n} seconds</option>)}</select></label></div>
        <p className="method-small"><Headphones size={15} /> {requiresStereo ? 'Use stereo headphones for this channel pattern.' : 'Works through speakers or headphones.'} Start with low device volume.</p>
        {blocked && <p role="status" className="method-notice">{governor.infantMode ? 'Sound Methods is unavailable in infant mode.' : panicked ? 'Panic is active. Choose Keep sound off in the stop dialog, then try the preview again.' : running ? 'Stop the Studio session before playing a preview.' : 'Unmute the Studio before playing a preview.'}</p>}

        <div className="method-controls">
          {recipe.kind === 'pairs' ? <div className="method-pairs">{recipe.pairs.map((pair, index) => <div key={index}><Numeric label={`Pair ${index + 1} · left Hz`} value={pair.leftHz} min={60} max={1000} step={.1} onChange={(leftHz) => update({ pairs: recipe.pairs.map((p, i) => i === index ? { ...p, leftHz } : p) })} /><Numeric label={`Pair ${index + 1} · right Hz`} value={pair.rightHz} min={60} max={1000} step={.1} onChange={(rightHz) => update({ pairs: recipe.pairs.map((p, i) => i === index ? { ...p, rightHz } : p) })} /><p className="method-small">Difference: {Math.abs(pair.rightHz - pair.leftHz).toFixed(2)} Hz · weight {pair.weight}</p></div>)}</div> : <>
            {!pureNoise && <Numeric label="Carrier · Hz" value={recipe.carrierHz} min={60} max={1000} step={1} onChange={(carrierHz) => update({ carrierHz })} />}
            <Numeric label="Modulation rate · Hz" value={recipe.rateHz} min={.05} max={40} step={.125} onChange={(rateHz) => update({ rateHz })} />
            {recipe.kind === 'phase-mod' ? <Numeric label="Phase depth · radians" value={recipe.phaseDepthRad} min={0} max={Math.PI} step={.1} onChange={(phaseDepthRad) => update({ phaseDepthRad })} /> : <label className="method-field"><span>Modulation depth · {Math.round(recipe.depth * 100)}%</span><input aria-label="Modulation depth" type="range" min={0} max={1} step={.01} value={recipe.depth} onChange={(event) => update({ depth: Number(event.target.value) })} /></label>}
          </>}
          {!pureNoise && <label className="method-field"><span>Generated noise mix · {Math.round(recipe.noiseMix * 100)}%</span><input aria-label="Generated noise mix" type="range" min={0} max={1} step={.01} value={recipe.noiseMix} onChange={(event) => update({ noiseMix: Number(event.target.value) })} /></label>}
          <label className="method-field"><span>Output ceiling · {effectiveGain} dBFS</span><input aria-label="Output ceiling" type="range" min={-60} max={-18} step={1} value={recipe.gainDb} onChange={(event) => update({ gainDb: Number(event.target.value) })} /></label>
        </div>
        {recipe.kind === 'pairs' && recipe.pairs.some((pair) => Math.abs(pair.rightHz - pair.leftHz) > 30) && <p className="method-notice">This ear-to-ear difference exceeds the usual binaural-beat range. Expect separate tones rather than a slow beat.</p>}
        <p className="method-small">Preview and WAV use the same synthesis and output ceiling, with 50 ms fades at both ends. dBFS is a digital level, not headphone loudness. Previews do not update the Studio dose log.</p>
        <details className="method-technical"><summary>How this sound is made</summary><p>{recipe.kind === 'pairs' ? 'Each channel sums its listed sine tones. Weights are divided by the greater of one or their total, then the output gain is applied.' : recipe.kind === 'phase-mod' ? 'Left = sin(2π × carrier × t + depth × sin(2π × rate × t)). Right uses a minus sign before the phase offset. Phase depth is in radians.' : recipe.kind === 'noise-comb' ? 'A seeded noise stream is mixed with delayed copies. The delay and wet amount sweep in opposite directions in the two channels; each mix is divided by one plus its wet amount.' : 'The volume envelope is 1 − depth/2 + (depth/2) × cos(2π × rate × t). It multiplies the tone or noise before the output gain.'}</p><p>Noise seed: {recipe.seed}. Noise uses octave random holds plus a white-noise component, giving a pink-like approximation. The file uses the displayed settings throughout, apart from its starting and ending fades.</p></details>
        <div className="method-export"><label className="method-inline">WAV length<select aria-label="WAV length" value={recipe.durationSec} onChange={(event) => update({ durationSec: Number(event.target.value) })}>{wavDurations.map((n) => <option key={n} value={n}>{n < 60 ? `${n} seconds` : `${n / 60} minute${n > 60 ? 's' : ''}`}</option>)}</select></label><button disabled={busy || governor.infantMode} onClick={exportWav}><Download size={16} />Export WAV</button>{busy && <button onClick={() => { cancel(); setMessage('Export cancelled.'); }}>Cancel export</button>}<button disabled={governor.infantMode} onClick={() => downloadBytes(recipeFile(effectiveRecipe, methodId), `opensync-${methodId}.json`)}>Export settings</button><button onClick={() => input.current?.click()}><Upload size={15} />Import settings</button><button onClick={() => select(methodId)}>Reset sound</button></div>
        <p className="method-small">48 kHz stereo, 16-bit PCM. Five minutes is about 58 MB. Longer files repeat the selected stationary pattern; they do not add a guided course or staged protocol.</p>
        <input ref={input} type="file" accept=".json,application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void importRecipe(file); event.target.value = ''; }} />
        {busy && <p role="status">Rendering WAV in the background…</p>}{message && <p role="status" className="method-feedback">{message}</p>}{error && <p role="alert" className="method-error">{error}</p>}
        <div className="method-source-note"><h3>{modified ? "Default example: source and limits" : "Source and limits"}</h3>{modified && <p>{method.basis}</p>}<p>{method.boundary}</p>{sourcesForMethod(method).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div>
      </div>
    </section>

    <section id="method-evidence" className="methods-evidence"><h2>What the evidence says</h2><div><article><h3>A beat is a sound pattern</h3><p>A 4 Hz difference between tones can create a perceived beat. It does not show that your whole brain is operating at 4 Hz.</p><a href="https://doi.org/10.1523/ENEURO.0232-19.2020" target="_blank" rel="noreferrer">Binaural and monaural EEG study ↗</a></article><article><h3>Gateway is a guided course</h3><p>Its report combines sound, relaxation, imagery, and a theory of consciousness. It does not give a verified Hz value for each Focus level or establish its metaphysical claims.</p><a href={METHOD_SOURCES[0].url} target="_blank" rel="noreferrer">Read the Army report ↗</a></article><article><h3>Studies test different outcomes</h3><p>A detectable auditory response, a mood rating, and better sleep are different results. Findings depend on the stimulus, comparison, and measurement.</p><Link to="/replication">See study protocols →</Link></article></div><p>To inspect a file, export it and open <Link to="/sample-lab">Sample Lab</Link>. For chords and overtones, use <Link to="/harmonics">Harmonic Lab</Link>. For the wider historical collection, use <Link to="/programs">Programs Archive</Link>.</p></section>

    <section id="method-sources" className="methods-sources"><h2>Sources and open-source tools</h2><p>This collection covers headphone sound methods and related claims. Electrical, RF, and magnetic devices require different hardware and are listed for context.</p><div className="method-search"><input aria-label="Search sources" placeholder="Search patents, papers, or tools" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Source type" value={sourceKind} onChange={(event) => setSourceKind(event.target.value)}>{['All', 'Document', 'Patent', 'Study', 'Tool'].map((kind) => <option key={kind}>{kind}</option>)}</select><span>{visibleSources.length} sources</span></div><div className="method-source-grid">{visibleSources.map((source) => <article key={source.id}><p className="method-category">{source.kind} · {source.year}</p><h3><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></h3><p>{source.finding}</p><p className="method-source-limit">{source.limit}</p></article>)}</div>{visibleSources.length === 0 && <p>No matching sources. Try a shorter search.</p>}</section>
  </div>;
}
