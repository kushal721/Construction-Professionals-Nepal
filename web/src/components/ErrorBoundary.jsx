import { Component } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

// Last-resort fallback so a render crash shows a message instead of a blank page.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-4 text-ink">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-soft">
            The page hit an unexpected error. Reloading usually fixes it. If it keeps happening, please contact us.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-muted p-3 text-left text-xs text-danger">
              {String(error?.stack || error)}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-ink hover:bg-brand-strong"
          >
            <RotateCw className="h-4 w-4" aria-hidden /> Reload page
          </button>
        </div>
      </div>
    );
  }
}
