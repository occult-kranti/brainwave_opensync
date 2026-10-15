/** Home starts with tasks; the complete directory shares the navigation registry. */
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, AudioLines, Headphones, Music2, Search } from 'lucide-react';
import {
  NAVIGATION_CATEGORIES,
  NAVIGATION_ENTRIES,
  navigationMatches,
  type NavigationEntry,
} from '@/app/navigation';
import { PRACTICE_GOALS } from '@/data/listeningPractice';
import './home.css';
import './practice.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () => NAVIGATION_ENTRIES.filter((entry) => entry.route.path !== '/' && navigationMatches(entry, query)),
    [query],
  );
  const tools = matches.filter((entry) => entry.route.group === 'tools');
  const research = matches.filter((entry) => entry.route.group === 'research');
  const help = matches.filter((entry) => entry.route.group === 'help');
  const searching = query.trim().length > 0;
  const researchCategory = NAVIGATION_CATEGORIES.find((category) => category.id === 'research');

  return (
    <div className="home-page">
      <header className="listening-hero">
        <div className="listening-hero-copy"><span className="eyebrow">Open Sync · Your listening room</span>
          <h1>A little space.<br /><em>A different rhythm.</em></h1>
          <p>Make room for meditation, rest, and curiosity. Find a sound for this moment, and let the rest wait.</p>
          <div className="home-start-row"><Link className="practice-primary" to="/meditate">Find my session <ArrowRight size={16} /></Link><Link className="home-text-link" to="/presets">Explore sounds</Link></div>
          <span className="hero-footnote">YOUR PACE · YOUR SPACE · NO ACCOUNT NEEDED</span>
        </div>
        <figure className="listening-hero-art"><img src={`${import.meta.env.BASE_URL}art/bowl-session.jpg`} alt="Singing bowls and candles beneath Himalayan mountains" /><figcaption><span>THE LISTENING COLLECTION</span><strong>Small rituals. Open possibilities.</strong><Link to="/presets?collection=practice">Discover the new practices ↗</Link></figcaption></figure>
      </header>
      <p className="home-scope t-body-sm text-3">These tools create and visualize audio. They do not measure your brain activity.</p>
      <section className="home-now" aria-labelledby="home-now-title"><div><span className="eyebrow">A moment for you</span><h2 id="home-now-title">What do you need right now?</h2><p>Choose an intention. We’ll help you find a place to begin.</p></div><div className="home-intentions">{PRACTICE_GOALS.slice(0, 5).map((g) => <Link key={g.id} to={`/meditate?goal=${g.id}`}>{g.title}<ArrowRight size={15} /></Link>)}</div><Link className="home-text-link" to="/meditate">Which meditation should I do right now?</Link></section>

      <Link className="home-night-link" to="/overnight"><span className="eyebrow">For tonight</span><strong>A quieter night starts here.</strong><span>Plan seven hours · choose sound, then quiet · explore dreaming <ArrowRight size={16} /></span></Link>
      <details className="home-tool-drawer"><summary>Make it your own <span>Studio, composition & audio analysis</span></summary><section className="home-task-section" aria-label="What would you like to do?">
        <div className="home-task-grid">
          <article className="home-task home-task-listen">
            <Headphones size={21} aria-hidden />
            <h2 className="t-h2">Listen</h2>
            <p className="t-body-sm text-2">Hear a short preview, then load a sound into Studio to play the full session.</p>
            <Link className="home-task-link" to="/presets">Browse presets <ArrowRight size={15} aria-hidden /></Link>
            <Link className="home-text-link" to="/presets?collection=bashar" data-testid="home-bashar-link">Bashar sounds · experimental collection</Link>
          </article>
          <article className="home-task">
            <Music2 size={21} aria-hidden />
            <h2 className="t-h2">Create</h2>
            <p className="t-body-sm text-2">Build chords and musical patterns, or edit tones and layers in Studio.</p>
            <Link className="home-task-link" to="/harmonics">Build a chord <ArrowRight size={15} aria-hidden /></Link>
            <Link className="home-text-link" to="/studio">Open Studio</Link>
          </article>
          <article className="home-task">
            <AudioLines size={21} aria-hidden />
            <h2 className="t-h2">Inspect</h2>
            <p className="t-body-sm text-2">View an audio file's waveform and spectrum, or measure its level and distortion.</p>
            <Link className="home-task-link" to="/sample-lab">Inspect an audio file <ArrowRight size={15} aria-hidden /></Link>
            <Link className="home-text-link" to="/analyzer">Measure audio</Link>
          </article>
        </div>
        <div className="home-simple-player">
          <p className="t-body-sm text-2"><strong>Want fewer controls?</strong> Simple player opens a separate listening view.</p>
          <a href={`${import.meta.env.BASE_URL}app/`} className="home-text-link" data-testid="everyday-link">Open Simple player <ArrowRight size={14} aria-hidden /></a>
        </div>
      </section>

      </details>

      <section className="home-labs" aria-labelledby="home-labs-title">
        <h2 id="home-labs-title" className="t-h2">Follow your curiosity</h2>
        <p className="t-body-sm text-2">Listening practices and the research behind them.</p>
        <Link className="home-sourcebook-link" to="/traditions"><span><strong>Programs, books & traditions</strong><span>Explore government archives, Russian and Chinese research, and seven new sounds.</span></span><ArrowRight size={20} /></Link>
        <div className="home-lab-grid">
          <Link className="home-lab-card" to="/lucid" data-testid="home-lab-lucid">
            <img src={`${import.meta.env.BASE_URL}art/lucid-dream.jpg`} alt="Lucid Audio Lab cover art" loading="lazy" />
            <span className="home-lab-body">
              <span className="t-label text-3">LUCID AUDIO LAB</span>
              <strong className="t-body">Cue research, night timing, Gateway file</strong>
              <span className="t-body-sm text-2">What sound can and cannot do for lucid dreams.</span>
            </span>
          </Link>
          <Link className="home-lab-card" to="/healing" data-testid="home-lab-healing">
            <img src={`${import.meta.env.BASE_URL}art/bowl-session.jpg`} alt="Healing Sound Lab cover art" loading="lazy" />
            <span className="home-lab-body">
              <span className="t-label text-3">HEALING SOUND LAB</span>
              <strong className="t-body">Bowls, rest & the healing traditions</strong>
              <span className="t-body-sm text-2">Bowls, vibroacoustics, the 30 Hz window, nano portraits.</span>
            </span>
          </Link>
          <Link className="home-lab-card" to="/nature" data-testid="home-lab-nature">
            <img src={`${import.meta.env.BASE_URL}art/sparrow.jpg`} alt="Nature Calls Lab cover art" loading="lazy" />
            <span className="home-lab-body">
              <span className="t-label text-3">NATURE CALLS LAB</span>
              <strong className="t-body">Animal call signs, plant acoustics</strong>
              <span className="t-body-sm text-2">Measured bands for cat, sparrow, jay, squirrel — plus a cricket thermometer.</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="home-directory" aria-labelledby="home-directory-title">
        <div className="home-directory-header">
          <div>
            <h2 id="home-directory-title" className="t-h2">Find a tool or page</h2>
            <p className="t-body-sm text-2">Browse by task or search by name.</p>
          </div>
          <label className="home-search">
            <span className="t-body-sm">Search tools and pages</span>
            <span className="home-search-input"><Search size={16} aria-hidden /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try chords, Bashar, or audio files" /></span>
          </label>
        </div>
        {searching && <p className="home-search-status t-body-sm text-2" role="status">{matches.length} {matches.length === 1 ? 'page' : 'pages'} found</p>}
        {matches.length === 0 && <div className="home-empty"><p className="t-body-sm text-2">No pages match “{query}”.</p><button type="button" className="home-reset" onClick={() => setQuery('')}>Clear search</button></div>}

        {tools.length > 0 && <div className="home-tool-groups" data-testid="home-tools">
          {NAVIGATION_CATEGORIES.map((category) => {
            const entries = tools.filter((entry) => entry.category === category.id);
            if (!entries.length) return null;
            return <details key={`${category.id}-${searching}`} className="home-directory-group" open={searching || undefined}>
              <summary id={`home-group-${category.id}`} className="t-h3">{category.title}<span>{entries.length} pages</span></summary>
              <DirectoryList entries={entries} />
            </details>;
          })}
        </div>}

        {research.length > 0 && <details className="home-reading" data-testid="home-research" open={searching || undefined}>
          <summary><span className="t-h3">{researchCategory?.title ?? 'Theory & research'}</span><span className="t-body-sm text-2">Sources, interpretations, and study notes</span></summary>
          <DirectoryList entries={research} />
        </details>}

        {help.length > 0 && <nav className="home-help" aria-label="Help">
          <span className="t-body-sm text-2">Help</span>
          {help.map((entry) => <Link key={entry.route.path} className="home-text-link" to={entry.route.path}>{entry.title}</Link>)}
        </nav>}
      </section>
    </div>
  );
}

function DirectoryList({ entries }: { entries: readonly NavigationEntry[] }) {
  return <ul className="home-directory-list">{entries.map((entry) => {
    const Icon = entry.route.icon;
    return <li key={entry.route.path}><Link to={entry.route.path} className="home-directory-link">
      <Icon size={17} aria-hidden />
      <span><strong>{entry.title}</strong><span className="t-body-sm text-2">{entry.description}</span></span>
      <ArrowRight size={14} aria-hidden />
    </Link></li>;
  })}</ul>;
}
