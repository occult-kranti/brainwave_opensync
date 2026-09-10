/**
 * Route-level error boundary. A render throw inside a lazy page used to blank
 * the whole app (no boundary anywhere); now the shell — and the panic button —
 * stay up, and the workspace shows a recoverable panel instead.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional reset hook (e.g., navigate home) — the boundary clears its own state too. */
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep it visible in devtools; there is no telemetry in this app by design.
    console.error('[open-sync] route error', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div
        role="alert"
        data-testid="error-boundary"
        className="panel"
        style={{ margin: 24, padding: 24, borderLeft: '2px solid var(--danger)', maxWidth: 720 }}
      >
        <div className="t-label" style={{ color: 'var(--danger-hi)', marginBottom: 8 }}>
          THIS SCREEN CRASHED
        </div>
        <p className="t-body" style={{ color: 'var(--text-2)', marginBottom: 12 }}>
          The rest of the app — including the panic button — is still running. Audio was not
          touched by this error.
        </p>
        <pre
          className="font-mono2"
          style={{
            fontSize: 11,
            color: 'var(--text-3)',
            whiteSpace: 'pre-wrap',
            marginBottom: 16,
            maxHeight: 160,
            overflow: 'auto',
          }}
        >
          {error.name}: {error.message}
        </pre>
        <div className="flex gap-2">
          <button type="button" className="btn-amber" onClick={this.reset}>
            TRY AGAIN
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => {
              window.location.hash = '';
              window.location.assign(import.meta.env.BASE_URL);
            }}
          >
            RELOAD APP
          </button>
        </div>
      </div>
    );
  }
}
