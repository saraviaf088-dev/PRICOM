import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { SHOWROOMS } from '../../data/showrooms';
import { MessageCircle, X, Send, MapPin, Sparkles } from 'lucide-react';

export default function WhatsAppFloating() {
  const { selectedProduct, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState(SHOWROOMS[0]);
  const [customText, setCustomText] = useState('');

  // Default context message
  let defaultMessage = CONFIG.WHATSAPP_DEFAULT_MSG;
  if (selectedProduct) {
    defaultMessage = `Hola, estoy interesado en *${selectedProduct.name}* (Precio: Bs. ${selectedProduct.price.toLocaleString('es-BO')}). ¿Podrían brindarme asesoramiento y disponibilidad en showroom?`;
  } else if (cart.length > 0) {
    defaultMessage = `Hola PRICOM, tengo ${cart.length} productos en mi carrito y quiero consultar sobre envíos y formas de pago.`;
  }

  const handleSendMessage = () => {
    const textToSend = customText.trim() || defaultMessage;
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        className="whatsapp-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Chatear por WhatsApp con un Asesor"
      >
        <div className="whatsapp-pulse-ring" />
        {isOpen ? <X size={28} /> : <MessageCircle size={32} />}
      </div>

      {/* Interactive Quick-Chat Window */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '2rem',
            width: '340px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 960,
            overflow: 'hidden',
            animation: 'modalEnter 0.25s ease'
          }}
        >
          {/* WhatsApp Header */}
          <div style={{ backgroundColor: 'var(--color-whatsapp-dark)', color: '#ffffff', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ position: 'relative' }}>
                <img src="/iconos/logo%20pricom.png" alt="PRICOM" style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fff', padding: '4px' }} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #fff' }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>Asesor PRICOM Bolivia</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>En línea • Respuesta en &lt; 2 min</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#fff' }}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
            {/* Showroom Selector */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Selecciona tu Showroom más cercano:
              </label>
              <select 
                className="form-select"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                value={selectedShowroom.id}
                onChange={(e) => setSelectedShowroom(SHOWROOMS.find(s => s.id === e.target.value) || SHOWROOMS[0])}
              >
                {SHOWROOMS.map(s => (
                  <option key={s.id} value={s.id}>{s.city} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Bubble Message */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-celeste)', marginBottom: '0.25rem' }}>Mensaje sugerido:</div>
              <p style={{ color: 'var(--text-secondary)' }}>"{defaultMessage}"</p>
            </div>

            {/* Custom Input */}
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="O escribe tu consulta personalizada..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{ fontSize: '0.82rem', resize: 'none', marginBottom: '0.75rem' }}
            />

            <button 
              className="btn btn-whatsapp" 
              style={{ width: '100%', padding: '0.65rem' }}
              onClick={handleSendMessage}
            >
              <Send size={15} />
              <span>Abrir WhatsApp Ahora</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
