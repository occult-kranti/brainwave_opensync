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
import './home.css';

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
      <header className="home-intro">
        <span className="t-label home-eyebrow">Open Sync · Sound workspace</span>
        <h1 className="t-display-lg">Listen, create, and inspect audio.</h1>
        <p className="t-body text-2">Listen to a preset, build a chord, or inspect an audio file. Start with a short preview; open more controls when you need them.</p>
        <div className="home-start-row">
          <Link className="home-primary" to="/presets">Choose a sound <ArrowRight size={17} aria-hidden /></Link>
          <Link className="home-text-link" to="/guide">How to start</Link>
        </div>
        <p className="home-scope t-body-sm text-2">These tools generate and measure audio. They do not measure your brain activity.</p>
      </header>

      <section className="home-task-section" aria-label="What would you like to do?">
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
            return <section key={category.id} className="home-directory-group" aria-labelledby={`home-group-${category.id}`}>
              <h3 id={`home-group-${category.id}`} className="t-h3">{category.title}</h3>
              <DirectoryList entries={entries} />
            </section>;
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
