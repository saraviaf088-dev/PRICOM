import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../config';
import { BOLIVIA_DEPARTMENTS, SHOWROOMS, ZONES_BY_CITY } from '../data/showrooms';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import {
  Check, ArrowRight, ArrowLeft, ShieldCheck, Truck,
  CreditCard, Smartphone, Building, MessageCircle, CheckCircle2,
  User, Phone, Mail, MapPin, FileText, Store, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart, cartTotal, clearCart,
    checkoutStep, setCheckoutStep,
    user, showToast,
    createOrder, processPayment
  } = useApp();

  useEffect(() => {
    setCheckoutStep(1);
  }, [setCheckoutStep]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nit: user?.nit || '',
    department: 'Santa Cruz',
    city: 'Santa Cruz de la Sierra',
    zone: 'Equipetrol Norte',
    address: user?.address || '',
    reference: 'Frente al parque',
    deliveryType: 'home',
    selectedShowroom: 'scz-equipetrol',
    paymentMethod: 'qr',
    notes: ''
  });

  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Agrega productos antes de continuar con la compra.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
        <Footer />
      </>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'city') {
        updated.zone = '';
      }
      return updated;
    });
  };

  const subtotal = cartTotal;
  const departmentData = BOLIVIA_DEPARTMENTS.find(d => d.name === formData.department);
  const deliveryCost = formData.deliveryType === 'home' ? (departmentData?.shippingFee || 0) : 0;
  const total = subtotal + deliveryCost;

  const selectedShowroomData = SHOWROOMS.find(s => s.id === formData.selectedShowroom);
  const selectedPaymentLabel = { qr: 'QR/SINPE', transfer: 'Transferencia Bancaria', card: 'Tarjeta Crédito/Débito' }[formData.paymentMethod] || formData.paymentMethod;

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!formData.name || !formData.phone || !formData.address) {
        showToast('Campos requeridos', 'Por favor completa nombre, teléfono y dirección.', 'warning');
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setCheckoutStep(3);
    } else if (checkoutStep === 3) {
      setCheckoutStep(4);
    }
  };

  const handlePrevStep = () => {
    if (checkoutStep > 1) {
      setCheckoutStep(checkoutStep - 1);
    }
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerNIT: formData.nit,
        deliveryType: formData.deliveryType,
        department: formData.department,
        city: formData.city,
        zone: formData.zone,
        address: formData.address,
        reference: formData.reference,
        selectedShowroom: formData.selectedShowroom,
        paymentMethod: formData.paymentMethod,
        subtotal,
        shippingCost: deliveryCost,
        total,
        items: cart.map(item => ({
          product: {
            id: item.product?.id || item.id,
            name: item.product?.name || item.name,
            brand: item.product?.brand || item.brand,
            price: item.product?.price || item.price,
            images: item.product?.images || item.images,
            category: item.product?.category || item.category,
          },
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedMaterial: item.selectedMaterial,
        })),
      };

      const order = await createOrder(orderData);

      if (!order) {
        showToast('Error', 'No se pudo crear el pedido. Intenta de nuevo.', 'error');
        setIsProcessing(false);
        return;
      }

      setOrderConfirmed(order);
      setCheckoutStep(5);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      showToast('Pedido Confirmado', 'Tu pedido ha sido registrado exitosamente.', 'success');
    } catch (err) {
      showToast('Error', 'Hubo un problema al procesar tu pedido.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!orderConfirmed) return;
    setIsProcessing(true);
    try {
      const paymentResult = await processPayment({
        orderId: orderConfirmed.orderId || orderConfirmed.id,
        paymentMethod: formData.paymentMethod,
        cardData: formData.paymentMethod === 'card' ? { number: '', installments: 1 } : null,
      });
      clearCart();
      if (paymentResult && paymentResult.success !== false) {
        showToast('Pago Registrado', 'Tu pago ha sido procesado correctamente.', 'success');
      } else {
        showToast('Pago Registrado', 'Tu pedido fue registrado. Puedes realizar el pago posteriormente.', 'success');
      }
      navigate('/');
    } catch (err) {
      showToast('Error de Pago', 'Hubo un problema al procesar el pago.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepLabels = ['Datos', 'Envío', 'Pago', 'Confirmar'];

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', padding: '6rem 1.5rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="checkout-stepper">
          {stepLabels.map((step, i) => {
            const stepNum = i + 1;
            const isCompleted = checkoutStep > stepNum;
            const isActive = checkoutStep === stepNum;
            return (
              <div key={i} className={`checkout-step-item${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}>
                <div className="checkout-step-number">
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {checkoutStep < 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {cart.map(item => (
              <div key={item.product?.id || item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <img src={item.product?.images[0] || item.images[0]} alt={item.product?.name || item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.product?.name || item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cantidad: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: '600' }}>Bs. {((item.product?.price || item.price) * item.quantity).toLocaleString('es-BO')}</div>
              </div>
            ))}
          </div>
        )}

        {checkoutStep === 1 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Datos de Contacto y Dirección</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Nombre completo *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Teléfono *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">NIT / CI</label>
                <input type="text" name="nit" value={formData.nit} onChange={handleInputChange} className="form-input" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Dirección completa *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="Av. Principal #123, Zona Equipetrol" required />
              </div>
              <div>
                <label className="form-label">Ciudad *</label>
                <select name="city" value={formData.city} onChange={handleInputChange} className="form-input" required>
                  {BOLIVIA_DEPARTMENTS.map(dept => (
                    <optgroup key={dept.id} label={dept.name}>
                      {dept.cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Barrio / Zona</label>
                <select name="zone" value={formData.zone} onChange={handleInputChange} className="form-input">
                  <option value="">Selecciona una zona</option>
                  {(ZONES_BY_CITY[formData.city] || []).map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Referencia</label>
                <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} className="form-input" placeholder="Frente al parque" />
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 2 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tipo de Entrega</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <label style={{ padding: '1rem', border: `2px solid ${formData.deliveryType === 'home' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="radio" name="deliveryType" value="home" checked={formData.deliveryType === 'home'} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                <Truck size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Envío a Domicilio {deliveryCost > 0 ? `(Bs. ${deliveryCost})` : '(Gratis)'}
              </label>
              <label style={{ padding: '1rem', border: `2px solid ${formData.deliveryType === 'showroom' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="radio" name="deliveryType" value="showroom" checked={formData.deliveryType === 'showroom'} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                <Building size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Recoger en Showroom
              </label>
            </div>
            {formData.deliveryType === 'showroom' && (
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Selecciona Showroom</label>
                <select name="selectedShowroom" value={formData.selectedShowroom} onChange={handleInputChange} className="form-input">
                  {SHOWROOMS.map(s => <option key={s.id} value={s.id}>{s.name} - {s.city}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {checkoutStep === 3 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Método de Pago</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <label style={{ padding: '1rem', border: `2px solid ${formData.paymentMethod === 'qr' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="qr" checked={formData.paymentMethod === 'qr'} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                QR/SINPE
              </label>
              <label style={{ padding: '1rem', border: `2px solid ${formData.paymentMethod === 'transfer' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                <CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Transferencia Bancaria
              </label>
              <label style={{ padding: '1rem', border: `2px solid ${formData.paymentMethod === 'card' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
                <Smartphone size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Tarjeta Crédito/Débito
              </label>
            </div>
          </div>
        )}

        {checkoutStep === 4 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Resumen del Pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <User size={16} color="var(--color-celeste)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cliente</div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formData.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <Phone size={16} color="var(--color-celeste)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Teléfono</div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formData.phone}</div>
                </div>
              </div>
              {formData.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <Mail size={16} color="var(--color-celeste)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formData.email}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <MapPin size={16} color="var(--color-celeste)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dirección</div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formData.address}, {formData.zone}, {formData.city}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <Truck size={16} color="var(--color-celeste)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Entrega</div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {formData.deliveryType === 'home' ? 'Envío a Domicilio' : `Recoger en ${selectedShowroomData?.name || formData.selectedShowroom}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <FileText size={16} color="var(--color-celeste)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Método de Pago</div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedPaymentLabel}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {checkoutStep < 5 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Subtotal:</span>
                <span>Bs. {subtotal.toLocaleString('es-BO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Envío:</span>
                <span style={{ color: deliveryCost === 0 ? 'var(--color-success)' : undefined }}>
                  {deliveryCost === 0 ? 'Gratis' : `Bs. ${deliveryCost.toLocaleString('es-BO')}`}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem' }}>
                <span>Total:</span>
                <span>Bs. {total.toLocaleString('es-BO')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              {checkoutStep > 1 && (
                <button className="btn btn-outline" onClick={handlePrevStep} style={{ flex: 1 }}>
                  <ArrowLeft size={16} />
                  <span>Anterior</span>
                </button>
              )}
              {checkoutStep < 4 ? (
                <button className="btn btn-primary" onClick={handleNextStep} style={{ flex: 1 }}>
                  <span>Continuar</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleConfirmOrder} disabled={isProcessing} style={{ flex: 1 }}>
                  <ShieldCheck size={16} />
                  <span>{isProcessing ? 'Procesando...' : 'Confirmar Pedido'}</span>
                </button>
              )}
            </div>
          </>
        )}

        {checkoutStep === 5 && orderConfirmed && (
          <div style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="var(--color-celeste)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>¡Pedido Confirmado!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Tu pedido <strong>#{orderConfirmed.orderNumber || orderConfirmed.orderId?.slice(0, 8)}</strong> ha sido registrado.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
              <button className="btn btn-primary" onClick={handlePayment} disabled={isProcessing} style={{ width: '100%' }}>
                {isProcessing ? 'Procesando...' : 'Completar Pago'}
              </button>
              <a
                href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola PRICOM, acabo de realizar el pedido #${orderConfirmed.orderNumber || orderConfirmed.orderId?.slice(0, 8)}. Necesito asistencia con el pago.`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%' }}
              >
                <MessageCircle size={16} />
                <span>Ayuda por WhatsApp</span>
              </a>
              <button className="btn btn-outline" onClick={() => navigate('/')} style={{ width: '100%' }}>
                Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
