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
        <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FFF8E7]">
          <section className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] w-full max-w-md p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#FF6B9D] border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
              <AlertTriangle size={22} className="text-black" />
            </div>
            <h1 className="text-xl font-black text-black uppercase">Something went wrong</h1>
            <p className="mt-2 mb-6 text-sm text-black/60 font-medium normal-case">The page hit an unexpected error. Reload to continue.</p>
            <button type="button" onClick={() => window.location.reload()} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw size={15} /> Reload CampusSwap
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
