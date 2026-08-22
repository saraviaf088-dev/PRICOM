import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usersAPI } from '../../api';
import { User, Package, MapPin, Bell, Shield, LogOut, X, Check, Eye, Mail, Lock, UserPlus, LogIn, ArrowLeft } from 'lucide-react';

export default function UserAccountModal() {
  const { activeModal, setActiveModal, user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('perfil');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot-password' | 'pending-verification'
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  if (activeModal !== 'auth') return null;

  const isLoggedIn = user && user.email;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await usersAPI.login(loginEmail, loginPassword);
      
      localStorage.setItem('pricom_user_token', result.token);
      setUser(result.user);
      showToast('Bienvenido', `Hola ${result.user.name}, has iniciado sesión correctamente.`, 'success');
      setActiveModal(null);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      if (error.message.includes('no verificado')) {
        setPendingEmail(loginEmail);
        setAuthView('pending-verification');
        showToast('Correo no verificado', 'Revisa tu bandeja de entrada para verificar tu correo.', 'warning');
      } else {
        showToast('Error', error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      showToast('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }
    
    if (registerPassword.length < 6) {
      showToast('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await usersAPI.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone
      });
      
      setPendingEmail(registerEmail);
      setAuthView('pending-verification');
      showToast('Cuenta creada', 'Se ha enviado un correo de verificación a tu dirección de email.', 'success');
      
      // Clear form
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterPhone('');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await usersAPI.forgotPassword(forgotEmail);
      showToast('Correo enviado', 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
      setAuthView('login');
      setForgotEmail('');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await usersAPI.resendVerification(pendingEmail);
      showToast('Correo reenviado', 'Revisa tu bandeja de entrada.', 'success');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pricom_user_token');
    setUser({ name: '', email: '', phone: '', nit: '', orders: [], address: '', city: '' });
    setActiveTab('perfil');
    setAuthView('login');
    showToast('Sesión cerrada', 'Has cerrado sesión correctamente.', 'info');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await usersAPI.updateProfile({
        name: user.name,
        phone: user.phone,
        nit: user.nit
      });
      
      setUser(result.user);
      showToast('Perfil Actualizado', 'Tus datos fueron guardados con éxito.', 'success');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth views (not logged in)
  if (!isLoggedIn) {
    return (
      <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Mi cuenta">
        <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={22} color="var(--color-celeste)" />
              <h3 style={{ fontSize: '1.25rem' }}>
                {authView === 'login' && 'Iniciar Sesión'}
                {authView === 'register' && 'Crear Cuenta'}
                {authView === 'forgot-password' && 'Recuperar Contraseña'}
                {authView === 'pending-verification' && 'Verifica tu Correo'}
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)} className="btn-icon">
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Login View */}
            {authView === 'login' && (
              <form onSubmit={handleLogin}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <LogIn size={40} style={{ color: 'var(--color-celeste)', margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Ingresa a tu cuenta para acceder a tus pedidos y favoritos
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="tu@correo.com"
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type={showLoginPassword ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      placeholder="••••••••"
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
                
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => setAuthView('forgot-password')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-celeste)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                
                <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>¿No tienes cuenta? </span>
                  <button 
                    type="button" 
                    onClick={() => setAuthView('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-celeste)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                  >
                    Crear cuenta
                  </button>
                </div>
              </form>
            )}

            {/* Register View */}
            {authView === 'register' && (
              <form onSubmit={handleRegister}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <UserPlus size={40} style={{ color: 'var(--color-celeste)', margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Crea tu cuenta para hacer pedidos y guardar tus favoritos
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="Juan Pérez"
                      value={registerName} 
                      onChange={(e) => setRegisterName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="tu@correo.com"
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="79123456"
                    value={registerPhone} 
                    onChange={(e) => setRegisterPhone(e.target.value)} 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type={showRegisterPassword ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="Repite tu contraseña"
                      value={registerConfirmPassword} 
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
                
                <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>¿Ya tienes cuenta? </span>
                  <button 
                    type="button" 
                    onClick={() => setAuthView('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-celeste)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
                  >
                    Iniciar sesión
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password View */}
            {authView === 'forgot-password' && (
              <form onSubmit={handleForgotPassword}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <Mail size={40} style={{ color: 'var(--color-celeste)', margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="tu@correo.com"
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
                
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => setAuthView('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-celeste)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
                  >
                    <ArrowLeft size={14} />
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}

            {/* Pending Verification View */}
            {authView === 'pending-verification' && (
              <div style={{ textAlign: 'center' }}>
                <Mail size={64} style={{ color: 'var(--color-celeste)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Verifica tu correo electrónico</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Hemos enviado un correo de verificación a <strong>{pendingEmail}</strong>. 
                  Haz clic en el enlace del correo para activar tu cuenta.
                </p>
                
                <div style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem', 
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>¿No recibiste el correo?</p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    <li>Revisa tu carpeta de spam o correo no deseado</li>
                    <li>Verifica que la dirección sea correcta</li>
                  </ul>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  {isLoading ? 'Reenviando...' : 'Reenviar Correo de Verificación'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setAuthView('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-celeste)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Logged in views
  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Mi cuenta">
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={22} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.25rem' }}>Mi Cuenta PRICOM</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={14} />
              <span>Salir</span>
            </button>
            <button onClick={() => setActiveModal(null)} className="btn-icon">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Account Body */}
        <div className="account-body-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '400px' }}>
          {/* Sidebar Nav */}
          <div className="account-sidebar" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem 1rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'perfil' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('perfil')}
            >
              <User size={14} />
              <span>Mi Perfil</span>
            </button>

            <button 
              className={`btn btn-sm ${activeTab === 'pedidos' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('pedidos')}
            >
              <Package size={14} />
              <span>Mis Pedidos</span>
            </button>

            <button 
              className={`btn btn-sm ${activeTab === 'direcciones' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('direcciones')}
            >
              <MapPin size={14} />
              <span>Direcciones</span>
            </button>

            <button 
              className={`btn btn-sm ${activeTab === 'notificaciones' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
              onClick={() => setActiveTab('notificaciones')}
            >
              <Bell size={14} />
              <span>Notificaciones</span>
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {activeTab === 'perfil' && (
              <form onSubmit={handleUpdateProfile}>
                <h4 style={{ marginBottom: '1.25rem' }}>Información Personal</h4>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-input" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-input" value={user.email} disabled style={{ opacity: 0.7 }} />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>El correo no se puede cambiar</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input type="tel" className="form-input" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">NIT o Carnet (Facturación)</label>
                  <input type="text" className="form-input" value={user.nit} onChange={(e) => setUser({ ...user, nit: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {activeTab === 'pedidos' && (
              <div>
                <h4 style={{ marginBottom: '1.25rem' }}>Historial de Pedidos</h4>
                {user.orders && user.orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {user.orders.map(order => (
                      <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700' }}>Pedido #{order.id}</span>
                          <span className="badge badge-celeste">{order.status}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Fecha: {order.date} • Total: <strong>Bs. {order.total.toLocaleString('es-BO')}</strong>
                        </div>
                        <div style={{ fontSize: '0.82rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>Aún no tienes pedidos registrados.</p>
                )}
              </div>
            )}

            {activeTab === 'direcciones' && (
              <div>
                <h4 style={{ marginBottom: '1.25rem' }}>Direcciones Guardadas en Bolivia</h4>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Casa Principal (Santa Cruz)</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{user.address || 'Sin dirección'}, {user.city || 'Santa Cruz'}</p>
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div>
                <h4 style={{ marginBottom: '1.25rem' }}>Centro de Notificaciones</h4>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-celeste)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                    ¡Nueva Colección Sealy 2026!
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Ya están disponibles los modelos convertibles Kennedy y Monterey con hasta 50% de descuento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}