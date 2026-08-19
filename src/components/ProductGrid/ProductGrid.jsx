import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import FilterSidebar from '../Filters/FilterSidebar';
import ProductCard from '../ProductCard/ProductCard';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Inbox } from 'lucide-react';

export default function ProductGrid() {
  const { products, filters, setFilters, searchQuery, resetFilters } = useApp();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        const matchMat = product.material.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCat && !matchMat) return false;
      }

      // 2. Category
      if (filters.category !== 'all') {
        if (product.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      }

      // 3. Brand
      if (filters.brand !== 'all') {
        if (product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      }

      // 4. Price
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // 5. Color
      if (filters.color !== 'all') {
        const hasColor = product.colors && product.colors.some(c =>
          c.name.toLowerCase().includes(filters.color.toLowerCase()) ||
          filters.color.toLowerCase().includes(c.name.toLowerCase())
        );
        if (!hasColor) return false;
      }

      // 6. Material
      if (filters.material !== 'all') {
        if (!product.material.toLowerCase().includes(filters.material.toLowerCase().split(' ')[0])) {
          return false;
        }
      }

      // 7. Style
      if (filters.style !== 'all') {
        if (product.style && !product.style.toLowerCase().includes(filters.style.toLowerCase())) {
          return false;
        }
      }

      // 8. Offer & New
      if (filters.isOffer && !product.isOffer) return false;
      if (filters.isNew && !product.isNew) return false;

      // 9. Location
      if (filters.location !== 'all') {
        if (!product.locations || !product.locations.includes(filters.location)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (filters.sortBy === 'bestseller') return b.reviewCount - a.reviewCount;
      return 0; // relevance
    });
  }, [products, filters, searchQuery]);

  // Active filter chips
  const activeChips = [];
  if (filters.category !== 'all') activeChips.push({ label: `Categoría: ${filters.category}`, key: 'category' });
  if (filters.brand !== 'all') activeChips.push({ label: `Marca: ${filters.brand}`, key: 'brand' });
  if (filters.color !== 'all') activeChips.push({ label: `Color: ${filters.color}`, key: 'color' });
  if (filters.material !== 'all') activeChips.push({ label: `Material: ${filters.material}`, key: 'material' });
  if (filters.style !== 'all') activeChips.push({ label: `Estilo: ${filters.style}`, key: 'style' });
  if (filters.isOffer) activeChips.push({ label: `Solo Ofertas`, key: 'isOffer' });
  if (filters.isNew) activeChips.push({ label: `Novedades 2026`, key: 'isNew' });
  if (filters.location !== 'all') activeChips.push({ label: `Showroom: ${filters.location}`, key: 'location' });
  if (filters.maxPrice < 30000) activeChips.push({ label: `Hasta Bs. ${filters.maxPrice.toLocaleString('es-BO')}`, key: 'maxPrice' });

  const handleRemoveChip = (key) => {
    if (key === 'maxPrice') setFilters(prev => ({ ...prev, maxPrice: 30000 }));
    else if (key === 'isOffer' || key === 'isNew') setFilters(prev => ({ ...prev, [key]: false }));
    else setFilters(prev => ({ ...prev, [key]: 'all' }));
  };

  return (
    <section id="catalogo" className="section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <span className="section-tag">Catálogo Oficial</span>
            <h2 className="section-title">Nuestra Colección de Muebles</h2>
            <p className="section-subtitle">
              Encuentra sofás, sillones reclinables, sofás cama y accesorios con garantía y entrega en Bolivia.
            </p>
          </div>
        </div>

        <div className="catalog-layout">
          {/* Desktop Filter Sidebar */}
          <div className="desktop-only">
            <FilterSidebar />
          </div>

          {/* Main Content Area */}
          <div className="catalog-content">
            {/* Toolbar */}
            <div className="catalog-toolbar">
              <div className="catalog-count">
                Mostrando <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto' : 'productos'}
                {searchQuery && <span> para "<em>{searchQuery}</em>"</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Mobile Filter Button */}
                <button 
                  className="btn btn-outline btn-sm mobile-filter-btn"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <SlidersHorizontal size={14} />
                  <span>Filtrar</span>
                </button>

                {/* Sort Dropdown */}
                <div className="catalog-sort">
                  <ArrowUpDown size={14} color="var(--text-muted)" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="sort-select"
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="bestseller">Más Vendidos</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor Valorados</option>
                    <option value="newest">Novedades</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Chips */}
            {activeChips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Filtros activos:</span>
                {activeChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveChip(chip.key)}
                    className="badge badge-outline"
                    style={{ cursor: 'pointer', padding: '0.35rem 0.65rem' }}
                  >
                    <span>{chip.label}</span>
                    <X size={12} />
                  </button>
                ))}
                <button
                  onClick={resetFilters}
                  style={{ fontSize: '0.78rem', color: 'var(--color-celeste)', fontWeight: '700', textDecoration: 'underline', background: 'none' }}
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)'
              }}>
                <Inbox size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>No se encontraron productos</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Intenta cambiar los filtros seleccionados o buscar con otro término.
                </p>
                <button onClick={resetFilters} className="btn btn-primary">
                  Ver Todos los Productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="drawer-backdrop" onClick={() => setIsMobileFilterOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 style={{ fontSize: '1.1rem' }}>Filtros del Catálogo</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body">
              <FilterSidebar isMobile={true} onCloseMobile={() => setIsMobileFilterOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
