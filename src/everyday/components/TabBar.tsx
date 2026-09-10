/**
 * Fixed bottom tab bar: Play / Sounds / Settings. NavLink stamps
 * aria-current="page" on the active tab; the class turns it amber.
 */

import { NavLink } from 'react-router';
import { AudioLines, Play, Settings2 } from 'lucide-react';
import { copy } from '../copy';

const TABS = [
  { id: 'play', to: '/', end: true, label: copy.tabs.play, Icon: Play },
  { id: 'sounds', to: '/sounds', end: false, label: copy.tabs.sounds, Icon: AudioLines },
  { id: 'settings', to: '/settings', end: false, label: copy.tabs.settings, Icon: Settings2 },
] as const;

export function TabBar() {
  return (
    <nav className="ev-tabbar" aria-label={copy.a11y.mainNav} data-testid="tabbar">
      <div className="ev-tabbar-inner">
        {TABS.map(({ id, to, end, label, Icon }) => (
          <NavLink key={id} to={to} end={end} className={({ isActive }) => `ev-tab${isActive ? ' is-active' : ''}`} data-testid={`tab-${id}`} aria-label={label}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
