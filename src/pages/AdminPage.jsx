import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function AdminPage() {
  const { setActiveModal } = useApp();

  useEffect(() => {
    setActiveModal('admin');
  }, [setActiveModal]);

  return (
    <>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Panel de Administración</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Abriendo el panel de control de PRICOM...</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
