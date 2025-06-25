
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚨 Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="reset-button"
              >
                Try Again
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: #f8f9fa;
              border-radius: 8px;
              margin: 1rem;
            }

            .error-content {
              text-align: center;
              max-width: 500px;
            }

            .error-content h2 {
              color: #dc3545;
              margin-bottom: 1rem;
            }

            .error-content p {
              color: #6c757d;
              margin-bottom: 2rem;
            }

            .error-details {
              text-align: left;
              margin: 1rem 0;
              padding: 1rem;
              background: #f1f3f4;
              border-radius: 4px;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              font-family: monospace;
              font-size: 0.8rem;
              white-space: pre-wrap;
              overflow-x: auto;
              max-height: 200px;
              overflow-y: auto;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }

            .retry-button,
            .reset-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: background-color 0.2s;
            }

            .retry-button {
              background: #007bff;
              color: white;
            }

            .retry-button:hover {
              background: #0056b3;
            }

            .reset-button {
              background: #6c757d;
              color: white;
            }

            .reset-button:hover {
              background: #545b62;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
