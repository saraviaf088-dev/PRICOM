import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { SHOWROOMS } from '../../data/showrooms';
import {
  MapPin, Phone, Mail, MessageCircle, Send, ShieldCheck,
  Truck, CreditCard, Lock, Smartphone, Settings
} from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const { setFilters, setActiveModal, openLegalModal, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('¡Suscripción Exitosa!', 'Recibirás las promociones exclusivas de PRICOM y Sealy.', 'success');
      setNewsletterEmail('');
    }
  };

  const handleCategoryClick = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
    if (window.location.pathname === '/') {
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#catalogo');
    }
  };

  const handleHomeLink = (e) => {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      navigate('/#inicio');
    }
  };

  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <img src="/iconos/logo%20pricom.png" alt="PRICOM Bolivia" style={{ height: '42px', backgroundColor: '#fff', padding: '4px', borderRadius: '6px' }} />
              <img src="/iconos/logo%20sealy.png" alt="Sealy Partner" style={{ height: '26px' }} />
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              PRICOM es la plataforma líder en Bolivia especializada en muebles de alta gama, sofás ortopédicos Sealy, convertibles multifuncionales y diseño de interiores.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--color-celeste)" />
                <span>Showrooms en Santa Cruz (Equipetrol), La Paz (Calacoto) y Cochabamba.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--color-celeste)" />
                <span>Atención a clientes: +{CONFIG.WHATSAPP_NUMBER.replace(/^(\d{3})(\d+)/, '$1 $2')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--color-celeste)" />
                <span>contacto@pricom.bo</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categorías */}
          <div>
            <h4 className="footer-col-title">Categorías</h4>
            <ul className="footer-links">
              <li><a href="#catalogo" onClick={() => handleCategoryClick('Sofás Cama')} className="footer-link">Sofás Cama Sealy</a></li>
              <li><a href="#catalogo" onClick={() => handleCategoryClick('Reclinables')} className="footer-link">Recliners Zero-Gravity</a></li>

            </ul>
          </div>

          {/* Col 3: Ayuda & Políticas */}
          <div>
            <h4 className="footer-col-title">Ayuda & Garantías</h4>
            <ul className="footer-links">
              <li><button onClick={() => openLegalModal('garantia')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Garantía Sealy 5 Años</button></li>
              <li><button onClick={() => openLegalModal('envios')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Tiempos de Envío en Bolivia</button></li>
              <li><button onClick={() => openLegalModal('envios')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Servicio de Armado Gratuito</button></li>
              <li><button onClick={() => openLegalModal('facturacion')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Facturación con NIT / CI</button></li>
              <li><button onClick={() => openLegalModal('terminos')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Términos y Condiciones</button></li>
              <li><button onClick={() => openLegalModal('privacidad')} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>Políticas de Privacidad</button></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & App */}
          <div>
            <h4 className="footer-col-title">Únete al Club PRICOM</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Suscríbete y recibe descuentos exclusivos y lanzamientos de nuevas colecciones.
            </p>

            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Tu correo electrónico..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="form-input"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.85rem' }}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Send size={15} />
              </button>
            </form>

            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
              ¿Consultas inmediatas?
              <a 
                href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola%20PRICOM`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#25D366', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
              >
                <MessageCircle size={16} />
                <span>Chatear al {CONFIG.WHATSAPP_NUMBER.replace(/^591/, '+591 ')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & payment trust badges */}
        <div className="footer-bottom">
          <div>
            © 2026 PRICOM Bolivia S.R.L. Todos los derechos reservados. Distribuidor Oficial Autorizado Sealy.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            <span>Pagos Seguros: QR Simple • Tigo Money • Visa • Mastercard • BCP • BNB</span>
            <button 
              onClick={() => setActiveModal('admin')}
              style={{ 
                background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
                padding: '4px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              title="Panel de Administración"
            >
              <Settings size={12} />
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
