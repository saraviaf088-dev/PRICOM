import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePWA } from '../../hooks/usePWA';
import { Smartphone, Download, Sparkles, CheckCircle2, QrCode } from 'lucide-react';

export default function AppDownloadSection() {
  const { showToast } = useApp();
  const { isInstallable, installApp } = usePWA();

  const handleDownloadClick = (platform) => {
    showToast('Descarga de App', `Iniciando descarga para ${platform} (PRICOM App Móvil).`, 'info');
  };

  const handleInstallPWA = async () => {
    if (isInstallable) {
      const installed = await installApp();
      if (installed) {
        showToast('¡Instalada!', 'PRICOM se instaló en tu pantalla de inicio.', 'success');
      }
    } else {
      showToast('Instalar PWA', 'Abre esta web en Chrome o Safari y usa "Agregar a pantalla de inicio" desde el menú del navegador.', 'info');
    }
  };

  return (
    <section className="container">
      <div className="app-download-section">
        {/* Left: Text & Store Badges */}
        <div>
          <span className="section-tag" style={{ color: 'var(--color-celeste)' }}>
            Experiencia Mobile-First
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '1rem', lineHeight: '1.15' }}>
            TU TIENDA, SIEMPRE CONTIGO
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Descarga nuestra aplicación oficial y disfruta una experiencia de compra más rápida, cotizaciones instantáneas por WhatsApp y visualización de muebles en tu sala desde tu celular o tablet.
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem', fontSize: '0.92rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--color-celeste)" />
              <span>Notificaciones de promociones exclusivas antes que nadie.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--color-celeste)" />
              <span>Rastreo en tiempo real de tu pedido y despacho en Bolivia.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--color-celeste)" />
              <span>Chat directo 1 a 1 con asesores de showroom Equipetrol y Calacoto.</span>
            </li>
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            {/* Google Play */}
            <button 
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.4rem', borderRadius: 'var(--radius-md)' }}
              onClick={() => handleDownloadClick('Google Play')}
            >
              <Download size={18} />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'none', opacity: 0.8 }}>Disponible en</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>Google Play</div>
              </div>
            </button>

            {/* App Store */}
            <button 
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.4rem', borderRadius: 'var(--radius-md)' }}
              onClick={() => handleDownloadClick('App Store')}
            >
              <Download size={18} />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'none', opacity: 0.8 }}>Descárgalo en el</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>App Store</div>
              </div>
            </button>

            {/* Install PWA Button */}
            <button 
              className="btn btn-primary"
              onClick={handleInstallPWA}
            >
              <Smartphone size={18} />
              <span>Instalar Web App (PWA)</span>
            </button>
          </div>
        </div>

        {/* Right: Realistic Phone Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="app-mockup-phone">
            <div className="phone-screen">
              {/* Fake Mobile App Header */}
              <div style={{ backgroundColor: '#051063', padding: '1.25rem 1rem 0.75rem', color: '#fff', textAlign: 'center' }}>
                <img src="/iconos/logo%20pricom.png" alt="PRICOM App" style={{ height: '24px', margin: '0 auto 4px' }} />
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>Muebles & Sofás Bolivia</div>
              </div>

              {/* Fake Mobile App Body */}
              <div style={{ padding: '0.75rem' }}>
                <img 
                  src="/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg" 
                  alt="Sealy Santa Cruz" 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.5rem' }} 
                />
                <div style={{ fontSize: '0.68rem', color: '#009EFF', fontWeight: '700' }}>SEALY BOLIVIA</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#051063' }}>Santa Cruz Seafoam</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#051063', margin: '0.25rem 0' }}>
                  Bs. 9.500 <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '700' }}>-50%</span>
                </div>
                
                <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
                  <button style={{ flex: 1, backgroundColor: '#009EFF', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                    Comprar
                  </button>
                  <button style={{ backgroundColor: '#25D366', color: '#fff', padding: '6px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                    WA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
