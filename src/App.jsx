import React, { useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// ── Eagerly loaded (visible on first paint) ──
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import ProductGrid from './components/ProductGrid/ProductGrid';
import OffersSection from './components/OffersSection/OffersSection';
import InspirateSection from './components/InspirateSection/InspirateSection';
import PromoterSection from './components/PromoterSection/PromoterSection';
import AppDownloadSection from './components/AppDownloadSection/AppDownloadSection';
import Footer from './components/Footer/Footer';
import WhatsAppFloating from './components/WhatsAppFloating/WhatsAppFloating';
import Comparator from './components/Comparator/Comparator';
import ToastContainer from './components/Toast/ToastContainer';

// ── Lazy loaded (only when modal opens) ──
const ProductModal = lazy(() => import('./components/ProductModal/ProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer/CartDrawer'));
const WishlistDrawer = lazy(() => import('./components/WishlistDrawer/WishlistDrawer'));
const CheckoutModal = lazy(() => import('./components/Checkout/CheckoutModal'));
const UserAccountModal = lazy(() => import('./components/UserAccountModal/UserAccountModal'));
const AdminModal = lazy(() => import('./components/AdminModal/AdminModal'));

// ── Loading fallback for lazy components ──
function ModalFallback() {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 16, 99, 0.75)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        padding: '2rem 3rem', textAlign: 'center', boxShadow: 'var(--shadow-xl)',
      }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 1rem' }} />
        <div className="skeleton" style={{ width: 160, height: 16, margin: '0 auto' }} />
      </div>
    </div>
  );
}

function MainApp() {
  const { products, openProductDetail } = useApp();

  // Listen to hash change for direct deep linking e.g. #producto-slug
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#producto-')) {
        const slug = hash.replace('#producto-', '');
        const found = products.find(p => p.slug === slug);
        if (found) {
          openProductDetail(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products, openProductDetail]);

  return (
    <div className="app-root">
      {/* 1. Global Header & Mega Menu */}
      <Header />

      {/* 2. Hero Principal (70-80% viewport) */}
      <Hero />

      {/* 3. Categorías Destacadas */}
      <Categories />

      {/* 4. Catálogo Inteligente con Filtros Multifacéticos */}
      <ProductGrid />

      {/* 5. Sección Promociones & Descuentos con Temporizador */}
      <OffersSection />

      {/* 6. Sección Editorial Inspírate (Revista de Diseño) */}
      <InspirateSection />

      {/* 7. Trabaja con Nosotros - Programa de Promotores */}
      <PromoterSection />

      {/* 8. Sección Descarga de App ("TU TIENDA, SIEMPRE CONTIGO") */}
      <AppDownloadSection />

      {/* 9. Footer Corporativo Completo */}
      <Footer />

      {/* 9. Floating Triggers */}
      <WhatsAppFloating />
      <Comparator />
      <ToastContainer />

      {/* 10. Lazy-loaded Modals & Drawers */}
      <Suspense fallback={<ModalFallback />}>
        <ProductModal />
        <CartDrawer />
        <WishlistDrawer />
        <CheckoutModal />
        <UserAccountModal />
        <AdminModal />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
