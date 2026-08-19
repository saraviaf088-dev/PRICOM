import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { CATEGORIES, NAVIGATION_LINKS } from '../../data/categories';
import { 
  Search, Heart, ShoppingBag, Scale, User, Moon, Sun, Monitor, 
  Menu, X, Phone, MessageCircle, ChevronDown, Sparkles, MapPin, Truck, ShieldCheck, Clock
} from 'lucide-react';

export default function Header() {
  const { 
    theme, setTheme, 
    cartCount, cartTotal, 
    wishlist, comparator, 
    searchQuery, setSearchQuery, 
    searchHistory, recordSearch, 
    products, setFilters, 
    setActiveModal, openProductDetail 
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const searchRef = useRef(null);

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
    setActiveMegaMenu(null);
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
                          openProductDetail(p);
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

        {/* 3. NAVIGATION BAR & MEGA MENU */}
        <nav className="nav-bar">
          <div className="container">
            <ul className="nav-links">
              {NAVIGATION_LINKS.map((link, idx) => (
                <li 
                  key={idx} 
                  onMouseEnter={() => link.hasMegaMenu && setActiveMegaMenu('muebles')}
                  onMouseLeave={() => link.hasMegaMenu && setActiveMegaMenu(null)}
                >
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
                    {link.hasMegaMenu && <ChevronDown size={14} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Mega Menu Dropdown */}
          {activeMegaMenu === 'muebles' && (
            <div 
              className="mega-menu-overlay glass"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                padding: '2rem 0',
                zIndex: 90
              }}
              onMouseEnter={() => setActiveMegaMenu('muebles')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-celeste)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Colección Sofás Sealy
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sofás')}>Sofás 3 Cuerpos Santa Cruz</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sofás Cama')}>Sofás Cama Monterey</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sofás Cama')}>Convertibles Kennedy Queen</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sofás Cama')}>Sammy Queen Chocolate</a></li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-celeste)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Reclinables & Salas
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Reclinables')}>Gameday Zero-Gravity</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Juegos de Sala')}>Seccional Modular Klein</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sillones')}>Poltronas de Lectura</a></li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-celeste)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Comedor & Decoración
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Mesas')}>Mesas de Mármol Aura</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Sillas')}>Sillas Nórdicas Oslo</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Lámparas')}>Lámparas de Pie en Latón</a></li>
                    <li><a href="#catalogo" onClick={() => handleCategoryNav('Alfombras')}>Alfombras de Lana Altiplano</a></li>
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <img src="/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg" alt="Destacado" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }} />
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Sealy Santa Cruz Seafoam</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-celeste)', fontWeight: '800' }}>Bs. 9.500 <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>Bs. 18.999</span></div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => handleCategoryNav('Sofás')}>Ver Colección</button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-panel"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 90,
              padding: '1.5rem',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}
          >
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                      setIsMobileMenuOpen(false);
                    }}
                    style={{ padding: '0.75rem 0.5rem', display: 'block', borderBottom: '1px solid var(--border-color-light)' }}
                  >
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
