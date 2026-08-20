import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { usersAPI } from '../api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus('error');
      setMessage('Token de restablecimiento no válido o faltante.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const result = await usersAPI.resetPassword(token, newPassword);
      setStatus('success');
      setMessage(result.message || 'Tu contraseña ha sido actualizada exitosamente.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              backgroundColor: 'rgba(0, 158, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Lock size={28} color="var(--color-celeste)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Nueva Contraseña
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Ingresa tu nueva contraseña para acceder a tu cuenta de PRICOM.
            </p>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={54} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#22c55e', marginBottom: '0.5rem' }}>¡Contraseña Actualizada!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {message}
              </p>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/')}
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {status === 'error' && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{message}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Nueva Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)',
                      background: 'none', border: 'none', cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Actualizar Contraseña</span>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-celeste)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
