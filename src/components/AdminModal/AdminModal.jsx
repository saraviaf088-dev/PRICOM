import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Plus, Trash2, Edit3, Save, X, DollarSign, Package, 
  MessageCircle, BarChart3, Lock, LogOut, Eye, EyeOff, ShoppingBag, 
  Clock, CheckCircle, Truck, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AdminModal() {
  const { 
    activeModal, setActiveModal, 
    products, adminAddProduct, adminUpdateProduct, adminDeleteProduct, 
    isAdminAuth, adminLogin, adminLogout,
    adminStats, adminOrders, fetchAdminStats, fetchAdminOrders, updateOrderStatus,
    showToast 
  } = useApp();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
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

  // Fetch data when admin logs in
  useEffect(() => {
    if (isAdminAuth && activeModal === 'admin') {
      loadDashboardData();
    }
  }, [isAdminAuth, activeModal]);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchAdminStats(), fetchAdminOrders()]);
    setLoading(false);
  };

  if (activeModal !== 'admin') return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await adminLogin(loginForm.username, loginForm.password);
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

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await fetchAdminStats();
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
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-container" style={{ maxWidth: '1100px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff' }}>
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
            <button onClick={() => setActiveModal(null)} style={{ color: '#fff' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
            { id: 'products', label: 'Productos', icon: Package },
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
              <button onClick={loadDashboardData} className="btn btn-outline btn-sm">
                <RefreshCw size={14} />
                Actualizar
              </button>
            </div>

            {adminOrders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No hay pedidos registrados</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="comparator-table">
                  <thead>
                    <tr>
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
                    {adminOrders.map(order => (
                      <tr key={order.id}>
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
                              const items = order.items?.map(i => `- ${i.productName} (x${i.quantity})`).join('%0A') || '';
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
              <h4 style={{ fontSize: '1.15rem' }}>Gestión de Catálogo</h4>
              <button className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)}>
                <Plus size={16} />
                <span>Nuevo Producto</span>
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
                      <option value="Sofás Cama">Sofás Cama</option>
                      <option value="Reclinables">Recliners</option>

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
        )}
      </div>
    </div>
  );
}
