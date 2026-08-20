const API_BASE = 'http://localhost:3001/api';

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
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// ==================== PRODUCTS ====================

export const productsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/products/${id}`),

  create: (product) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (id, data) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  sync: (products) =>
    request('/sync/products', {
      method: 'POST',
      body: JSON.stringify({ products }),
    }),
};

// ==================== ORDERS ====================

export const ordersAPI = {
  create: (order) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/orders/${id}`),

  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ==================== PAYMENTS ====================

export const paymentsAPI = {
  process: (paymentData) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};

// ==================== STATS ====================

export const statsAPI = {
  getDashboard: () => request('/stats/dashboard'),
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
  register: (userData) =>
    userRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (email, password) =>
    userRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (token) =>
    userRequest(`/users/verify-email?token=${token}`),

  resendVerification: (email) =>
    userRequest('/users/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getProfile: () => userRequest('/users/profile'),

  updateProfile: (data) =>
    userRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email) =>
    userRequest('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) =>
    userRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};
