import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS as initialProducts } from '../data/products';
import { ARTICLES } from '../data/articles';
import { CONFIG } from '../config';
import { storage } from '../storage';
import { authAPI, ordersAPI, productsAPI, paymentsAPI, statsAPI, usersAPI } from '../api';
import confetti from 'canvas-confetti';

const AppContext = createContext();

// App version - increment to force cache clear
const APP_VERSION = '1.0.2';

export function AppProvider({ children }) {
  // Clear stale cache on version change
  useEffect(() => {
    const storedVersion = localStorage.getItem('pricom_app_version');
    if (storedVersion !== APP_VERSION) {
      // Clear all PRICOM localStorage entries except cart and wishlist
      const keysToPreserve = ['pricom_cart', 'pricom_wishlist'];
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pricom_') && !keysToPreserve.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('pricom_app_version', APP_VERSION);
    }
  }, []);
  // ── Products Store (editable by Admin) ──
  // Always start with latest products from data file, then merge any custom products from localStorage
  const [products, setProducts] = useState(() => {
    const stored = storage.get(CONFIG.STORAGE_KEYS.PRODUCTS, null);
    // Always use initialProducts as base (latest names from data file)
    if (stored && Array.isArray(stored)) {
      // Merge: keep custom products (not in initialProducts) and update existing ones
      const customProducts = stored.filter(p => !initialProducts.find(ip => ip.id === p.id));
      return [...initialProducts, ...customProducts];
    }
    return initialProducts;
  });

  // ── Cart Store ──
  const [cart, setCart] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.CART, [])
  );

  // ── Wishlist Store ──
  const [wishlist, setWishlist] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.WISHLIST, [])
  );

  // ── Comparator Store (up to 4 products) ──
  const [comparator, setComparator] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.COMPARATOR, [])
  );

  // ── Theme Store ──
  const [theme, setTheme] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.THEME, 'light')
  );

  // ── Search & Filters Store ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.SEARCH_HISTORY, [
      'Sofás Sealy', 'Sofá cama Queen', 'Recliner Gameday', 'Santa Cruz',
    ])
  );

  const initialFilterState = {
    category: 'all',
    subCategory: 'all',
    brand: 'all',
    minPrice: 0,
    maxPrice: 30000,
    color: 'all',
    material: 'all',
    style: 'all',
    availability: 'all',
    isOffer: false,
    isNew: false,
    location: 'all',
    sortBy: 'relevance',
  };

  const [filters, setFilters] = useState(initialFilterState);

  // ── Active Modals & Views ──
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [legalTab, setLegalTab] = useState('garantia');

  const openLegalModal = useCallback((tab = 'garantia') => {
    setLegalTab(tab);
    setActiveModal('legal');
  }, []);

  // ── Load live products from backend on mount ──
  useEffect(() => {
    productsAPI.getAll()
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
          // Also save to localStorage for offline/client-side fallback
          localStorage.setItem('pricom_products', JSON.stringify(data));
        } else {
          // Server has no products, sync from local/initial data
          productsAPI.sync(initialProducts).then(() => {
            setProducts(initialProducts);
            localStorage.setItem('pricom_products', JSON.stringify(initialProducts));
          }).catch(() => {});
        }
      })
      .catch(() => {
        // Safe fallback to initial/local storage products
        setProducts(initialProducts);
      });
  }, []);

  // ── User Profile Store ──
  const [user, setUser] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.USER, {
      name: '',
      email: '',
      phone: '',
      nit: '',
      city: '',
      address: '',
      orders: [],
    })
  );

  // ── Load user profile on mount if token exists ──
  useEffect(() => {
    const token = localStorage.getItem('pricom_user_token');
    if (token) {
      usersAPI.getProfile()
        .then(profile => {
          setUser({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            nit: profile.nit || '',
            city: '',
            address: '',
            orders: [],
          });
        })
        .catch(() => {
          // Token invalid or expired, clear it
          localStorage.removeItem('pricom_user_token');
        });
    }
  }, []);

  // ── Toast Notifications ──
  const [toasts, setToasts] = useState([]);

  // ── Admin Auth ──
  const [isAdminAuth, setIsAdminAuth] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.ADMIN_AUTH, false)
  );
  const [adminToken, setAdminToken] = useState(() =>
    storage.get(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, null)
  );
  const [adminStats, setAdminStats] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);

  // ═══════════════════════════════════════════
  // PERSISTENCE EFFECTS (safe localStorage)
  // ═══════════════════════════════════════════
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.WISHLIST, wishlist); }, [wishlist]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.COMPARATOR, comparator); }, [comparator]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.SEARCH_HISTORY, searchHistory); }, [searchHistory]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.USER, user); }, [user]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.ADMIN_AUTH, isAdminAuth); }, [isAdminAuth]);
  useEffect(() => { storage.set(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, adminToken); }, [adminToken]);

  // Theme synchronization with HTML tag
  useEffect(() => {
    storage.set(CONFIG.STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // ═══════════════════════════════════════════
  // DERIVED VALUES (useMemo)
  // ═══════════════════════════════════════════
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // ═══════════════════════════════════════════
  // TOAST HELPERS
  // ═══════════════════════════════════════════
  const showToast = useCallback((title, message, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, CONFIG.TOAST_DURATION_MS);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ═══════════════════════════════════════════
  // CART OPERATIONS
  // ═══════════════════════════════════════════
  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    const color = options.color || (product.colors && product.colors[0]?.name) || 'Estándar';
    const material = options.material || product.material || 'Estándar';

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedColor: color, selectedMaterial: material }];
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#009eff', '#051063', '#ffffff'],
      });
    } catch {
      // safe fallback
    }

    showToast('¡Añadido al carrito!', `${product.name} (${quantity} un.) se sumó a tu compra.`, 'success');
  }, [showToast]);

  const removeFromCart = useCallback((productId, selectedColor) => {
    setCart(prev =>
      prev.filter(item => !(item.product.id === productId && (!selectedColor || item.selectedColor === selectedColor)))
    );
    showToast('Producto eliminado', 'El artículo fue removido del carrito.', 'info');
  }, [showToast]);

  const updateCartQuantity = useCallback((productId, selectedColor, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId && (!selectedColor || item.selectedColor === selectedColor)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ═══════════════════════════════════════════
  // WISHLIST OPERATIONS
  // ═══════════════════════════════════════════
  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const prod = products.find(p => p.id === productId);
      const name = prod ? prod.name : 'Producto';
      if (exists) {
        showToast('Eliminado de Favoritos', `${name} se quitó de tu lista.`, 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('¡Guardado en Favoritos!', `${name} se guardó en tu lista de deseos.`, 'success');
        return [...prev, productId];
      }
    });
  }, [products, showToast]);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  // ═══════════════════════════════════════════
  // COMPARATOR OPERATIONS
  // ═══════════════════════════════════════════
  const toggleComparator = useCallback((productId) => {
    setComparator(prev => {
      const exists = prev.includes(productId);
      const prod = products.find(p => p.id === productId);
      const name = prod ? prod.name : 'Producto';
      if (exists) {
        showToast('Removido del comparador', `${name} se quitó de la comparación.`, 'info');
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= CONFIG.MAX_COMPARATOR_ITEMS) {
          showToast('Límite de comparación', `Puedes comparar hasta un máximo de ${CONFIG.MAX_COMPARATOR_ITEMS} productos a la vez.`, 'warning');
          return prev;
        }
        showToast('Añadido al comparador', `${name} se agregó al comparador (Hasta ${CONFIG.MAX_COMPARATOR_ITEMS} productos).`, 'success');
        return [...prev, productId];
      }
    });
  }, [products, showToast]);

  const isInComparator = useCallback((productId) => comparator.includes(productId), [comparator]);
  const clearComparator = useCallback(() => setComparator([]), []);

  // ═══════════════════════════════════════════
  // SEARCH HISTORY
  // ═══════════════════════════════════════════
  const recordSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setSearchHistory(prev =>
      [clean, ...prev.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, CONFIG.MAX_SEARCH_HISTORY)
    );
  }, []);

  // ═══════════════════════════════════════════
  // PRODUCT MODALS
  // ═══════════════════════════════════════════
  const openProductDetail = useCallback((product) => {
    setSelectedProduct(product);
    setActiveModal('product-detail');
    window.history.pushState(null, '', `#producto-${product.slug}`);
  }, []);

  const openQuickView = useCallback((product) => {
    setSelectedProduct(product);
    setActiveModal('quick-view');
  }, []);

  const openArticle = useCallback((article) => {
    setSelectedArticle(article);
    setActiveModal('article');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    if (window.location.hash.startsWith('#producto-')) {
      window.history.replaceState(null, '', '#catalogo');
    }
  }, []);

  // ═══════════════════════════════════════════
  // FILTER RESET
  // ═══════════════════════════════════════════
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
    setSearchQuery('');
  }, []);

  // ═══════════════════════════════════════════
  // ADMIN OPERATIONS
  // ═══════════════════════════════════════════
  const adminLogin = useCallback(async (username, password) => {
    try {
      const result = await authAPI.login(username, password);
      setIsAdminAuth(true);
      setAdminToken(result.token);
      storage.set(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, result.token);
      showToast('Acceso Autorizado', 'Bienvenido al panel de administración.', 'success');
      return true;
    } catch (err) {
      showToast('Acceso Denegado', err.message || 'Credenciales incorrectas.', 'warning');
      return false;
    }
  }, [showToast]);

  const adminLogout = useCallback(() => {
    setIsAdminAuth(false);
    setAdminToken(null);
    setAdminStats(null);
    setAdminOrders([]);
    storage.set(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, null);
    showToast('Sesión Cerrada', 'Has salido del panel de administración.', 'info');
  }, [showToast]);

  const fetchAdminStats = useCallback(async () => {
    try {
      const stats = await statsAPI.getDashboard();
      setAdminStats(stats);
      return stats;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, []);

  const fetchAdminOrders = useCallback(async (params = {}) => {
    try {
      const orders = await ordersAPI.getAll(params);
      setAdminOrders(orders);
      return orders;
    } catch (err) {
      console.error('Error fetching orders:', err);
      return [];
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setAdminOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderStatus: status } : o
      ));
      showToast('Pedido Actualizado', `Estado cambiado a: ${status}`, 'success');
      return true;
    } catch (err) {
      showToast('Error', err.message || 'No se pudo actualizar el pedido', 'warning');
      return false;
    }
  }, [showToast]);

  const createOrder = useCallback(async (orderData) => {
    try {
      const result = await ordersAPI.create(orderData);
      return result;
    } catch (err) {
      console.error('Error creating order:', err);
      return null;
    }
  }, []);

  const processPayment = useCallback(async (paymentData) => {
    try {
      const result = await paymentsAPI.process(paymentData);
      return result;
    } catch (err) {
      console.error('Error processing payment:', err);
      return null;
    }
  }, []);

  const adminAddProduct = useCallback(async (newProduct) => {
    try {
      const created = await productsAPI.create(newProduct);
      setProducts(prev => [created, ...prev]);
      // Auto-sync to server
      const allProducts = [created];
      productsAPI.sync(allProducts).catch(() => {});
      showToast('Producto Creado', `${created.name} fue añadido al catálogo.`, 'success');
      return created;
    } catch (err) {
      setProducts(prev => [newProduct, ...prev]);
      showToast('Producto Creado', `${newProduct.name} fue añadido (modo local).`, 'success');
      return newProduct;
    }
  }, [showToast]);

  const adminUpdateProduct = useCallback(async (updatedProduct) => {
    try {
      await productsAPI.update(updatedProduct.id, updatedProduct);
    } catch (err) {
      // Continue with local update
    }
    setProducts(prev => {
      const next = prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
      // Auto-sync full list to server
      productsAPI.sync(next).catch(() => {});
      return next;
    });
    showToast('Producto Actualizado', `${updatedProduct.name} fue modificado exitosamente.`, 'success');
  }, [showToast]);

  const adminDeleteProduct = useCallback(async (productId) => {
    try {
      await productsAPI.delete(productId);
    } catch (err) {
      // Continue with local delete
    }
    setProducts(prev => {
      const next = prev.filter(p => p.id !== productId);
      // Auto-sync full list to server
      productsAPI.sync(next).catch(() => {});
      return next;
    });
    showToast('Producto Eliminado', 'El producto fue dado de baja del catálogo.', 'info');
  }, [showToast]);

  const syncProductsToServer = useCallback(async () => {
    try {
      await productsAPI.sync(products);
      showToast('Sincronizado', 'Productos sincronizados con el servidor.', 'success');
    } catch (err) {
      showToast('Error', 'No se pudieron sincronizar los productos.', 'warning');
    }
  }, [products, showToast]);

  // ═══════════════════════════════════════════
  // PROVIDER VALUE
  // ═══════════════════════════════════════════
  const value = useMemo(() => ({
    products,
    cart,
    wishlist,
    comparator,
    theme,
    setTheme,
    searchQuery,
    setSearchQuery,
    searchHistory,
    recordSearch,
    filters,
    setFilters,
    resetFilters,
    activeModal,
    setActiveModal,
    selectedProduct,
    setSelectedProduct,
    selectedArticle,
    setSelectedArticle,
    checkoutStep,
    setCheckoutStep,
    user,
    setUser,
    toasts,
    showToast,
    removeToast,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    toggleWishlist,
    isInWishlist,
    toggleComparator,
    isInComparator,
    clearComparator,
    openProductDetail,
    openQuickView,
    openArticle,
    legalTab,
    setLegalTab,
    openLegalModal,
    isAdminAuth,
    adminToken,
    adminStats,
    adminOrders,
    adminLogin,
    adminLogout,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    fetchAdminStats,
    fetchAdminOrders,
    updateOrderStatus,
    createOrder,
    processPayment,
    syncProductsToServer,
  }), [
    products, cart, wishlist, comparator, theme,
    searchQuery, searchHistory, filters, activeModal,
    selectedProduct, selectedArticle, checkoutStep,
    user, toasts, cartTotal, cartCount, isAdminAuth,
    adminToken, adminStats, adminOrders,
    showToast, removeToast, addToCart, removeFromCart,
    updateCartQuantity, clearCart, toggleWishlist, isInWishlist,
    toggleComparator, isInComparator, clearComparator,
    openProductDetail, openQuickView, openArticle, closeModal,
    legalTab, openLegalModal,
    recordSearch, resetFilters, setTheme, setSearchQuery,
    setFilters, setActiveModal, setSelectedProduct,
    setSelectedArticle, setCheckoutStep, setUser,
    adminLogin, adminLogout, adminAddProduct,
    adminUpdateProduct, adminDeleteProduct,
    fetchAdminStats, fetchAdminOrders, updateOrderStatus,
    createOrder, processPayment, syncProductsToServer,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
