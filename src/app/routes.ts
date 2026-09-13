/**
 * Route registry — the single source of truth for every screen.
 *
 * App.tsx builds the router from it, AppShell renders the rail / bottom bar /
 * MORE drawer from it, the command palette lists it, and Home picks module
 * icons from it. Adding a screen is one entry here (plus a feature doc in
 * src/docs/features.ts, which the docs tests cross-check against APP_SCREENS).
 *
 * Only Home is eager: first paint must never wait on a route chunk. Every
 * other page is code-split via React.lazy.
 */

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  Activity,
  Archive,
  AudioWaveform,
  BookMarked,
  BookOpen,
  Compass,
  FileAudio,
  FlaskConical,
  Gauge,
  GitFork,
  Home as HomeIcon,
  Headphones,
  Info,
  Layers,
  ListChecks,
  MessageSquareWarning,
  Moon,
  Music2,
  Orbit,
  Radio,
  Repeat2,
  ShieldAlert,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Home from '@/pages/Home';

export type RouteGroup = 'home' | 'tools' | 'research' | 'help';

export interface AppRoute {
  /** Router path (all top-level; deep links rely on the Pages 404 fallback). */
  path: string;
  /** Rail / palette label (upper-case, mono). */
  label: string;
  /** Feature-docs module name (`module` in src/docs/features.ts). */
  module: string;
  icon: LucideIcon;
  group: RouteGroup;
  component: ComponentType | LazyExoticComponent<ComponentType>;
  /** Phone bottom-bar tab (max four; everything else lives in MORE). */
  bottomTab?: boolean;
}

const r = (
  path: string,
  label: string,
  module: string,
  icon: LucideIcon,
  group: RouteGroup,
  load: () => Promise<{ default: ComponentType }>,
  extra: Partial<AppRoute> = {},
): AppRoute => ({ path, label, module, icon, group, component: lazy(load), ...extra });

export const ROUTES: readonly AppRoute[] = [
  { path: '/', label: 'HOME', module: 'Home', icon: HomeIcon, group: 'home', component: Home, bottomTab: true },
  // Practical tools — listening, creating, measuring and testing.
  r('/studio', 'STUDIO', 'Studio', AudioWaveform, 'tools', () => import('@/pages/Studio'), { bottomTab: true }),
  r('/presets', 'PRESETS', 'Presets', Layers, 'tools', () => import('@/pages/Presets')),
  r('/library', 'LIBRARY', 'Library', BookOpen, 'tools', () => import('@/pages/Library'), { bottomTab: true }),
  r('/harmonics', 'HARMONIC LAB', 'Harmonic Lab', Music2, 'tools', () => import('@/pages/HarmonicLab')),
  r('/sound-methods', 'SOUND METHODS', 'Sound Methods', Headphones, 'tools', () => import('@/pages/SoundMethods')),
  r('/sonic-lab', 'SONIC LAB', 'Sonic Lab', Orbit, 'tools', () => import('@/pages/SonicLab')),
  r('/sample-lab', 'SAMPLE LAB', 'Sample Lab', FileAudio, 'tools', () => import('@/pages/SampleLab')),
  r('/analyzer', 'ANALYZER', 'Analyzer', Activity, 'tools', () => import('@/pages/Analyzer')),
  r('/cymatics', 'CYMATICS', 'Cymatic Studio', Waves, 'tools', () => import('@/pages/Cymatics')),
  r('/dream', 'SLEEP & DREAM', 'Sleep & Dream', Moon, 'tools', () => import('@/pages/Dream')),
  r('/quicklab', 'QUICK LAB', 'Quick Lab', Zap, 'tools', () => import('@/pages/QuickLab')),
  r('/lab', 'EXPERIMENT LAB', 'Experiment Lab', FlaskConical, 'tools', () => import('@/pages/research/ExperimentLab')),
  r('/replication', 'REPLICATION BAY', 'Replication Bay', Repeat2, 'tools', () => import('@/pages/Replication')),
  // Background reading — grouped behind one disclosure in both navigation layouts.
  r('/levels', 'LEVELS', 'Levels', Gauge, 'research', () => import('@/pages/Levels')),
  r('/knowledge', 'KNOWLEDGE', 'Knowledge', BookMarked, 'research', () => import('@/pages/Knowledge')),
  r('/channeled', 'CHANNELED SOURCES', 'Channeled Sources', Radio, 'research', () => import('@/pages/ChanneledSources')),
  r('/theory', 'THEORY EXPLORER', 'Theory Explorer', GitFork, 'research', () => import('@/pages/TheoryExplorer')),
  r('/critique', 'CRITIQUE LIBRARY', 'Critique Library', MessageSquareWarning, 'research', () => import('@/pages/research/CritiqueLibrary')),
  r('/hypotheses', 'HYPOTHESIS TRACKER', 'Hypothesis Tracker', ListChecks, 'research', () => import('@/pages/research/HypothesisTracker')),
  r('/programs', 'PROGRAMS ARCHIVE', 'Programs Archive', Archive, 'research', () => import('@/pages/research/ProgramsArchive')),
  r('/safety', 'SAFETY', 'Safety', ShieldAlert, 'help', () => import('@/pages/Safety'), { bottomTab: true }),
  r('/guide', 'GUIDE', 'Guide', Compass, 'help', () => import('@/pages/Guide')),
  r('/about', 'ABOUT', 'About', Info, 'help', () => import('@/pages/About')),
];

export const HOME_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'home');
export const TOOL_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'tools');
export const RESEARCH_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'research');
export const HELP_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'help');
export const BOTTOM_TAB_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.bottomTab);

export function routeByPath(path: string): AppRoute | undefined {
  return ROUTES.find((x) => x.path === path);
}

/** Icon for a feature-docs module name (Home / Guide cards). */
export function iconForModule(module: string): LucideIcon {
  return ROUTES.find((x) => x.module === module)?.icon ?? Info;
}
