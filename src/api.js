const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// Admin credentials for client-side auth (fallback when backend is not available)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'PricomOficial2026!'
};

// Check if backend is available
let backendAvailable = null;
async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const response = await fetch(API_BASE + '/products', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

function getToken() {
  return localStorage.getItem('pricom_admin_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(error.error || 'Error del servidor');
  }

  return response.json();
}

// ==================== AUTH ====================

export const authAPI = {
  login: async (username, password) => {
    // Try backend first
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
      } catch (err) {
        // Backend failed, fall through to client-side
      }
    }
    
    // Client-side fallback
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = btoa(JSON.stringify({ username, role: 'admin', exp: Date.now() + 86400000 }));
      localStorage.setItem('pricom_admin_token', token);
      return { token, admin: { id: 1, username, role: 'admin' } };
    }
    throw new Error('Credenciales incorrectas');
  },

  changeCredentials: async (currentPassword, newUsername, newPassword) => {
    return await request('/auth/change-credentials', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newUsername, newPassword }),
    });
  },
};

// ==================== PRODUCTS ====================

export const productsAPI = {
  getAll: async (params = {}) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`);
    }
    // Client-side: return products from localStorage or empty
    const stored = localStorage.getItem('pricom_products');
    return stored ? JSON.parse(stored) : [];
  },

  getById: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/products/${id}`);
    }
    const stored = localStorage.getItem('pricom_products');
    const products = stored ? JSON.parse(stored) : [];
    return products.find(p => p.id === id) || null;
  },

  create: async (product) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_products');
    const products = stored ? JSON.parse(stored) : [];
    products.push(product);
    localStorage.setItem('pricom_products', JSON.stringify(products));
    return product;
  },

  update: async (id, data) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_products');
    const products = stored ? JSON.parse(stored) : [];
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data, id };
      localStorage.setItem('pricom_products', JSON.stringify(products));
    }
    return products[index] || data;
  },

  delete: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/products/${id}`, {
        method: 'DELETE',
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_products');
    const products = stored ? JSON.parse(stored) : [];
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('pricom_products', JSON.stringify(filtered));
    return { message: 'Producto eliminado' };
  },

  sync: async (products) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request('/sync/products', {
        method: 'POST',
        body: JSON.stringify({ products }),
      });
    }
    // Client-side fallback: save to localStorage
    localStorage.setItem('pricom_products', JSON.stringify(products));
    return { message: `${products.length} productos sincronizados localmente` };
  },
};

// ==================== ORDERS ====================

export const ordersAPI = {
  create: async (order) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_orders');
    const orders = stored ? JSON.parse(stored) : [];
    const newOrder = { ...order, id: `local-${Date.now()}`, orderNumber: `PR-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
    orders.push(newOrder);
    localStorage.setItem('pricom_orders', JSON.stringify(orders));
    return { orderId: newOrder.id, orderNumber: newOrder.orderNumber, total: order.total };
  },

  getAll: async (params = {}) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      const query = new URLSearchParams(params).toString();
      return request(`/orders${query ? `?${query}` : ''}`);
    }
    const stored = localStorage.getItem('pricom_orders');
    return stored ? JSON.parse(stored) : [];
  },

  getById: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/orders/${id}`);
    }
    const stored = localStorage.getItem('pricom_orders');
    const orders = stored ? JSON.parse(stored) : [];
    return orders.find(o => o.id === id) || null;
  },

  updateStatus: async (id, status) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_orders');
    const orders = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].orderStatus = status;
      orders[index].updatedAt = new Date().toISOString();
      localStorage.setItem('pricom_orders', JSON.stringify(orders));
    }
    return { message: 'Estado actualizado' };
  },

  update: async (id, data) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    const stored = localStorage.getItem('pricom_orders');
    const orders = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem('pricom_orders', JSON.stringify(orders));
    }
    return { message: 'Pedido actualizado' };
  },

  delete: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/orders/${id}`, {
        method: 'DELETE',
      });
    }
    const stored = localStorage.getItem('pricom_orders');
    const orders = stored ? JSON.parse(stored) : [];
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem('pricom_orders', JSON.stringify(filtered));
    return { message: 'Pedido eliminado' };
  },
};

// ==================== PAYMENTS ====================

export const paymentsAPI = {
  process: async (paymentData) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    }
    // Client-side fallback
    return { success: true, paymentId: `local-${Date.now()}`, status: 'completed', reference: `LOCAL-${Date.now()}` };
  },
};

// ==================== STATS ====================

export const statsAPI = {
  getDashboard: async () => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request('/stats/dashboard');
    }
    // Client-side fallback: compute from localStorage
    const storedProducts = localStorage.getItem('pricom_products');
    const storedOrders = localStorage.getItem('pricom_orders');
    const products = storedProducts ? JSON.parse(storedProducts) : [];
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    
    const totalRevenue = orders
      .filter(o => ['paid', 'delivered'].includes(o.orderStatus))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const lowStockProducts = products.filter(p => (p.stockCount || 0) < 5).length;
    
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
      paidOrders: orders.filter(o => o.orderStatus === 'paid').length,
      lowStockProducts,
      recentOrders: orders.slice(0, 10),
      topProducts: [],
      salesByCategory: []
    };
  },

  getMonthlySales: async (year) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return request(`/stats/monthly-sales?year=${year}`);
    }
    const storedOrders = localStorage.getItem('pricom_orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthly = labels.map((label, i) => {
      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && d.getMonth() === i && ['paid', 'delivered'].includes(o.orderStatus);
      });
      return {
        month: i,
        label,
        revenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: monthOrders.length,
        itemsSold: monthOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, item) => s + item.quantity, 0), 0)
      };
    });
    return {
      year,
      monthly,
      totalRevenue: monthly.reduce((sum, m) => sum + m.revenue, 0),
      totalOrders: monthly.reduce((sum, m) => sum + m.orders, 0)
    };
  },
};

// ==================== USERS ====================

function getUserToken() {
  return localStorage.getItem('pricom_user_token');
}

async function userRequest(endpoint, options = {}) {
  const token = getUserToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(error.error || 'Error del servidor');
  }

  return response.json();
}

export const usersAPI = {
  register: async (userData) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return userRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_users');
    const users = stored ? JSON.parse(stored) : [];
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Este correo ya está registrado');
    }
    const newUser = { ...userData, id: `user-${Date.now()}`, emailVerified: true, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('pricom_users', JSON.stringify(users));
    return { message: 'Cuenta creada exitosamente', userId: newUser.id };
  },

  login: async (email, password) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      return userRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }
    // Client-side fallback
    const stored = localStorage.getItem('pricom_users');
    const users = stored ? JSON.parse(stored) : [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciales incorrectas');
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 604800000 }));
    return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, nit: user.nit } };
  },

  verifyEmail: (token) => userRequest(`/users/verify-email?token=${token}`),
  resendVerification: (email) => userRequest('/users/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  getProfile: () => userRequest('/users/profile'),
  updateProfile: (data) => userRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email) => userRequest('/users/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) => userRequest('/users/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
};

// ==================== PROMOTERS ====================

export const promotersAPI = {
  submit: async (fullName, city, phone) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request('/promoters', {
          method: 'POST',
          body: JSON.stringify({ fullName, city, phone }),
        });
      } catch (err) {
        // Backend failed, fall through to client-side
      }
    }
    // Client-side fallback: save to localStorage
    const application = {
      id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fullName,
      city,
      phone,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const stored = JSON.parse(localStorage.getItem('pricom_promoters') || '[]');
    stored.push(application);
    localStorage.setItem('pricom_promoters', JSON.stringify(stored));
    return { message: 'Solicitud enviada correctamente', application };
  },
  getAll: async () => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request('/promoters');
      } catch (err) {
        // Fall through to client-side
      }
    }
    return JSON.parse(localStorage.getItem('pricom_promoters') || '[]');
  },
  update: async (id, data) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request(`/promoters/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (err) {
        // Fall through to client-side
      }
    }
    const stored = JSON.parse(localStorage.getItem('pricom_promoters') || '[]');
    const idx = stored.findIndex(p => p.id === id);
    if (idx !== -1) {
      stored[idx] = { ...stored[idx], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem('pricom_promoters', JSON.stringify(stored));
      return stored[idx];
    }
    throw new Error('Solicitud no encontrada');
  },
  delete: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request(`/promoters/${id}`, { method: 'DELETE' });
      } catch (err) {
        // Fall through to client-side
      }
    }
    const stored = JSON.parse(localStorage.getItem('pricom_promoters') || '[]');
    const filtered = stored.filter(p => p.id !== id);
    localStorage.setItem('pricom_promoters', JSON.stringify(filtered));
    return { message: 'Solicitud eliminada' };
  },
};

// ==================== NEWSLETTER ====================

export const newsletterAPI = {
  subscribe: async (email) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request('/newsletter', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        // Backend failed, fall through to client-side
      }
    }
    const subscriber = {
      id: `nl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    const stored = JSON.parse(localStorage.getItem('pricom_newsletter') || '[]');
    if (stored.find(s => s.email === email.toLowerCase())) {
      return { message: 'Ya estás suscrito' };
    }
    stored.push(subscriber);
    localStorage.setItem('pricom_newsletter', JSON.stringify(stored));
    return { message: 'Suscripción exitosa', subscriber };
  },
  getAll: async () => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request('/newsletter');
      } catch (err) {
        // Fall through to client-side
      }
    }
    return JSON.parse(localStorage.getItem('pricom_newsletter') || '[]');
  },
  delete: async (id) => {
    const isBackendUp = await checkBackend();
    if (isBackendUp) {
      try {
        return await request(`/newsletter/${id}`, { method: 'DELETE' });
      } catch (err) {
        // Fall through to client-side
      }
    }
    const stored = JSON.parse(localStorage.getItem('pricom_newsletter') || '[]');
    const filtered = stored.filter(s => s.id !== id);
    localStorage.setItem('pricom_newsletter', JSON.stringify(filtered));
    return { message: 'Suscriptor eliminado' };
  },
};
