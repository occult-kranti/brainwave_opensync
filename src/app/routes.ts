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
  Info,
  Layers,
  ListChecks,
  MessageSquareWarning,
  Moon,
  Orbit,
  Repeat2,
  ShieldAlert,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Home from '@/pages/Home';

export type RouteGroup = 'core' | 'research';

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
  { path: '/', label: 'HOME', module: 'Home', icon: HomeIcon, group: 'core', component: Home, bottomTab: true },
  r('/studio', 'STUDIO', 'Studio', AudioWaveform, 'core', () => import('@/pages/Studio'), { bottomTab: true }),
  r('/library', 'LIBRARY', 'Library', BookOpen, 'core', () => import('@/pages/Library'), { bottomTab: true }),
  r('/presets', 'PRESETS', 'Presets', Layers, 'core', () => import('@/pages/Presets')),
  r('/levels', 'LEVELS', 'Levels', Gauge, 'core', () => import('@/pages/Levels')),
  r('/analyzer', 'ANALYZER', 'Analyzer', Activity, 'core', () => import('@/pages/Analyzer')),
  r('/cymatics', 'CYMATICS', 'Cymatic Studio', Waves, 'core', () => import('@/pages/Cymatics')),
  r('/dream', 'SLEEP & DREAM', 'Sleep & Dream', Moon, 'core', () => import('@/pages/Dream')),
  r('/replication', 'REPLICATION BAY', 'Replication Bay', Repeat2, 'core', () => import('@/pages/Replication')),
  r('/safety', 'SAFETY', 'Safety', ShieldAlert, 'core', () => import('@/pages/Safety'), { bottomTab: true }),
  r('/knowledge', 'KNOWLEDGE', 'Knowledge', BookMarked, 'core', () => import('@/pages/Knowledge')),
  r('/about', 'ABOUT', 'About', Info, 'core', () => import('@/pages/About')),
  r('/guide', 'GUIDE', 'Guide', Compass, 'core', () => import('@/pages/Guide')),
  // Research modules — all live.
  r('/lab', 'EXPERIMENT LAB', 'Experiment Lab', FlaskConical, 'research', () => import('@/pages/research/ExperimentLab')),
  r('/critique', 'CRITIQUE LIBRARY', 'Critique Library', MessageSquareWarning, 'research', () => import('@/pages/research/CritiqueLibrary')),
  r('/hypotheses', 'HYPOTHESIS TRACKER', 'Hypothesis Tracker', ListChecks, 'research', () => import('@/pages/research/HypothesisTracker')),
  r('/programs', 'PROGRAMS ARCHIVE', 'Programs Archive', Archive, 'research', () => import('@/pages/research/ProgramsArchive')),
  r('/quicklab', 'QUICK LAB', 'Quick Lab', Zap, 'research', () => import('@/pages/QuickLab')),
  r('/theory', 'THEORY EXPLORER', 'Theory Explorer', GitFork, 'research', () => import('@/pages/TheoryExplorer')),
  r('/sonic-lab', 'SONIC LAB', 'Sonic Lab', Orbit, 'research', () => import('@/pages/SonicLab')),
  r('/sample-lab', 'SAMPLE LAB', 'Sample Lab', FileAudio, 'research', () => import('@/pages/SampleLab')),
];

export const CORE_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'core');
export const RESEARCH_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.group === 'research');
export const BOTTOM_TAB_ROUTES: readonly AppRoute[] = ROUTES.filter((x) => x.bottomTab);

export function routeByPath(path: string): AppRoute | undefined {
  return ROUTES.find((x) => x.path === path);
}

/** Icon for a feature-docs module name (Home / Guide cards). */
export function iconForModule(module: string): LucideIcon {
  return ROUTES.find((x) => x.module === module)?.icon ?? Info;
}
