import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CONFIG } from '../../config';
import { BOLIVIA_DEPARTMENTS, SHOWROOMS } from '../../data/showrooms';
import { 
  X, Check, ArrowRight, ArrowLeft, ShieldCheck, Truck, QrCode, 
  CreditCard, Smartphone, Building, MessageCircle, FileText, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal() {
  const { 
    activeModal, setActiveModal, 
    cart, cartTotal, clearCart, 
    checkoutStep, setCheckoutStep, 
    user, setUser, showToast,
    createOrder, processPayment
  } = useApp();

  // Checkout Form State
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
    deliveryType: 'home', // 'home' | 'showroom'
    selectedShowroom: 'scz-equipetrol',
    paymentMethod: 'qr', // 'qr' | 'tigo' | 'card' | 'transfer' | 'delivery'
    notes: ''
  });

  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (activeModal !== 'checkout') return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedDeptObj = BOLIVIA_DEPARTMENTS.find(d => d.name.toLowerCase() === formData.department.toLowerCase()) || BOLIVIA_DEPARTMENTS[0];
  const shippingCost = formData.deliveryType === 'showroom' ? 0 : selectedDeptObj.shippingFee;
  const totalAmount = cartTotal + shippingCost;

  const handleNextStep = () => {
    if (checkoutStep === 2) {
      if (!formData.name || !formData.phone || !formData.email) {
        showToast('Datos Incompletos', 'Por favor llena tu nombre, teléfono y correo electrónico.', 'warning');
        return;
      }
    }
    if (checkoutStep === 3) {
      if (formData.deliveryType === 'home' && (!formData.address || !formData.zone)) {
        showToast('Dirección requerida', 'Por favor ingresa tu zona y dirección de entrega.', 'warning');
        return;
      }
    }
    setCheckoutStep(checkoutStep + 1);
  };

  const handlePrevStep = () => {
    setCheckoutStep(Math.max(1, checkoutStep - 1));
  };

  const handleFinalizeOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Create order in backend
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
        subtotal: cartTotal,
        shippingCost,
        total: totalAmount,
        items: cart.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            images: item.product.images,
            category: item.product.category,
          },
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedMaterial: item.selectedMaterial,
        })),
      };

      const orderResult = await createOrder(orderData);

      if (!orderResult) {
        showToast('Error', 'No se pudo crear el pedido. Intenta de nuevo.', 'warning');
        setIsProcessing(false);
        return;
      }

      // Process payment
      const paymentResult = await processPayment({
        orderId: orderResult.orderId,
        paymentMethod: formData.paymentMethod,
        cardData: formData.paymentMethod === 'card' ? { number: '4242424242424242', installments: 1 } : null,
        tigoPhone: formData.paymentMethod === 'tigo' ? formData.phone : null,
      });

      const orderId = orderResult.orderNumber;
      const newOrder = {
        id: orderId,
        orderId: orderResult.orderId,
        date: new Date().toLocaleDateString('es-BO'),
        items: [...cart],
        total: totalAmount,
        customer: { ...formData },
        status: paymentResult?.status === 'completed' ? 'Pagado' : 'Pendiente de Pago',
        paymentStatus: paymentResult?.status || 'pending',
        paymentReference: paymentResult?.reference || '',
      };

      setOrderConfirmed(newOrder);
      setCheckoutStep(5);
      clearCart();

      try {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#009eff', '#051063', '#25d366', '#ffffff']
        });
      } catch (e) {}

      showToast('¡Pedido Confirmado!', `Tu orden ${orderId} fue registrada exitosamente.`, 'success');
    } catch (err) {
      showToast('Error', 'Hubo un problema al procesar tu pedido.', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendOrderToWhatsApp = () => {
    if (!orderConfirmed) return;
    const itemsList = orderConfirmed.items.map(i => `- ${i.product.name} (x${i.quantity}) - Color: ${i.selectedColor}`).join('%0A');
    const msg = `*CONFIRMACIÓN DE PEDIDO PRICOM BOLIVIA*%0A` +
      `*Nº Pedido:* ${orderConfirmed.id}%0A` +
      `*Cliente:* ${orderConfirmed.customer.name}%0A` +
      `*Teléfono:* ${orderConfirmed.customer.phone}%0A` +
      `*NIT/CI:* ${orderConfirmed.customer.nit}%0A` +
      `*Destino:* ${orderConfirmed.customer.department}, ${orderConfirmed.customer.city}%0A` +
      `*Dirección:* ${orderConfirmed.customer.address} (${orderConfirmed.customer.zone})%0A` +
      `*Método de Pago:* ${orderConfirmed.customer.paymentMethod.toUpperCase()}%0A` +
      `*Productos:*%0A${itemsList}%0A` +
      `*Total Pagado/Por Pagar:* Bs. ${orderConfirmed.total.toLocaleString('es-BO')}`;

    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Proceso de compra">
      <div className="modal-container" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.25rem' }}>Checkout Seguro PRICOM Bolivia</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Stepper Progress */}
          <div className="checkout-stepper">
            <div className={`checkout-step-item ${checkoutStep >= 1 ? (checkoutStep > 1 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 1 ? <Check size={16} /> : 1}</div>
              <span>1. Carrito</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 2 ? (checkoutStep > 2 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 2 ? <Check size={16} /> : 2}</div>
              <span>2. Datos</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 3 ? (checkoutStep > 3 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 3 ? <Check size={16} /> : 3}</div>
              <span>3. Envío</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 4 ? (checkoutStep > 4 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 4 ? <Check size={16} /> : 4}</div>
              <span>4. Pago</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 5 ? 'active' : ''}`}>
              <div className="checkout-step-number">5</div>
              <span>5. Confirmación</span>
            </div>
          </div>

          {/* STEP 1: Resumen */}
          {checkoutStep === 1 && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Resumen de Productos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={item.product.images[0]} alt={item.product.name} style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Color: {item.selectedColor} • Cant: {item.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>
                      Bs. {(item.product.price * item.quantity).toLocaleString('es-BO')}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '2px dashed var(--border-color)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Subtotal:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>
                  Bs. {cartTotal.toLocaleString('es-BO')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-lg" onClick={handleNextStep}>
                  <span>Continuar a Datos del Cliente</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Datos del Cliente */}
          {checkoutStep === 2 && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Datos Personales & Facturación en Bolivia</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Ej: Fabiola Morales" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="+591 77312345" />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="fabiola@ejemplo.bo" />
                </div>
                <div className="form-group">
                  <label className="form-label">NIT o Carnet de Identidad (CI) *</label>
                  <input type="text" name="nit" value={formData.nit} onChange={handleInputChange} className="form-input" placeholder="Ej: 4589210014" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={handlePrevStep}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleNextStep}>
                  <span>Continuar a Dirección de Entrega</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dirección & Envío */}
          {checkoutStep === 3 && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Método y Dirección de Entrega en Bolivia</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div 
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${formData.deliveryType === 'home' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    backgroundColor: formData.deliveryType === 'home' ? 'var(--color-celeste-light)' : 'var(--bg-surface)'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'home' }))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <Truck size={18} color="var(--color-celeste)" />
                    <span>Envío a Domicilio con Armado</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Personal especializado entrega y arma el mueble en tu sala.</p>
                </div>

                <div 
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${formData.deliveryType === 'showroom' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    backgroundColor: formData.deliveryType === 'showroom' ? 'var(--color-celeste-light)' : 'var(--bg-surface)'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'showroom' }))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <Building size={18} color="var(--color-celeste)" />
                    <span>Retiro en Showroom Oficial</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Retira sin costo en Equipetrol, Calacoto o Cochabamba.</p>
                </div>
              </div>

              {formData.deliveryType === 'home' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Departamento</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="form-select">
                      {BOLIVIA_DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.shippingFee === 0 ? 'Envío Gratis' : `+Bs. ${d.shippingFee}`})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad / Municipio</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" placeholder="Ej: Santa Cruz de la Sierra" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zona / Barrio *</label>
                    <input type="text" name="zone" value={formData.zone} onChange={handleInputChange} className="form-input" placeholder="Ej: Equipetrol Norte / Sopocachi / Cala Cala" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Calle, Número y Referencias *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="Calle Los Cusis #240, Edif. Tower piso 4" />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Selecciona el Showroom de Retiro</label>
                  <select name="selectedShowroom" value={formData.selectedShowroom} onChange={handleInputChange} className="form-select">
                    {SHOWROOMS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.address} ({s.city})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={handlePrevStep}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleNextStep}>
                  <span>Continuar a Forma de Pago</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Métodos de Pago */}
          {checkoutStep === 4 && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Selecciona tu Método de Pago</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {/* QR Simple */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${formData.paymentMethod === 'qr' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                  backgroundColor: formData.paymentMethod === 'qr' ? 'var(--color-celeste-light)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="paymentMethod" value="qr" checked={formData.paymentMethod === 'qr'} onChange={handleInputChange} />
                  <QrCode size={24} color="var(--color-celeste)" />
                  <div>
                    <div style={{ fontWeight: '700' }}>QR Simple Interbancario (Recomendado en Bolivia)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Genera código QR compatible con BCP, BNB, Banco Mercantil, GanaMóvil, Fassil y cualquier app bancaria.</div>
                  </div>
                </label>

                {/* Tarjeta */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${formData.paymentMethod === 'card' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                  backgroundColor: formData.paymentMethod === 'card' ? 'var(--color-celeste-light)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} />
                  <CreditCard size={24} color="var(--color-azul-oscuro)" />
                  <div>
                    <div style={{ fontWeight: '700' }}>Tarjeta de Débito / Crédito Visa o Mastercard</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Procesamiento seguro encriptado TLS 256 bits sin recargo.</div>
                  </div>
                </label>

                {/* Tigo Money */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${formData.paymentMethod === 'tigo' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                  backgroundColor: formData.paymentMethod === 'tigo' ? 'var(--color-celeste-light)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="paymentMethod" value="tigo" checked={formData.paymentMethod === 'tigo'} onChange={handleInputChange} />
                  <Smartphone size={24} color="#00377B" />
                  <div>
                    <div style={{ fontWeight: '700' }}>Tigo Money</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Paga directo desde tu billetera móvil Tigo Money.</div>
                  </div>
                </label>

                {/* Transferencia */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${formData.paymentMethod === 'transfer' ? 'var(--color-celeste)' : 'var(--border-color)'}`,
                  backgroundColor: formData.paymentMethod === 'transfer' ? 'var(--color-celeste-light)' : 'var(--bg-surface)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} />
                  <Building size={24} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: '700' }}>Transferencia Bancaria Directa</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Te proporcionamos nuestras cuentas corrientes en BCP o BNB.</div>
                  </div>
                </label>
              </div>

              {/* QR Preview if QR is selected */}
              {formData.paymentMethod === 'qr' && (
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-azul-oscuro)' }}>
                    Código QR Simple Oficial PRICOM
                  </div>
                  <div style={{ display: 'inline-block', padding: '12px', background: '#fff', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PRICOM-${formData.department}-${totalAmount}-BS-${Date.now()}`}
                      alt="QR Simple" 
                      style={{ width: 160, height: 160, display: 'block' }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Escanea este código desde la app de tu banco boliviano por <strong>Bs. {totalAmount.toLocaleString('es-BO')}</strong>.
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    El pago será verificado automáticamente por nuestro sistema.
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {formData.paymentMethod === 'transfer' && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-azul-oscuro)' }}>
                    Datos para Transferencia Bancaria
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                    <div><strong>Banco BCP:</strong> Cuenta Corriente N° 123456789</div>
                    <div><strong>CCI:</strong> 005123456789012345</div>
                    <div><strong>Titular:</strong> PRICOM Bolivia S.R.L.</div>
                    <div><strong>NIT:</strong> 123456789</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Envía el comprobante de pago a WhatsApp para confirmar tu pedido.
                  </div>
                </div>
              )}

              {/* Tigo Money Info */}
              {formData.paymentMethod === 'tigo' && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#00377B' }}>
                    Pago con Tigo Money
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                    <div><strong>Número de cuenta:</strong> 76740940</div>
                    <div><strong>Nombre:</strong> PRICOM Bolivia</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Realiza la transferencia desde tu app Tigo Money y envía el comprobante.
                  </div>
                </div>
              )}

              {/* Final Totals Summary */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  <span>Subtotal:</span>
                  <span>Bs. {cartTotal.toLocaleString('es-BO')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>Envío y Armado:</span>
                  <span>{shippingCost === 0 ? '¡Gratis!' : `Bs. ${shippingCost.toLocaleString('es-BO')}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '800', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span>Total Final:</span>
                  <span style={{ color: 'var(--color-azul-oscuro)' }}>Bs. {totalAmount.toLocaleString('es-BO')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={handlePrevStep} disabled={isProcessing}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleFinalizeOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar y Finalizar Pedido</span>
                      <Check size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Confirmación de Pedido */}
          {checkoutStep === 5 && orderConfirmed && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={64} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.8rem', color: 'var(--color-azul-oscuro)', marginBottom: '0.5rem' }}>
                ¡Gracias por tu compra, {orderConfirmed.customer.name}!
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
                Tu pedido <strong>{orderConfirmed.id}</strong> ha sido registrado. Te hemos enviado un correo a <strong>{orderConfirmed.customer.email}</strong> y nuestro equipo de logística coordinará contigo la entrega.
              </p>

              {/* Order Receipt Box */}
              <div style={{ textAlign: 'left', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CÓDIGO DE PEDIDO:</span>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{orderConfirmed.id}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FECHA:</span>
                    <div style={{ fontWeight: '700' }}>{orderConfirmed.date}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL:</span>
                    <div style={{ fontWeight: '800', color: 'var(--color-azul-oscuro)' }}>Bs. {orderConfirmed.total.toLocaleString('es-BO')}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><strong>Destino:</strong> {orderConfirmed.customer.address}, {orderConfirmed.customer.zone}, {orderConfirmed.customer.city} ({orderConfirmed.customer.department})</div>
                  <div><strong>Factura a nombre de:</strong> {orderConfirmed.customer.name} (NIT/CI: {orderConfirmed.customer.nit})</div>
                  <div><strong>Método de Pago:</strong> {orderConfirmed.customer.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-whatsapp btn-lg" onClick={handleSendOrderToWhatsApp}>
                  <MessageCircle size={18} />
                  <span>Enviar Confirmación a WhatsApp</span>
                </button>

                <button className="btn btn-primary btn-lg" onClick={() => setActiveModal(null)}>
                  <span>Volver a la Tienda</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
