import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DiagnosticPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const { t } = useTranslation();

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        environment: 'unknown',
        nodeIntegration: false,
        databaseAvailable: false,
        error: null,
      };

      // Check environment
      if (typeof window !== 'undefined') {
        results.environment = 'browser/electron';
        results.nodeIntegration = typeof process !== 'undefined';
      }

      // Try to initialize database
      try {
        const { initializeDatabase } = await import('./database/connection');
        await initializeDatabase();
        results.databaseAvailable = true;
      } catch (err) {
        results.databaseAvailable = false;
        results.error = err instanceof Error ? {
          message: err.message,
          stack: err.stack,
        } : String(err);
      }

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{
      padding: '2.5rem',
      background: 'white',
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ marginBottom: '1.875rem', color: '#1976d2' }}>
        🔍 {t('DiagnosticPage.title')}
      </h1>

      <div style={{
        background: '#f5f5f5',
        padding: '1.25rem',
        borderRadius: '0.5rem',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{ marginBottom: '0.9375rem' }}>{t('DiagnosticPage.environment')}</h2>
        <pre style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </div>

      {diagnostics.error && (
        <div style={{
          background: '#ffebee',
          padding: '1.25rem',
          borderRadius: '0.5rem',
          border: '0.125rem solid #d32f2f'
        }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '0.9375rem' }}>
            ⚠️ {t('DiagnosticPage.errorDetected')}
          </h2>
          <pre style={{
            fontSize: '0.75rem',
            lineHeight: '1.4',
            overflow: 'auto',
            maxHeight: '25rem'
          }}>
            {JSON.stringify(diagnostics.error, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '1.875rem' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '0.625rem'
          }}
        >
          🔄 {t('DiagnosticPage.reload')}
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          🏠 {t('DiagnosticPage.goToApp')}
        </button>
      </div>
    </div>
  );
};

export default DiagnosticPage;
