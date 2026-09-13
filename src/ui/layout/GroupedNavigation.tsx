import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { HELP_ROUTES, HOME_ROUTES, RESEARCH_ROUTES, TOOL_ROUTES, type AppRoute } from '@/app/routes';

/** One ordering for the desktop rail and phone drawer. Disclosure is session-local. */
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
  const activeResearch = RESEARCH_ROUTES.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`),
  );
  const [disclosure, setDisclosure] = useState<{ path: string; open: boolean } | null>(null);
  // New destinations start closed, except a theory deep link reveals its page.
  // An explicit collapse on that page still wins until the next navigation.
  const researchOpen = disclosure?.path === pathname ? disclosure.open : Boolean(activeResearch);
  const researchId = `${idPrefix}-research-links`;
  const researchLabel = activeResearch
    ? `Theory & research — current page: ${activeResearch.label}`
    : 'Theory & research';
  const ResearchChevron = researchOpen ? ChevronDown : ChevronRight;

  return (
    <>
      {HOME_ROUTES.map(renderRoute)}
      <section aria-label="Tools" data-nav-group="tools">
        <GroupHeading collapsed={collapsed}>Tools</GroupHeading>
        {TOOL_ROUTES.map(renderRoute)}
      </section>
      <section aria-label="Theory & research" data-nav-group="research" style={{ borderTop: '1px solid var(--line-1)', marginTop: 8 }}>
        <button
          type="button"
          data-testid={`${idPrefix}-research-toggle`}
          aria-label={researchLabel}
          aria-expanded={researchOpen}
          aria-controls={researchId}
          title={collapsed ? `${researchOpen ? 'Hide' : 'Show'} ${researchLabel}` : undefined}
          onClick={() => setDisclosure({ path: pathname, open: !researchOpen })}
          className="t-label flex items-center"
          style={{
            width: '100%',
            minHeight: 48,
            padding: collapsed ? '10px 8px' : '12px 16px',
            gap: collapsed ? 3 : 8,
            justifyContent: collapsed ? 'center' : 'space-between',
            border: 'none',
            background: activeResearch ? 'var(--ink-2)' : 'transparent',
            color: activeResearch ? 'var(--amber)' : 'var(--text-2)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {collapsed ? <BookOpen size={19} strokeWidth={1.5} aria-hidden="true" /> : <span>Theory &amp; research</span>}
          <ResearchChevron size={14} strokeWidth={1.5} aria-hidden="true" style={{ flexShrink: 0 }} />
        </button>
        {!researchOpen && activeResearch && !collapsed && (
          <p className="t-caption" style={{ color: 'var(--amber)', padding: '0 16px 12px', margin: 0 }}>
            Current page: {activeResearch.label}
          </p>
        )}
        <div id={researchId} hidden={!researchOpen}>
          {researchOpen && RESEARCH_ROUTES.map(renderRoute)}
        </div>
      </section>
      <section aria-label="Help" data-nav-group="help" style={{ borderTop: '1px solid var(--line-1)' }}>
        <GroupHeading collapsed={collapsed}>Help</GroupHeading>
        {HELP_ROUTES.map(renderRoute)}
      </section>
    </>
  );
}

function GroupHeading({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return (
    <h2
      className={collapsed ? 'sr-only' : 't-label text-3'}
      style={collapsed ? undefined : { padding: '12px 16px 4px', margin: 0 }}
    >
      {children}
    </h2>
  );
}
