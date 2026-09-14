import { Activity, BookOpen, CircleHelp, FlaskConical, House, Music2, type LucideIcon } from 'lucide-react';
import { ROUTES, type AppRoute } from './routes';

export type NavigationCategoryId = 'primary' | 'create' | 'analyze' | 'experiments' | 'research' | 'help';

export interface NavigationCategory {
  id: NavigationCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationEntry {
  route: AppRoute;
  title: string;
  description: string;
  aliases: readonly string[];
  category: NavigationCategoryId;
}

export const NAVIGATION_CATEGORIES: readonly NavigationCategory[] = [
  { id: 'primary', title: 'Start here', description: 'Choose a sound or work on a session.', icon: House },
  { id: 'create', title: 'Create & explore', description: 'Build chords, edit sound recipes, and explore patterns.', icon: Music2 },
  { id: 'analyze', title: 'Analyze audio', description: 'Inspect a recording or monitor a live signal.', icon: Activity },
  { id: 'experiments', title: 'Run experiments', description: 'Compare sounds, track observations, and inspect protocols.', icon: FlaskConical },
  { id: 'research', title: 'Theory & research', description: 'Read source material, evidence, and unresolved claims.', icon: BookOpen },
  { id: 'help', title: 'Help', description: 'Listening settings, instructions, and project information.', icon: CircleHelp },
];

type EntrySpec = readonly [path: string, category: NavigationCategoryId, title: string, description: string, aliases: readonly string[]];

const ENTRY_SPECS: readonly EntrySpec[] = [
  ['/', 'primary', 'Home', 'Find a starting point for listening, creating, or inspecting audio.', ['start', 'tools', 'directory']],
  ['/presets', 'primary', 'Presets', 'Preview ready-made sounds, then load a session to play or edit.', ['listen', 'Bashar', 'bowls', 'noise', 'sound library', 'saved']],
  ['/studio', 'primary', 'Studio', 'Mix tones, noise, and layers into a session.', ['create', 'play', 'duration', 'volume', 'export', 'WAV', 'binaural', 'isochronic']],
  ['/harmonics', 'create', 'Harmonic Lab', 'Build chords and compare tunings.', ['chord', 'music', 'harmony', 'overtones', 'just', 'equal', 'pitch']],
  ['/sound-methods', 'create', 'Sound Methods', 'Edit sound examples from published methods.', ['Monroe', 'Gateway', 'patent', 'noise', 'binaural', 'phase modulation', 'recipe']],
  ['/sonic-lab', 'create', 'Sonic Lab', 'Try audio patterns, rhythms, and illusions.', ['Shepard', 'Risset', 'Fibonacci', 'noise', 'generator', 'patterns']],
  ['/library', 'create', 'Frequency reference', 'Browse frequency references and hear short examples.', ['library', 'frequency library', 'Hz', 'Bashar', 'pitch', 'tone']],
  ['/cymatics', 'create', 'Cymatics', 'Simulate sound-driven patterns.', ['cymatic studio', 'visualization', 'sand', 'plate', 'Chladni']],
  ['/sample-lab', 'analyze', 'Recording analysis', 'Inspect an audio file in your browser.', ['sample lab', 'recording', 'file', 'audio files', 'spectrum', 'spectrogram', 'loudness']],
  ['/analyzer', 'analyze', 'Live analyzer', 'Monitor the Studio signal or a microphone input.', ['analyzer', 'live', 'microphone', 'input', 'spectrum', 'level']],
  ['/quicklab', 'experiments', 'Quick Lab', 'Run a small listening comparison and record your ratings.', ['self experiment', 'compare', 'A/B', 'ratings']],
  ['/lab', 'experiments', 'Experiment Lab', 'Inspect planned audio experiments and their methods.', ['protocol', 'study', 'experiment']],
  ['/replication', 'experiments', 'Replication Bay', 'Compare published stimuli and inspect reconstruction limits.', ['replicate', 'protocol', 'Monroe', 'Gateway', 'stimulus']],
  ['/dream', 'experiments', 'Sleep experiments', 'Review advanced sleep protocols and keep a dream journal.', ['sleep & dream', 'sleep and dream', 'dream lab', 'lucid', 'journal', 'TLR', 'WBTB']],
  ['/levels', 'research', 'Levels', 'Inspect proposed levels and their evidence limits.', ['focus levels', 'ladder', 'frequency']],
  ['/knowledge', 'research', 'Knowledge', 'Read explanations of sound, perception, and evidence.', ['learn', 'knowledge base', 'brain', 'EEG']],
  ['/channeled', 'research', 'Channeled Sources', 'Read the Bashar digest analysis and chosen frequency mappings.', ['Bashar', 'channeling', 'golden ratio', 'phi', '200000']],
  ['/theory', 'research', 'Theory Explorer', 'Trace claims, assumptions, and supporting sources.', ['theory', 'claim', 'audit']],
  ['/critique', 'research', 'Critique Library', 'Review study limitations and alternative explanations.', ['criticism', 'evidence', 'studies']],
  ['/hypotheses', 'research', 'Hypothesis Tracker', 'Inspect open questions and proposed tests.', ['hypothesis', 'question', 'test']],
  ['/programs', 'research', 'Programs Archive', 'Browse historical sound programs and their sources.', ['Gateway', 'Monroe', 'archive', 'history']],
  ['/safety', 'help', 'Safety', 'Set listening limits and read the audio advisory.', ['volume', 'duration', 'dose', 'hearing', 'stop', 'infant']],
  ['/guide', 'help', 'Guide', 'Find instructions for each tool.', ['help', 'instructions', 'how to', 'manual']],
  ['/about', 'help', 'About', 'Read project information, licenses, and privacy details.', ['open source', 'privacy', 'license', 'version']],
];

// Home is eager in the route registry and consumes this metadata. Resolve
// routes on use, after module initialization, to avoid routes → Home → metadata.
export const NAVIGATION_ENTRIES: readonly NavigationEntry[] = ENTRY_SPECS.map(([path, category, title, description, aliases]) => ({
  get route() {
    const route = ROUTES.find((candidate) => candidate.path === path);
    if (!route) throw new Error(`Missing route for navigation: ${path}`);
    return route;
  },
  category, title, description, aliases,
}));

export const DISCLOSURE_CATEGORIES: readonly NavigationCategory[] = NAVIGATION_CATEGORIES.filter((category) => category.id !== 'primary');

export function getPrimaryNavRoutes(): readonly AppRoute[] {
  return NAVIGATION_ENTRIES.filter((entry) => entry.category === 'primary').map((entry) => entry.route);
}

export function getSafetyRoute(): AppRoute {
  return NAVIGATION_ENTRIES.find((entry) => entry.route.path === '/safety')!.route;
}

export function navigationForPath(path: string): NavigationEntry | undefined {
  return NAVIGATION_ENTRIES.find((entry) => entry.route.path === path);
}

export function entriesForCategory(category: NavigationCategoryId): readonly NavigationEntry[] {
  return NAVIGATION_ENTRIES.filter((entry) => entry.category === category);
}

/** Same plain-language matching for the directory and command palette. */
export function navigationMatches(entry: NavigationEntry, query: string): boolean {
  const haystack = [entry.title, entry.description, entry.route.label, entry.route.module, ...entry.aliases].join(' ').toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every((term) => haystack.includes(term));
}
