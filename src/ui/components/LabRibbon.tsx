/** Contextual navigation belongs behind one disclosure on narrow screens. */
import { Link, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { navigationForPath, RESEARCH_LAB_PATHS } from '@/app/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

export function LabRibbon() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const navigation = <nav aria-label="Research labs" className="atlas-lab-ribbon">
    {RESEARCH_LAB_PATHS.map(path => <Link key={path} to={path}
      className={`chip ${pathname === path ? 'chip-active' : ''}`}
      aria-current={pathname === path ? 'page' : undefined}>
      {navigationForPath(path)?.title ?? path}
    </Link>)}
  </nav>;
  return isMobile ? <details key={pathname} className="atlas-related-disclosure atlas-lab-disclosure"><summary>Related tools <ChevronDown size={17} aria-hidden="true" /></summary>{navigation}</details> : navigation;
}
