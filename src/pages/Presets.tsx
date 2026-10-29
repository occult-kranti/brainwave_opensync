import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, BookOpen, Headphones, Play, Search, SlidersHorizontal, Speaker, X } from 'lucide-react';
import { matchesListeningFilters, matchesCollection, matchesObeSubgroup, obeSubgroupFor, OBE_SUBGROUPS, presetFamily, PRESET_COLLECTIONS, COLLECTION_NOTES, FAMILY_ORDER, type PresetCollection } from '@/data/presetBrowse';
import { presetGuidance } from '@/data/presetGuidance';
import { needsHeadphones } from '@/data/sessionSuggestions';
import { PRESETS, presetDurationMin, type Preset, type PresetCategory } from '@/data/presets';
import { GradeBadge } from '@/ui/components/GradeBadge';
import { Chip } from '@/ui/components/primitives';
import { PanicButton } from '@/ui/components/Panic';
import { useModalA11y } from '@/ui/hooks';
import { useSheetScrollLock } from '@/ui/useSheetScrollLock';
import { useIsMobile } from '@/hooks/use-mobile';
import { OverlayPortal } from '@/ui/components/OverlayPortal';
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
const ARCHIVE_EDITION = true;
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
  const obeSubgroup = OBE_SUBGROUPS.find(([id]) => id === params.get('obe'))?.[0] ?? '';
  const obeCollection = collection === 'obe';
  const basharCollection = collection === 'bashar';
  const cat = CATS.find((candidate) => candidate === params.get('category')) ?? 'All';
  const query = params.get('q') ?? '';
  const requestedGrade = params.get('grade');
  const minGrade: GradeLetter | '' = requestedGrade === 'A' || requestedGrade === 'B' || requestedGrade === 'C' ? requestedGrade : '';
  const [drawer, setDrawer] = useState<Preset | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();
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
  const filtersRef = useRef<HTMLElement>(null);
  const filtersCloseRef = useRef<HTMLButtonElement>(null);
  useModalA11y(drawer !== null, () => { stopPreview(); setDrawer(null); }, drawerCloseRef, drawerRef);
  useModalA11y(isMobile && filtersOpen, () => setFiltersOpen(false), filtersCloseRef, filtersRef);
  useSheetScrollLock(drawer !== null || (isMobile && filtersOpen));

  useEffect(() => () => stopPreview(), [stopPreview]);
  useEffect(() => stopPreview(), [params, stopPreview]);
  useEffect(() => {
    if (previewBlocked || infantOnly) stopPreview();
  }, [previewBlocked, infantOnly, stopPreview]);
  // Safety changes discard optional overlays before the next committed view.
  if ((session.panicked || session.advisoryOpen) && (drawer !== null || filtersOpen)) {
    setDrawer(null); setFiltersOpen(false);
  } else if (!isMobile && filtersOpen) setFiltersOpen(false);

  const matching = useMemo(() => PRESETS.filter((p) =>
    (infantOnly ? p.category === 'Infant' : matchesCollection(p, collection) && (cat === 'All' || p.category === cat)) &&
    (!minGrade || GRADE_RANK[p.grade] >= GRADE_RANK[minGrade]) && presetMatchesSearch(p, query) && matchesListeningFilters(p, setup, duration, sound)).sort((a, b) => sort === 'shortest' ? presetDurationMin(a) - presetDurationMin(b) : sort === 'longest' ? presetDurationMin(b) - presetDurationMin(a) : sort === 'name' ? a.title.localeCompare(b.title) : 0),
  [infantOnly, collection, cat, minGrade, query, setup, duration, sound, sort]);
  const filtered = useMemo(() => matching.filter(p => infantOnly || !obeCollection || matchesObeSubgroup(p, obeSubgroup)), [matching, infantOnly, obeCollection, obeSubgroup]);
  const obeGroupLabel = (p: Preset) => OBE_SUBGROUPS.find(([id]) => id === obeSubgroupFor(p))?.[1] ?? 'Related practices';
  const groupFor = (p: Preset) => groupBy === 'category' ? p.category : obeCollection && !infantOnly ? obeGroupLabel(p) : presetFamily(p);
  const groupOrder: readonly string[] = obeCollection && !infantOnly && groupBy !== 'category' ? OBE_SUBGROUPS.map(([, title]) => title) : FAMILY_ORDER;
  const groups = [...new Set(filtered.map(groupFor))].sort((a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b));
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const [expansionVersion, setExpansionVersion] = useState(0);
  const expandGroups = (open: boolean) => { setExpanded(open); setExpansionVersion(v => v + 1); };
  const collectionTitle = PRESET_COLLECTIONS.find(([id]) => id === collection)?.[1] ?? 'Presets';
  const activeFilterCount = [setup, duration, sound, minGrade, cat === 'All' ? '' : cat, obeCollection ? obeSubgroup : ''].filter(Boolean).length;
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
    ['q', 'category', 'grade', 'setup', 'duration', 'sound', 'obe'].forEach(key => next.delete(key));
    commitParams(next);
  };
  const chooseCollection = (nextCollection: Collection) => {
    stopPreview(); setPreviewHint(''); setDrawer(null); setExpanded(null);
    const next = new URLSearchParams(pendingParams.current);
    ['q', 'category', 'grade', 'setup', 'duration', 'sound', 'obe'].forEach(key => next.delete(key));
    if (nextCollection === 'start') next.delete('collection'); else next.set('collection', nextCollection);
    commitParams(next);
  };
  const load = (p: Preset, destination = ARCHIVE_EDITION ? '/listen' : '/studio') => {
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

  const filterControls = <>
<div className="preset-quick-filters"><label>Listening setup<select value={setup} onChange={e => changeParam('setup', e.target.value)}><option value="">All setups</option><option value="speakers">Speaker-compatible</option><option value="headphones">Stereo headphones</option></select></label><label>Session length<select value={duration} onChange={e => changeParam('duration', e.target.value)}><option value="">Any length</option><option value="short">Up to 15 min</option><option value="medium">15–60 min</option><option value="long">1–7 hours</option><option value="night">7 hours or longer</option></select></label><label>Sound character<select value={sound} onChange={e => changeParam('sound', e.target.value)}><option value="">All sounds</option><option value="steady">Steady tones</option><option value="binaural">Binaural beats</option><option value="pulse">AM & pulses</option><option value="nature">Nature layer</option><option value="noise">Noise layer</option><option value="bowls">Singing bowls</option></select></label></div>
    {obeCollection && !infantOnly && <div className="preset-obe-filter"><label htmlFor="obe-subgroup">OBE practice stage<select id="obe-subgroup" value={obeSubgroup} onChange={e => changeParam('obe', e.target.value)}><option value="">All stages ({matching.length})</option>{OBE_SUBGROUPS.map(([id, title]) => <option value={id} key={id}>{title} ({matching.filter(p => matchesObeSubgroup(p, id)).length})</option>)}</select></label><p>{OBE_SUBGROUPS.find(([id]) => id === obeSubgroup)?.[2] ?? 'Start with preparation, then choose a related practice. Dreaming, imagery and remote viewing are separate topics, not proof of leaving the body.'}</p></div>}
    <details className="preset-more-filters"><summary><SlidersHorizontal size={14} />More filters{minGrade || cat !== 'All' ? ' · active' : ''}</summary><label>Minimum evidence grade<select aria-label="Minimum evidence grade" value={minGrade} onChange={e => changeParam('grade', e.target.value)}><option value="">Any grade</option><option value="C">C or higher</option><option value="B">B or higher</option><option value="A">A only</option></select></label><p>Grades describe evidence for a claim, not sound quality.</p><div className="preset-filter-row" aria-label="Preset categories">{CATS.map(c => <Chip key={c} active={cat === c} onClick={() => changeParam('category', c === 'All' ? '' : c)}>{c}</Chip>)}</div></details>
  </>;

  const guide = (path: string, label: string) => ARCHIVE_EDITION ? <Link to={path}>{label}<ArrowRight size={16} /></Link> : <a href={assetUrl(`archive${path}`)} onClick={() => { stopPreview(); session.stop(); }}>{label}<ArrowRight size={16} /></a>;
  return <div className="preset-page library-page">
    <header className="library-heading"><div className="library-sculpture" aria-hidden="true" style={{ backgroundImage: `url(${assetUrl('art/spatial-studies.webp')})` }} /><div><span className="library-eyebrow">The sound library</span><h1 className="t-display-lg">Find your frequency.</h1><p className="text-2">Choose an intention. Explore the sound. Make it your own.</p></div><div className="library-total"><strong>{PRESETS.length}</strong><span>original presets<br />with sources & limits</span></div></header>
    <div className="library-layout">
    {!infantOnly && <aside className="library-sidebar"><span className="library-eyebrow">Collections</span>{isMobile ? <label className="mobile-collection-picker">Collection<select aria-label="Preset collection" value={collection} onChange={e => chooseCollection(e.target.value as Collection)}>{PRESET_COLLECTIONS.map(([id, title]) => <option key={id} value={id}>{title} ({id === 'saved' ? userPresets.length : PRESETS.filter(p => matchesCollection(p, id)).length})</option>)}</select></label> : <nav className="preset-collections" aria-label="Preset collections">{PRESET_COLLECTIONS.map(([id, title]) => <button key={id} type="button" aria-label={title} aria-pressed={collection === id} onClick={() => chooseCollection(id)}><span>{title}</span><small aria-hidden="true">{id === 'saved' ? userPresets.length : PRESETS.filter(p => matchesCollection(p, id)).length}</small></button>)}</nav>}<div className="library-help"><BookOpen size={19} /><p>A practice for this moment?</p>{guide('/meditate', 'Help me choose')}</div></aside>}
    <div className="library-content">
    <section className="preset-filters" aria-label="Find a preset"><div className="library-search-row"><label className="preset-search"><span className="sr-only">Search sounds</span><Search size={18} /><input type="search" value={query} placeholder="Search names, frequencies, practices…" onChange={e => changeParam('q', e.target.value, true)} /></label></div>
    {(collection !== 'saved' || infantOnly) && (isMobile ? <div className="preset-mobile-filter-row"><button type="button" className="chip preset-filter-trigger" aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => { stopPreview(); setFiltersOpen(true); }}><SlidersHorizontal size={16} />Filters{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button><span>{activeFilterCount ? `${activeFilterCount} active · settings kept` : 'Setup, length & sound'}</span></div> : filterControls)}
    {(query || minGrade || setup || duration || sound || (obeCollection && obeSubgroup) || cat !== 'All') && <button type="button" className="preset-clear" onClick={clearFilters}>Clear filters</button>}
    {infantOnly && <p>Infant mode: only Infant presets are shown.</p>}</section>
    <div className="library-collection-heading"><div><span className="library-eyebrow">{infantOnly ? 'Restricted listening' : 'Selected collection'}</span><h2>{infantOnly ? 'Infant presets' : collectionTitle}</h2><p>{infantOnly ? 'Current infant-mode limits apply to every sound.' : COLLECTION_NOTES[collection]}</p></div></div>
    {!infantOnly && basharCollection && <section id="bashar-collection-title" className="preset-intro"><p>Scale sequence, alpha/gamma comparison, golden-ratio pitch ladder, and bowl chord. The scale uses chosen k = 5,000, anchored on 200,000 ↔ 40 Hz; this is an illustration, not a measured human frequency. <Link to="/channeled">Read the source analysis</Link>.</p></section>}
    {!infantOnly && collection === 'hypnosis' && <div className="library-practice-link">{guide('/hypnosis', 'Read the hypnosis practice & research')}</div>}
    {!infantOnly && collection === 'overnight' && <div className="library-practice-link">{guide('/overnight', 'Plan a night with sound, then quiet')}</div>}
    {!infantOnly && collection === 'archive' && <div className="library-practice-link">{guide('/traditions', 'Read the programs & traditions sourcebook')}</div>}
    {!infantOnly && collection === 'nano' && <div className="library-practice-link"><Link to="/nano-lab">Open the NanoLab signal bench <ArrowRight size={16} /></Link></div>}
    {previewBlocked && <p className="preset-playback-note" role="status">{previewBlockReason} {unmuteHelp}</p>}
    {previewHint && <p className="preset-playback-note" role="status">{previewHint}</p>}
    {collection === 'saved' && !infantOnly && <section data-testid="my-presets"><h2 className="sr-only">My presets</h2><p className="preset-intro">Studio presets saved in this browser. Harmonic Lab recipes stay in Harmonic Lab.</p>{!userPresets.length && <div className="library-empty"><h3>Your own collection starts here.</h3><p>No saved Studio presets yet. <Link to="/studio">Open Studio</Link>, make a sound and choose Save as preset.</p></div>}{userPresets.length > 0 && !savedFiltered.length && <p>No saved presets match your search.</p>}<div className="preset-grid">{savedFiltered.map(u => { const p = userPresetAsPreset(u); const playing = previewId === `preset:${p.id}`; return <article key={u.id} className="panel preset-card" data-testid={`my-preset-${u.id}`}><h3>{u.name}</h3><p>{presetSignalSummary(p)} · {fmtClock(presetDurationMin(p) * 60)}</p><PresetPracticeGuide preset={p} compact /><div className="preset-card-actions"><button type="button" data-testid={`my-preset-preview-${u.id}`} className="chip" disabled={previewBlocked} aria-label={playing ? `Stop preview of ${u.name}` : `Preview first 10 seconds of ${u.name}`} onClick={() => { if (canPreview(p)) session.previewPreset(p); }}>{playing ? 'Stop preview' : 'Preview · 10 s'}</button><button type="button" className="chip chip-active" onClick={() => load(p)}>{ARCHIVE_EDITION ? 'Choose sound' : 'Load into Studio'}</button><button type="button" className="chip" data-testid={`my-preset-delete-${u.id}`} aria-label={`Delete ${u.name}`} onClick={() => { stopPreview(); session.deleteUserPreset(u.id); }}>Delete</button></div></article>; })}</div></section>}
    {(collection !== 'saved' || infantOnly) && <><div className="preset-results"><span role="status">{filtered.length} {filtered.length === 1 ? 'preset' : 'presets'}</span><div className="library-group-actions"><button onClick={() => expandGroups(true)}>Expand all</button><button onClick={() => expandGroups(false)}>Collapse all</button></div></div><div className="preset-arrangement"><label>Group by<select value={groupBy} onChange={e => changeParam('group', e.target.value)}><option value="collection">Practice</option><option value="category">Category</option></select></label><label>Sort<select value={sort} onChange={e => changeParam('sort', e.target.value)}><option value="">Collection order</option><option value="shortest">Shortest first</option><option value="longest">Longest first</option><option value="name">Name A–Z</option></select></label></div>
    {filtered.length === 0 && <div className="library-empty"><h3>No sounds match yet.</h3><p>No presets match these filters. Try a broader search.</p><button type="button" className="chip" onClick={clearFilters}>Clear filters</button>{!infantOnly && collection !== 'all' && <button className="chip" onClick={() => { const next = new URLSearchParams(pendingParams.current); next.set('collection', 'all'); next.delete('category'); next.delete('grade'); next.delete('obe'); commitParams(next); }}>Search all presets instead</button>}</div>}
    <div className="preset-group-list">{groups.map((group, groupIndex) => <details className="preset-category-group" key={`${collection}-${group}-${query}-${cat}-${setup}-${duration}-${sound}-${obeSubgroup}-${expansionVersion}`} open={expanded ?? ((!isMobile && collection !== 'all') || groupIndex === 0 || Boolean(query || setup || duration || sound || minGrade || obeSubgroup) || cat !== 'All')}><summary><span className="library-group-number">{String(groupIndex + 1).padStart(2, '0')}</span><span className="library-group-name">{group}</span><span className="library-group-count">{filtered.filter(p => groupFor(p) === group).length} sounds</span></summary>{obeCollection && !infantOnly && groupBy !== 'category' && <p className="preset-obe-group-note">{OBE_SUBGROUPS.find(([, title]) => title === group)?.[2]}</p>}<div className="preset-grid">{filtered.filter(p => groupFor(p) === group).map(p => { const playing = previewId === `preset:${p.id}`; return <article key={p.id} className="panel preset-card" data-testid={`preset-card-${p.id}`}>
    <div className="preset-card-top"><span className="library-duration">{presetDurationMin(p) >= 60 ? `${Math.round(presetDurationMin(p) / 60 * 10) / 10} hr` : `${presetDurationMin(p)} min`}</span><GradeBadge grade={p.grade} citation={{ verdict: gradeVerdict(p), summary: p.rationale, source: p.citations[0] }} /></div><h3>{presetDisplayName(p)}</h3><p className="preset-setup-tag">{needsHeadphones(p) ? <Headphones size={13} /> : <Speaker size={13} />}{needsHeadphones(p) ? 'Stereo headphones' : 'Speaker-compatible'}</p><p className="preset-card-description clamped">{isBasharPreset(p) ? presetSoundDescription(p) : p.purpose ?? presetSoundDescription(p)}</p><PresetPracticeGuide preset={p} compact /><div className="preset-card-actions"><button type="button" data-testid={`preset-preview-${p.id}`} className={`chip ${playing ? 'chip-active preview-active' : ''}`} disabled={previewBlocked} aria-label={playing ? `Stop preview of ${p.title}` : `Preview first ${previewSeconds(p)} seconds of ${p.title}`} onClick={() => playPreview(p)}>{playing ? '■ Stop preview' : <><Play size={12} />Preview · {previewSeconds(p)} s</>}</button><button type="button" className="chip chip-active" aria-label={ARCHIVE_EDITION ? `Choose ${p.title}` : `Load ${p.title} into Studio`} onClick={() => load(p)}>{ARCHIVE_EDITION ? 'Choose sound' : 'Load into Studio'}<ArrowRight size={13} /></button><button type="button" className="preset-details-button" aria-label={`Details and steps for ${p.title}`} onClick={() => { stopPreview(); setDrawer(p); }}>Sound details & practice</button></div></article>; })}</div></details>)}</div></>}
    </div></div>
    {isMobile && filtersOpen && <OverlayPortal>
      <div className="preset-filter-backdrop" onClick={() => setFiltersOpen(false)} />
      <aside ref={filtersRef} className="preset-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="preset-filter-title" tabIndex={-1}>
        <header className="preset-filter-sheet-heading"><div><span className="library-eyebrow">Find your sound</span><h2 id="preset-filter-title">Listening filters</h2></div><button type="button" ref={filtersCloseRef} aria-label="Close listening filters" className="close-sheet" onClick={() => setFiltersOpen(false)}><X size={20} /></button></header>
        <PanicButton />
        {filterControls}
        <div className="preset-filter-actions"><button type="button" className="chip" onClick={clearFilters}>Reset filters</button><button type="button" className="chip chip-active" onClick={() => setFiltersOpen(false)}>Show {filtered.length} {filtered.length === 1 ? 'preset' : 'presets'}</button></div>
      </aside>
    </OverlayPortal>}
    {drawer && <OverlayPortal>
      <div className="preset-sheet-backdrop" onClick={() => { stopPreview(); setDrawer(null); }} />
      <aside ref={drawerRef} className="preset-sheet" role="dialog" aria-modal="true" aria-labelledby="preset-sheet-title" tabIndex={-1}>
        <div className="preset-sheet-top"><span className="t-label text-3">SOUND DETAILS</span><PanicButton />
          <button type="button" className="close-sheet" ref={drawerCloseRef} aria-label="Close spec sheet" onClick={() => { stopPreview(); setDrawer(null); }}><X size={20} /></button></div>
        <h2 className="t-h2" id="preset-sheet-title">{presetDisplayName(drawer)}</h2>
        <p className="t-body-sm text-2" style={{ marginTop: 8 }}>{presetSoundDescription(drawer)}</p>
        <p className="t-readout-sm text-2 preset-signal">{presetSignalSummary(drawer)} · {fmtClock(presetDurationMin(drawer) * 60)}</p>
        <MiniPhaseBar beats={drawer.spec.phases.map(ph => ({ sec: ph.durationSec, beat: ph.beatHz }))} durationSec={presetDurationMin(drawer) * 60} />
        {drawer.art && <img className="preset-sheet-art" src={assetUrl(drawer.art)} alt={`${presetDisplayName(drawer)} original cover art`} loading="lazy" />}
        <PresetPracticeGuide preset={drawer} />
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
        <div className="preset-sheet-actions"><button type="button" className="chip chip-active" onClick={() => load(drawer)}>Choose sound</button><button type="button" className="chip" onClick={() => load(drawer, '/studio')}>Open in Studio</button></div>
      </aside>
    </OverlayPortal>}
  </div>;
}

function gradeVerdict(p: Preset): string {
  if (p.grade === 'B') return 'Some human evidence; study limits apply.';
  if (p.grade === 'C') return 'Indirect or inconsistent evidence.';
  if (p.grade === 'D') return 'The proposed physiological effect is not established.';
  return 'Evidence supports the stated claim; check its scope.';
}

function PresetPracticeGuide({ preset, compact = false }: { preset: Preset; compact?: boolean }) {
  const guide = presetGuidance(preset);
  const content = <dl className="preset-practice-copy">
    {!compact && <div><dt>Why this sound</dt><dd>{guide.logic}</dd></div>}
    <div><dt>What you may notice</dt><dd>{guide.experience}</dd></div>
    <div><dt>How to use</dt><dd>{guide.howToUse}</dd></div>
    <div><dt>How often</dt><dd>{guide.howOften}</dd></div>
    {!compact && <div><dt>Evidence & limits</dt><dd>{guide.limits}</dd></div>}
  </dl>;
  if (compact) return <details className="preset-practice-preview"><summary>How to listen & what to expect</summary>{content}</details>;
  return <section className="preset-practice-guide" aria-label="Preset practice guide"><h3 className="t-h3">Your listening guide</h3>{content}{guide.sources.length > 0 && <ul className="source-list preset-guide-sources">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>}</section>;
}
