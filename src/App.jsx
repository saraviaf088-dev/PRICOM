import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/AdminPage';
import { OfflineBanner } from './components/PWA/InstallBanner';

// ── Lazy loaded (only when needed) ──
const CartDrawer = lazy(() => import('./components/CartDrawer/CartDrawer'));
const WishlistDrawer = lazy(() => import('./components/WishlistDrawer/WishlistDrawer'));
const UserAccountModal = lazy(() => import('./components/UserAccountModal/UserAccountModal'));
const LegalModal = lazy(() => import('./components/LegalModals/LegalModal'));

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

// ── Eagerly loaded (visible on first paint) ──
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import ProductGrid from './components/ProductGrid/ProductGrid';
import OffersSection from './components/OffersSection/OffersSection';
import InspirateSection from './components/InspirateSection/InspirateSection';
import PromoterSection from './components/PromoterSection/PromoterSection';
import Footer from './components/Footer/Footer';
import WhatsAppFloating from './components/WhatsAppFloating/WhatsAppFloating';
import Comparator from './components/Comparator/Comparator';
import ToastContainer from './components/Toast/ToastContainer';

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Categories />
      <ProductGrid />
      <OffersSection />
      <InspirateSection />
      <PromoterSection />
      <Footer />
      <WhatsAppFloating />
      <Comparator />
      <ToastContainer />
    </>
  );
}

function AppShell() {
  return (
    <Suspense fallback={<ModalFallback />}>
      <CartDrawer />
      <WishlistDrawer />
      <UserAccountModal />
      <LegalModal />
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/verificar-email" element={<VerifyEmailPage />} />
            <Route path="/restablecer-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
          <AppShell />
          <OfflineBanner />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
