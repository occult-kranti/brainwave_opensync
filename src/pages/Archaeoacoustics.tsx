import { useLayoutEffect } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Waves } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigationType } from 'react-router';
import { architectureTopics } from '@/archaeoacoustics/architecture';
import { indiaTopics } from '@/archaeoacoustics/india';
import { physicsTopics } from '@/archaeoacoustics/physics';
import { photos } from '@/archaeoacoustics/photos';
import Exhibits from '@/archaeoacoustics/Exhibits';
import ListeningPresets from '@/archaeoacoustics/ListeningPresets';
import type { Topic, TopicId } from '@/archaeoacoustics/types';
import { assetUrl } from '@/lib/assetUrl';
import './archaeoacoustics.css';

const ROOT = '/archaeoacoustics';
const ORDER: TopicId[] = ['celestial', 'architecture', 'india', 'geometry', 'ritual', 'brainwaves'];
const topics = ORDER.map(id => [...architectureTopics, ...indiaTopics, ...physicsTopics].find(topic => topic.id === id)!);
const descriptions = {
  Measured: 'Observations or measurements under stated conditions',
  Model: 'Results from an explicit equation or simulation',
  Tradition: 'Texts, artifacts, or documented practices',
  Limited: 'Evidence with a narrow scope or unresolved interpretation',
  Unverified: 'A reported claim with insufficient primary evidence',
};

function SourceList({ refs }: { refs: Topic['sections'][number]['refs'] }) {
  return <ul className="arch-links">{refs.map(ref => <li key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.title} <ArrowUpRight size={13} aria-hidden /></a></li>)}</ul>;
}

function FieldPhoto({ id, eager = false }: { id: TopicId; eager?: boolean }) {
  const photo = photos[id];
  if (!photo) return null;
  return <figure className="arch-photo" data-topic={id}>
    <img src={assetUrl(`archaeoacoustics/${photo.file}`)} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} />
    <figcaption><a href={photo.url}>{photo.credit}</a> · <a href={photo.licenseUrl}>{photo.license}</a> · <a href={assetUrl('archaeoacoustics/CREDITS.md')}>Image credits</a></figcaption>
  </figure>;
}

function Chapter({ topic }: { topic: Topic }) {
  const current = ORDER.indexOf(topic.id);
  const next = topics[current + 1];
  return <>
    <header className="arch-chapter-head">
      <div><p className="arch-eyebrow">{topic.kicker}</p><h1>{topic.title}</h1><p>{topic.dek}</p><div className="arch-actions"><a className="arch-button arch-primary" href="#chapter-evidence">Read the evidence <ArrowDown size={16} aria-hidden /></a><Link className="arch-button" to={`${ROOT}?view=listening`}><AudioLines size={16} aria-hidden /> All listening presets</Link></div></div>
      <FieldPhoto id={topic.id} eager />
    </header>
    <div className="arch-chapter-content" id="chapter-evidence">
      <div className="arch-main">
        <section><h2>Evidence and open claims</h2>
          {topic.sections.map((section, index) => <article className="arch-entry" id={`claim-${index + 1}`} key={section.title}>
            <div className="arch-entry-heading"><h3>{section.title}</h3><span className="arch-evidence" data-evidence={section.evidence} title={descriptions[section.evidence]}>{section.evidence}</span></div>
            <p>{section.body}</p>
            {section.refs.length > 0 && <SourceList refs={section.refs} />}
          </article>)}
        </section>
        <Exhibits topic={topic.id} />
        <ListeningPresets topics={[topic.id]} />
      </div>
      <aside className="arch-chapter-index"><h2>In this chapter</h2><ol>{topic.sections.map((section, index) => <li key={section.title}><a href={`#claim-${index + 1}`}>{section.title}</a></li>)}</ol><Link to="/cymatics"><Waves size={16} aria-hidden /> Open Cymatic Studio</Link></aside>
    </div>
    {next && <div className="arch-next"><Link className="arch-button" to={`${ROOT}/${next.id}`}>Next chapter · {next.title} <ArrowRight size={16} aria-hidden /></Link></div>}
  </>;
}

function Overview() {
  return <>
    <header className="arch-hero" style={{ backgroundImage: `linear-gradient(90deg, #17130ff5 0%, #17130fc7 38%, #17130f20 80%), url(${assetUrl('archaeoacoustics/cover.webp')})` }}><div className="arch-hero-copy"><p className="arch-eyebrow">Open Sync research exhibit</p><h1>Sound in stone</h1><p>What happens when a voice meets a chamber, a staircase, or a slab of granite?</p><div className="arch-actions"><a className="arch-button arch-primary" href="#chapters">Explore the chapters <ArrowDown size={17} aria-hidden /></a><Link className="arch-button" to={`${ROOT}?view=listening`}><AudioLines size={17} aria-hidden /> Listen to the presets</Link></div></div></header>
    <p className="arch-image-note">Generated cover illustration of a modern Chladni plate.</p>
    <section className="arch-intro"><h2>Start with the measurements</h2><p>Six chapters follow the claims from pyramid numerology and solar oscillations to Hampi’s musical pillars and the 110 Hz EEG study. The supplied video summary is the starting point. Its recording and transcript were unavailable for attribution checks.</p></section>
    <section id="chapters" className="arch-catalog" aria-label="Research chapters">{topics.map(topic => <article className="arch-tile" key={topic.id}>
      <FieldPhoto id={topic.id} />
      <div><p className="arch-eyebrow">{topic.kicker}</p><h2><Link to={`${ROOT}/${topic.id}`}>{topic.title} <ArrowRight size={18} aria-hidden /></Link></h2><p>{topic.dek}</p></div>
    </article>)}</section>
    <details className="arch-legend"><summary>How to read the evidence labels</summary><dl>{Object.entries(descriptions).map(([name, description]) => <div key={name}><dt>{name}</dt><dd>{description}</dd></div>)}</dl></details>
  </>;
}

export default function Archaeoacoustics() {
  const { pathname, search, hash } = useLocation();
  const navigation = useNavigationType();
  useLayoutEffect(() => {
    if (!hash && navigation !== 'POP') window.scrollTo(0, 0);
  }, [pathname, search, hash, navigation]);
  const topicId = pathname.replace(/\/$/, '').split('/').at(-1);
  const topic = topics.find(item => item.id === topicId);
  const listening = !topic && new URLSearchParams(search).get('view') === 'listening';
  return <div className="arch-page">
    <nav className="arch-nav" aria-label="Archaeoacoustics chapters">
      <Link to={ROOT} aria-current={!topic && !listening ? 'page' : undefined}>Overview</Link>
      {topics.map(item => <NavLink end key={item.id} to={`${ROOT}/${item.id}`}>{item.title}</NavLink>)}
      <Link to={`${ROOT}?view=listening`} aria-current={listening ? 'page' : undefined}>Listening presets</Link>
    </nav>
    {topic ? <Chapter key={topic.id} topic={topic} /> : listening ? <section className="arch-listening-page">
      <header><p className="arch-eyebrow">Open Sync research exhibit</p><h1>Archaeoacoustics presets</h1><p>Compare short synthesized references for chamber tones, musical intervals, instrument spectra, and beat rates.</p></header>
      <ListeningPresets />
    </section> : <Overview />}
  </div>;
}
