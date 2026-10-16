import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Download, Orbit } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { LabRibbon } from '@/ui/components/LabRibbon';
import { LabPresetCard } from '@/ui/components/LabPresetCard';
import { useSession } from '@/ui/session/useSession';
import { LEVITATION_PRESETS } from '@/data/levitationPresets';
import { LEVITATION_SOURCES, LEVITATION_EXPERIMENTS, MEDIA_RECORDS, PROVENANCE_SEARCH_LOG } from '@/levitation';
import { CONNECTIONS } from '@/levitation/connections';
import { AcousticBench, MagneticBench } from '@/levitation/Benches';
import './levitation.css';

const SECTIONS = ['Overview', 'Acoustic bench', 'Magnetic & control bench', 'Experiment setups', 'Sources & media', 'Listening collection'] as const;
const OWN_PREVIEWS = new Set(LEVITATION_PRESETS.map(p => `preset:${p.id}`));
const SETUPS = [
  ['acoustic', 'Standing-wave acoustic apparatus', 'A conceptual emitter–reflector arrangement. The numerical bench represents an ideal axial field, not a calibrated array or a complete three-dimensional trap.'],
  ['magnetic', 'Passive diamagnetic support', 'A conceptual magnet and sample arrangement. The local force model does not calculate this geometry, tensor susceptibility or lateral stability.'],
  ['vibration', 'Apparent-weight control experiment', 'A support-force measurement with independent motion and vibration observations. Define the system boundary and ordinary-force controls before interpreting a changed reading.'],
] as const;

function SourceLinks({ ids }: { ids: readonly string[] }) {
  return <div className="lv-links">{ids.map(id => { const source = LEVITATION_SOURCES.find(s => s.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>; })}</div>;
}

export default function LevitationLab() {
  const [section, setSection] = useState<typeof SECTIONS[number]>('Overview');
  const [country, setCountry] = useState('All');
  const [query, setQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('All');
  const session = useSession();
  const { previewId, stopPreview, running, muted, panicked, advisoryAcknowledged, governor } = session;
  const latestPreview = useRef<string | null>(null);
  useEffect(() => { latestPreview.current = previewId; }, [previewId]);
  useEffect(() => () => { if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview(); }, [stopPreview]);
  useEffect(() => { if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview(); }, [running, muted, panicked, advisoryAcknowledged, governor.infantMode, governor.maxGainDbFs, stopPreview]);
  const changeSection = (next: typeof SECTIONS[number]) => { if (latestPreview.current && OWN_PREVIEWS.has(latestPreview.current)) stopPreview(); setSection(next); };
  const sources = LEVITATION_SOURCES.filter(s => (country === 'All' || (s.country ?? 'International') === country) && `${s.title} ${s.kind} ${s.evidence} ${s.topics.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const connections = CONNECTIONS.filter(c => connectionStatus === 'All' || c.status === connectionStatus);
  return <div className="lv-page">
    <LabRibbon />
    <header className="lv-hero"><div><p className="lv-kicker">FIELD NOTES 03 · FORCES / FIELDS / EVIDENCE</p><h1>Levitation<br /><em>Laboratory</em></h1><p className="lv-deck">What holds an object up?<br />Follow the force, inspect the field, close the energy budget.</p><div className="lv-hero-links"><a href={assetUrl('research/levitation-network.md')} download><Download size={15} aria-hidden="true" /> Research dossier</a><a href={assetUrl('research/levitation-evidence.json')} download>Evidence map · JSON</a></div></div><div className="lv-orbit" aria-hidden="true"><Orbit strokeWidth={0.65} /><span>Σ F = 0<br /><small>THEN TEST STABILITY</small></span></div></header>
    <div className="lv-counts"><span><strong>{LEVITATION_SOURCES.length}</strong> selected sources</span><span><strong>{CONNECTIONS.length}</strong> typed connections</span><span><strong>3</strong> virtual models</span><span><strong>{LEVITATION_EXPERIMENTS.length}</strong> proposed experiments</span></div>
    <nav className="lv-tabs" aria-label="Levitation lab sections">{SECTIONS.map(name => <button key={name} type="button" aria-pressed={section === name} onClick={() => changeSection(name)}>{name}</button>)}</nav>

    {section === 'Overview' && <section aria-label="Levitation overview"><div className="lv-section-heading"><p className="lv-kicker">A SELECTED SOURCE AUDIT · 16 OCTOBER 2026</p><h2>One word. Several mechanisms.</h2><p>Acoustic scattering, magnetic response, electric forces, optical momentum and flowing gas can provide support. Each requires its own geometry, material response and measurements. The models here describe ordinary forces; none demonstrates altered gravity.</p></div>
      <div className="lv-overview-grid"><article><span>01 / SUPPORT</span><h3>Balance is a first test.</h3><p>An upward force can equal weight without producing a stable trap. Check the response to a displacement and the directions the model leaves out.</p><button onClick={() => changeSection('Acoustic bench')}>Explore force & potential <ArrowUpRight size={15} /></button></article><article><span>02 / ENERGY</span><h3>Resonance needs a ledger.</h3><p>A large response does not identify a new energy source. The driven oscillator displays input power, loss power and gravity’s static sag.</p><button onClick={() => changeSection('Magnetic & control bench')}>Open the control bench <ArrowUpRight size={15} /></button></article><article><span>03 / PROVENANCE</span><h3>A record establishes a record.</h3><p>USA, China and Russia documents include patents, programs and experiments. Government custody and patent claims have different evidentiary roles from measured replication.</p><button onClick={() => changeSection('Sources & media')}>Inspect the source dossiers <ArrowUpRight size={15} /></button></article></div>
      <div className="lv-boundary"><h3>What “free energy” means here</h3><p>Thermodynamic free energy describes work available under specified constraints. Environmental harvesting draws on a resource. A claim of cyclic output without a source requires a complete energy and uncertainty budget, including reset work and stored energy. Casimir attraction and resonance alone do not supply that demonstration.</p><SourceLinks ids={['foundation-energy', 'foundation-casimir', 'foundation-ratchet']} /></div>
      <div className="lv-section-heading"><p className="lv-kicker">NEWTON / TESLA / GOR’KOV / MAXWELL / EINSTEIN / CASIMIR</p><h2>Connect ideas without merging their evidence.</h2><p>Historical influence, mathematical derivation and analogy are different relationships. Every connection below includes what would still need to be tested. The earlier <Link to="/newton-tesla">Newton–Tesla Lab</Link> contains the wider alchemical and historical reading.</p></div>
      <label className="lv-filter">Connection status<select aria-label="Connection status" value={connectionStatus} onChange={e => setConnectionStatus(e.target.value)}>{['All', 'documented', 'derived', 'analogy', 'unsupported'].map(v => <option key={v}>{v}</option>)}</select></label>
      <div className="lv-records">{connections.map(c => <details key={c.id} className="lv-record" data-connection-status={c.status}><summary><span className={`lv-tag lv-tag-${c.status}`}>{c.status}</span><strong>{c.from} → {c.to}</strong></summary><p>{c.explanation}</p><p className="lv-gap"><strong>Missing bridge:</strong> {c.missingBridge}</p><SourceLinks ids={c.sourceIds} /></details>)}</div>
    </section>}

    {section === 'Acoustic bench' && <AcousticBench />}
    {section === 'Magnetic & control bench' && <MagneticBench />}

    {section === 'Experiment setups' && <section aria-label="Proposed experiment setups"><div className="lv-section-heading"><p className="lv-kicker">SCHEMATICS / CONTROLS / FALSIFIERS</p><h2>Make the next measurement explicit.</h2><p>These are original conceptual illustrations and proposed tests. They are not photographs, calibrated reconstructions or completed experiments. The virtual benches do not drive hardware.</p></div>
      <div className="lv-setup-grid">{SETUPS.map(([id, title, copy]) => <article key={id}><a href={assetUrl(`research/levitation-setups/${id}.svg`)} download><img src={assetUrl(`research/levitation-setups/${id}.svg`)} alt={title} loading="lazy" width="840" height="520" /></a><h3>{title}</h3><p>{copy}</p><a className="lv-download" href={assetUrl(`research/levitation-setups/${id}.svg`)} download><Download size={14} /> Download {id} SVG</a></article>)}</div>
      <p className="lv-boundary">Real ultrasonic, high-voltage, strong-field and laser experiments require apparatus-specific calibration and suitable facilities. The sketches omit construction wiring and exposure prescriptions. Passive or digital controls are useful before interpreting a more elaborate apparatus.</p>
      <div className="lv-records">{LEVITATION_EXPERIMENTS.map(e => <details className="lv-record" key={e.id} data-experiment-id={e.id}><summary><span className="lv-tag">{e.status}</span><strong>{e.title}</strong></summary><p className="lv-meta">{e.mechanism}</p><dl className="lv-dossier">{(['question', 'prediction', 'setup', 'variables', 'control', 'measurement', 'falsifier', 'limits'] as const).map(key => <div key={key}><dt>{key}</dt><dd>{e[key]}</dd></div>)}</dl><SourceLinks ids={e.sourceIds} /></details>)}</div>
    </section>}

    {section === 'Sources & media' && <section aria-label="Levitation sources and media"><div className="lv-section-heading"><p className="lv-kicker">WHAT WAS READ / WHAT WAS MEASURED / WHAT REMAINS OPEN</p><h2>Inspect the record behind the claim.</h2><p>This is a selected public-source investigation, not a search of every government archive or the entire literature. Each dossier records the exact version and inspected passage. A paper, patent, institution’s report and video caption do not provide the same kind of evidence.</p></div>
      <details className="lv-record"><summary><span className="lv-tag">3 media audits</span><strong>NASA/JPL, a TU Delft lecture, and transcript access</strong></summary><div className="lv-media">{MEDIA_RECORDS.map(m => <article key={m.id}><h3><a href={m.url} target="_blank" rel="noreferrer">{m.title} ↗</a></h3><p className="lv-meta">{m.creator} · {m.published} · {m.affiliation}</p><p><strong>Inspected:</strong> {m.inspection}</p><p><strong>Transcript:</strong> {m.transcriptStatus}</p><p>{m.claim}</p><p className="lv-gap">{m.limits}</p><p className="lv-meta">{m.access}</p></article>)}</div></details>
      <details className="lv-record"><summary><span className="lv-tag">Search log</span><strong>WikiLeaks and bounded access findings</strong></summary><ul>{PROVENANCE_SEARCH_LOG.map(item => <li key={item}>{item}</li>)}</ul></details>
      <div className="lv-filters"><label className="lv-filter">Country / institutional context<select aria-label="Source country" value={country} onChange={e => setCountry(e.target.value)}>{['All', 'USA', 'China', 'Russia', 'International'].map(v => <option key={v}>{v}</option>)}</select></label><label className="lv-filter">Search title, claim or topic<input type="search" aria-label="Search levitation sources" value={query} onChange={e => setQuery(e.target.value)} placeholder="Gor’kov, quantum, patent, free energy…" /></label></div>
      <p className="lv-meta" role="status">{sources.length} of {LEVITATION_SOURCES.length} selected source records</p>
      <div className="lv-records">{sources.map(s => <details className="lv-record" key={s.id} data-source-country={s.country ?? 'International'} data-source-id={s.id}><summary><span className="lv-tag">{s.status}</span><strong>{s.title}</strong><small>{s.country ?? 'International'} · {s.date}</small></summary><p className="lv-meta">{s.kind}</p><dl className="lv-dossier">{([['Version', s.version], ['Passage read', s.passageRead], ['Access', s.access], ['Provenance', s.provenance], ['Evidence', s.evidence], ['Limitations', s.limitations]] as const).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><a href={s.url} target="_blank" rel="noreferrer">Open inspected source <ArrowUpRight size={14} /></a></details>)}</div>
      {sources.length === 0 && <p>No records match these filters. Try a broader term or another country.</p>}
    </section>}

    {section === 'Listening collection' && <section aria-label="Levitation listening collection"><div className="lv-section-heading"><p className="lv-kicker">FOUR ORIGINAL LISTENING ILLUSTRATIONS · GRADE D</p><h2>Hear a comparison. Keep the claim small.</h2><p>Explore a frequency reference, stereo phase drift and opposite pitch sequences. These quiet recipes are original teaching illustrations. They do not generate a levitation field, reproduce an inventor’s device or establish a healing effect.</p><Link to="/presets?collection=levitation">Open the grouped preset collection ↗</Link></div>
      {governor.infantMode ? <p className="lv-boundary">Experimental listening is unavailable in infant mode.</p> : <div className="lv-preset-grid">{LEVITATION_PRESETS.map(preset => <LabPresetCard key={preset.id} preset={preset} testidPrefix="lv" />)}</div>}
      <p className="lv-meta">A digital gain value is not a calibrated sound-pressure exposure. The model sliders above do not set playback pressure or control an external device.</p>
    </section>}
    <footer className="lv-footer"><Link to="/newton-tesla">Newton–Tesla research ↗</Link><Link to="/sound-research">Sound Research Laboratory ↗</Link><a href={assetUrl('research/levitation-network.md')} download>Download the full audit ↧</a></footer>
  </div>;
}
