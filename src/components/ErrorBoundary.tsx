import React, { ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  isDark?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  declare state: State;
  declare props: Readonly<Props> & Readonly<{ children?: React.ReactNode }>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const isDark = this.props.isDark ?? true;

    if (hasError) {
      return (
        <div className={`min-h-[60vh] flex flex-col items-center justify-center p-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-black mb-4 tracking-tight">Oops! Something broke.</h1>

          <p className={`max-w-md text-sm leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            We encountered an unexpected error while rendering this page. Your data is safe — try reloading or heading back home.
          </p>

          {error && (
            <div className={`max-w-xl w-full p-5 rounded-xl text-left mb-8 overflow-auto text-xs font-mono border ${isDark ? 'bg-black border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {error.toString()}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
            <a
              href="/"
              className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest rounded-xl border transition-all ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              <Home className="w-4 h-4" />
              Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export const ErrorBoundary: React.FC<Props> = ({ children, isDark }) => (
  <ErrorBoundaryClass isDark={isDark}>{children}</ErrorBoundaryClass>
);
