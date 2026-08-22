import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../config';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import WhatsAppFloating from '../components/WhatsAppFloating/WhatsAppFloating';
import ToastContainer from '../components/Toast/ToastContainer';
import ProductCard from '../components/ProductCard/ProductCard';
import {
  X, Heart, Scale, ShoppingBag, MessageCircle, Star, ShieldCheck,
  Truck, Check, Maximize2, Layers
} from 'lucide-react';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    products, addToCart, isInWishlist, toggleWishlist,
    isInComparator, toggleComparator, setCheckoutStep, setActiveModal
  } = useApp();

  const product = products.find(p => p.slug === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors && product.colors[0]?.name ? product.colors[0].name : '');
      setSelectedMaterial(product.material || '');
      setQuantity(1);
      setActiveTab('descripcion');
      document.title = `${product.name} | PRICOM Bolivia`;
    }
  }, [product]);

  const handleColorChange = (colorName) => {
    if (!product) return;
    const clickedColor = product.colors?.find(c => c.name === colorName);
    const clickedHex = clickedColor?.hex;
    const variant = products.find(p =>
      p.id !== product.id &&
      p.category === product.category &&
      p.colors &&
      p.colors.some(c => c.hex === clickedHex || c.name === colorName)
    );
    if (variant) {
      navigate(`/producto/${variant.slug}`, { replace: true });
    } else {
      setSelectedColor(colorName);
    }
  };

  if (!product) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Producto no encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>El producto que buscas no existe o fue removido.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
        <Footer />
      </>
    );
  }

  const isWish = isInWishlist(product.id);
  const isComp = isInComparator(product.id);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${product.images[activeImageIndex]})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { color: selectedColor, material: selectedMaterial });
    setCheckoutStep(1);
    navigate('/checkout');
  };

  const whatsappMessage = encodeURIComponent(
    `Hola PRICOM, estoy interesado en el *${product.name}* (Precio: Bs. ${product.price.toLocaleString('es-BO')}). Color: ${selectedColor || 'Estándar'}. ¿Podrían confirmarme disponibilidad y tiempo de entrega en mi ciudad?`
  );
  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="pdp-page">
        <div className="pdp-grid">
          <div className="pdp-gallery">
            <div
              className="pdp-main-image-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsFullScreen(true)}
            >
              <img
                key={product.id}
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="pdp-main-image"
              />
              <div
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundSize: '250%', borderRadius: 'inherit', ...zoomStyle
                }}
              />
              <button
                className="card-action-btn"
                style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}
                onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }}
                title="Ver en pantalla completa"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            <div className="pdp-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pdp-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="pdp-thumb-img" />
                </button>
              ))}
            </div>

            <div className="pdp-photo-note">
              <Layers size={18} color="var(--color-celeste)" />
              <span>Fotografías tomadas en ambientes reales de showrooms oficiales Sealy Bolivia.</span>
            </div>
          </div>

          <div className="pdp-info">
            <div className="pdp-info-header">
              <span className="pdp-brand-label">
                {product.brand} • {product.category}
              </span>
              <div className="pdp-info-actions">
                <button className={`card-action-btn ${isWish ? 'active' : ''}`} onClick={() => toggleWishlist(product.id)} title="Favorito">
                  <Heart size={16} fill={isWish ? '#ffffff' : 'none'} />
                </button>
                <button className={`card-action-btn ${isComp ? 'compare-active' : ''}`} onClick={() => toggleComparator(product.id)} title="Comparar">
                  <Scale size={16} />
                </button>
              </div>
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-rating">
              <Star size={16} fill="currentColor" />
              <span className="pdp-rating-value">{product.rating}</span>
              <span className="pdp-rating-count">({product.reviewCount} valoraciones de clientes en Bolivia)</span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-current-price">Bs. {product.price.toLocaleString('es-BO')}</span>
              {product.originalPrice && <span className="pdp-original-price">Antes Bs. {product.originalPrice.toLocaleString('es-BO')}</span>}
              {product.discount > 0 && <span className="pdp-discount-badge">Ahorras {product.discount}%</span>}
            </div>

            <div className="pdp-stock-status">
              <Check size={14} />
              <span>{product.availability} ({product.stockCount} unidades disponibles)</span>
            </div>

            <p className="pdp-description">
              {product.shortDescription}
            </p>

            {product.colors && product.colors.length > 1 && (
              <div className="pdp-color-section">
                <label className="form-label">Color seleccionado: <strong>{selectedColor}</strong></label>
                <div className="color-swatches">
                  {product.colors.map((c, i) => (
                    <button key={i} className={`color-swatch-btn ${selectedColor === c.name ? 'active' : ''}`} onClick={() => handleColorChange(c.name)} style={{ backgroundColor: c.hex }} title={c.name} />
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-qty-row">
              <span className="pdp-qty-label">Cantidad:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="pdp-action-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleBuyNow}>
                <ShoppingBag size={18} />
                <span>Comprar Ahora</span>
              </button>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                <MessageCircle size={18} />
                <span>Consultar WhatsApp</span>
              </a>
            </div>

            <button className="btn btn-outline pdp-add-cart-btn" onClick={() => addToCart(product, quantity, { color: selectedColor, material: selectedMaterial })}>
              <span>Agregar al Carrito de Compras</span>
            </button>

            <div className="pdp-warranty-info">
              <div className="pdp-warranty-item">
                <ShieldCheck size={16} color="var(--color-celeste)" />
                <span>{product.warranty}</span>
              </div>
              <div className="pdp-warranty-item">
                <Truck size={16} color="var(--color-celeste)" />
                <span>Armado gratuito en tu domicilio en Santa Cruz, La Paz y Cochabamba</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pdp-tabs">
          <div className="pdp-tabs-nav">
            <button className={`pdp-tab-btn ${activeTab === 'descripcion' ? 'active' : ''}`} onClick={() => setActiveTab('descripcion')}>Descripción</button>
            <button className={`pdp-tab-btn ${activeTab === 'ficha' ? 'active' : ''}`} onClick={() => setActiveTab('ficha')}>Ficha Técnica</button>
            <button className={`pdp-tab-btn ${activeTab === 'garantia' ? 'active' : ''}`} onClick={() => setActiveTab('garantia')}>Garantía Oficial</button>
            <button className={`pdp-tab-btn ${activeTab === 'envios' ? 'active' : ''}`} onClick={() => setActiveTab('envios')}>Envíos en Bolivia</button>
            <button className={`pdp-tab-btn ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>Preguntas Frecuentes</button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'descripcion' && (
              <div>
                <p style={{ lineHeight: '1.7', marginBottom: '1.5rem' }}>{product.fullDescription}</p>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-celeste)' }}>Características Principales:</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
                  {product.features && product.features.map((feat, i) => <li key={i} style={{ color: 'var(--text-secondary)' }}>{feat}</li>)}
                </ul>
              </div>
            )}
            {activeTab === 'ficha' && (
              <div>
                <table className="comparator-table">
                  <tbody>
                    {product.specs && product.specs.map((spec, i) => <tr key={i}><th>{spec.label}</th><td>{spec.value}</td></tr>)}
                    <tr><th>Dimensiones</th><td>Ancho: {product.dimensions.width} | Profundidad: {product.dimensions.depth} | Alto: {product.dimensions.height}{product.dimensions.bedDimensions && ` | Modo Cama: ${product.dimensions.bedDimensions}`}</td></tr>
                    <tr><th>Material y Tapiz</th><td>{product.material}</td></tr>
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
                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>Este producto cuenta con respaldo de fábrica oficial. Cubre defectos en estructuras de madera tratada, ensambles metálicos de apertura, resortes embolsados y mecanismos de reclinación por 5 años, además de 2 años en espumas y tapicería ante defectos de fabricación.</p>
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

          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Completa tu ambiente con estos modelos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloating />
      <ToastContainer />

      {isFullScreen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsFullScreen(false)}>
          <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#fff', fontSize: '1.5rem' }} onClick={() => setIsFullScreen(false)}>
            <X size={32} />
          </button>
          <img src={product.images[activeImageIndex]} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
        </div>
      )}
    </>
  );
}
