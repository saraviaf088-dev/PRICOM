import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldCheck, Truck, MapPin, MessageCircle, Sparkles } from 'lucide-react';

export default function Hero() {
  const { setFilters } = useApp();

  const handleExplore = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOffers = () => {
    setFilters(prev => ({ ...prev, isOffer: true }));
    const el = document.getElementById('ofertas');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="hero">
      <div className="hero-overlay" />
      
      <div className="container hero-content">
        {/* Badge */}
        <div className="hero-badge">
          <Sparkles size={14} color="var(--color-celeste)" />
          <span>Colección Exclusiva Sealy Bolivia 2026</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Transforma tu <span>espacio.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Descubre muebles diseñados para vivir, descansar y disfrutar. Sofás ortopédicos, convertibles inteligentes y diseño de autor con entrega y armado en toda Bolivia.
        </p>

        {/* Call to Actions */}
        <div className="hero-actions">
          <button onClick={handleExplore} className="btn btn-primary btn-lg">
            <span>EXPLORAR PRODUCTOS</span>
            <ArrowRight size={18} />
          </button>

          <button onClick={handleOffers} className="btn btn-secondary btn-lg" style={{ border: '1.5px solid rgba(255, 255, 255, 0.4)' }}>
            <span>VER OFERTAS HASTA -50%</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="hero-stats">
          <div className="hero-stat-item">
            <div className="hero-stat-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="hero-stat-text">
              <h4>Garantía 5 Años</h4>
              <p>Respaldo oficial Sealy</p>
            </div>
          </div>

          <div className="hero-stat-item">
            <div className="hero-stat-icon">
              <Truck size={22} />
            </div>
            <div className="hero-stat-text">
              <h4>Envío & Armado</h4>
              <p>Santa Cruz, La Paz y CBB</p>
            </div>
          </div>

          <div className="hero-stat-item">
            <div className="hero-stat-icon">
              <MapPin size={22} />
            </div>
            <div className="hero-stat-text">
              <h4>3 Showrooms</h4>
              <p>Equipetrol y Calacoto</p>
            </div>
          </div>

          <div className="hero-stat-item">
            <div className="hero-stat-icon">
              <MessageCircle size={22} />
            </div>
            <div className="hero-stat-text">
              <h4>Asesoría Directa</h4>
              <p>WhatsApp inmediato</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
