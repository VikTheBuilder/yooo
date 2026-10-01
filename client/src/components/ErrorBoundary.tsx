import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CampusSwap render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12">
          <section className="glass w-full max-w-md p-8 text-center border border-red-400/20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-400/10 text-red-300 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <h1 className="text-xl font-bold text-white">Something went wrong</h1>
            <p className="mt-2 mb-6 text-sm text-slate-400">The page hit an unexpected error. Reload to continue.</p>
            <button type="button" onClick={() => window.location.reload()} className="btn-primary">
              <RefreshCw size={15} /> Reload CampusSwap
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
