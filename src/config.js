// ==========================================================================
// PRICOM GLOBAL CONFIGURATION
// Centraliza valores de configuración global.
// ==========================================================================

export const CONFIG = {
  // API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',

  // WhatsApp
  WHATSAPP_NUMBER: '59176740940',
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
    ADMIN_TOKEN: 'pricom_admin_token',
    OFFERS_END: 'pricom_offers_end',
    DELETED_PRODUCTS: 'pricom_deleted_products',
  },

  // Limits
  MAX_COMPARATOR_ITEMS: 4,
  MAX_SEARCH_HISTORY: 8,
  TOAST_DURATION_MS: 4000,

  // Site
  SITE_URL: 'https://pricom.bo',
  SITE_NAME: 'PRICOM Bolivia',
};
