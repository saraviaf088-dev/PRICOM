import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { 
  X, Heart, Scale, ShoppingBag, MessageCircle, Star, ShieldCheck, 
  Truck, Check, Sparkles, MapPin, Maximize2, Layers, Clock, HelpCircle, ChevronRight
} from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';

export default function ProductModal() {
  const { 
    selectedProduct, setSelectedProduct, closeModal, 
    addToCart, isInWishlist, toggleWishlist, 
    isInComparator, toggleComparator, 
    products, setActiveModal, setCheckoutStep 
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descripcion'); // 'descripcion' | 'ficha' | 'garantia' | 'envios' | 'faq'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  // Update selected color/material when selectedProduct changes
  React.useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setSelectedColor(selectedProduct.colors && selectedProduct.colors[0]?.name ? selectedProduct.colors[0].name : '');
      setSelectedMaterial(selectedProduct.material || '');
      setQuantity(1);
      setActiveTab('descripcion');
    }
  }, [selectedProduct]);

  // Handle color change: find matching variant product in same category by hex color
  const handleColorChange = (colorName) => {
    if (!selectedProduct) return;
    const clickedColor = selectedProduct.colors?.find(c => c.name === colorName);
    const clickedHex = clickedColor?.hex;
    const variant = products.find(p =>
      p.id !== selectedProduct.id &&
      p.category === selectedProduct.category &&
      p.colors &&
      p.colors.some(c => c.hex === clickedHex || c.name === colorName)
    );
    if (variant) {
      setSelectedProduct(variant);
    } else {
      setSelectedColor(colorName);
    }
  };

  if (!selectedProduct) return null;

  const isWish = isInWishlist(selectedProduct.id);
  const isComp = isInComparator(selectedProduct.id);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${selectedProduct.images[activeImageIndex]})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, { color: selectedColor, material: selectedMaterial });
    closeModal();
    setCheckoutStep(1);
    setActiveModal('checkout');
  };

  const whatsappMessage = encodeURIComponent(
    `Hola PRICOM, estoy interesado en el *${selectedProduct.name}* (Precio: Bs. ${selectedProduct.price.toLocaleString('es-BO')}). Color: ${selectedColor || 'Estándar'}. ¿Podrían confirmarme disponibilidad y tiempo de entrega en mi ciudad?`
  );

  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 3);

  return (
    <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-label={`Detalles de ${selectedProduct.name}`}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" type="button" onClick={(e) => { e.stopPropagation(); closeModal(); }} title="Cerrar">
          <X size={20} />
        </button>

        {/* 1. Main PDP Split View */}
        <div className="pdp-grid">
          {/* Left: Gallery */}
          <div className="pdp-gallery">
            <div 
              className="pdp-main-image-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsFullScreen(true)}
            >
              <img
                key={selectedProduct.id}
                src={selectedProduct.images[activeImageIndex]}
                alt={selectedProduct.name}
                className="pdp-main-image"
              />

              {/* Hover Zoom Overlay */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundSize: '250%',
                  borderRadius: 'inherit',
                  ...zoomStyle
                }} 
              />

              <button 
                className="card-action-btn"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullScreen(true);
                }}
                title="Ver en pantalla completa"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="pdp-thumbnails">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pdp-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="pdp-thumb-img" />
                </button>
              ))}
            </div>

            {/* In-room preview badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}>
              <Layers size={18} color="var(--color-celeste)" />
              <span>Fotografías tomadas en ambientes reales de showrooms oficiales Sealy Bolivia.</span>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="pdp-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-celeste)', letterSpacing: '0.05em' }}>
                {selectedProduct.brand} • {selectedProduct.category}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`card-action-btn ${isWish ? 'active' : ''}`}
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  title="Favorito"
                >
                  <Heart size={16} fill={isWish ? '#ffffff' : 'none'} />
                </button>
                <button 
                  className={`card-action-btn ${isComp ? 'compare-active' : ''}`}
                  onClick={() => toggleComparator(selectedProduct.id)}
                  title="Comparar"
                >
                  <Scale size={16} />
                </button>
              </div>
            </div>

            <h1 className="pdp-title">{selectedProduct.name}</h1>

            {/* Rating */}
            <div className="product-card-rating" style={{ marginBottom: '1rem' }}>
              <Star size={16} fill="currentColor" />
              <span style={{ fontWeight: '700' }}>{selectedProduct.rating}</span>
              <span>({selectedProduct.reviewCount} valoraciones de clientes en Bolivia)</span>
            </div>

            {/* Price Row */}
            <div className="pdp-price-row">
              <span className="pdp-current-price">
                Bs. {selectedProduct.price.toLocaleString('es-BO')}
              </span>
              {selectedProduct.originalPrice && (
                <span className="pdp-original-price">
                  Antes Bs. {selectedProduct.originalPrice.toLocaleString('es-BO')}
                </span>
              )}
              {selectedProduct.discount > 0 && (
                <span className="pdp-discount-badge">
                  Ahorras {selectedProduct.discount}%
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="pdp-stock-status">
              <Check size={14} />
              <span>{selectedProduct.availability} ({selectedProduct.stockCount} unidades disponibles)</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {selectedProduct.shortDescription}
            </p>

            {/* Color selector */}
            {selectedProduct.colors && selectedProduct.colors.length > 1 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  Color seleccionado: <strong>{selectedColor}</strong>
                </label>
                <div className="color-swatches">
                  {selectedProduct.colors.map((c, i) => (
                    <button
                      key={i}
                      className={`color-swatch-btn ${selectedColor === c.name ? 'active' : ''}`}
                      onClick={() => handleColorChange(c.name)}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Controller */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Cantidad:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdp-action-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleBuyNow}>
                <ShoppingBag size={18} />
                <span>Comprar Ahora</span>
              </button>

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <MessageCircle size={18} />
                <span>Consultar WhatsApp</span>
              </a>
            </div>

            {/* Add to Cart secondary */}
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginBottom: '1.5rem' }}
              onClick={() => addToCart(selectedProduct, quantity, { color: selectedColor, material: selectedMaterial })}
            >
              <span>Agregar al Carrito de Compras</span>
            </button>

            {/* Quick Guarantees list */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-celeste)" />
                <span>{selectedProduct.warranty}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} color="var(--color-celeste)" />
                <span>Armado gratuito en tu domicilio en Santa Cruz, La Paz y Cochabamba</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detailed Tabs Accordion */}
        <div className="pdp-tabs">
          <div className="pdp-tabs-nav">
            <button 
              className={`pdp-tab-btn ${activeTab === 'descripcion' ? 'active' : ''}`}
              onClick={() => setActiveTab('descripcion')}
            >
              Descripción
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'ficha' ? 'active' : ''}`}
              onClick={() => setActiveTab('ficha')}
            >
              Ficha Técnica
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'garantia' ? 'active' : ''}`}
              onClick={() => setActiveTab('garantia')}
            >
              Garantía Oficial
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'envios' ? 'active' : ''}`}
              onClick={() => setActiveTab('envios')}
            >
              Envíos en Bolivia
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveTab('faq')}
            >
              Preguntas Frecuentes
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'descripcion' && (
              <div>
                <p style={{ lineHeight: '1.7', marginBottom: '1.5rem' }}>{selectedProduct.fullDescription}</p>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-celeste)' }}>Características Principales:</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
                  {selectedProduct.features && selectedProduct.features.map((feat, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)' }}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'ficha' && (
              <div>
                <table className="comparator-table">
                  <tbody>
                    {selectedProduct.specs && selectedProduct.specs.map((spec, i) => (
                      <tr key={i}>
                        <th>{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                    <tr>
                      <th>Dimensiones</th>
                      <td>
                        Ancho: {selectedProduct.dimensions.width} | Profundidad: {selectedProduct.dimensions.depth} | Alto: {selectedProduct.dimensions.height}
                        {selectedProduct.dimensions.bedDimensions && ` | Modo Cama: ${selectedProduct.dimensions.bedDimensions}`}
                      </td>
                    </tr>
                    <tr>
                      <th>Material y Tapiz</th>
                      <td>{selectedProduct.material}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'garantia' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={32} color="var(--color-celeste)" />
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>Garantía Certificada Sealy & PRICOM</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cobertura directa en todo el territorio boliviano</p>
                  </div>
                </div>
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  Este producto cuenta con respaldo de fábrica oficial. Cubre defectos en estructuras de madera tratada, ensambles metálicos de apertura, resortes embolsados y mecanismos de reclinación por 5 años, además de 2 años en espumas y tapicería ante defectos de fabricación.
                </p>
              </div>
            )}

            {activeTab === 'envios' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h5 style={{ color: 'var(--color-celeste)', marginBottom: '0.35rem' }}>Santa Cruz de la Sierra</h5>
                    <p style={{ fontSize: '0.85rem' }}>Entrega en 24 horas con armado gratis en tu sala.</p>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h5 style={{ color: 'var(--color-celeste)', marginBottom: '0.35rem' }}>La Paz & El Alto</h5>
                    <p style={{ fontSize: '0.85rem' }}>Entrega en 24 a 48 horas con personal capacitado.</p>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h5 style={{ color: 'var(--color-celeste)', marginBottom: '0.35rem' }}>Cochabamba & Otros Dptos.</h5>
                    <p style={{ fontSize: '0.85rem' }}>Envíos asegurados y coordinados a Tarija, Sucre, Oruro, Potosí, Beni y Pando.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h5 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>¿Cómo se limpia el tapizado?</h5>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Las telas Sealy cuentan con tratamiento repelente. Para suciedad habitual basta un paño húmedo con jabón neutro sin frotar agresivamente.</p>
                </div>
                <div>
                  <h5 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>¿El sofá pasa por puertas estándar de edificios?</h5>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Sí, todos nuestros modelos están diseñados para ingresar con facilidad por puertas de 80 cm y ascensores residenciales. Las patas son desmontables.</p>
                </div>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Completa tu ambiente con estos modelos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullScreen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setIsFullScreen(false)}
        >
          <button 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#fff', fontSize: '1.5rem' }}
            onClick={() => setIsFullScreen(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedProduct.images[activeImageIndex]} 
            alt="Full size" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} 
          />
        </div>
      )}
    </div>
  );
}
