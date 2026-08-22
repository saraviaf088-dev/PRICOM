import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { X, Download, Smartphone, Wifi, WifiOff } from 'lucide-react';

export function InstallBanner() {
  const { isInstallable, isInstalled, isOffline, installApp, dismissInstallPrompt } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || isOffline) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    await installApp();
    setIsInstalling(false);
  };

  if (!isInstallable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--color-azul-oscuro)',
      color: '#fff',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      zIndex: 999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Smartphone size={22} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Instala PRICOM en tu celular</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Compra más rápido y recibe ofertas exclusivas</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--color-celeste)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.82rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Download size={16} />
          {isInstalling ? 'Instalando...' : 'Instalar'}
        </button>
        <button
          onClick={dismissInstallPrompt}
          style={{
            padding: '0.6rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--color-warning)',
      color: '#000',
      padding: '0.5rem 1rem',
      textAlign: 'center',
      fontSize: '0.82rem',
      fontWeight: '600',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    }}>
      <WifiOff size={16} />
      Estás sin conexión — algunos datos podrían no estar disponibles
    </div>
  );
}
