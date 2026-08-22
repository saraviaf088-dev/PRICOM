import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { Scale, X, ShoppingBag, MessageCircle, Star, Check, Trash2 } from 'lucide-react';

export default function Comparator() {
  const navigate = useNavigate();
  const {
    comparator, clearComparator, toggleComparator,
    products, activeModal, setActiveModal,
    addToCart
  } = useApp();

  const compProducts = products.filter(p => comparator.includes(p.id));

  if (compProducts.length === 0) return null;

  const isModalOpen = activeModal === 'comparator';

  return (
    <>
      {/* 1. Floating Sticky Dock at Bottom */}
      {!isModalOpen && (
        <div className="comparator-dock">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={20} color="var(--color-celeste)" />
            <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>
              Comparar ({compProducts.length}/4)
            </span>
          </div>

          <div className="comparator-dock-items">
            {compProducts.map(p => (
              <div key={p.id} style={{ position: 'relative' }}>
                <img src={p.images[0]} alt={p.name} className="comparator-dock-thumb" />
                <button
                  onClick={() => toggleComparator(p.id)}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: 'var(--color-danger)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}
                  title="Quitar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setActiveModal('comparator')}
            >
              Comparar Ahora
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={clearComparator}
              title="Vaciar comparador"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Full Screen / Detailed Comparison Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Comparador de productos">
          <div 
            className="modal-container comparator-modal-container"
            style={{ maxWidth: '1200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Scale size={22} color="var(--color-celeste)" />
                <h3 style={{ fontSize: '1.25rem' }}>Comparativa de Productos ({compProducts.length} seleccionados)</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={clearComparator} 
                  className="btn btn-outline btn-sm"
                >
                  Limpiar Todo
                </button>
                <button onClick={() => setActiveModal(null)} className="btn-icon">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table className="comparator-table">
                <thead>
                  <tr>
                    <th>Atributo</th>
                    {compProducts.map(p => (
                      <td key={p.id} style={{ minWidth: '220px', textAlign: 'center', verticalAlign: 'top' }}>
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                          />
                          <button
                            onClick={() => toggleComparator(p.id)}
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: 'var(--bg-surface)',
                              borderRadius: '50%',
                              padding: '4px',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                            title="Quitar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-celeste)', fontWeight: '700', textTransform: 'uppercase' }}>
                          {p.brand}
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem', margin: '0.25rem 0' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-azul-oscuro)', marginBottom: '0.75rem' }}>
                          Bs. {p.price.toLocaleString('es-BO')}
                        </div>
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', marginBottom: '0.35rem' }}
                          onClick={() => {
                            addToCart(p, 1);
                            setActiveModal(null);
                          }}
                        >
                          <ShoppingBag size={14} />
                          <span>Comprar</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Categoría</th>
                    {compProducts.map(p => <td key={p.id}>{p.category} - {p.subCategory}</td>)}
                  </tr>
                  <tr>
                    <th>Calificación</th>
                    {compProducts.map(p => (
                      <td key={p.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-rating)', fontWeight: '700' }}>
                          <Star size={14} fill="currentColor" />
                          <span>{p.rating} ({p.reviewCount} reseñas)</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Material Principal</th>
                    {compProducts.map(p => <td key={p.id}>{p.material}</td>)}
                  </tr>
                  <tr>
                    <th>Dimensiones</th>
                    {compProducts.map(p => (
                      <td key={p.id}>
                        {p.dimensions.width} (Ancho) × {p.dimensions.depth} (Prof.) × {p.dimensions.height} (Alto)
                        {p.dimensions.bedDimensions && <div><strong>Cama:</strong> {p.dimensions.bedDimensions}</div>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Estilo de Diseño</th>
                    {compProducts.map(p => <td key={p.id}>{p.style || 'Contemporáneo'}</td>)}
                  </tr>
                  <tr>
                    <th>Garantía Oficial</th>
                    {compProducts.map(p => <td key={p.id}>{p.warranty}</td>)}
                  </tr>
                  <tr>
                    <th>Disponibilidad</th>
                    {compProducts.map(p => (
                      <td key={p.id}>
                        <span style={{ color: 'var(--color-success)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> {p.availability}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Consultar Asesor</th>
                    {compProducts.map(p => {
                      const msg = encodeURIComponent(`Hola PRICOM, deseo información y disponibilidad del modelo ${p.name} (Bs. ${p.price.toLocaleString('es-BO')})`);
                      return (
                        <td key={p.id} style={{ textAlign: 'center' }}>
                          <a
                            href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            style={{ width: '100%' }}
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
