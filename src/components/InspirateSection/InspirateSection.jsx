import React from 'react';
import { useApp } from '../../context/AppContext';
import { ARTICLES } from '../../data/articles';
import { BookOpen, Clock, ArrowRight, X, User } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';

export default function InspirateSection() {
  const { 
    selectedArticle, openArticle, 
    activeModal, setActiveModal, 
    products 
  } = useApp();

  const isReaderOpen = activeModal === 'article' && selectedArticle;

  // Linked products mentioned in article
  const linkedProducts = selectedArticle ? products.filter(p => 
    selectedArticle.relatedProductIds && selectedArticle.relatedProductIds.includes(p.id)
  ) : [];

  return (
    <section id="inspirate" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-tag">Revista de Diseño & Confort</span>
            <h2 className="section-title">INSPÍRATE</h2>
            <p className="section-subtitle">
              Guías editoriales, consejos de arquitectura de interiores y tendencias para transformar tu hogar.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="articles-grid">
          {ARTICLES.map(art => (
            <article key={art.id} className="article-card" onClick={() => openArticle(art)} style={{ cursor: 'pointer' }}>
              <img src={art.image} alt={art.title} className="article-card-img" loading="lazy" />
              
              <div className="article-card-body">
                <div className="article-meta">
                  <span className="article-category">{art.category}</span>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 className="article-card-title">{art.title}</h3>
                <p className="article-card-summary">{art.summary}</p>

                <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-celeste)', fontWeight: '700', fontSize: '0.88rem' }}>
                  <span>Leer Artículo Completo</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Article Reader Modal */}
      {isReaderOpen && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-container" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
              <X size={20} />
            </button>

            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title} 
              style={{ width: '100%', height: '320px', objectFit: 'cover' }} 
            />

            <div style={{ padding: '2.5rem' }}>
              <div className="article-meta" style={{ marginBottom: '1rem' }}>
                <span className="badge badge-celeste">{selectedArticle.category}</span>
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: '1.2' }}>
                {selectedArticle.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <User size={16} color="var(--color-celeste)" />
                <span>Por: <strong>{selectedArticle.author}</strong></span>
              </div>

              <div 
                style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              {/* Linked Products in Article */}
              {linkedProducts.length > 0 && (
                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-celeste)' }}>
                    Muebles Destacados en este Artículo:
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {linkedProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
