import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { AppRoute } from '@/app/routes';
import { DISCLOSURE_CATEGORIES, getPrimaryNavRoutes, getSafetyRoute, entriesForCategory, type NavigationCategory } from '@/app/navigation';

/** One shallow task hierarchy for the desktop rail and mobile drawer. */
export function GroupedNavigation({
  idPrefix,
  collapsed = false,
  renderRoute,
}: {
  idPrefix: string;
  collapsed?: boolean;
  renderRoute: (route: AppRoute) => ReactNode;
}) {
  const { pathname } = useLocation();
  return <>
    <section aria-label="Start here" data-nav-group="primary">{getPrimaryNavRoutes().map(renderRoute)}</section>
    <section aria-label="Tools" data-nav-group="tools">
      {DISCLOSURE_CATEGORIES.filter((category) => ['create', 'analyze', 'experiments'].includes(category.id)).map((category) =>
        <NavigationDisclosure key={category.id} {...{ category, idPrefix, collapsed, renderRoute, pathname }} />,
      )}
    </section>
    {DISCLOSURE_CATEGORIES.filter((category) => ['research', 'help'].includes(category.id)).map((category) =>
      <NavigationDisclosure key={category.id} {...{ category, idPrefix, collapsed, renderRoute, pathname }} />,
    )}
    {renderRoute(getSafetyRoute())}
  </>;
}

function NavigationDisclosure({ category, idPrefix, collapsed, renderRoute, pathname }: {
  category: NavigationCategory;
  idPrefix: string;
  collapsed: boolean;
  renderRoute: (route: AppRoute) => ReactNode;
  pathname: string;
}) {
  const entries = entriesForCategory(category.id).filter((entry) => entry.route.path !== '/safety');
  const activeEntry = entries.find(({ route }) => pathname === route.path || pathname.startsWith(`${route.path}/`));
  const [disclosure, setDisclosure] = useState<{ path: string; open: boolean } | null>(null);
  // A deep link reveals its location; an explicit collapse on that page wins.
  const open = disclosure?.path === pathname ? disclosure.open : Boolean(activeEntry);
  const contentId = `${idPrefix}-${category.id}-links`;
  const label = activeEntry ? `${category.title} — current page: ${activeEntry.title}` : category.title;
  const Chevron = open ? ChevronDown : ChevronRight;
  const Icon = category.icon;

  return <section aria-label={category.title} data-nav-group={category.id} style={{ borderTop: '1px solid var(--line-1)', marginTop: 4 }}>
    <button type="button" data-testid={`${idPrefix}-${category.id}-toggle`}
      aria-label={label} aria-expanded={open} aria-controls={contentId}
      title={collapsed ? `${open ? 'Hide' : 'Show'} ${label}` : undefined}
      onClick={() => setDisclosure({ path: pathname, open: !open })}
      className="t-label flex items-center"
      style={{ width: '100%', minHeight: 48, padding: collapsed ? '10px 8px' : '12px 16px', gap: collapsed ? 3 : 8, justifyContent: collapsed ? 'center' : 'space-between', border: 'none', background: activeEntry ? 'var(--ink-2)' : 'transparent', color: activeEntry ? 'var(--amber)' : 'var(--text-2)', cursor: 'pointer', textAlign: 'left' }}>
      {collapsed ? <Icon size={19} strokeWidth={1.5} aria-hidden="true" /> : <span>{category.title}</span>}
      <Chevron size={14} strokeWidth={1.5} aria-hidden="true" style={{ flexShrink: 0 }} />
    </button>
    {!open && activeEntry && !collapsed && <p className="t-caption" style={{ color: 'var(--amber)', padding: '0 16px 12px', margin: 0 }}>Current page: {activeEntry.title}</p>}
    <div id={contentId} hidden={!open}>{open && entries.map((entry) => renderRoute(entry.route))}</div>
  </section>;
}
