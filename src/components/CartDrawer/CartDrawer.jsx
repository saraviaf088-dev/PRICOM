import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { ShoppingBag, X, Trash2, ArrowRight, Truck, Tag, MessageCircle } from 'lucide-react';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    activeModal, setActiveModal,
    cart, removeFromCart, updateCartQuantity,
    cartTotal, cartCount, showToast,
    setCheckoutStep
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  if (activeModal !== 'cart') return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === CONFIG.VALID_COUPON_CODE) {
      setDiscountPercent(CONFIG.COUPON_DISCOUNT_PERCENT);
      showToast('Cupón Aplicado', `¡Obtuviste ${CONFIG.COUPON_DISCOUNT_PERCENT}% de descuento adicional!`, 'success');
    } else {
      showToast('Cupón No Válido', 'El código ingresado no existe o ha expirado.', 'warning');
    }
  };

  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = cartTotal - discountAmount;

  const handleProceedCheckout = () => {
    setCheckoutStep(1);
    setActiveModal(null);
    navigate('/checkout');
  };

  const handleSendCartWhatsApp = () => {
    const itemsList = cart.map(i => `- ${i.product.name} (x${i.quantity}) - Color: ${i.selectedColor} - Bs. ${(i.product.price * i.quantity).toLocaleString('es-BO')}`).join('%0A');
    const msg = `Hola PRICOM, quiero comprar / cotizar los siguientes productos de mi carrito:%0A${itemsList}%0ATotal: Bs. ${finalTotal.toLocaleString('es-BO')}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.15rem' }}>Tu Carrito ({cartCount})</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker in Bolivia */}
        <div style={{
          backgroundColor: 'var(--color-azul-oscuro-light)',
          color: 'var(--color-azul-oscuro)',
          padding: '0.65rem 1.25rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Truck size={16} color="var(--color-celeste)" />
          <span>¡Calificas para <strong>Envío y Armado Gratis</strong> en Santa Cruz, La Paz y Cochabamba!</span>
        </div>

        {/* Items list */}
        <div className="drawer-body">
          {cart.length > 0 ? (
            <div>
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedColor}-${idx}`} className="cart-item-row">
                  <img src={item.product.images[0]} alt={item.product.name} className="cart-item-img" />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-celeste)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {item.product.brand}
                    </div>
                    <h4 style={{ fontSize: '0.92rem', marginBottom: '0.2rem' }}>{item.product.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Color: <strong>{item.selectedColor}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="qty-control">
                        <button 
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, -1)}
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, 1)}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontWeight: '800', color: 'var(--color-azul-oscuro)', fontSize: '0.95rem' }}>
                        Bs. {(item.product.price * item.quantity).toLocaleString('es-BO')}
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Cupón (Usa: PRICOM10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Aplicar
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h4>Tu carrito está vacío</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>
                Explora nuestras colecciones Sealy y encuentra el mueble ideal para tu hogar.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveModal(null)}>
                Ir a Comprar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span>Bs. {cartTotal.toLocaleString('es-BO')}</span>
            </div>

            {discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-success)' }}>
                <span>Descuento Cupón ({discountPercent}%):</span>
                <span>- Bs. {discountAmount.toLocaleString('es-BO')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: '800' }}>
              <span>Total a Pagar:</span>
              <span style={{ color: 'var(--color-azul-oscuro)' }}>
                Bs. {finalTotal.toLocaleString('es-BO')}
              </span>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={handleProceedCheckout}
            >
              <span>INICIAR COMPRA SEGURA</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn btn-whatsapp btn-sm" 
              style={{ width: '100%' }}
              onClick={handleSendCartWhatsApp}
            >
              <MessageCircle size={14} />
              <span>Pedir Asistencia por WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
