import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Download, Play, Square, Save, Upload, Music2 } from 'lucide-react';
import { useSession } from '@/ui/session/useSession';
import { encodeWav } from '@/engine';
import { downloadBytes } from '@/ui/audio/renderExport';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { InfoPopover } from '@/ui/components/InfoPopover';
import { DEFAULT_RECIPE, notesForRecipe, componentsForRecipe, renderHarmonicRecipe, validateRecipe, type HarmonicRecipe } from '@/harmoniclab/model';
import { CHOICES, TIMBRES, HARMONIC_SOURCES, parseRatios, recipeTitle } from '@/harmoniclab/catalog';
import { readRecipes, saveRecipes, encodeRecipe, decodeRecipe } from '@/harmoniclab/recipes';
import '@/harmoniclab/harmonics.css';

const COLORS = ['var(--amber)', 'var(--teal)', '#9daeee', '#dd9ccc', '#aace87', '#e7ac81', '#9cbfc9'];

function SignalPlot({ recipe }: { recipe: HarmonicRecipe }) {
  const components = componentsForRecipe(recipe);
  const sum = Math.max(1, components.reduce((n, c) => n + c.amplitude, 0));
  const path = Array.from({ length: 600 }, (_, i) => {
    const t = i / 599 * .02;
    const value = components.reduce((n, c) => n + c.amplitude * Math.sin(2 * Math.PI * c.hz * t), 0) / sum;
    return `${i === 0 ? 'M' : 'L'}${i},${55 - value * 47}`;
  }).join(' ');
  const x = (hz: number) => 25 + Math.log(hz / 20) / Math.log(16000 / 20) * 550;
  return <div className="harmonic-signal">
    <div className="harmonic-panel-label">PARTIAL COMPONENT MAP <span>Frequency · Hz / per-voice weight</span></div>
    <svg viewBox="0 0 600 150" role="img" aria-label="Predicted partial components, 20 to 16000 Hz, logarithmic frequency axis; coincident weights are not summed">
      {[20, 100, 440, 1000, 4000, 16000].map((hz) => <g key={hz}><line x1={x(hz)} x2={x(hz)} y1="8" y2="122" stroke="var(--line-2)" /><text x={x(hz)} y="143" textAnchor="middle" fill="var(--text-2)" fontSize="13">{hz >= 1000 ? `${hz / 1000}k` : hz}</text></g>)}
      {components.map((c, i) => <line key={i} x1={x(c.hz)} x2={x(c.hz)} y1="120" y2={120 - c.amplitude * 100} stroke={COLORS[c.noteIndex % COLORS.length]} strokeWidth="2.5"><title>{c.hz.toFixed(2)} Hz · harmonic {c.harmonic} · weight {c.amplitude.toFixed(2)}</title></line>)}
    </svg>
    <div className="harmonic-panel-label">SIGNAL SKETCH <span>First 20 ms · relative amplitude</span></div>
    <svg viewBox="0 0 600 110" role="img" aria-label="Predicted summed chord waveform over 20 milliseconds, before playback envelope and output gain">
      <line x1="0" x2="600" y1="55" y2="55" stroke="var(--line-2)" /><path d={path} stroke="var(--amber)" fill="none" strokeWidth="1.8" />
    </svg>
    <p className="harmonic-meta">Calculated chord before fades and output gain. Overlapping partials are drawn separately. Progressions shift these frequencies together. The plots show the sound model; no microphone or EEG is used.</p>
  </div>;
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const [previousValue, setPreviousValue] = useState(value);
  if (previousValue !== value) { setPreviousValue(value); setDraft(String(value)); }
  const invalid = draft.trim() === '' || !Number.isFinite(Number(draft)) || Number(draft) < min || Number(draft) > max;
  const commit = () => { if (!invalid) onChange(Number(draft)); else setDraft(String(value)); };
  return <label className="harmonic-field"><span>{label}</span><input type="number" min={min} max={max} step={step} value={draft} aria-invalid={invalid} onChange={(e) => { setDraft(e.target.value); const next = Number(e.target.value); if (e.target.value.trim() && Number.isFinite(next) && next >= min && next <= max) onChange(next); }} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { commit(); e.currentTarget.blur(); } }} /></label>;
}

export default function HarmonicLab() {
  const session = useSession();
  const { togglePreview, stopPreview, engineRef, previewId, governor, running, panicked, muted, advisoryAcknowledged, openAdvisory } = session;
  const [recipe, setRecipe] = useState<HarmonicRecipe>(() => structuredClone(DEFAULT_RECIPE));
  const [ratiosText, setRatiosText] = useState('1, 5/4, 3/2');
  const [saved, setSaved] = useState(readRecipes);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [renderInfo, setRenderInfo] = useState('');
  const owner = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const stopOwned = () => { if (owner.current) { owner.current = null; stopPreview(); } };
  const notes = useMemo(() => notesForRecipe(recipe), [recipe]);
  const literal = ['harmonic', 'phi', 'custom'].includes(recipe.chord);
  const effectiveGain = Math.min(recipe.gainDb, governor.maxGainDbFs);
  const blocked = running || panicked || muted || governor.infantMode;
  const playing = previewId?.startsWith('harmonic:') ?? false;

  useEffect(() => () => { if (owner.current) { owner.current = null; stopPreview(); } }, [stopPreview]);
  useEffect(() => {
    if ((running || panicked || muted || governor.infantMode) && owner.current) { owner.current = null; stopPreview(); }
  }, [running, panicked, muted, governor.infantMode, stopPreview]);
  useEffect(() => () => { if (owner.current) { owner.current = null; stopPreview(); } }, [governor.maxGainDbFs, stopPreview]);

  const update = (patch: Partial<HarmonicRecipe>) => {
    stopOwned(); setError(''); setMessage(''); setRenderInfo('');
    setRecipe((r) => validateRecipe({ ...r, ...patch }));
  };
  const load = (value: HarmonicRecipe) => {
    stopOwned(); setRecipe(validateRecipe(value)); setRatiosText(value.customRatios.join(', ')); setRenderInfo(''); setError(''); setMessage('Recipe loaded. Press Play to hear it.');
  };
  const makeRender = (tuning?: HarmonicRecipe['tuning'], seconds?: number) => {
    const sound = renderHarmonicRecipe({ ...recipe, gainDb: effectiveGain, ...(tuning ? { tuning } : {}), ...(seconds ? { durationSec: seconds, pattern: 'chord' as const } : {}) });
    setRenderInfo(`${sound.durationSec} s · 48 kHz · stereo mono-compatible · sample peak ${Number.isFinite(sound.peakDb) ? sound.peakDb.toFixed(1) : '−∞'} dBFS · ${sound.omittedPartials} out-of-band partials omitted`);
    return sound;
  };
  const play = (tuning?: HarmonicRecipe['tuning']) => {
    const id = `harmonic:${tuning ?? 'composition'}`;
    if (previewId === id) { stopOwned(); return; }
    if (blocked) return;
    if (!advisoryAcknowledged) { openAdvisory(); setMessage('Read the listening advisory, then press Play again.'); return; }
    try {
      setError(''); setMessage('');
      const sound = makeRender(tuning, tuning ? 4 : undefined);
      let success = false;
      togglePreview(id, () => {
        owner.current = id;
        success = engineRef.current.playBuffer(sound.left, sound.right, sound.sampleRate, 0, () => {
          if (owner.current === id) { owner.current = null; stopPreview(); }
        });
        return () => { if (owner.current === id) owner.current = null; };
      });
      if (!success) { stopOwned(); setError('Audio could not start in this browser. Try again or export the WAV.'); }
    } catch (e) { stopOwned(); setError(e instanceof Error ? e.message : 'Audio rendering failed.'); }
  };
  const exportWav = () => {
    try {
      setError(''); const sound = makeRender();
      downloadBytes(encodeWav(sound.left, sound.right, sound.sampleRate, 'pcm16'), `opensync-harmonic-${recipe.rootHz}hz-${recipe.chord}.wav`);
      setMessage('WAV exported with the displayed output gain.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Export failed.'); }
  };
  const save = () => {
    const next = [structuredClone(recipe), ...saved].slice(0, 12);
    if (saveRecipes(next)) { setSaved(next); setMessage('Recipe saved on this device.'); } else setError('Device storage is unavailable. Export the recipe instead.');
  };

  return <div className="harmonic-page">
    <header className="harmonic-heading"><div><div className="harmonic-eyebrow"><Music2 size={16} /> CHORDS AND TUNING</div><h1>Harmonic Lab</h1><p>Build chords, adjust overtones, compare tunings, and export audio.</p></div><div className="flex items-center gap-2"><GradeBadge grade="A" citation={{ verdict: 'A for frequency arithmetic and audio synthesis only.', summary: 'A tuning choice is not evidence of a physiological effect.', source: HARMONIC_SOURCES[0].url }} /><InfoPopover featureId="harmonic-composer" /></div></header>

    <div className="harmonic-workspace">
      <section className="harmonic-panel harmonic-controls" aria-labelledby="harmony-heading"><h2 id="harmony-heading">01 <span>Build a harmony</span></h2>
        <div className="harmonic-root"><NumberField label="Root frequency · Hz" value={recipe.rootHz} min={55} max={880} step={.01} onChange={(rootHz) => update({ rootHz })} /><div className="harmonic-buttons">{[110, 220, 432, 440, 528].map((rootHz) => <button key={rootHz} aria-pressed={recipe.rootHz === rootHz} onClick={() => update({ rootHz })}>{rootHz}</button>)}</div></div>
        <label className="harmonic-field"><span>Chord / interval set</span><select value={recipe.chord} onChange={(e) => update({ chord: e.target.value as HarmonicRecipe['chord'] })}>{CHOICES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
        <label className="harmonic-field"><span>Tuning</span><select value={recipe.tuning} disabled={literal} onChange={(e) => update({ tuning: e.target.value as HarmonicRecipe['tuning'] })}><option value="just">Just intonation · simple ratios</option><option value="equal">Equal temperament · 12 equal steps</option><option value="pythagorean">Pythagorean · fifth-derived ratios</option></select></label>
        {literal && <p className="harmonic-meta">This set uses its stated ratios directly. The tuning selector applies to named musical chords.</p>}
        {recipe.chord === 'custom' && <div><label className="harmonic-field"><span>Custom ratios · up to seven</span><input value={ratiosText} onChange={(e) => setRatiosText(e.target.value)} placeholder="1, 5/4, 3/2" /></label><button className="harmonic-small" onClick={() => { try { update({ customRatios: parseRatios(ratiosText) }); } catch (e) { setError((e as Error).message); } }}>Apply ratios</button></div>}
        {recipe.chord === 'phi' && <p className="harmonic-callout">φ = (1 + √5) / 2. These are 833.09-cent intervals, not integer-multiple harmonics. <Link to="/channeled">Explore the source exhibit</Link>.</p>}
        <p className="harmonic-meta">The root buttons select audible pitches. They do not measure a brain state or prescribe a special effect.</p>
      </section>

      <section className="harmonic-panel harmonic-preview" aria-labelledby="listen-heading"><h2 id="listen-heading">02 <span>Preview the sound</span></h2><SignalPlot recipe={recipe} />
        <div className="harmonic-transport"><button className="harmonic-primary" disabled={blocked} onClick={() => play()}>{previewId === 'harmonic:composition' ? <Square size={18} /> : <Play size={18} />}{previewId === 'harmonic:composition' ? 'Stop preview' : 'Play composition'}</button><button disabled={!playing} onClick={stopOwned}><Square size={16} /> Stop</button><span className="harmonic-meta">{recipe.durationSec} SECOND PREVIEW</span></div>
        {blocked && <p className="harmonic-callout" role="status">{governor.infantMode ? 'Harmonic Lab is unavailable in infant mode. The Safety page controls this setting.' : panicked ? 'Panic is active. Choose Keep sound off in the stop dialog, then try the preview again.' : running ? 'Stop the Studio session before previewing here.' : 'The Studio is muted. Unmute before playing a preview.'}</p>}
        <div className="harmonic-sequence"><label className="harmonic-field"><span>Play as</span><select value={recipe.pattern} onChange={(e) => update({ pattern: e.target.value as HarmonicRecipe['pattern'] })}><option value="chord">Held chord</option><option value="arpeggio">Arpeggio</option><option value="progression">Four-bar progression</option></select></label><NumberField label="Tempo · BPM" value={recipe.tempo} min={40} max={180} onChange={(tempo) => update({ tempo })} /><NumberField label="Length · seconds" value={recipe.durationSec} min={2} max={30} onChange={(durationSec) => update({ durationSec })} /></div>
        {recipe.pattern === 'progression' && <p className="harmonic-meta">Root pattern: 1 → 4/3 → 3/2 → 1. Each chord lasts four beats; the pattern repeats to the chosen length.</p>}
        <label className="harmonic-level"><span>Output ceiling <strong>{effectiveGain} dBFS</strong></span><input aria-label="Output ceiling in dBFS" type="range" min={-60} max={-18} step={1} value={recipe.gainDb} onChange={(e) => update({ gainDb: Number(e.target.value) })} /></label>
        <p className="harmonic-meta">Preview and WAV use this gain. Start with low device volume; dBFS is not a measured listening level. Previews do not update the session dose log.</p>
      </section>
    </div>

    <section className="harmonic-panel" aria-labelledby="overtones-heading"><div className="harmonic-panel-head"><h2 id="overtones-heading">03 <span>Shape the overtones</span></h2><div className="harmonic-buttons">{TIMBRES.map((t) => <button key={t.label} onClick={() => update({ harmonics: [...t.values] })}>{t.label}</button>)}</div></div><p className="harmonic-meta">Each note has eight integer-multiple partials. These sliders set their relative weights; Output controls the overall level.</p><div className="harmonic-overtones">{recipe.harmonics.map((amplitude, index) => <label key={index}><span className="harmonic-overtone-number">{index + 1}<small>×</small></span><span>{index === 0 ? 'Fundamental' : `Harmonic ${index + 1}`}</span><input type="range" min={0} max={1} step={.01} value={amplitude} aria-label={`Harmonic ${index + 1} amplitude`} onChange={(e) => update({ harmonics: recipe.harmonics.map((v, i) => i === index ? Number(e.target.value) : v) })} /><output>{Math.round(amplitude * 100)}%</output></label>)}</div></section>

    <div className="harmonic-bottom"><section className="harmonic-panel" aria-labelledby="frequency-heading"><h2 id="frequency-heading">04 <span>Check the frequencies</span></h2><div className="harmonic-table-scroll"><table><thead><tr><th>Voice</th><th>Ratio</th><th>Hz</th><th>Cents</th><th>Δ 12-TET</th></tr></thead><tbody>{notes.map((n, i) => <tr key={i}><th><span style={{ color: COLORS[i % COLORS.length] }}>●</span> {n.label}</th><td>{n.ratio.toFixed(5)}</td><td>{n.hz.toFixed(2)}</td><td>{n.cents.toFixed(2)}</td><td>{n.deviationCents > 0 ? '+' : ''}{n.deviationCents.toFixed(2)}</td></tr>)}</tbody></table></div><p className="harmonic-meta">Hz = root × ratio. Cents = 1200 log₂(ratio). Δ compares each interval with {literal ? 'its nearest equal-tempered semitone' : 'the corresponding equal-tempered interval'}. Values are rounded here; the sound uses full precision.</p><div className="harmonic-compare"><h3>Compare the same chord</h3><div className="harmonic-buttons"><button disabled={blocked || literal} onClick={() => play('just')}>{previewId === 'harmonic:just' ? 'Stop A' : 'A · Just · 4 s'}</button><button disabled={blocked || literal} onClick={() => play('equal')}>{previewId === 'harmonic:equal' ? 'Stop B' : 'B · Equal · 4 s'}</button></div><p className="harmonic-meta">Same root, timbre, and gain. Tuning labels stay visible during this comparison. {literal ? 'Choose a named chord to compare tunings.' : ''}</p></div></section>
      <section className="harmonic-panel" aria-labelledby="keep-heading"><h2 id="keep-heading">05 <span>Save and export</span></h2><div className="harmonic-export"><button className="harmonic-primary" disabled={governor.infantMode} onClick={exportWav}><Download size={17} /> Export WAV</button><button onClick={() => downloadBytes(encodeRecipe({ ...recipe, gainDb: effectiveGain }), 'opensync-harmonic-recipe.json', 'application/json')}><Download size={17} /> Export recipe</button><button onClick={save}><Save size={17} /> Save on device</button><button onClick={() => fileInput.current?.click()}><Upload size={17} /> Import recipe</button></div><input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="Import harmonic recipe file" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { if (f.size > 32768) throw new Error('Choose a recipe smaller than 32 KB.'); load(decodeRecipe(await f.text())); } catch (err) { setError(err instanceof Error ? err.message : 'Could not read this recipe.'); } }} /><p className="harmonic-meta">WAV: 48 kHz, two identical channels, PCM 16-bit. The recipe stores all controls. Device saves stay in this browser; export a recipe to keep a portable copy.</p>
        {saved.length > 0 ? <div className="harmonic-saved"><h3>Saved recipes <span>{saved.length}/12</span></h3>{saved.map((r, i) => <div key={i}><button onClick={() => load(r)}>{recipeTitle(r)}</button><button aria-label={`Remove saved recipe ${i + 1}`} onClick={() => { const next = saved.filter((_, index) => i !== index); if (saveRecipes(next)) setSaved(next); else setError('Could not update device storage.'); }}>Remove</button></div>)}</div> : <p className="harmonic-meta">No saved recipes yet.</p>}
      </section></div>
    <div className="harmonic-feedback" aria-live="polite">{error && <p role="alert" className="harmonic-error">{error}</p>}{message && <p>{message}</p>}{renderInfo && <p className="harmonic-meta">{renderInfo}</p>}</div>
    <footer className="harmonic-panel harmonic-sources"><h2>Frequency and tuning</h2><p>A tuning defines the ratios between notes. This lab calculates those ratios and generates audio. The sources below explain tuning, digital synthesis, and listening levels. No brain activity or consciousness is measured.</p><div>{HARMONIC_SOURCES.map((s) => <p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a><span className="harmonic-meta">{s.scope}</span></p>)}</div><Link to="/sonic-lab">More generators in Sonic Lab</Link><Link to="/sample-lab">Analyze an exported recording</Link></footer>
  </div>;
}
