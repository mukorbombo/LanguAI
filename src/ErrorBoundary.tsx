import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">React Rendering Error</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
          <pre className="whitespace-pre-wrap mt-4 text-sm">{this.state.error?.stack}</pre>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
