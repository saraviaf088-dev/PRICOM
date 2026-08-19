import React from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { Heart, X, ShoppingBag, Trash2, Share2, MessageCircle, ArrowRight } from 'lucide-react';

export default function WishlistDrawer() {
  const { 
    activeModal, setActiveModal, 
    wishlist, products, toggleWishlist, 
    addToCart, showToast, openProductDetail 
  } = useApp();

  if (activeModal !== 'wishlist') return null;

  const wishProducts = products.filter(p => wishlist.includes(p.id));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Enlace Copiado', 'El enlace a tus favoritos fue copiado al portapapeles.', 'success');
  };

  const handleAddAllToCart = () => {
    wishProducts.forEach(p => addToCart(p, 1));
    showToast('Productos Agregados', `${wishProducts.length} productos fueron sumados a tu carrito.`, 'success');
    setActiveModal('cart');
  };

  const shareWishlistWhatsApp = () => {
    const itemsList = wishProducts.map(p => `- ${p.name} (Bs. ${p.price.toLocaleString('es-BO')})`).join('%0A');
    const msg = `Hola PRICOM, deseo cotizar mi lista de favoritos:%0A${itemsList}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Lista de favoritos">
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart size={20} color="var(--color-danger)" fill="var(--color-danger)" />
            <h3 style={{ fontSize: '1.15rem' }}>Mis Favoritos ({wishProducts.length})</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {wishProducts.length > 0 ? (
            <div>
              {wishProducts.map(p => (
                <div key={p.id} className="cart-item-row">
                  <img 
                    src={p.images[0]} 
                    alt={p.name} 
                    className="cart-item-img"
                    onClick={() => {
                      openProductDetail(p);
                      setActiveModal('product-detail');
                    }}
                    style={{ cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-celeste)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {p.brand}
                    </div>
                    <h4 
                      style={{ fontSize: '0.92rem', cursor: 'pointer', marginBottom: '0.35rem' }}
                      onClick={() => {
                        openProductDetail(p);
                        setActiveModal('product-detail');
                      }}
                    >
                      {p.name}
                    </h4>
                    <div style={{ fontWeight: '800', color: 'var(--color-azul-oscuro)', fontSize: '1rem', marginBottom: '0.6rem' }}>
                      Bs. {p.price.toLocaleString('es-BO')}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => addToCart(p, 1)}
                      >
                        <ShoppingBag size={13} />
                        <span>Al Carrito</span>
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleWishlist(p.id)}
                        title="Quitar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h4>Tu lista de favoritos está vacía</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>
                Guarda los muebles que más te gusten haciendo clic en el corazón ♡.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveModal(null)}
              >
                Explorar Catálogo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {wishProducts.length > 0 && (
          <div className="drawer-footer">
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={handleAddAllToCart}
            >
              <ShoppingBag size={16} />
              <span>Mover Todo al Carrito</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleShare}>
                <Share2 size={14} />
                <span>Compartir</span>
              </button>

              <button className="btn btn-whatsapp btn-sm" onClick={shareWishlistWhatsApp}>
                <MessageCircle size={14} />
                <span>Cotizar por WA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
