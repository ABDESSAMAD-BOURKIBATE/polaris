import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl" />
                    </div>

                    <div className="glass-panel p-8 max-w-lg w-full relative z-10 border-red-500/20 glow-critical">
                        <div className="flex flex-col items-center text-center space-y-6">

                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white text-glow">System Error Detected</h1>
                                <p className="text-slate-400">
                                    The dashboard encountered an unexpected exception and secured the session.
                                </p>
                            </div>

                            {this.state.error && (
                                <div className="w-full bg-slate-900/50 p-4 rounded border border-slate-800 text-left overflow-auto max-h-32 custom-scrollbar">
                                    <code className="text-xs font-mono-cyber text-red-400 whitespace-pre-wrap">
                                        {this.state.error.message}
                                    </code>
                                </div>
                            )}

                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 group"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
                                <span>Initialize Recovery</span>
                            </button>

                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
