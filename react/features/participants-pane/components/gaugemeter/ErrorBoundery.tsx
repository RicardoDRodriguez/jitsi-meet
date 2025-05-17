import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro no componente:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Erro ao carregar o componente.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;