// ==========================================================================
// PRICOM GLOBAL CONFIGURATION
// Centraliza valores que antes estaban hardcodeados en múltiples archivos.
// ==========================================================================

export const CONFIG = {
  // WhatsApp
  WHATSAPP_NUMBER: '59175012345',
  WHATSAPP_DEFAULT_MSG: 'Hola PRICOM, deseo información sobre los muebles del catálogo.',

  // Coupon
  VALID_COUPON_CODE: 'PRICOM10',
  COUPON_DISCOUNT_PERCENT: 10,

  // Storage keys
  STORAGE_KEYS: {
    PRODUCTS: 'pricom_products',
    CART: 'pricom_cart',
    WISHLIST: 'pricom_wishlist',
    COMPARATOR: 'pricom_comparator',
    THEME: 'pricom_theme',
    SEARCH_HISTORY: 'pricom_search_history',
    USER: 'pricom_user',
    ADMIN_AUTH: 'pricom_admin_auth',
    OFFERS_END: 'pricom_offers_end',
  },

  // Admin credentials (for demo — in production, use a backend)
  ADMIN_CREDENTIALS: {
    username: 'admin',
    password: 'pricom2026',
  },

  // Limits
  MAX_COMPARATOR_ITEMS: 4,
  MAX_SEARCH_HISTORY: 8,
  TOAST_DURATION_MS: 4000,

  // Site
  SITE_URL: 'https://pricom.bo',
  SITE_NAME: 'PRICOM Bolivia',
};
