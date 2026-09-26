import { Link } from 'react-router';
import { ArrowUpRight, BookOpen, GitFork, Headphones } from 'lucide-react';
import { assetUrl } from '@/lib/assetUrl';
import { useSession } from '@/ui/session/useSession';

const repositories = [
  ['brainwave_opensync', 'Current audio tools, harmonic composition, sound methods and session controls.'],
  ['open-sync', 'Preserved original audio laboratory, including MED FREQ and its source collection.'],
  ['newton-tesla-alchemy', 'Historical dossiers covering Newton, Tesla, Jung, Penrose and Feynman.'],
  ['resonant-vessels', 'Illustrated folios about resonance, historical experiments and speculative claims.'],
  ['astrology-sim-ant', 'Astronomical calculators, historical systems and a sourced research graph.'],
] as const;

export default function Projects() {
  const { stop, stopPreview } = useSession();
  const leaveAudio = () => { stopPreview(); stop(); };
  return <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(20px, 4vw, 48px)' }}>
    <p className="t-label" style={{ color: 'var(--teal-hi)' }}>AUDIO · HISTORY · MEASUREMENT</p>
    <h1 className="font-display" style={{ fontSize: 'clamp(30px, 4vw, 48px)', margin: '12px 0' }}>Connected projects</h1>
    <p style={{ maxWidth: 760, color: 'var(--text-2)', lineHeight: 1.7 }}>Create sounds here, inspect the original audio suite, or follow a question into the research atlas. Each project keeps its source record and working tools.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 18, margin: '28px 0' }}>
      <article style={{ padding: 24, border: '1px solid var(--line-1)', borderRadius: 10, background: 'var(--ink-2)' }}>
        <Headphones aria-hidden size={26} style={{ color: 'var(--amber)' }} />
        <h2 style={{ fontSize: 22, margin: '16px 0 12px' }}>Original Open Sync</h2>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>The full 22-module suite, including MED FREQ, its frequency reference, experiments and audio tools.</p>
        <a href={assetUrl('open-sync/')} onClick={leaveAudio} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal-hi)', marginTop: 16 }}>Open audio suite <ArrowUpRight size={16} /></a>
      </article>
      <article style={{ padding: 24, border: '1px solid var(--line-1)', borderRadius: 10, background: 'var(--ink-2)' }}>
        <BookOpen aria-hidden size={26} style={{ color: 'var(--amber)' }} />
        <h2 style={{ fontSize: 22, margin: '16px 0 12px' }}>Resonance Research Atlas</h2>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>Compare historical claims, current sources, model calculations and proposed experiments across the research collection.</p>
        <a href={assetUrl('research/')} onClick={leaveAudio} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal-hi)', marginTop: 16 }}>Open research atlas <ArrowUpRight size={16} /></a>
      </article>
    </div>
    <p className="t-caption" style={{ color: 'var(--text-3)' }}>Opening either project stops audio in this tab. The original suite is preserved separately; the current <Link to="/studio" style={{ color: 'var(--teal-hi)' }}>Studio</Link> retains its newer session controls.</p>
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 22 }}><GitFork aria-hidden size={20} style={{ display: 'inline', marginRight: 8 }} />Source repositories</h2>
      <div style={{ marginTop: 12 }}>{repositories.map(([name, description]) => <article key={name} style={{ padding: '18px 0', borderBottom: '1px solid var(--line-1)' }}>
        <h3 style={{ fontSize: 16 }}><a href={`https://github.com/occult-kranti/${name}`} onClick={leaveAudio} style={{ color: 'var(--teal-hi)' }}>{name} ↗</a></h3>
        <p style={{ color: 'var(--text-2)', marginTop: 6, lineHeight: 1.6 }}>{description}</p>
      </article>)}</div>
    </section>
  </div>;
}
