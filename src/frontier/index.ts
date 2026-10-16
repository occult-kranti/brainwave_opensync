import { BASHAR_SOURCES, BASHAR_CONNECTIONS } from './basharSources';
import { SCIENCE_SOURCES, SCIENCE_CONNECTIONS } from './scienceSources';
export { BASHAR_CLAIMS } from './basharSources';
export { FREQUENCY_HYPOTHESES } from './hypotheses';
export const FRONTIER_SOURCES = [...BASHAR_SOURCES, ...SCIENCE_SOURCES];
export const FRONTIER_CONNECTIONS = [...BASHAR_CONNECTIONS, ...SCIENCE_CONNECTIONS];
