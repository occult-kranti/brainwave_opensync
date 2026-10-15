import { Moon, Mountain } from 'lucide-react';
import { ARCHIVE_THEMES, type ArchiveTheme } from '../archiveTheme';
import { projectUrl } from '@/lib/assetUrl';
import { useSession } from '../session/useSession';

export function ArchiveThemePicker({ value, onChange }: { value: ArchiveTheme; onChange: (theme: ArchiveTheme) => void }) {
  const { stop, stopPreview } = useSession();
  return <div className="archive-theme-bar">
    <a href={projectUrl('')} onClick={() => { stopPreview(); stop(); }} className="archive-original-link">Original workspace <span aria-hidden>↗</span></a>
    <fieldset className="archive-theme-picker">
      <legend className="sr-only">Landscape theme</legend>
      {ARCHIVE_THEMES.map(theme => <button key={theme.id} type="button" aria-pressed={value === theme.id} onClick={() => onChange(theme.id)}>
        {theme.id === 'night-country' ? <Moon size={15} aria-hidden /> : <Mountain size={15} aria-hidden />}{theme.label}
      </button>)}
    </fieldset>
  </div>;
}
