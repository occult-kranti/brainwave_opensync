import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { SessionProvider } from './ui/session/SessionContext';
import { AppShell } from './ui/layout/AppShell';
import { ErrorBoundary } from './ui/components/ErrorBoundary';
import { ROUTES } from './app/routes';

/** Dim in-shell fallback while a route chunk loads (motion: led-pulse token). */
function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="route-loading font-mono2"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        fontSize: 11,
        letterSpacing: '0.2em',
        color: 'var(--amber-dim, var(--text-3))',
      }}
    >
      LOADING…
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppShell>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {ROUTES.map(({ path, component: Page }) => (
                <Route key={path} path={path} element={<Page />} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppShell>
    </SessionProvider>
  );
}
