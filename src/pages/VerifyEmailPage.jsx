import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { usersAPI } from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de verificación no proporcionado');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const result = await usersAPI.verifyEmail(token);
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Error al verificar el correo');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    
    setResendStatus('sending');
    try {
      await usersAPI.resendVerification(resendEmail);
      setResendStatus('sent');
    } catch (error) {
      setResendStatus('error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="spin" style={{ color: 'var(--color-celeste)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verificando tu correo...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Por favor espera un momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} style={{ color: '#22c55e', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#22c55e' }}>¡Correo Verificado!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {message}. Ya puedes iniciar sesión y disfrutar de todos los beneficios de PRICOM.
            </p>
            <Link to="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-celeste)',
              color: '#fff',
              padding: '0.875rem 2rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.95rem'
            }}>
              Ir al Inicio
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#ef4444' }}>Error de Verificación</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {message}
            </p>
            
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <Mail size={24} style={{ color: 'var(--color-celeste)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>¿No recibiste el correo?</h3>
              <form onSubmit={handleResendVerification} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="form-input"
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={resendStatus === 'sending'}
                >
                  {resendStatus === 'sending' ? 'Enviando...' : 'Reenviar Correo de Verificación'}
                </button>
                {resendStatus === 'sent' && (
                  <p style={{ color: '#22c55e', fontSize: '0.85rem' }}>Correo reenviado. Revisa tu bandeja de entrada.</p>
                )}
                {resendStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>Error al reenviar. Intenta más tarde.</p>
                )}
              </form>
            </div>
            
            <Link to="/" style={{
              color: 'var(--color-celeste)',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Volver al Inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}