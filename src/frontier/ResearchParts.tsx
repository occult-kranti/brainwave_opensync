import { useState } from 'react';
import { FRONTIER_SOURCES } from './index';
import type { ResearchConnection } from './types';

export function SourceLinks({ ids }: { ids: readonly string[] }) {
  return <div className="fr-links">{ids.map(id => {
    const source = FRONTIER_SOURCES.find(s => s.id === id);
    return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : null;
  })}</div>;
}

export function ConnectionList({ connections }: { connections: readonly ResearchConnection[] }) {
  const [relation, setRelation] = useState('All');
  const matches = connections.filter(c => relation === 'All' || c.relation === relation);
  return <><label className="fr-filter">Relationship<select aria-label="Connection relationship" value={relation} onChange={e => setRelation(e.target.value)}>{['All', 'documents', 'analogy', 'tests', 'unsupported'].map(s => <option key={s}>{s}</option>)}</select></label><div className="fr-records">{matches.map(c => <details className="fr-record" key={c.id}><summary><span className="fr-tag">{c.relation}</span><strong>{c.from} → {c.to}</strong></summary><p>{c.explanation}</p><SourceLinks ids={c.sourceIds} /></details>)}</div>{!matches.length && <p>No connections in this category.</p>}</>;
}

export function SourceDesk() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('All');
  const kinds = [...new Set(FRONTIER_SOURCES.map(s => s.kind))];
  const matches = FRONTIER_SOURCES.filter(s => (kind === 'All' || s.kind === kind) && `${s.title} ${s.summary} ${s.limitation}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <><div className="fr-filters"><label className="fr-filter">Search the records<input type="search" aria-label="Search frontier sources" value={query} onChange={e => setQuery(e.target.value)} placeholder="Transcript, nanoparticle, patent…" /></label><label className="fr-filter">Source type<select aria-label="Frontier source type" value={kind} onChange={e => setKind(e.target.value)}>{['All', ...kinds].map(s => <option key={s}>{s}</option>)}</select></label></div><p className="fr-meta" role="status">{matches.length} of {FRONTIER_SOURCES.length} selected records</p><div className="fr-records">{matches.map(s => <details className="fr-record" key={s.id} data-source-id={s.id}><summary><span className="fr-tag">{s.kind}</span><strong>{s.title}</strong><small>{s.date}</small></summary><dl className="fr-dossier"><div><dt>Inspected passage</dt><dd>{s.locator}</dd></div><div><dt>Access</dt><dd>{s.access}</dd></div><div><dt>What it supports</dt><dd>{s.summary}</dd></div><div><dt>Limit</dt><dd>{s.limitation}</dd></div></dl><a href={s.url} target="_blank" rel="noreferrer">Open source ↗</a></details>)}</div>{!matches.length && <p>No records match. Clear the search or select another source type.</p>}</>;
}
