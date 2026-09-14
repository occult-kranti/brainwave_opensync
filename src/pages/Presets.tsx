import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { X } from 'lucide-react';
import { PRESETS, presetDurationMin, type Preset, type PresetCategory } from '@/data/presets';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Chip } from '@/ui/components/primitives';
import { PanicButton } from '@/ui/components/Panic';
import { useModalA11y } from '@/ui/hooks';
import { MiniPhaseBar } from '@/ui/components/PhaseTimeline';
import { useSession } from '@/ui/session/useSession';
import { fmtClock } from '@/ui/session/sessionMath';
import { previewUrlFor, usePreviewManifest } from '@/ui/session/previewManifest';
import { userPresetAsPreset } from '@/ui/session/userPresets';
import { isBasharPreset, phaseSoundLabel, presetDisplayName, presetMatchesSearch, presetSignalSummary, presetSoundDescription } from '@/ui/components/presetPresentation';
import type { GradeLetter } from '@/ui/theme';
import './presets.css';

const CATS: (PresetCategory | 'All')[] = ['All', 'Sleep', 'Focus', 'Relax', 'Meditate', 'Experimental', 'Infant'];
const GRADE_RANK: Record<GradeLetter, number> = { A: 3, B: 2, C: 1, D: 0 };
const STARTER_IDS = ['relax-alpha-ease', 'exp-phi-ladder', 'exp-phi-bowl-chord'];
type Collection = 'start' | 'all' | 'bashar' | 'saved';

export default function Presets() {
  const [params, setParams] = useSearchParams();
  const requestedCollection = params.get('collection');
  const collection: Collection = requestedCollection === 'all' || requestedCollection === 'bashar' || requestedCollection === 'saved' ? requestedCollection : 'start';
  const basharCollection = collection === 'bashar';
  const cat = CATS.find((candidate) => candidate === params.get('category')) ?? 'All';
  const query = params.get('q') ?? '';
  const requestedGrade = params.get('grade');
  const minGrade: GradeLetter | '' = requestedGrade === 'A' || requestedGrade === 'B' || requestedGrade === 'C' ? requestedGrade : '';
  const [drawer, setDrawer] = useState<Preset | null>(null);
  const [previewHint, setPreviewHint] = useState('');
  const session = useSession();
  const { stopPreview, previewId, governor, userPresets } = session;
  const infantOnly = governor.infantMode;
  const previewBlocked = session.running || session.panicked || session.muted;
  const previewBlockReason = session.panicked ? 'Sound is stopped. Dismiss the stop screen before previewing.' : session.running ? 'Stop the active session before previewing.' : session.muted ? 'Unmute before previewing.' : '';
  const previewManifest = usePreviewManifest();
  const navigate = useNavigate();
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  useModalA11y(drawer !== null, () => { stopPreview(); setDrawer(null); }, drawerCloseRef, drawerRef);

  useEffect(() => () => stopPreview(), [stopPreview]);
  useEffect(() => stopPreview(), [params, stopPreview]);
  useEffect(() => {
    if (previewBlocked || infantOnly) stopPreview();
  }, [previewBlocked, infantOnly, stopPreview]);

  const filtered = useMemo(() => PRESETS.filter((p) =>
    (infantOnly ? p.category === 'Infant' : collection === 'saved' ? false : (collection === 'all' || (basharCollection ? isBasharPreset(p) : STARTER_IDS.includes(p.id))) && (collection !== 'all' || cat === 'All' || p.category === cat)) &&
    (!minGrade || GRADE_RANK[p.grade] >= GRADE_RANK[minGrade]) && presetMatchesSearch(p, query)),
  [infantOnly, collection, basharCollection, cat, minGrade, query]);
  const savedFiltered = userPresets.filter((preset) => presetMatchesSearch(userPresetAsPreset(preset), query));

  const changeParam = (key: string, value: string, replace = false) => {
    stopPreview(); setPreviewHint('');
    setParams((previous) => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; }, { replace });
  };
  const clearFilters = () => {
    stopPreview(); setPreviewHint('');
    setParams((previous) => { const next = new URLSearchParams(previous); ['q', 'category', 'grade'].forEach((key) => next.delete(key)); return next; });
  };
  const chooseCollection = (nextCollection: Collection) => {
    stopPreview(); setPreviewHint(''); setDrawer(null);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      ['q', 'category', 'grade'].forEach((key) => next.delete(key));
      if (nextCollection === 'start') next.delete('collection'); else next.set('collection', nextCollection);
      return next;
    });
  };
  const load = (p: Preset) => {
    stopPreview(); session.stop(); session.loadPreset(p); navigate('/studio');
  };
  const canPreview = (p: Preset) => {
    if (previewBlocked || (infantOnly && p.category !== 'Infant')) return false;
    if (!session.advisoryAcknowledged) { setPreviewHint('After the listening notice, press Preview or Hear step again to start the sound.'); session.openAdvisory(); return false; }
    setPreviewHint('');
    return true;
  };
  const previewSeconds = (p: Preset) => previewUrlFor(p.id, previewManifest) ? previewManifest?.seconds ?? 10 : 10;
  const playPreview = (p: Preset) => {
    if (!canPreview(p)) return;
    const url = previewUrlFor(p.id, previewManifest);
    if (url) session.previewUrl(`preset:${p.id}`, url); else session.previewPreset(p);
  };
  const playStep = (p: Preset, index: number) => {
    if (!canPreview(p)) return;
    session.previewPreset({ ...p, id: `${p.id}:step:${index + 1}`, spec: { ...p.spec, phases: [{ ...p.spec.phases[index], durationSec: 8 }] } });
  };

  return <div className="preset-page">
    <header>
      <h1 className="t-display-lg">Presets</h1>
      <p className="t-body text-2">Preview a sound, then load its full session into Studio to play or edit. Loading does not start playback.</p>
    </header>

    {!infantOnly && <nav className="preset-collections" aria-label="Preset collections">
      <button type="button" className={`chip ${collection === 'start' ? 'chip-active' : ''}`} aria-pressed={collection === 'start'} onClick={() => chooseCollection('start')}>Start here</button>
      <button type="button" className={`chip ${collection === 'all' ? 'chip-active' : ''}`} aria-pressed={collection === 'all'} onClick={() => chooseCollection('all')}>Browse all presets</button>
      <button type="button" className={`chip ${basharCollection ? 'chip-active' : ''}`} aria-pressed={basharCollection} onClick={() => chooseCollection('bashar')}>Bashar sounds</button>
      <button type="button" className={`chip ${collection === 'saved' ? 'chip-active' : ''}`} aria-pressed={collection === 'saved'} onClick={() => chooseCollection('saved')}>My presets{userPresets.length ? ` (${userPresets.length})` : ''}</button>
    </nav>}

    {!infantOnly && collection === 'start' && <div className="preset-intro">
      <h2 className="t-h2">Three sounds to try</h2>
      <p className="t-body-sm text-2">A pair of tones, a pitch sequence, and a bowl chord. Hear a short sample before choosing a full session.</p>
      <p className="t-body-sm text-2">Load a sound into Studio to choose a shorter duration before playing.</p>
    </div>}

    {!infantOnly && basharCollection && <section className="panel preset-collection" aria-labelledby="bashar-collection-title">
      <div>
        <h2 id="bashar-collection-title" className="t-h2">Bashar sounds</h2>
        <p className="t-body-sm text-2">Scale sequence, alpha/gamma comparison, golden-ratio pitch ladder, and bowl chord. Four listening examples from the supplied digest.</p>
        <p className="t-body-sm text-2">Starting pitches and timings are app choices. The scale uses chosen k = 5,000, anchored on 200,000 ↔ 40 Hz; this is an illustration, not a measured human frequency. <Link to="/channeled">Read the source analysis</Link>.</p>
      </div>
    </section>}

    <section className="preset-filters" aria-label="Find a preset">
      <div className="preset-filter-row">
        <label className="preset-search t-body-sm">Search sounds
          <input type="search" value={query} placeholder="Name, pitch, rhythm, or mode" onChange={(e) => changeParam('q', e.target.value, true)} />
        </label>
      </div>
      {(collection !== 'saved' || infantOnly) && <details className="preset-more-filters">
        <summary className="t-body-sm">More filters{minGrade || (collection === 'all' && cat !== 'All') ? ' · filters active' : ''}</summary>
        <label className="t-body-sm">Minimum evidence grade
          <select value={minGrade} onChange={(e) => changeParam('grade', e.target.value)}>
            <option value="">Any grade</option><option value="C">C or higher</option><option value="B">B or higher</option><option value="A">A only</option>
          </select>
        </label>
        <p className="t-caption text-3">Grades describe the preset’s evidence claim, not sound quality or a guaranteed effect.</p>
        {!infantOnly && collection === 'all' && <div className="preset-filter-row" aria-label="Preset categories">
          {CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => changeParam('category', c === 'All' ? '' : c)}>{c.toUpperCase()}</Chip>)}
        </div>}
      </details>}
      <p className="t-caption text-3">Search applies to {infantOnly ? 'Infant presets' : collection === 'start' ? 'the three starting sounds' : collection === 'saved' ? 'My presets' : basharCollection ? 'the Bashar collection' : 'all presets'}.{(query || minGrade || (collection === 'all' && cat !== 'All')) && <button type="button" className="preset-clear" onClick={clearFilters}>Clear filters</button>}</p>
      {infantOnly && <p className="t-body-sm text-2">Infant mode: only Infant presets are shown.</p>}
    </section>

    {previewBlocked && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewBlockReason}</p>}
    {previewHint && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewHint}</p>}

    {collection === 'saved' && !infantOnly && <section data-testid="my-presets" style={{ marginBottom: 28 }}>
      <h2 className="t-h2" style={{ marginBottom: 12 }}>My presets</h2>
      <p className="t-body-sm text-2 preset-intro">Studio presets saved in this browser. Harmonic Lab recipes stay in Harmonic Lab.</p>
      {!userPresets.length && <p className="t-body text-2">No saved Studio presets yet. <Link to="/studio">Open Studio</Link> and choose Save as preset.</p>}
      {userPresets.length > 0 && !savedFiltered.length && <p className="t-body text-2">No saved presets match your search.</p>}
      <div className="preset-grid">{savedFiltered.map((u) => {
        const p = userPresetAsPreset(u);
        const playing = previewId === `preset:${p.id}`;
        return <article key={u.id} className="panel preset-card" data-testid={`my-preset-${u.id}`}>
          <h3 className="t-h3">{u.name}</h3>
          <p className="t-readout-sm text-2 preset-signal">{presetSignalSummary(p)} · Full session {fmtClock(presetDurationMin(p) * 60)}</p>
          <div className="preset-card-actions">
            <button type="button" data-testid={`my-preset-preview-${u.id}`} className={`chip ${playing ? 'chip-active' : ''}`} disabled={previewBlocked}
              aria-label={playing ? `Stop preview of ${u.name}` : `Preview first 10 seconds of ${u.name}`}
              onClick={() => { if (canPreview(p)) session.previewPreset(p); }}>{playing ? '■ STOP PREVIEW' : '▶ PREVIEW · 10 S'}</button>
            <button type="button" className="chip" onClick={() => load(p)}>LOAD INTO STUDIO</button>
            <button type="button" className="chip" data-testid={`my-preset-delete-${u.id}`} aria-label={`Delete ${u.name}`}
              onClick={() => { stopPreview(); session.deleteUserPreset(u.id); }}>DELETE</button>
          </div>
        </article>;
      })}</div>
    </section>}

    {(collection !== 'saved' || infantOnly) && <><div className="preset-results">
      <h2 className="t-h3">{infantOnly ? 'Infant presets' : basharCollection ? 'Bashar collection' : collection === 'start' ? 'Starting sounds' : 'All presets'}</h2>
      <span className="t-body-sm text-2" role="status">{filtered.length} presets</span>
    </div>
    {filtered.length === 0 && <div className="panel"><p className="t-body text-2">No presets match these filters.</p>
      <button type="button" className="chip" onClick={clearFilters}>Clear filters</button>
      {!infantOnly && collection !== 'all' && <button type="button" className="chip" onClick={() => {
        stopPreview(); setPreviewHint('');
        setParams((previous) => { const next = new URLSearchParams(previous); next.set('collection', 'all'); next.delete('category'); next.delete('grade'); return next; });
      }}>Search all presets instead</button>}</div>}
    <div className="preset-grid">
      {filtered.map((p) => {
        const playing = previewId === `preset:${p.id}`;
        const bashar = isBasharPreset(p);
        return <article key={p.id} className="panel preset-card" data-testid={`preset-card-${p.id}`}>
          <div className="preset-card-top">
            <span className="t-label text-3">Full session · {fmtClock(presetDurationMin(p) * 60)}</span>
            <GradeBadge grade={p.grade} citation={{ verdict: gradeVerdict(p), summary: p.rationale, source: p.citations[0] }} />
          </div>
          <h3 className="t-h2">{presetDisplayName(p)}</h3>
          <p className={`t-body-sm text-2 preset-card-description ${bashar ? '' : 'clamped'}`}>{presetSoundDescription(p)}</p>
          <MiniPhaseBar beats={p.spec.phases.map((ph) => ({ sec: ph.durationSec, beat: ph.beatHz }))} durationSec={presetDurationMin(p) * 60} />
          <p className="t-readout-sm text-2 preset-signal">{presetSignalSummary(p)}</p>
          <div className="preset-card-actions">
            <button type="button" data-testid={`preset-preview-${p.id}`} className={`chip ${playing ? 'chip-active' : ''}`} disabled={previewBlocked}
              aria-label={playing ? `Stop preview of ${p.title}` : `Preview first ${previewSeconds(p)} seconds of ${p.title}`} onClick={() => playPreview(p)}>{playing ? '■ STOP PREVIEW' : `▶ PREVIEW · ${previewSeconds(p)} S`}</button>
            <button type="button" className="chip chip-active" aria-label={`Load ${p.title} into Studio`} onClick={() => load(p)}>LOAD INTO STUDIO</button>
            <button type="button" className="chip preset-details-button" aria-label={`Details and steps for ${p.title}`} onClick={() => { stopPreview(); setDrawer(p); }}>DETAILS & STEPS</button>
          </div>
        </article>;
      })}
    </div></>}

    {drawer && <>
      <div className="preset-sheet-backdrop" onClick={() => { stopPreview(); setDrawer(null); }} />
      <aside ref={drawerRef} className="preset-sheet" role="dialog" aria-modal="true" aria-labelledby="preset-sheet-title" tabIndex={-1}>
        <div className="preset-sheet-top"><span className="t-label text-3">SOUND DETAILS</span><PanicButton />
          <button type="button" className="close-sheet" ref={drawerCloseRef} aria-label="Close spec sheet" onClick={() => { stopPreview(); setDrawer(null); }}><X size={20} /></button></div>
        <h2 className="t-h2" id="preset-sheet-title">{presetDisplayName(drawer)}</h2>
        <p className="t-body-sm text-2" style={{ marginTop: 8 }}>{presetSoundDescription(drawer)}</p>
        <p className="t-readout-sm text-2 preset-signal">{presetSignalSummary(drawer)} · {fmtClock(presetDurationMin(drawer) * 60)}</p>
        <h3 className="t-h3">{drawer.spec.phases.length > 1 ? 'Sequence' : 'Sound'}</h3>
        <ol className="preset-steps">{drawer.spec.phases.map((phase, i) => {
          const playing = previewId === `preset:${drawer.id}:step:${i + 1}`;
          return <li key={i}><strong className="t-body-sm">{phase.name} · {fmtClock(phase.durationSec)}</strong>
            <p className="t-body-sm text-2">{phaseSoundLabel(phase)} · authored {phase.gainDbFs} dBFS</p>
            <button type="button" className={`chip ${playing ? 'chip-active' : ''}`} disabled={previewBlocked || (infantOnly && drawer.category !== 'Infant')} aria-pressed={playing}
              aria-label={playing ? `Stop step ${i + 1}` : `Hear step ${i + 1} for 8 seconds`} onClick={() => playStep(drawer, i)}>{playing ? '■ STOP' : `▶ HEAR STEP ${i + 1} · 8 S`}</button>
          </li>;
        })}</ol>
        <p className="t-caption text-3" style={{ marginTop: 16 }}>Step previews play each segment in isolation. Studio plays the full sequence with its current transition behavior. Preview level is reduced; device volume determines listening loudness.</p>
        {previewHint && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewHint}</p>}
        {drawer.spec.phases.some((p) => p.rampSec) && <p className="t-caption text-3" style={{ marginTop: 8 }}>Authored phase fades ({[...new Set(drawer.spec.phases.map((p) => p.rampSec).filter(Boolean))].join(', ')} s) are saved as metadata; they do not run during playback or export.</p>}
        <h3 className="t-h3">Sources and limits</h3>
        <GradeBadge grade={drawer.grade} citation={{ verdict: gradeVerdict(drawer), summary: drawer.rationale, source: drawer.citations[0] }} />
        <p className="t-body-sm text-2" style={{ marginTop: 12 }}>{drawer.rationale}</p>
        <ul className="source-list t-caption text-3">{drawer.citations.map((c) => <li key={c}>{c}</li>)}</ul>
        {isBasharPreset(drawer) && <p className="t-body-sm"><Link to="/channeled">Open the Bashar source analysis</Link></p>}
        <button type="button" className="chip chip-active" onClick={() => load(drawer)}>LOAD INTO STUDIO</button>
      </aside>
    </>}
  </div>;
}

function gradeVerdict(p: Preset): string {
  if (p.grade === 'B') return 'Some human evidence; study limits apply.';
  if (p.grade === 'C') return 'Indirect or inconsistent evidence.';
  if (p.grade === 'D') return 'The proposed physiological effect is not established.';
  return 'Evidence supports the stated claim; check its scope.';
}
