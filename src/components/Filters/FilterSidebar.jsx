import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, BRANDS } from '../../data/categories';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

export const COLOR_OPTIONS = [
  { name: 'Seafoam', hex: '#7ba79d' },
  { name: 'Slate', hex: '#4f555c' },
  { name: 'Piper Blue', hex: '#2a5482' },
  { name: 'Chive Oliva', hex: '#5d6b4f' },
  { name: 'Mocha', hex: '#6f5440' },
  { name: 'Chocolate', hex: '#4a3224' },
  { name: 'Beach Arena', hex: '#c9beaa' },
  { name: 'Turquesa', hex: '#1f8d9b' },
  { name: 'Gris Perla', hex: '#a4a8ad' },
  { name: 'Noir / Negro', hex: '#1a1c20' }
];

export const MATERIAL_OPTIONS = [
  'Lino Premium',
  'Microfibra Anti-manchas',
  'Air-Leather / Cuero',
  'Madera Maciza de Roble/Fresno',
  'Mármol Sintético Sinterizado',
  'Lana Natural 100%'
];

export const STYLE_OPTIONS = [
  'Contemporáneo',
  'Minimalista',
  'Mid-Century Modern',
  'Escandinavo',
  'Lujo Contemporáneo'
];

export default function FilterSidebar({ isMobile = false, onCloseMobile }) {
  const { filters, setFilters, resetFilters, products } = useApp();

  const handlePriceChange = (e, type) => {
    const val = Number(e.target.value);
    setFilters(prev => ({
      ...prev,
      [type]: val
    }));
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={18} color="var(--color-celeste)" />
          <span>Filtros Avanzados</span>
        </div>
        <button onClick={resetFilters} className="filters-reset-btn" title="Limpiar todos los filtros">
          <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
          Limpiar
        </button>
      </div>

      {/* 1. Categoría */}
      <div className="filter-group">
        <div className="filter-group-title">Categoría</div>
        <label className="filter-checkbox-label">
          <input
            type="radio"
            name="filter-cat"
            checked={filters.category === 'all'}
            onChange={() => setFilters(prev => ({ ...prev, category: 'all', subCategory: 'all' }))}
          />
          <span>Todas las categorías</span>
        </label>
        {CATEGORIES.map(cat => (
          <label key={cat.id} className="filter-checkbox-label">
            <input
              type="radio"
              name="filter-cat"
              checked={filters.category.toLowerCase() === cat.name.toLowerCase()}
              onChange={() => setFilters(prev => ({ ...prev, category: cat.name, subCategory: 'all' }))}
            />
            <span>{cat.name} ({cat.count})</span>
          </label>
        ))}
      </div>

      {/* 2. Marca */}
      <div className="filter-group">
        <div className="filter-group-title">Marca</div>
        <label className="filter-checkbox-label">
          <input
            type="radio"
            name="filter-brand"
            checked={filters.brand === 'all'}
            onChange={() => setFilters(prev => ({ ...prev, brand: 'all' }))}
          />
          <span>Todas las marcas</span>
        </label>
        {BRANDS.map(brand => (
          <label key={brand.id} className="filter-checkbox-label">
            <input
              type="radio"
              name="filter-brand"
              checked={filters.brand.toLowerCase() === brand.name.toLowerCase()}
              onChange={() => setFilters(prev => ({ ...prev, brand: brand.name }))}
            />
            <span>{brand.name}</span>
          </label>
        ))}
      </div>

      {/* 3. Rango de Precio (Bs.) */}
      <div className="filter-group">
        <div className="filter-group-title">Precio Máximo: Bs. {filters.maxPrice.toLocaleString('es-BO')}</div>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => handlePriceChange(e, 'maxPrice')}
          style={{ width: '100%', accentColor: 'var(--color-celeste)' }}
        />
        <div className="price-slider-inputs">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange(e, 'minPrice')}
            className="price-input-box"
            placeholder="Min Bs."
          />
          <span>-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange(e, 'maxPrice')}
            className="price-input-box"
            placeholder="Max Bs."
          />
        </div>
      </div>

      {/* 4. Muestrario de Colores */}
      <div className="filter-group">
        <div className="filter-group-title">Color</div>
        <div className="color-swatches">
          <button
            className={`color-swatch-btn ${filters.color === 'all' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, color: 'all' }))}
            style={{ background: 'linear-gradient(45deg, #ccc, #fff)' }}
            title="Todos los colores"
          />
          {COLOR_OPTIONS.map((c, i) => (
            <button
              key={i}
              className={`color-swatch-btn ${filters.color.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, color: prev.color === c.name ? 'all' : c.name }))}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* 5. Material */}
      <div className="filter-group">
        <div className="filter-group-title">Material</div>
        <label className="filter-checkbox-label">
          <input
            type="radio"
            name="filter-material"
            checked={filters.material === 'all'}
            onChange={() => setFilters(prev => ({ ...prev, material: 'all' }))}
          />
          <span>Todos los materiales</span>
        </label>
        {MATERIAL_OPTIONS.map((mat, i) => (
          <label key={i} className="filter-checkbox-label">
            <input
              type="radio"
              name="filter-material"
              checked={filters.material === mat}
              onChange={() => setFilters(prev => ({ ...prev, material: mat }))}
            />
            <span>{mat}</span>
          </label>
        ))}
      </div>

      {/* 6. Estilo */}
      <div className="filter-group">
        <div className="filter-group-title">Estilo</div>
        <label className="filter-checkbox-label">
          <input
            type="radio"
            name="filter-style"
            checked={filters.style === 'all'}
            onChange={() => setFilters(prev => ({ ...prev, style: 'all' }))}
          />
          <span>Todos los estilos</span>
        </label>
        {STYLE_OPTIONS.map((st, i) => (
          <label key={i} className="filter-checkbox-label">
            <input
              type="radio"
              name="filter-style"
              checked={filters.style === st}
              onChange={() => setFilters(prev => ({ ...prev, style: st }))}
            />
            <span>{st}</span>
          </label>
        ))}
      </div>

      {/* 7. Promociones y Novedades */}
      <div className="filter-group">
        <div className="filter-group-title">Ocasión</div>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={filters.isOffer}
            onChange={(e) => setFilters(prev => ({ ...prev, isOffer: e.target.checked }))}
          />
          <span>Solo Ofertas con Descuento</span>
        </label>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={filters.isNew}
            onChange={(e) => setFilters(prev => ({ ...prev, isNew: e.target.checked }))}
          />
          <span>Nuevos Lanzamientos 2026</span>
        </label>
      </div>

      {/* 8. Disponibilidad Ciudad */}
      <div className="filter-group" style={{ borderBottom: 'none', marginBottom: 0 }}>
        <div className="filter-group-title">Disponibilidad en Showroom</div>
        {['Todas', 'Santa Cruz', 'La Paz', 'Cochabamba'].map((city, i) => (
          <label key={i} className="filter-checkbox-label">
            <input
              type="radio"
              name="filter-loc"
              checked={filters.location === (city === 'Todas' ? 'all' : city)}
              onChange={() => setFilters(prev => ({ ...prev, location: city === 'Todas' ? 'all' : city }))}
            />
            <span>{city}</span>
          </label>
        ))}
      </div>

      {isMobile && (
        <button 
          className="btn btn-primary btn-lg" 
          style={{ width: '100%', marginTop: '1.5rem' }}
          onClick={onCloseMobile}
        >
          Ver Resultados
        </button>
      )}
    </aside>
  );
}

FilterSidebar.propTypes = {
  isMobile: PropTypes.bool,
  onCloseMobile: PropTypes.func,
};
