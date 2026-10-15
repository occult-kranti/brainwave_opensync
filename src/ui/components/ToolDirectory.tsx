import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';
import { NAVIGATION_CATEGORIES, NAVIGATION_ENTRIES, navigationMatches, type NavigationEntry } from '@/app/navigation';

export function ToolDirectory() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => NAVIGATION_ENTRIES.filter((entry) => entry.route.path !== '/' && navigationMatches(entry, query)), [query]);
  const tools = matches.filter((entry) => entry.route.group === 'tools');
  const research = matches.filter((entry) => entry.route.group === 'research');
  const help = matches.filter((entry) => entry.route.group === 'help');
  const searching = query.trim().length > 0;
  const researchCategory = NAVIGATION_CATEGORIES.find((category) => category.id === 'research');
  return (
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
              <summary id={`home-group-${category.id}`} className="t-h3">{category.title}<span>{entries.length} {entries.length === 1 ? 'page' : 'pages'}</span></summary>
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
