import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/categories';
import { ArrowRight } from 'lucide-react';

export default function Categories() {
  const { setFilters } = useApp();

  const handleSelectCategory = (categoryName) => {
    setFilters(prev => ({
      ...prev,
      category: categoryName,
      subCategory: 'all'
    }));
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-tag">Colecciones Destacadas</span>
            <h2 className="section-title">Explora por Categoría</h2>
            <p className="section-subtitle">
              Mobiliario y decoración diseñados con los más altos estándares de estética y durabilidad.
            </p>
          </div>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleSelectCategory(cat.name)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="category-card-bg"
                loading="lazy"
              />
              <div className="category-card-overlay" />
              <div className="category-card-content">
                <span className="category-card-count">{cat.count} Modelos Disponibles</span>
                <h3 className="category-card-title">{cat.name}</h3>
                <p className="category-card-tagline">{cat.tagline}</p>
                <div className="category-card-btn">
                  <span>Explorar</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
