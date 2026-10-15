import { readJson, STORAGE_KEYS, writeJson } from '@/lib/storage';

export const ARCHIVE_THEMES = [
  { id: 'night-country', label: 'Night Country', image: 'art/night-country.webp' },
  { id: 'quiet-horizon', label: 'Quiet Horizon', image: 'art/quiet-horizon.webp' },
] as const;
export type ArchiveTheme = (typeof ARCHIVE_THEMES)[number]['id'];

export function readArchiveTheme(): ArchiveTheme {
  const saved = readJson<unknown>(STORAGE_KEYS.archiveTheme, 1);
  return saved === 'quiet-horizon' ? saved : 'night-country';
}

export function saveArchiveTheme(theme: ArchiveTheme): void {
  writeJson(STORAGE_KEYS.archiveTheme, 1, theme);
}
