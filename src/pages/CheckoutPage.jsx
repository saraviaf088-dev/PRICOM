import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CONFIG } from '../config';
import { BOLIVIA_DEPARTMENTS, SHOWROOMS, ZONES_BY_CITY } from '../data/showrooms';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import {
  Check, ShieldCheck, Truck, CreditCard, Smartphone, Building,
  MessageCircle, CheckCircle2, User, Phone, Mail, MapPin, Lock,
  Package, ChevronDown, ChevronUp, FileText, X
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
    city: 'Santa Cruz de la Sierra',
    zone: '',
    address: user?.address || '',
    reference: '',
    deliveryType: 'home',
    selectedShowroom: 'scz-equipetrol',
    paymentMethod: 'qr',
    notes: ''
  });

  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardData, setCardData] = useState({
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
          <Package size={64} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Agrega productos antes de continuar con la compra.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Ver Productos</button>
        </div>
        <Footer />
      </>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'city') updated.zone = '';
      return updated;
    });
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cardNumber') {
      formatted = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (name === 'expiry') {
      formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + ' / ' + formatted.slice(2, 4);
      }
    }
    if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formatted }));
    setCardErrors(prev => ({ ...prev, [name]: '' }));
  };

  const subtotal = cartTotal;
  const departmentData = BOLIVIA_DEPARTMENTS.find(d => formData.city.includes(d.cities[0]?.split(' ')[0]) || d.cities.includes(formData.city));
  const deliveryCost = formData.deliveryType === 'home' ? (departmentData?.shippingFee || 0) : 0;
  const total = subtotal + deliveryCost;

  const selectedShowroomData = SHOWROOMS.find(s => s.id === formData.selectedShowroom);
  const selectedPaymentLabel = { qr: 'QR/SINPE', transfer: 'Transferencia Bancaria', card: 'Tarjeta Crédito/Débito' }[formData.paymentMethod] || formData.paymentMethod;

  const buildOrderData = () => ({
    customerName: formData.name,
    customerEmail: formData.email,
    customerPhone: formData.phone,
    customerNIT: formData.nit,
    city: formData.city,
    zone: formData.zone,
    address: formData.address,
    reference: formData.reference,
    deliveryType: formData.deliveryType,
    selectedShowroom: formData.deliveryType === 'showroom' ? selectedShowroomData?.name : null,
    paymentMethod: formData.paymentMethod,
    items: cart.map(item => ({
      productId: item.product?.id || item.id,
      productName: item.product?.name || item.name,
      price: item.product?.price || item.price,
      quantity: item.quantity,
      image: item.product?.images?.[0] || item.images?.[0],
    })),
    subtotal,
    deliveryCost,
    total,
    notes: formData.notes,
  });

  const submitOrder = async () => {
    setIsProcessing(true);
    try {
      const result = await createOrder(buildOrderData());
      if (result) {
        setOrderConfirmed(result);
        setShowCardModal(false);
        clearCart();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        showToast('¡Pedido Confirmado!', `Tu pedido ${result.orderNumber} fue registrado exitosamente.`, 'success');
      }
    } catch (err) {
      showToast('Error', 'No se pudo procesar el pedido. Intenta de nuevo.', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showToast('Campos requeridos', 'Por favor completa nombre, teléfono y dirección.', 'warning');
      return;
    }
    if (formData.paymentMethod === 'card') {
      setShowCardModal(true);
      return;
    }
    submitOrder();
  };

  const handleCardPayment = () => {
    const errors = {};
    if (!cardData.holderName.trim()) errors.holderName = 'Ingresa el nombre del titular';
    if (cardData.cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = 'Número de tarjeta inválido';
    const parts = cardData.expiry.split(' / ');
    if (parts.length < 2 || !parts[0] || !parts[1]) errors.expiry = 'Fecha inválida';
    if (cardData.cvv.length < 3) errors.cvv = 'CVV inválido';

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }
    submitOrder();
  };

  if (orderConfirmed) {
    const receiptDate = new Date().toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' });
    return (
      <>
        <Header />
        <main style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', padding: '6rem 1.5rem 4rem' }}>
          <div style={{ maxWidth: '560px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={36} color="#fff" />
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>¡Compra Realizada!</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tu pedido fue registrado exitosamente</p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--color-azul-oscuro), var(--color-celeste))', padding: '1.25rem 1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>COMPROBANTE DE COMPRA</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{orderConfirmed.orderNumber}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', opacity: 0.9 }}>
                  <div>{receiptDate}</div>
                  <div>Estado: Pendiente de pago</div>
                </div>
              </div>

              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-celeste)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Datos del Cliente</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Nombre:</span> <strong>{orderConfirmed.customerName || formData.name}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Teléfono:</span> <strong>{orderConfirmed.customerPhone || formData.phone}</strong></div>
                  {formData.email && <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> <strong>{formData.email}</strong></div>}
                  {formData.nit && <div><span style={{ color: 'var(--text-secondary)' }}>NIT/CI:</span> <strong>{formData.nit}</strong></div>}
                  <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-secondary)' }}>Dirección:</span> <strong>{orderConfirmed.address || formData.address}, {formData.city}{formData.zone ? `, ${formData.zone}` : ''}</strong></div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-celeste)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Productos</div>
                  {(orderConfirmed.items || cart).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', fontSize: '0.85rem', borderBottom: i < (orderConfirmed.items || cart).length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <span style={{ flex: 1 }}>{item.productName || item.name} <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span></span>
                      <span style={{ fontWeight: '600' }}>Bs. {((item.price || 0) * item.quantity).toLocaleString('es-BO')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span>Bs. {subtotal.toLocaleString('es-BO')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Envío ({formData.deliveryType === 'showroom' ? 'Showroom' : formData.city})</span>
                    <span style={{ color: deliveryCost === 0 ? 'var(--color-success)' : 'inherit' }}>{deliveryCost === 0 ? 'Gratis' : `Bs. ${deliveryCost}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid var(--border-color)', fontSize: '1.1rem', fontWeight: '800' }}>
                    <span>Total a Pagar</span>
                    <span style={{ color: 'var(--color-azul-oscuro)' }}>Bs. {total.toLocaleString('es-BO')}</span>
                  </div>
                </div>

                {(formData.paymentMethod === 'card' || formData.paymentMethod === 'transfer') && (
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-celeste)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Datos de Pago</div>
                    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', lineHeight: 1.6 }}>
                      <div><strong>Banco:</strong> Banco Nacional de Bolivia (BNB)</div>
                      <div><strong>Cuenta:</strong> 1000242043</div>
                      <div><strong>Swift:</strong> BNBOBOLXXXX</div>
                      <div><strong>Titular:</strong> PRICOM Bolivia S.R.L.</div>
                      <div style={{ marginTop: '0.5rem', color: 'var(--color-warning)', fontWeight: '600' }}>Realiza la transferencia del monto exacto y envía el comprobante por WhatsApp.</div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'qr' && (
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-celeste)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pago QR / SINPE</div>
                    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', color: 'var(--color-warning)', fontWeight: '600' }}>
                      Envía el comprobante de pago por WhatsApp para confirmar tu pedido.
                    </div>
                  </div>
                )}

                {formData.notes && (
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-celeste)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Notas</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{formData.notes}</div>
                  </div>
                )}

                <div style={{ backgroundColor: 'rgba(0,180,216,0.08)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Recibirás un mensaje de WhatsApp con los detalles para coordinar el pago y la entrega.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              <a
                href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola, confirmo mi pedido ${orderConfirmed.orderNumber}. Adjunto comprobante de pago.`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', backgroundColor: '#25D366', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
              >
                <MessageCircle size={18} />
                Enviar comprobante por WhatsApp
              </a>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
                Volver al Inicio
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', padding: '6rem 1.5rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Datos</span>
            <span>Entrega</span>
            <span>Pago</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--color-celeste), var(--color-azul-oscuro))', borderRadius: '2px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column - Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Contact & Address */}
            <section style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--color-celeste)" />
                Datos de Contacto y Dirección
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">Nombre completo *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Tu nombre" required />
                </div>
                <div>
                  <label className="form-label">Teléfono *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="76543210" required />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="form-label">NIT / CI</label>
                  <input type="text" name="nit" value={formData.nit} onChange={handleInputChange} className="form-input" placeholder="Opcional para factura" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Dirección completa *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="Av. Principal #123" required />
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Referencia</label>
                  <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} className="form-input" placeholder="Frente al parque, casa azul" />
                </div>
              </div>
            </section>

            {/* Delivery Type */}
            <section style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="var(--color-celeste)" />
                Tipo de Entrega
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ padding: '1rem', border: `2px solid ${formData.deliveryType === 'home' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: formData.deliveryType === 'home' ? 'rgba(0,180,216,0.05)' : 'transparent' }}>
                  <input type="radio" name="deliveryType" value="home" checked={formData.deliveryType === 'home'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${formData.deliveryType === 'home' ? 'var(--color-celeste)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.deliveryType === 'home' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-celeste)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Envío a Domicilio</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{deliveryCost > 0 ? `Bs. ${deliveryCost}` : 'Gratis'}</div>
                  </div>
                </label>
                <label style={{ padding: '1rem', border: `2px solid ${formData.deliveryType === 'showroom' ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: formData.deliveryType === 'showroom' ? 'rgba(0,180,216,0.05)' : 'transparent' }}>
                  <input type="radio" name="deliveryType" value="showroom" checked={formData.deliveryType === 'showroom'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${formData.deliveryType === 'showroom' ? 'var(--color-celeste)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.deliveryType === 'showroom' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-celeste)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Recoger en Showroom</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gratis</div>
                  </div>
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
            </section>

            {/* Payment Method */}
            <section style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--color-celeste)" />
                Método de Pago
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { value: 'qr', icon: CheckCircle2, label: 'QR / SINPE', desc: 'Pago inmediato con código QR' },
                  { value: 'transfer', icon: Building, label: 'Transferencia Bancaria', desc: 'BCP, BNB, Mercantil, etc.' },
                  { value: 'card', icon: Smartphone, label: 'Tarjeta Crédito/Débito', desc: 'Visa, Mastercard' },
                ].map(method => (
                  <label key={method.value} style={{ padding: '1rem', border: `2px solid ${formData.paymentMethod === method.value ? 'var(--color-celeste)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: formData.paymentMethod === method.value ? 'rgba(0,180,216,0.05)' : 'transparent' }}>
                    <input type="radio" name="paymentMethod" value={method.value} checked={formData.paymentMethod === method.value} onChange={handleInputChange} style={{ display: 'none' }} />
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${formData.paymentMethod === method.value ? 'var(--color-celeste)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {formData.paymentMethod === method.value && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-celeste)' }} />}
                    </div>
                    <method.icon size={20} color={formData.paymentMethod === method.value ? 'var(--color-celeste)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{method.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Notes */}
            <section style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--color-celeste)" />
                Notas Adicionales
              </h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Instrucciones especiales de entrega, horarios preferidos, etc. (opcional)"
                rows={3}
                style={{ resize: 'vertical', width: '100%' }}
              />
            </section>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedSummary(!expandedSummary)}
              >
                <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} />
                  Resumen del Pedido
                  <span style={{ backgroundColor: 'var(--color-celeste)', color: '#fff', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </h3>
                {expandedSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Items */}
              {expandedSummary && (
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.product?.id || item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={item.product?.images?.[0] || item.images?.[0]}
                            alt={item.product?.name || item.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                          <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--color-celeste)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name || item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>x{item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Bs. {((item.product?.price || item.price) * item.quantity).toLocaleString('es-BO')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" className="form-input" placeholder="Código de descuento" style={{ flex: 1, fontSize: '0.85rem' }} />
                      <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>Aplicar</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Totals + CTA (always visible) */}
              <div style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>Bs. {subtotal.toLocaleString('es-BO')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Envío</span>
                  <span style={{ color: deliveryCost === 0 ? 'var(--color-success)' : 'inherit' }}>
                    {deliveryCost === 0 ? 'Gratis' : `Bs. ${deliveryCost}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid var(--border-color)', fontSize: '1.1rem', fontWeight: '800' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-azul-oscuro)' }}>Bs. {total.toLocaleString('es-BO')}</span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isProcessing ? 0.7 : 1 }}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner" style={{ width: '18px', height: '18px' }} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Comprar Ahora - Bs. {total.toLocaleString('es-BO')}
                    </>
                  )}
                </button>

                {/* Trust Signals */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <ShieldCheck size={14} color="var(--color-success)" />
                    <span>Compra 100% segura y protegida</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Truck size={14} color="var(--color-celeste)" />
                    <span>Envío gratis en Santa Cruz, La Paz y Cochabamba</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} color="var(--color-success)" />
                    <span>Garantía oficial Sealy de 5 años</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Support */}
            <a
              href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Hola, necesito ayuda con mi pedido`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#25D366', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}
            >
              <MessageCircle size={18} />
              ¿Necesitas ayuda? Chatea con nosotros
            </a>
          </div>
        </div>
      </main>

      {/* Card Payment Modal */}
      {showCardModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,16,99,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #f0ad4e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Formulario de pago</h3>
              <button onClick={() => setShowCardModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Cardholder Name */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--color-danger)' }}>*</span> Nombre del titular
                </label>
                <input
                  type="text"
                  name="holderName"
                  value={cardData.holderName}
                  onChange={handleCardInputChange}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="form-input"
                  style={{ borderColor: cardErrors.holderName ? 'var(--color-danger)' : undefined }}
                />
                {cardErrors.holderName && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem', display: 'block' }}>{cardErrors.holderName}</span>}
              </div>

              {/* Card Number */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--color-danger)' }}>*</span> Información de la tarjeta
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  placeholder="Número de tarjeta"
                  className="form-input"
                  style={{ borderColor: cardErrors.cardNumber ? 'var(--color-danger)' : undefined }}
                />
                {cardErrors.cardNumber && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem', display: 'block' }}>{cardErrors.cardNumber}</span>}
              </div>

              {/* Expiry & CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--color-danger)' }}>*</span> MM / AA
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardInputChange}
                    placeholder="MM / AA"
                    className="form-input"
                    style={{ borderColor: cardErrors.expiry ? 'var(--color-danger)' : undefined }}
                  />
                  {cardErrors.expiry && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem', display: 'block' }}>{cardErrors.expiry}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--color-danger)' }}>*</span> CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    placeholder="CVV"
                    className="form-input"
                    style={{ borderColor: cardErrors.cvv ? 'var(--color-danger)' : undefined }}
                  />
                  {cardErrors.cvv && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem', display: 'block' }}>{cardErrors.cvv}</span>}
                </div>
              </div>

              {/* Bank Details */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-celeste)' }}>Datos de la cuenta PRICOM:</div>
                <div><strong>Banco:</strong> Banco Nacional de Bolivia (BNB)</div>
                <div><strong>Cuenta:</strong> 1000242043</div>
                <div><strong>Swift:</strong> BNBOBOLXXXX</div>
                <div><strong>Titular:</strong> PRICOM Bolivia S.R.L.</div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleCardPayment}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isProcessing ? 0.7 : 1 }}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px' }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Pagar BOB {total.toLocaleString('es-BO')}
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={14} />
                  <span>PCI DSS</span>
                </div>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <Lock size={14} />
                  <span>SSL Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
