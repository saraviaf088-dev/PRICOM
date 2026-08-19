import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { storage } from '../../storage';
import ProductCard from '../ProductCard/ProductCard';
import { Flame, Clock, ArrowRight } from 'lucide-react';

// Timer duration: 2 days in milliseconds
const TIMER_DURATION = 2 * 24 * 60 * 60 * 1000;

function getEndTime() {
  const saved = storage.get(CONFIG.STORAGE_KEYS.OFFERS_END);
  if (saved && Date.now() < saved) return saved;
  const newEnd = Date.now() + TIMER_DURATION;
  storage.set(CONFIG.STORAGE_KEYS.OFFERS_END, newEnd);
  return newEnd;
}

function calcTimeLeft(endTime) {
  const diff = Math.max(0, endTime - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function OffersSection() {
  const { products, setFilters } = useApp();

  const [endTime] = useState(getEndTime);
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endTime));
  const [discountFilter, setDiscountFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const offerProducts = products.filter(p => {
    if (!p.isOffer && p.discount === 0) return false;
    if (discountFilter === '50') return p.discount >= 50;
    if (discountFilter === '40') return p.discount >= 40 && p.discount < 50;
    if (discountFilter === '30') return p.discount >= 30 && p.discount < 40;
    return true;
  });

  return (
    <section id="ofertas" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Banner with Timer */}
        <div className="promo-banner">
          <div style={{ maxWidth: '650px' }}>
            <span className="badge badge-discount" style={{ marginBottom: '1rem' }}>
              <Flame size={14} />
              OFERTA POR TIEMPO LIMITADO
            </span>

            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#ffffff', marginBottom: '0.75rem', lineHeight: '1.1' }}>
              Descuentos Exclusivos Sealy hasta -50%
            </h2>

            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Aprovecha las promociones de temporada en sofás, sofás cama matrimoniales y sillones reclinables. Stock limitado para entrega inmediata.
            </p>

            {/* Countdown Box */}
            <div className="countdown-timer">
              <div className="countdown-box">
                <div className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</div>
                <div className="countdown-label">Días</div>
              </div>
              <div className="countdown-box">
                <div className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="countdown-label">Horas</div>
              </div>
              <div className="countdown-box">
                <div className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">Minutos</div>
              </div>
              <div className="countdown-box">
                <div className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="countdown-label">Segundos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem' }}>Selecciona tu Nivel de Ahorro:</h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${discountFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDiscountFilter('all')}
            >
              Todas las Ofertas ({products.filter(p => p.isOffer).length})
            </button>
            <button 
              className={`btn btn-sm ${discountFilter === '50' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDiscountFilter('50')}
            >
              50% OFF
            </button>
            <button 
              className={`btn btn-sm ${discountFilter === '40' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDiscountFilter('40')}
            >
              40% a 49% OFF
            </button>
            <button 
              className={`btn btn-sm ${discountFilter === '30' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDiscountFilter('30')}
            >
              30% a 39% OFF
            </button>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="product-grid">
          {offerProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
