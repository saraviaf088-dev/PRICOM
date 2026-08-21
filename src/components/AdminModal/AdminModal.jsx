import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Plus, Trash2, Edit3, Save, X, DollarSign, Package, 
  MessageCircle, BarChart3, Lock, LogOut, Eye, EyeOff, ShoppingBag, 
  Clock, CheckCircle, Truck, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Image,
  Settings, Shield
} from 'lucide-react';

const ProductForm = React.memo(({ product, onChange, onSubmit, onCancel, title, isSaving }) => (
  <form onSubmit={onSubmit} style={{ padding: '1.5rem', margin: '0 1.5rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-celeste)', maxHeight: '70vh', overflowY: 'auto' }}>
    <h5 style={{ fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Package size={18} />
      {title}
    </h5>
    
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Información Básica</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input type="text" className="form-input" required value={product.name} onChange={(e) => onChange({ ...product, name: e.target.value })} placeholder="Ej: Sealy Monterey" />
        </div>
        <div className="form-group">
          <label className="form-label">Marca</label>
          <input type="text" className="form-input" value={product.brand} onChange={(e) => onChange({ ...product, brand: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select className="form-select" value={product.category} onChange={(e) => onChange({ ...product, category: e.target.value })}>
            <option value="Sofás Cama">Sofás Cama</option>
            <option value="Reclinables">Reclinables</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Subcategoría</label>
          <input type="text" className="form-input" value={product.subCategory} onChange={(e) => onChange({ ...product, subCategory: e.target.value })} placeholder="Ej: Sofás Cama Queen" />
        </div>
        <div className="form-group">
          <label className="form-label">Material</label>
          <input type="text" className="form-input" value={product.material} onChange={(e) => onChange({ ...product, material: e.target.value })} placeholder="Ej: Microfibra Premium" />
        </div>
        <div className="form-group">
          <label className="form-label">Estilo</label>
          <input type="text" className="form-input" value={product.style} onChange={(e) => onChange({ ...product, style: e.target.value })} placeholder="Ej: Contemporáneo" />
        </div>
      </div>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Precios y Stock</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Precio (Bs.) *</label>
          <input type="number" className="form-input" required value={product.price} onChange={(e) => onChange({ ...product, price: Number(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">Precio Original (Bs.)</label>
          <input type="number" className="form-input" value={product.originalPrice} onChange={(e) => onChange({ ...product, originalPrice: Number(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">Descuento (%)</label>
          <input type="number" className="form-input" value={product.discount} onChange={(e) => onChange({ ...product, discount: Number(e.target.value) || 0 })} />
        </div>
        <div className="form-group">
          <label className="form-label">Stock *</label>
          <input type="number" className="form-input" required value={product.stockCount} onChange={(e) => onChange({ ...product, stockCount: Number(e.target.value) || 0 })} />
        </div>
      </div>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Imagen</div>
      <div className="form-group">
        <label className="form-label">URL de la imagen principal</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Image size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" value={product.images?.[0] || ''} onChange={(e) => onChange({ ...product, images: [e.target.value, ...(product.images || []).slice(1)] })} placeholder="/images/RUTA/1.jpg o https://..." style={{ flex: 1 }} />
        </div>
        {product.images?.[0] && (
          <img src={product.images[0]} alt="Preview" style={{ marginTop: '0.5rem', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
        )}
      </div>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Descripciones</div>
      <div className="form-group">
        <label className="form-label">Descripción Corta</label>
        <input type="text" className="form-input" value={product.shortDescription} onChange={(e) => onChange({ ...product, shortDescription: e.target.value })} placeholder="Una línea descripción del producto" />
      </div>
      <div className="form-group">
        <label className="form-label">Descripción Completa</label>
        <textarea className="form-input" rows={3} value={product.fullDescription} onChange={(e) => onChange({ ...product, fullDescription: e.target.value })} placeholder="Descripción detallada del producto..." style={{ resize: 'vertical' }} />
      </div>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Estado y Badges</div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
          <input type="checkbox" checked={product.isOffer} onChange={(e) => onChange({ ...product, isOffer: e.target.checked })} />
          En Oferta
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
          <input type="checkbox" checked={product.isNew} onChange={(e) => onChange({ ...product, isNew: e.target.checked })} />
          Nuevo
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem' }}>
          <input type="checkbox" checked={product.isFeatured} onChange={(e) => onChange({ ...product, isFeatured: e.target.checked })} />
          Destacado
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', color: product.isHidden ? 'var(--color-danger)' : undefined }}>
          <input type="checkbox" checked={product.isHidden || false} onChange={(e) => onChange({ ...product, isHidden: e.target.checked })} />
          Oculto
        </label>
      </div>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Garantía</label>
          <input type="text" className="form-input" value={product.warranty} onChange={(e) => onChange({ ...product, warranty: e.target.value })} placeholder="Ej: 5 Años Oficial" />
        </div>
        <div className="form-group">
          <label className="form-label">Disponibilidad</label>
          <select className="form-select" value={product.availability} onChange={(e) => onChange({ ...product, availability: e.target.value })}>
            <option value="En Stock">En Stock</option>
            <option value="Pre-orden">Pre-orden</option>
            <option value="Agotado">Agotado</option>
            <option value="Disponible bajo pedido">Disponible bajo pedido</option>
          </select>
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
      <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
        <Save size={14} />
        {isSaving ? 'Guardando...' : title.includes('Crear') ? 'Crear Producto' : 'Guardar Cambios'}
      </button>
      <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={isSaving}>
        <X size={14} />
        Cancelar
      </button>
    </div>
  </form>
));

export default function AdminModal({ fullPage = false }) {
  const { 
    activeModal, setActiveModal, 
    products, adminAddProduct, adminUpdateProduct, adminDeleteProduct, 
    isAdminAuth, adminLogin, adminLogout, changeAdminCredentials,
    adminStats, adminOrders, fetchAdminStats, fetchAdminOrders, updateOrderStatus,
    syncProductsToServer,
    showToast 
  } = useApp();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [credForm, setCredForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
  const [showCredPasswords, setShowCredPasswords] = useState({ current: false, newPass: false });

  const [newProd, setNewProd] = useState({
    id: '',
    name: '',
    brand: 'Sealy',
    category: 'Sofás Cama',
    subCategory: 'Sofás Cama Queen',
    price: 9000,
    originalPrice: 15000,
    discount: 40,
    isOffer: true,
    isNew: true,
    isFeatured: false,
    rating: 5.0,
    reviewCount: 1,
    images: ['/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg'],
    colors: [{ name: 'Estándar', hex: '#888888', active: true }],
    material: 'Microfibra y Espuma Sealy',
    style: 'Contemporáneo',
    shortDescription: 'Sofá de diseño de alta gama con garantía oficial.',
    fullDescription: 'Descripción completa del modelo.',
    features: ['Característica principal'],
    specs: [{ label: 'Marca', value: 'Sealy' }],
    warranty: '5 Años Oficial',
    availability: 'En Stock',
    stockCount: 5,
    locations: ['Santa Cruz', 'La Paz']
  });

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAdminStats(), fetchAdminOrders()]);
    setLoading(false);
  }, [fetchAdminStats, fetchAdminOrders]);

  useEffect(() => {
    if (isAdminAuth && activeModal === 'admin') {
      loadDashboardData();
    }
  }, [isAdminAuth, activeModal, loadDashboardData]);

  if (!fullPage && activeModal !== 'admin') return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await adminLogin(loginForm.username, loginForm.password);
    if (success) {
      setLoginForm({ username: '', password: '' });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const id = `custom-${Date.now()}`;
      const slug = newProd.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      const created = await adminAddProduct({ ...newProd, id, slug });
      if (created) {
        setIsCreating(false);
        setNewProd({
          id: '', name: '', brand: 'Sealy', category: 'Sofás Cama', subCategory: 'Sofás Cama Queen',
          price: 9000, originalPrice: 15000, discount: 40, isOffer: true, isNew: true, isFeatured: false,
          rating: 5.0, reviewCount: 1, images: ['/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg'],
          colors: [{ name: 'Estándar', hex: '#888888', active: true }],
          material: 'Microfibra y Espuma Sealy', style: 'Contemporáneo',
          shortDescription: 'Sofá de diseño de alta gama con garantía oficial.',
          fullDescription: 'Descripción completa del modelo.',
          features: ['Característica principal'],
          specs: [{ label: 'Marca', value: 'Sealy' }],
          warranty: '5 Años Oficial', availability: 'En Stock', stockCount: 5,
          locations: ['Santa Cruz', 'La Paz']
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const productName = editingProduct.name;
      await adminUpdateProduct(editingProduct);
      setEditingProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePriceStock = (prod, newPrice, newStock) => {
    const price = Number(newPrice);
    const stock = Number(newStock);
    if (isNaN(price) || isNaN(stock)) return;
    adminUpdateProduct({
      ...prod,
      price,
      stockCount: stock
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result) {
      await fetchAdminStats();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'var(--color-warning)',
      paid: 'var(--color-success)',
      processing: 'var(--color-celeste)',
      shipped: 'var(--color-azul-oscuro)',
      delivered: 'var(--color-success)',
      cancelled: 'var(--color-danger)',
    };
    return colors[status] || 'var(--text-muted)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      paid: 'Pagado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const filteredOrders = orderFilter === 'all' 
    ? adminOrders 
    : adminOrders.filter(o => o.orderStatus === orderFilter);

  // ── Login Screen ──
  if (!isAdminAuth) {
    const loginFormEl = (
      <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Ingresa tus credenciales de administrador para acceder al panel de gestión.
        </p>
        <div className="form-group">
          <label className="form-label">Usuario</label>
          <input type="text" className="form-input" value={loginForm.username} onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))} placeholder="Ingresa tu usuario" required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} className="form-input" value={loginForm.password} onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Ingresa tu contraseña" required style={{ paddingRight: '2.5rem' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
          <Lock size={16} />
          <span>Iniciar Sesión</span>
        </button>
      </form>
    );

    if (fullPage) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Lock size={22} color="var(--color-celeste)" />
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Acceso Administrador</h3>
              </div>
            </div>
            {loginFormEl}
          </div>
        </div>
      );
    }

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
          {loginFormEl}
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  const dashboardContent = (
    <>
      {/* Header */}
      <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff', borderRadius: fullPage ? 'var(--radius-md) var(--radius-md) 0 0' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LayoutDashboard size={22} color="var(--color-celeste)" />
          <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Panel de Administración PRICOM</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={loadDashboardData}
            className="btn btn-outline btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={adminLogout}
            className="btn btn-outline btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
          {!fullPage && (
            <button onClick={() => setActiveModal(null)} style={{ color: '#fff' }}>
              <X size={20} />
            </button>
          )}
          {fullPage && (
            <button onClick={() => window.close()} style={{ color: '#fff' }}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
            { id: 'products', label: 'Productos', icon: Package },
            { id: 'settings', label: 'Configuración', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '700',
                fontSize: '0.88rem',
                color: activeTab === tab.id ? 'var(--color-celeste)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-celeste)' : '2px solid transparent',
                backgroundColor: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Productos</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-celeste)' }}>{adminStats?.totalProducts || products.length}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Pedidos</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>{adminStats?.totalOrders || 0}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Ingresos Totales</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-success)' }}>Bs. {(adminStats?.totalRevenue || 0).toLocaleString('es-BO')}</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Stock Bajo</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: adminStats?.lowStockProducts > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {adminStats?.lowStockProducts || 0}
                </div>
              </div>
            </div>

            {/* Sync Button */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await syncProductsToServer();
                    alert('Productos sincronizados al servidor correctamente');
                  } catch (err) {
                    alert('Error al sincronizar: ' + err.message);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={16} />
                Sincronizar Productos al Servidor
              </button>
            </div>

            {/* Top Products */}
            {adminStats?.topProducts && adminStats.topProducts.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={16} />
                  Productos Más Vendidos
                </div>
                <div style={{ padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  <div>Producto</div><div style={{ textAlign: 'center' }}>Unidades</div><div style={{ textAlign: 'right' }}>Ingresos</div>
                </div>
                {adminStats.topProducts.map((p, i) => (
                  <div key={i} style={{ padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '600' }}>{p.name}</div>
                    <div style={{ textAlign: 'center' }}>{p.totalSold}</div>
                    <div style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-success)' }}>Bs. {p.revenue.toLocaleString('es-BO')}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '700' }}>
                Pedidos Recientes
              </div>
              {adminOrders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay pedidos registrados aún
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="comparator-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Nº Pedido</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOrders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: '700' }}>{order.orderNumber}</td>
                          <td>{order.customerName}</td>
                          <td style={{ fontWeight: '700', color: 'var(--color-azul-oscuro)' }}>Bs. {order.total.toLocaleString('es-BO')}</td>
                          <td>
                            <span style={{ 
                              padding: '0.25rem 0.65rem', 
                              borderRadius: 'var(--radius-full)', 
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: `${getStatusColor(order.orderStatus)}20`,
                              color: getStatusColor(order.orderStatus)
                            }}>
                              {getStatusLabel(order.orderStatus)}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {new Date(order.createdAt).toLocaleDateString('es-BO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.15rem' }}>Gestión de Pedidos</h4>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={orderFilter} 
                  onChange={(e) => setOrderFilter(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="paid">Pagados</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviados</option>
                  <option value="delivered">Entregados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
                <button onClick={loadDashboardData} className="btn btn-outline btn-sm">
                  <RefreshCw size={14} />
                  Actualizar
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No hay pedidos {orderFilter !== 'all' ? 'con este filtro' : 'registrados'}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="comparator-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}></th>
                      <th>Nº Pedido</th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Envío</th>
                      <th>Pago</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                            >
                              {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                          <td style={{ fontWeight: '700' }}>{order.orderNumber}</td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                          </td>
                          <td>{order.customerPhone}</td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {order.deliveryType === 'home' ? `🏠 ${order.city}` : `🏪 Showroom`}
                          </td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: 'var(--radius-sm)', 
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              backgroundColor: order.paymentStatus === 'completed' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                              color: order.paymentStatus === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
                            }}>
                              {order.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>
                            Bs. {order.total.toLocaleString('es-BO')}
                          </td>
                          <td>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                backgroundColor: 'var(--bg-surface)',
                                color: getStatusColor(order.orderStatus),
                              }}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="paid">Pagado</option>
                              <option value="processing">Procesando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              onClick={() => {
                                const items = order.items?.map(i => `- ${i.productName || i.product?.name} (x${i.quantity})`).join('%0A') || '';
                                const msg = `*PEDIDO ${order.orderNumber}*%0ACliente: ${order.customerName}%0ATel: ${order.customerPhone}%0ATotal: Bs. ${order.total}%0AEstado: ${getStatusLabel(order.orderStatus)}%0A%0AProductos:%0A${items}`;
                                window.open(`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}?text=${msg}`, '_blank');
                              }}
                              className="btn btn-outline btn-sm"
                              title="Contactar por WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </button>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr>
                            <td colSpan={9} style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                                <div>
                                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-celeste)' }}>Datos del Cliente</div>
                                  <div><strong>Nombre:</strong> {order.customerName}</div>
                                  <div><strong>Email:</strong> {order.customerEmail || 'No proporcionado'}</div>
                                  <div><strong>Teléfono:</strong> {order.customerPhone}</div>
                                  <div><strong>NIT:</strong> {order.customerNIT || 'No proporcionado'}</div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-celeste)' }}>Envío</div>
                                  <div><strong>Tipo:</strong> {order.deliveryType === 'home' ? 'Domicilio' : 'Showroom'}</div>
                                  <div><strong>Ciudad:</strong> {order.city || 'N/A'}</div>
                                  <div><strong>Dirección:</strong> {order.address || 'N/A'}</div>
                                  <div><strong>Referencia:</strong> {order.reference || 'N/A'}</div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-celeste)' }}>Productos</div>
                                  {order.items?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                      <span>{item.productName || item.product?.name} (x{item.quantity})</span>
                                      <span style={{ fontWeight: '700' }}>Bs. {((item.price || item.product?.price || 0) * item.quantity).toLocaleString('es-BO')}</span>
                                    </div>
                                  ))}
                                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                                    <span>Total:</span>
                                    <span style={{ color: 'var(--color-azul-oscuro)' }}>Bs. {order.total.toLocaleString('es-BO')}</span>
                                  </div>
                                </div>
                              </div>
                              {order.notes && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                                  <strong>Notas:</strong> {order.notes}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Action Bar */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.15rem' }}>Gestión de Catálogo ({products.length} productos)</h4>
              <button className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)}>
                <Plus size={16} />
                <span>Nuevo Producto</span>
              </button>
            </div>

            {/* Create Form */}
            {isCreating && (
              <ProductForm 
                product={newProd} 
                onChange={setNewProd} 
                onSubmit={handleCreateSubmit} 
                onCancel={() => setIsCreating(false)} 
                title="Crear Nuevo Producto"
                isSaving={isSaving}
              />
            )}

            {/* Edit Form */}
            {editingProduct && (
              <ProductForm 
                product={editingProduct} 
                onChange={setEditingProduct} 
                onSubmit={handleEditSubmit} 
                onCancel={() => setEditingProduct(null)} 
                title={`Editar: ${editingProduct.name}`}
                isSaving={isSaving}
              />
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
                        <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: '4px' }} />
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
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button 
                            onClick={() => setEditingProduct({ ...p })}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-celeste)', borderColor: 'var(--color-celeste)' }}
                            title="Editar producto"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`¿Eliminar "${p.name}"?`)) {
                                adminDeleteProduct(p.id);
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                            title="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              Seguridad y Credenciales
            </h4>

            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem', maxWidth: '500px' }}>
              <h5 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--color-celeste)' }}>Cambiar Usuario y/o Contraseña</h5>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Contraseña Actual (requerida)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCredPasswords.current ? 'text' : 'password'}
                    className="form-input"
                    value={credForm.currentPassword}
                    onChange={(e) => setCredForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Ingresa tu contraseña actual"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowCredPasswords(prev => ({ ...prev, current: !prev.current }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showCredPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Nuevo Nombre de Usuario (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={credForm.newUsername}
                  onChange={(e) => setCredForm(prev => ({ ...prev, newUsername: e.target.value }))}
                  placeholder="Dejar vacío para mantener el actual"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Nueva Contraseña (opcional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCredPasswords.newPass ? 'text' : 'password'}
                    className="form-input"
                    value={credForm.newPassword}
                    onChange={(e) => setCredForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowCredPasswords(prev => ({ ...prev, newPass: !prev.newPass }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showCredPasswords.newPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {credForm.newPassword && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    className="form-input"
                    value={credForm.confirmPassword}
                    onChange={(e) => setCredForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!credForm.currentPassword) {
                    showToast('Error', 'Debes ingresar tu contraseña actual.', 'warning');
                    return;
                  }
                  if (!credForm.newUsername && !credForm.newPassword) {
                    showToast('Error', 'Debes cambiar al menos el usuario o la contraseña.', 'warning');
                    return;
                  }
                  if (credForm.newPassword) {
                    if (credForm.newPassword.length < 8) {
                      showToast('Error', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
                      return;
                    }
                    if (credForm.newPassword !== credForm.confirmPassword) {
                      showToast('Error', 'Las contraseñas no coinciden.', 'warning');
                      return;
                    }
                  }
                  try {
                    setIsSaving(true);
                    await changeAdminCredentials(credForm.currentPassword, credForm.newUsername || undefined, credForm.newPassword || undefined);
                    setCredForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
                  } catch (err) {
                    // Error ya mostrado por changeAdminCredentials
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving || !credForm.currentPassword}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              >
                {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        )}
    </>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '1rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
          {dashboardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-container" style={{ maxWidth: '1100px' }} onClick={(e) => e.stopPropagation()}>
        {dashboardContent}
      </div>
    </div>
  );
}
