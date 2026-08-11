import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches render-time errors in the component tree below it and shows a
 * recoverable fallback instead of a blank white screen (React unmounts the
 * whole tree on an uncaught render error otherwise).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-2xl text-primary">Something broke</h1>
          <p className="max-w-md text-sm text-muted">
            This part of the app hit an unexpected error. Reloading usually fixes it — your saved
            jams and login are unaffected.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-primary px-4 py-2 font-semibold text-black"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
