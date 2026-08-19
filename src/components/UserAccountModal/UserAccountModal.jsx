import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Package, MapPin, Bell, Shield, LogOut, X, Check, Eye } from 'lucide-react';

export default function UserAccountModal() {
  const { activeModal, setActiveModal, user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'pedidos' | 'direcciones' | 'notificaciones'

  if (activeModal !== 'auth') return null;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    showToast('Perfil Actualizado', 'Tus datos fueron guardados con éxito.', 'success');
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Mi cuenta">
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={22} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.25rem' }}>Mi Cuenta PRICOM</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Account Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '400px' }}>
          {/* Sidebar Nav */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem 1rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                  <input type="email" className="form-input" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input type="tel" className="form-input" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">NIT o Carnet (Facturación)</label>
                  <input type="text" className="form-input" value={user.nit} onChange={(e) => setUser({ ...user, nit: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
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
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{user.address}, {user.city}</p>
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
