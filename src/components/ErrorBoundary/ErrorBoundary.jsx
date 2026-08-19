import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PRICOM ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '480px',
            textAlign: 'center',
            padding: '3rem 2rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <AlertTriangle size={56} color="var(--color-warning)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Algo salió mal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Ha ocurrido un error inesperado en la aplicación. Puedes intentar recargar la página o volver al inicio.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={this.handleReload} className="btn btn-primary">
                <RefreshCw size={16} />
                <span>Recargar Página</span>
              </button>
              <button onClick={this.handleReset} className="btn btn-outline">
                <span>Volver al Inicio</span>
              </button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Detalles del error (para desarrollo)
                </summary>
                <pre style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-danger)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.5rem',
                  overflow: 'auto',
                  maxHeight: '150px',
                }}>
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
