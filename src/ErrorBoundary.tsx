import { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  t: (key: string) => string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div style={{
          padding: '2.5rem',
          background: 'white',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '1.25rem' }}>
            ⚠️ {t('ErrorBoundary.title')}
          </h1>
          <div style={{
            background: '#ffebee',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            border: '0.125rem solid #d32f2f'
          }}>
            <h2 style={{ marginBottom: '0.625rem' }}>{t('ErrorBoundary.errorMessage')}</h2>
            <pre style={{
              background: 'white',
              padding: '0.9375rem',
              borderRadius: '0.25rem',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {this.state.error?.toString()}
            </pre>
          </div>
          {this.state.errorInfo && (
            <div style={{
              background: '#f5f5f5',
              padding: '1.25rem',
              borderRadius: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <h2 style={{ marginBottom: '0.625rem' }}>{t('ErrorBoundary.stackTrace')}</h2>
              <pre style={{
                background: 'white',
                padding: '0.9375rem',
                borderRadius: '0.25rem',
                overflow: 'auto',
                fontSize: '0.75rem',
                maxHeight: '25rem'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🔄 {t('ErrorBoundary.reload')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
