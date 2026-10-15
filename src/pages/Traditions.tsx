import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ARCHIVE_SOURCES, ARCHIVE_PRESETS, type ArchiveGroup } from '@/data/archivePractice';
import { presetDurationMin } from '@/data/presets';
import { useSession } from '@/ui/session/useSession';
import './practice.css';

const groups: ArchiveGroup[] = ['Government archives', 'Russia & China', 'Books & esoteric traditions'];

export default function Traditions() {
  const [query, setQuery] = useState('');
  const s = useSession();
  const navigate = useNavigate();
  const load = (id: string) => {
    const p = ARCHIVE_PRESETS.find((p) => p.id === id);
    if (!p || s.governor.infantMode) return;
    s.stopPreview(); s.stop(); s.loadPreset(p); navigate('/studio');
  };
  const matches = ARCHIVE_SOURCES.filter((source) => `${source.title} ${source.origin} ${source.kind} ${source.finding}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div className="practice-page">
    <header className="practice-heading"><span className="eyebrow"><BookOpen size={15} /> Sourcebook · reviewed 15 October 2026</span><h1>Old questions.<br />New ways to listen.</h1><p>Government programs, Russian and Chinese research, and esoteric books. Explore the documents, then try an original sound inspired by an idea.</p></header>
    <section className="research-overview" aria-label="How to read the sourcebook"><article><h2>Trace the source</h2><p>Who wrote it, who holds it, and what we could actually inspect. A US report about Russia is labeled as such.</p></article><article><h2>Separate the claim</h2><p>A patent, a spiritual teaching and a trial result answer different questions. Government custody or funding is not proof of effectiveness.</p></article><article><h2>Listen with context</h2><p>All seven recipes are original, grade D experiments. Their settings describe audio; they do not reproduce a secret program or establish healing.</p></article></section>
    <div className="sourcebook-tools"><label>Find a source<input type="search" placeholder="Try China, Gateway, qigong, or a book…" value={query} onChange={(e) => setQuery(e.target.value)} /></label><Link to="/presets?collection=archive">Browse the seven sounds <ArrowRight size={16} /></Link></div>
    {s.governor.infantMode && <p role="status">Infant mode is active. These adult experiments cannot be loaded.</p>}
    {groups.map((group) => {
      const sources = matches.filter((source) => source.group === group);
      return sources.length > 0 && <details className="research-section" key={group} open={Boolean(query) || group === 'Russia & China'}><summary>{group}<span className="source-count">{sources.length} sources</span></summary><div className="sourcebook-grid">{sources.map((source) => {
        const p = ARCHIVE_PRESETS.find((p) => p.id === source.preset);
        return <article className="sourcebook-entry" key={source.id}><span className="eyebrow">{source.kind}</span><h2>{source.title}</h2><p className="source-origin">{source.origin}</p><p>{source.finding}</p><details className="quiet-disclosure"><summary>Evidence & access limits</summary><p><strong>Access:</strong> {source.access}.</p><p>{source.limit}</p></details><div className="source-links"><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a>{source.alternate && <a href={source.alternate} target="_blank" rel="noreferrer">{source.id === 'gateway' ? 'Read transcript' : 'Read author copy'} ↗</a>}</div>{p && <div className="source-listening"><span className="eyebrow">Original sound · {presetDurationMin(p)} min · D experimental</span><h3>{p.title.replace(' — experimental tier', '')}</h3><p>{p.purpose}</p><details className="quiet-disclosure"><summary>What this recipe reproduces</summary><p>{p.rationale}</p></details><button className="practice-text-button" disabled={s.governor.infantMode} onClick={() => load(p.id)}>Set up in Studio <ArrowRight size={15} /></button></div>}</article>;
      })}</div></details>;
    })}
    {matches.length === 0 && <p role="status">No source matches that search. Try a country, title or practice.</p>}
    <details className="research-section"><summary>What the mathematics can tell us</summary><p>For a binaural pair, the nominal difference is |f₂ − f₁|. A 40 Hz envelope repeats every 25 milliseconds. A 3:2 ratio gives a musical fifth. These are testable statements about signals.</p><p>No equation here converts a book’s “vibration”, a qi concept, or a historical Focus level into a measured biological dose. We need calibrated exposure, an operational outcome, appropriate controls and replicated measurements to test that additional claim.</p><Link to="/hypnosis">Try the frequency calculator and read the human evidence <ArrowRight size={15} /></Link></details>
    <section className="research-next"><h2>Keep exploring</h2><div><Link to="/programs">Full historical programs archive</Link><Link to="/sound-methods">Published signal methods</Link><Link to="/replication">Replication limits</Link><Link to="/channeled">Channeled-source analysis</Link><Link to="/meditate">Find a session for today</Link></div></section>
  </div>;
}
