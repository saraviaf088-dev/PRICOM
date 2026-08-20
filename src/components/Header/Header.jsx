import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { CATEGORIES, NAVIGATION_LINKS } from '../../data/categories';
import {
  Search, Heart, ShoppingBag, Scale, User, Moon, Sun, Monitor,
  Menu, X, Phone, MessageCircle, Sparkles, MapPin, Truck, ShieldCheck, Clock,
  Home, Armchair, Tag, Compass, Headphones
} from 'lucide-react';

const NAV_ICONS = {
  'Inicio': Home,
  'Sofás Cama': Armchair,
  'Recliners': Armchair,
  'Sillas': Armchair,
  'Ofertas': Tag,
  'Inspírate': Compass,
  'Trabaja con Nosotros': Headphones,
  'Contacto': Headphones,
};

export default function Header() {
  const navigate = useNavigate();
  const {
    theme, setTheme,
    cartCount, cartTotal,
    wishlist, comparator,
    searchQuery, setSearchQuery,
    searchHistory, recordSearch,
    products, setFilters,
    setActiveModal,
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered live results for autocomplete
  const liveResults = searchQuery.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.material.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      recordSearch(searchQuery);
      setIsSearchOpen(false);
      const catalogEl = document.getElementById('catalogo');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTag = (term) => {
    setSearchQuery(term);
    recordSearch(term);
    setIsSearchOpen(false);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryNav = (catName) => {
    setFilters(prev => ({ ...prev, category: catName, subCategory: 'all' }));
    setIsMobileMenuOpen(false);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. TOPBAR */}
      <div className="topbar">
        <div className="container topbar-content">
          <div className="topbar-announcement">
            <Truck size={14} className="topbar-highlight" />
            <span>Envíos con armado gratis en <strong className="topbar-highlight">Santa Cruz, La Paz y Cochabamba</strong></span>
          </div>

          <div className="topbar-links">
            <a href="#contacto" className="topbar-link">
              <MapPin size={13} />
              <span>Nuestros Showrooms</span>
            </a>

            <a 
              href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola%20PRICOM,%20deseo%20asesoramiento%20personalizado`} 
              target="_blank" 
              rel="noreferrer" 
              className="topbar-link"
            >
              <MessageCircle size={13} style={{ color: '#25D366' }} />
              <span>Asesoría WhatsApp</span>
            </a>

            {/* Theme Selector */}
            <div className="theme-switcher">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Modo Claro"
              >
                <Sun size={12} />
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Modo Oscuro"
              >
                <Moon size={12} />
              </button>
              <button 
                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setTheme('system')}
                title="Automático / Sistema"
              >
                <Monitor size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="header">
        <div className="container header-main">
          {/* Mobile Hamburger */}
          <button 
            className="btn-icon mobile-only" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo & Sealy badge */}
          <a href="#inicio" className="brand-wrapper">
            <img src="/iconos/logo%20pricom.png" alt="PRICOM Bolivia" className="brand-logo" />
            <div className="brand-partner-badge">
              <img src="/iconos/logo%20sealy.png" alt="Sealy Official Partner" className="sealy-mini-logo" />
            </div>
          </a>

          {/* Smart Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
              <Search size={18} className="search-icon-left" />
              <input
                type="text"
                placeholder="¿Qué estás buscando? (Ej: Sofás reclinables, Sealy Santa Cruz, Comedor...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')} 
                  className="search-clear-btn"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="search-dropdown">
                {liveResults.length > 0 ? (
                  <div className="search-dropdown-section">
                    <div className="search-dropdown-title">
                      <Sparkles size={13} color="var(--color-celeste)" />
                      Productos sugeridos
                    </div>
                    {liveResults.map(p => (
                      <div 
                        key={p.id} 
                        className="search-product-item"
                        onClick={() => {
                          navigate(`/producto/${p.slug}`);
                          setIsSearchOpen(false);
                        }}
                      >
                        <img src={p.images[0]} alt={p.name} className="search-product-thumb" />
                        <div>
                          <div className="search-product-name">{p.name}</div>
                          <div className="search-product-price">Bs. {p.price.toLocaleString('es-BO')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="search-dropdown-section">
                  <div className="search-dropdown-title">
                    <Clock size={13} />
                    Búsquedas populares
                  </div>
                  <div className="search-tags">
                    {searchHistory.map((term, i) => (
                      <button 
                        key={i} 
                        className="search-tag" 
                        onClick={() => handleSelectTag(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="search-dropdown-section">
                  <div className="search-dropdown-title">Categorías destacadas</div>
                  <div className="search-tags">
                    {CATEGORIES.slice(0, 5).map(cat => (
                      <button 
                        key={cat.id} 
                        className="search-tag" 
                        onClick={() => handleCategoryNav(cat.name)}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="header-actions">
            {/* Wishlist */}
            <button 
              className="action-btn" 
              onClick={() => setActiveModal('wishlist')}
              title="Mis Favoritos"
            >
              <Heart size={20} />
              <span>Favoritos</span>
              {wishlist.length > 0 && <span className="action-counter">{wishlist.length}</span>}
            </button>

            {/* Comparator */}
            <button 
              className="action-btn" 
              onClick={() => setActiveModal('comparator')}
              title="Comparar Productos"
            >
              <Scale size={20} />
              <span>Comparar</span>
              {comparator.length > 0 && <span className="action-counter">{comparator.length}</span>}
            </button>

            {/* User Account */}
            <button 
              className="action-btn" 
              onClick={() => setActiveModal('auth')}
              title="Mi Cuenta"
            >
              <User size={20} />
              <span>Cuenta</span>
            </button>

            {/* Cart */}
            <button 
              className="action-btn" 
              onClick={() => setActiveModal('cart')}
              title="Carrito de Compras"
            >
              <ShoppingBag size={20} />
              <span>Carrito</span>
              {cartCount > 0 && <span className="action-counter action-counter-cart">{cartCount}</span>}
            </button>

            {/* Direct WhatsApp CTA */}
            <a 
              href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola%20PRICOM,%20quiero%20informaci%C3%B3n%20sobre%20sus%20muebles`} 
              target="_blank" 
              rel="noreferrer"
              className="btn-header-whatsapp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 3. NAVIGATION BAR */}
        <nav className="nav-bar">
          <div className="container">
            <ul className="nav-links">
              {NAVIGATION_LINKS.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.path} 
                    className={`nav-link-item ${link.isHighlight ? 'highlight' : ''}`}
                    onClick={(e) => {
                      if (link.filter) {
                        e.preventDefault();
                        handleCategoryNav(link.filter.category);
                      }
                    }}
                  >
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

      </header>

      {/* Mobile Slide-Out Drawer */}
      <div 
        className={`mobile-drawer-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src="/iconos/logo%20pricom.png" alt="PRICOM" />
          </div>
          <button 
            className="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mobile-drawer-nav">
          <div className="mobile-drawer-section-title">Navegación</div>
          {NAVIGATION_LINKS.map((link, idx) => {
            const Icon = NAV_ICONS[link.label] || Grid3X3;
            return (
              <a
                key={idx}
                href={link.path}
                className={`mobile-drawer-nav-item ${link.isHighlight ? 'highlight' : ''}`}
                onClick={(e) => {
                  if (link.filter) {
                    e.preventDefault();
                    handleCategoryNav(link.filter.category);
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </a>
            );
          })}

          <div className="mobile-drawer-divider" />

          <div className="mobile-drawer-section-title">Mi Cuenta</div>
          <button
            className="mobile-drawer-nav-item"
            onClick={() => { setActiveModal('wishlist'); setIsMobileMenuOpen(false); }}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Heart size={18} />
            <span>Favoritos</span>
            {wishlist.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--color-celeste)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            className="mobile-drawer-nav-item"
            onClick={() => { setActiveModal('comparator'); setIsMobileMenuOpen(false); }}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Scale size={18} />
            <span>Comparar</span>
            {comparator.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--color-azul-oscuro)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>
                {comparator.length}
              </span>
            )}
          </button>

          <button
            className="mobile-drawer-nav-item"
            onClick={() => { setActiveModal('auth'); setIsMobileMenuOpen(false); }}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <User size={18} />
            <span>Mi Cuenta</span>
          </button>

          <div className="mobile-drawer-divider" />

          <div className="mobile-drawer-section-title">Tema</div>
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1.25rem' }}>
            <button 
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: theme === 'light' ? 'var(--color-celeste)' : 'var(--bg-secondary)', color: theme === 'light' ? '#fff' : 'var(--text-primary)' }}
            >
              <Sun size={14} /> Claro
            </button>
            <button 
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: theme === 'dark' ? 'var(--color-celeste)' : 'var(--bg-secondary)', color: theme === 'dark' ? '#fff' : 'var(--text-primary)' }}
            >
              <Moon size={14} /> Oscuro
            </button>
            <button 
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
              style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: theme === 'system' ? 'var(--color-celeste)' : 'var(--bg-secondary)', color: theme === 'system' ? '#fff' : 'var(--text-primary)' }}
            >
              <Monitor size={14} /> Auto
            </button>
          </div>
        </nav>

        <div className="mobile-drawer-footer">
          <a 
            href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola%20PRICOM,%20quiero%20informaci%C3%B3n%20sobre%20sus%20muebles`} 
            target="_blank" 
            rel="noreferrer"
            className="mobile-drawer-whatsapp"
          >
            <MessageCircle size={18} />
            Asesoría por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
