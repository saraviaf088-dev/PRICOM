import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Plus, Trash2, Edit3, Save, X, DollarSign, Package, 
  MessageCircle, BarChart3, Lock, LogOut, Eye, EyeOff 
} from 'lucide-react';

export default function AdminModal() {
  const { 
    activeModal, setActiveModal, 
    products, adminAddProduct, adminUpdateProduct, adminDeleteProduct, 
    isAdminAuth, adminLogin, adminLogout,
    showToast 
  } = useApp();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProd, setNewProd] = useState({
    id: '',
    name: '',
    brand: 'Sealy',
    category: 'Sofás',
    subCategory: 'Sofás de 3 Cuerpos',
    price: 9000,
    originalPrice: 15000,
    discount: 40,
    isOffer: true,
    isNew: true,
    rating: 5.0,
    reviewCount: 1,
    images: ['/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg'],
    material: 'Microfibra y Espuma Sealy',
    shortDescription: 'Sofá de diseño de alta gama con garantía oficial.',
    fullDescription: 'Descripción completa del modelo.',
    warranty: '5 Años Oficial',
    availability: 'En Stock',
    stockCount: 5,
    locations: ['Santa Cruz', 'La Paz']
  });

  if (activeModal !== 'admin') return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const success = adminLogin(loginForm.username, loginForm.password);
    if (success) {
      setLoginForm({ username: '', password: '' });
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const id = `custom-${Date.now()}`;
    const slug = newProd.name.toLowerCase().replace(/ /g, '-');
    adminAddProduct({ ...newProd, id, slug });
    setIsCreating(false);
  };

  const handleUpdatePriceStock = (prod, newPrice, newStock) => {
    adminUpdateProduct({
      ...prod,
      price: Number(newPrice),
      stockCount: Number(newStock)
    });
  };

  // ── Login Screen ──
  if (!isAdminAuth) {
    return (
      <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Acceso administrador">
        <div className="modal-container" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={22} color="var(--color-celeste)" />
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Acceso Administrador</h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ color: '#fff' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Ingresa tus credenciales de administrador para acceder al panel de gestión.
            </p>

            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input 
                type="text" 
                className="form-input" 
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Ej: admin"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="form-input" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Ingresa tu contraseña"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Lock size={16} />
              <span>Iniciar Sesión</span>
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              Demo: usuario <strong>admin</strong> / contraseña <strong>pricom2026</strong>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-container" style={{ maxWidth: '1050px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LayoutDashboard size={22} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Panel de Administración PRICOM</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={adminLogout}
              className="btn btn-outline btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
            <button onClick={() => setActiveModal(null)} style={{ color: '#fff' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Productos en Catálogo</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-celeste)' }}>{products.length}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Ofertas Activas</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-danger)' }}>{products.filter(p => p.isOffer).length}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Consultas WhatsApp / Mes</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-whatsapp)' }}>148</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Ventas Registradas</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>Bs. 184.200</div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1.15rem' }}>Gestión de Catálogo de Productos</h4>
          <button className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            <span>Añadir Nuevo Producto</span>
          </button>
        </div>

        {/* Create Form Modal */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} style={{ padding: '1.5rem', margin: '0 1.5rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-celeste)' }}>
            <h5 style={{ fontWeight: '700', marginBottom: '1rem' }}>Crear Nuevo Producto</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto</label>
                <input type="text" className="form-input" required value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} placeholder="Ej: Sealy Master Living" />
              </div>
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input type="text" className="form-input" value={newProd.brand} onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-select" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}>
                  <option value="Sofás">Sofás</option>
                  <option value="Sofás Cama">Sofás Cama</option>
                  <option value="Sillones">Sillones</option>
                  <option value="Reclinables">Reclinables</option>
                  <option value="Juegos de Sala">Juegos de Sala</option>
                  <option value="Mesas">Mesas</option>
                  <option value="Decoración">Decoración</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Precio en Bolivianos (Bs.)</label>
                <input type="number" className="form-input" required value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock en Bolivia</label>
                <input type="number" className="form-input" required value={newProd.stockCount} onChange={(e) => setNewProd({ ...newProd, stockCount: Number(e.target.value) })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Guardar Producto</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreating(false)}>Cancelar</button>
            </div>
          </form>
        )}

        {/* Product Table */}
        <div style={{ padding: '0 1.5rem 2rem', overflowX: 'auto' }}>
          <table className="comparator-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Marca / Cat</th>
                <th>Precio (Bs.)</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ width: '60px' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ fontWeight: '700' }}>{p.name}</td>
                  <td>{p.brand} - {p.category}</td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={p.price} 
                      className="price-input-box" 
                      style={{ width: '110px' }}
                      onBlur={(e) => handleUpdatePriceStock(p, e.target.value, p.stockCount)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={p.stockCount} 
                      className="price-input-box" 
                      style={{ width: '70px' }}
                      onBlur={(e) => handleUpdatePriceStock(p, p.price, e.target.value)}
                    />
                  </td>
                  <td>
                    <button 
                      onClick={() => adminDeleteProduct(p.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      title="Eliminar producto"
                      aria-label={`Eliminar ${p.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
