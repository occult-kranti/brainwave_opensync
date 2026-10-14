/**
 * LabRibbon — cross-navigation between the three research labs
 * (Lucid Audio Lab / Healing Sound Lab / Nature Calls Lab). One row of chips
 * with the current lab marked active; keeps the lab cluster one tap apart.
 */

import { Link, useLocation } from 'react-router';

const LABS = [
  { path: '/lucid', label: 'LUCID AUDIO LAB' },
  { path: '/healing', label: 'HEALING SOUND LAB' },
  { path: '/nature', label: 'NATURE CALLS LAB' },
] as const;

export function LabRibbon() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Research labs" className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
      <span className="t-caption font-mono2 text-3" style={{ alignSelf: 'center' }}>LABS ·</span>
      {LABS.map((lab) => {
        const active = pathname === lab.path;
        return (
          <Link
            key={lab.path}
            to={lab.path}
            className={`chip ${active ? 'chip-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            style={{ textDecoration: 'none' }}
          >
            {lab.label}
          </Link>
        );
      })}
    </nav>
  );
}
