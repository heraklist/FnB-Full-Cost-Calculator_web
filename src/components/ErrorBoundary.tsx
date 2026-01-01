import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child component tree.
 * Displays a user-friendly error UI in Greek, matching the app's dark theme.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f1a',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            background: '#16213e',
            border: '1px solid #1f4068',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#e2e8f0', marginBottom: '16px', margin: '0 0 16px 0' }}>
              Κάτι πήγε στραβά
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', margin: '0 0 24px 0' }}>
              Η εφαρμογή αντιμετώπισε ένα απροσδόκητο σφάλμα.
            </p>
            {this.state.error && (
              <details style={{
                marginBottom: '24px',
                textAlign: 'left',
                background: '#0f0f1a',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#e53e3e'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px', color: '#e2e8f0' }}>
                  Τεχνικές Λεπτομέρειες
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              🔄 Επαναφόρτωση Εφαρμογής
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
