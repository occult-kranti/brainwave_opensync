import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { X } from 'lucide-react';
import { matchesListeningFilters, presetFamily, PRESET_COLLECTIONS, type PresetCollection } from '@/data/presetBrowse';
import { needsHeadphones } from '@/data/sessionSuggestions';
import { PRACTICE_PRESETS } from '@/data/listeningPractice';
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
import { assetUrl } from '@/lib/assetUrl';
import type { GradeLetter } from '@/ui/theme';
import './presets.css';

const CATS: (PresetCategory | 'All')[] = ['All', 'Sleep', 'Focus', 'Relax', 'Meditate', 'Lucid Dream', 'Experimental', 'Infant'];
const GRADE_RANK: Record<GradeLetter, number> = { A: 3, B: 2, C: 1, D: 0 };
const STARTER_IDS = ['practice-soft-landing', 'practice-bowl-attention', 'practice-evening-rain', 'practice-steady-focus'];
type Collection = PresetCollection;

export default function Presets() {
  const [params, setParams] = useSearchParams();
  const pendingParams = useRef(params);
  useEffect(() => { pendingParams.current = params; }, [params]);
  const requestedCollection = params.get('collection');
  const collection: Collection = PRESET_COLLECTIONS.find(([id]) => id === requestedCollection)?.[0] ?? 'start';
  const setup = params.get('setup') ?? '';
  const duration = params.get('duration') ?? '';
  const sound = params.get('sound') ?? '';
  const sort = params.get('sort') ?? '';
  const groupBy = params.get('group') ?? 'collection';
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
  const unmuteHelp = session.muted && !session.running && !session.panicked
    ? <><Link to="/studio">Open Studio</Link> and select Unmute, then return here to preview.</>
    : null;
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
    (infantOnly ? p.category === 'Infant' : collection === 'saved' ? false : (collection === 'all' || (collection === 'practice' ? PRACTICE_PRESETS.some((entry) => entry.id === p.id) : collection === 'archive' ? p.id.startsWith('archive-') : collection === 'overnight' ? p.id.startsWith('night-') : collection === 'nano' ? p.id.startsWith('nano-') : basharCollection ? isBasharPreset(p) : STARTER_IDS.includes(p.id))) && (collection !== 'all' || cat === 'All' || p.category === cat)) &&
    (!minGrade || GRADE_RANK[p.grade] >= GRADE_RANK[minGrade]) && presetMatchesSearch(p, query) && matchesListeningFilters(p, setup, duration, sound)).sort((a, b) => sort === 'shortest' ? presetDurationMin(a) - presetDurationMin(b) : sort === 'longest' ? presetDurationMin(b) - presetDurationMin(a) : sort === 'name' ? a.title.localeCompare(b.title) : 0),
  [infantOnly, collection, basharCollection, cat, minGrade, query, setup, duration, sound, sort]);
  const groupFor = (p: Preset) => groupBy === 'category' ? p.category : presetFamily(p);
  const groups = [...new Set(filtered.map(groupFor))];
  const savedFiltered = userPresets.filter((preset) => presetMatchesSearch(userPresetAsPreset(preset), query));

  const commitParams = (next: URLSearchParams, replace = false) => {
    pendingParams.current = next;
    setParams(next, { replace });
  };
  const changeParam = (key: string, value: string, replace = false) => {
    stopPreview(); setPreviewHint('');
    const next = new URLSearchParams(pendingParams.current);
    if (value) next.set(key, value); else next.delete(key);
    commitParams(next, replace);
  };
  const clearFilters = () => {
    stopPreview(); setPreviewHint('');
    const next = new URLSearchParams(pendingParams.current);
    ['q', 'category', 'grade', 'setup', 'duration', 'sound'].forEach(key => next.delete(key));
    commitParams(next);
  };
  const chooseCollection = (nextCollection: Collection) => {
    stopPreview(); setPreviewHint(''); setDrawer(null);
    const next = new URLSearchParams(pendingParams.current);
    ['q', 'category', 'grade', 'setup', 'duration', 'sound'].forEach(key => next.delete(key));
    if (nextCollection === 'start') next.delete('collection'); else next.set('collection', nextCollection);
    commitParams(next);
  };
  const load = (p: Preset, destination = '/listen') => {
    stopPreview(); session.stop(); session.loadPreset(p); navigate(destination);
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
      <span className="eyebrow">Explore the collection</span><h1 className="t-display-lg">Find your kind of quiet.</h1>
      <p className="t-body text-2">A short pause, a longer practice, or something new to explore. Preview a sound, then choose when to play.</p>
    </header>

    {!infantOnly && <nav className="preset-collections" aria-label="Preset collections">{PRESET_COLLECTIONS.map(([id, title]) => <button key={id} type="button" className={`chip ${collection === id ? 'chip-active' : ''}`} aria-pressed={collection === id} onClick={() => chooseCollection(id)}>{title}{id === 'saved' && userPresets.length ? ` (${userPresets.length})` : ''}</button>)}</nav>}

    {!infantOnly && collection === 'start' && <div className="preset-intro">
      <h2 className="t-h2">A few good places to begin</h2>
      <p className="t-body-sm text-2">Rain, bowls and steady tones. Four simple listening designs, from five to fifteen minutes.</p>

    </div>}

    {!infantOnly && basharCollection && <section className="panel preset-collection" aria-labelledby="bashar-collection-title">
      <div>
        <h2 id="bashar-collection-title" className="t-h2">Bashar sounds</h2>
        <p className="t-body-sm text-2">Scale sequence, alpha/gamma comparison, golden-ratio pitch ladder, and bowl chord. Four listening examples from the supplied digest.</p>
        <p className="t-body-sm text-2">Starting pitches and timings are app choices. The scale uses chosen k = 5,000, anchored on 200,000 ↔ 40 Hz; this is an illustration, not a measured human frequency. <Link to="/channeled">Read the source analysis</Link>.</p>
        <p className="t-body-sm text-2">Each card states its purpose and links the source videos (auto-transcript digests, unverified). The same links appear in each sound’s spec sheet under Source videos.</p>
      </div>
    </section>}

    {collection === 'overnight' && <div className="preset-intro"><h2 className="t-h2">Seven-hour sound beds</h2><p>These are continuous, speaker-compatible experiments. For 30 minutes of sound followed by quiet, use the <Link to="/overnight">overnight planner</Link>.</p></div>}
    {collection === 'nano' && <div className="preset-intro"><h2 className="t-h2">Hear the signal mathematics</h2><p>Five-minute Studio AM and carrier controls. Open <Link to="/nano-lab">NanoLab</Link> for exact two-tone, AM, baseband and carrier bench presets with measured spectra.</p></div>}
    <p className="preset-guide-link"><Link to="/meditate">Not sure where to begin? Find a session for now →</Link></p>
    <section className="preset-filters" aria-label="Find a preset">
      <div className="preset-filter-row">
        <label className="preset-search t-body-sm">Search sounds
          <input type="search" value={query} placeholder="Name, pitch, rhythm, or mode" onChange={(e) => changeParam('q', e.target.value, true)} />
        </label>
      </div>
      <details className="explore-filter-drawer"><summary>Refine your listening{setup || duration || sound || minGrade || cat !== 'All' ? ' · filters active' : ''}</summary>
      {(collection !== 'saved' || infantOnly) && <div className="preset-quick-filters">
        <label>Listening setup<select value={setup} onChange={e => changeParam('setup', e.target.value)}><option value="">All setups</option><option value="speakers">Speaker-compatible</option><option value="headphones">Requires stereo headphones</option></select></label>
        <label>Session length<select value={duration} onChange={e => changeParam('duration', e.target.value)}><option value="">Any length</option><option value="short">Up to 15 min</option><option value="medium">Over 15–60 min</option><option value="long">Over 1–under 7 hours</option><option value="night">7 hours or longer</option></select></label>
        <label>Sound character<select value={sound} onChange={e => changeParam('sound', e.target.value)}><option value="">All sounds</option><option value="steady">Steady tones</option><option value="binaural">Binaural beats</option><option value="pulse">AM & pulses</option><option value="nature">Nature layer</option><option value="noise">Noise layer</option><option value="bowls">Singing bowls</option></select></label>
      </div>}
      {(collection !== 'saved' || infantOnly) && <details className="preset-more-filters">
        <summary className="t-body-sm">More filters{minGrade || (collection === 'all' && cat !== 'All') ? ' · filters active' : ''}</summary>
        <label className="t-body-sm">Minimum evidence grade
          <select aria-label="Minimum evidence grade" value={minGrade} onChange={(e) => changeParam('grade', e.target.value)}>
            <option value="">Any grade</option><option value="C">C or higher</option><option value="B">B or higher</option><option value="A">A only</option>
          </select>
        </label>
        <p className="t-caption text-3">Grades describe the preset’s evidence claim, not sound quality or a guaranteed effect.</p>
        {!infantOnly && collection === 'all' && <div className="preset-filter-row" aria-label="Preset categories">
          {CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => changeParam('category', c === 'All' ? '' : c)}>{c.toUpperCase()}</Chip>)}
        </div>}
      </details>}
      </details>
      <p className="t-caption text-3">Search applies to {infantOnly ? 'Infant presets' : collection === 'start' ? 'the four starting sounds' : collection === 'saved' ? 'My presets' : basharCollection ? 'the Bashar collection' : collection === 'practice' ? 'Meditation & rest' : collection === 'archive' ? 'Programs & traditions' : collection === 'overnight' ? 'Overnight' : collection === 'nano' ? 'NanoLab' : 'all presets'}.{(query || minGrade || setup || duration || sound || (collection === 'all' && cat !== 'All')) && <button type="button" className="preset-clear" onClick={clearFilters}>Clear filters</button>}</p>
      {infantOnly && <p className="t-body-sm text-2">Infant mode: only Infant presets are shown.</p>}
    </section>

    {previewBlocked && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewBlockReason} {unmuteHelp}</p>}
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
              onClick={() => { if (canPreview(p)) session.previewPreset(p); }}>{playing ? '■ Stop preview' : '▶ Preview · 10 s'}</button>
            <button type="button" className="chip" onClick={() => load(p)}>Choose sound</button>
            <button type="button" className="chip" data-testid={`my-preset-delete-${u.id}`} aria-label={`Delete ${u.name}`}
              onClick={() => { stopPreview(); session.deleteUserPreset(u.id); }}>DELETE</button>
          </div>
        </article>;
      })}</div>
    </section>}

    {(collection !== 'saved' || infantOnly) && <><div className="preset-results">
      <h2 className="t-h3">{infantOnly ? 'Infant presets' : basharCollection ? 'Bashar collection' : collection === 'start' ? 'Start with a little space' : collection === 'practice' ? 'Meditation & rest' : collection === 'archive' ? 'Programs & traditions · experimental' : collection === 'overnight' ? 'Overnight · experimental' : collection === 'nano' ? 'NanoLab · experimental' : 'All presets'}</h2>
      <span className="t-body-sm text-2" role="status">{filtered.length} presets</span>
    </div>
    <div className="preset-arrangement"><label>Group by<select value={groupBy} onChange={e => changeParam('group', e.target.value)}><option value="collection">Collection</option><option value="category">Intention category</option></select></label><label>Sort within groups<select value={sort} onChange={e => changeParam('sort', e.target.value)}><option value="">Collection order</option><option value="shortest">Shortest first</option><option value="longest">Longest first</option><option value="name">Name A–Z</option></select></label></div>
    {filtered.length === 0 && <div className="panel"><p className="t-body text-2">No presets match these filters.</p>
      <button type="button" className="chip" onClick={clearFilters}>Clear filters</button>
      {!infantOnly && collection !== 'all' && <button type="button" className="chip" onClick={() => {
        stopPreview(); setPreviewHint('');
        setParams((previous) => { const next = new URLSearchParams(previous); next.set('collection', 'all'); next.delete('category'); next.delete('grade'); return next; });
      }}>Search all presets instead</button>}</div>}
    <div className="preset-group-list">
      {groups.map((group) => <details className="preset-category-group" key={`${collection}-${group}-${query}-${cat}-${setup}-${duration}-${sound}`} open={collection !== 'all' || Boolean(query || setup || duration || sound) || cat !== 'All' || undefined}><summary>{group}<span>{filtered.filter((p) => groupFor(p) === group).length} {filtered.filter((p) => groupFor(p) === group).length === 1 ? 'sound' : 'sounds'}</span></summary><div className="preset-grid">
      {filtered.filter((p) => groupFor(p) === group).map((p) => {
        const playing = previewId === `preset:${p.id}`;
        const bashar = isBasharPreset(p);
        return <article key={p.id} className="panel preset-card" data-testid={`preset-card-${p.id}`}>
          <img className="preset-card-art" src={assetUrl(p.category === 'Sleep' || p.category === 'Lucid Dream' || p.id.startsWith('night-') || p.id.includes('dream') ? 'art/night-country.webp' : 'art/quiet-horizon.webp')} alt="" loading="lazy" width="1536" height="1024" />
          <div className="preset-card-top">
            <span className="t-label text-3">Full session · {fmtClock(presetDurationMin(p) * 60)}</span>
            <GradeBadge grade={p.grade} citation={{ verdict: gradeVerdict(p), summary: p.rationale, source: p.citations[0] }} />
          </div>
          <h3 className="t-h2">{presetDisplayName(p)}</h3><p className="preset-setup-tag">{needsHeadphones(p) ? 'Stereo headphones' : 'Speaker-compatible'}</p>
          <p className={`t-body-sm text-2 preset-card-description ${bashar ? '' : 'clamped'}`}>{presetSoundDescription(p)}</p>

          {p.links && p.links.length > 0 && (
            <p className="preset-card-links">
              {p.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" title={l.label}>
                  ▶ VIDEO {l.url.split('v=')[1] ?? 'SOURCE'}
                </a>
              ))}
            </p>
          )}

          <div className="preset-card-actions">
            <button type="button" data-testid={`preset-preview-${p.id}`} className={`chip ${playing ? 'chip-active' : ''}`} disabled={previewBlocked}
              aria-label={playing ? `Stop preview of ${p.title}` : `Preview first ${previewSeconds(p)} seconds of ${p.title}`} onClick={() => playPreview(p)}>{playing ? '■ Stop preview' : `▶ Preview · ${previewSeconds(p)} s`}</button>
            <button type="button" className="chip chip-active" aria-label={`Choose ${p.title}`} onClick={() => load(p)}>Choose sound</button>
            <button type="button" className="chip preset-details-button" aria-label={`Details and steps for ${p.title}`} onClick={() => { stopPreview(); setDrawer(p); }}>Sound details</button>
          </div>
        </article>;
      })}
    </div></details>)}
    </div></>}

    {drawer && <>
      <div className="preset-sheet-backdrop" onClick={() => { stopPreview(); setDrawer(null); }} />
      <aside ref={drawerRef} className="preset-sheet" role="dialog" aria-modal="true" aria-labelledby="preset-sheet-title" tabIndex={-1}>
        <div className="preset-sheet-top"><span className="t-label text-3">SOUND DETAILS</span><PanicButton />
          <button type="button" className="close-sheet" ref={drawerCloseRef} aria-label="Close spec sheet" onClick={() => { stopPreview(); setDrawer(null); }}><X size={20} /></button></div>
        <h2 className="t-h2" id="preset-sheet-title">{presetDisplayName(drawer)}</h2>
        <p className="t-body-sm text-2" style={{ marginTop: 8 }}>{presetSoundDescription(drawer)}</p>
        <p className="t-readout-sm text-2 preset-signal">{presetSignalSummary(drawer)} · {fmtClock(presetDurationMin(drawer) * 60)}</p>
        <MiniPhaseBar beats={drawer.spec.phases.map(ph => ({ sec: ph.durationSec, beat: ph.beatHz }))} durationSec={presetDurationMin(drawer) * 60} />
        {drawer.art && <img className="preset-sheet-art" src={assetUrl(drawer.art)} alt={`${presetDisplayName(drawer)} original cover art`} loading="lazy" />}
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
        {previewBlocked && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewBlockReason} {unmuteHelp}</p>}
        {previewHint && <p className="t-body-sm text-2 preset-playback-note" role="status">{previewHint}</p>}
        {drawer.spec.phases.some((p) => p.rampSec) && <p className="t-caption text-3" style={{ marginTop: 8 }}>Authored phase fades ({[...new Set(drawer.spec.phases.map((p) => p.rampSec).filter(Boolean))].join(', ')} s) are saved as metadata; they do not run during playback or export.</p>}
        <h3 className="t-h3">Sources and limits</h3>
        <GradeBadge grade={drawer.grade} citation={{ verdict: gradeVerdict(drawer), summary: drawer.rationale, source: drawer.citations[0] }} />
        <p className="t-body-sm text-2" style={{ marginTop: 12 }}>{drawer.rationale}</p>
        {drawer.purpose && (
          <p className="t-body-sm" style={{ marginTop: 10, color: 'var(--teal)' }}>{drawer.purpose}</p>
        )}
        {drawer.links && drawer.links.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <span className="t-label text-3">SOURCE VIDEOS</span>
            <ul className="source-list t-caption" style={{ marginTop: 6 }}>
              {drawer.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }}>
                    ▶ {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="source-list t-caption text-3">{drawer.citations.map((c) => <li key={c}>{c}</li>)}</ul>
        {isBasharPreset(drawer) && <p className="t-body-sm"><Link to="/channeled">Open the Bashar source analysis</Link></p>}
        <button type="button" className="chip chip-active" onClick={() => load(drawer)}>Choose sound</button><button type="button" className="chip" onClick={() => load(drawer, '/studio')}>Open in Studio</button>
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
