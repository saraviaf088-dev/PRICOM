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

  const handleCloseCheckout = React.useCallback(() => {
    setCheckoutStep(1);
    setActiveModal(null);
  }, [setCheckoutStep, setActiveModal]);

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
    <div className="modal-overlay" onClick={handleCloseCheckout} role="dialog" aria-modal="true" aria-label="Proceso de compra">
      <div className="modal-container checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header checkout-header">
          <div className="checkout-header-left">
            <ShieldCheck size={22} color="var(--color-celeste)" />
            <h3 className="checkout-title">Checkout Seguro PRICOM Bolivia</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); handleCloseCheckout(); }} className="btn-icon checkout-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="checkout-body">
          {/* Stepper Progress */}
          <div className="checkout-stepper">
            <div className={`checkout-step-item ${checkoutStep >= 1 ? (checkoutStep > 1 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 1 ? <Check size={16} /> : 1}</div>
              <span className="checkout-step-label">1. Carrito</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 2 ? (checkoutStep > 2 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 2 ? <Check size={16} /> : 2}</div>
              <span className="checkout-step-label">2. Datos</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 3 ? (checkoutStep > 3 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 3 ? <Check size={16} /> : 3}</div>
              <span className="checkout-step-label">3. Envío</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 4 ? (checkoutStep > 4 ? 'completed' : 'active') : ''}`}>
              <div className="checkout-step-number">{checkoutStep > 4 ? <Check size={16} /> : 4}</div>
              <span className="checkout-step-label">4. Pago</span>
            </div>
            <div className={`checkout-step-item ${checkoutStep >= 5 ? 'active' : ''}`}>
              <div className="checkout-step-number">5</div>
              <span className="checkout-step-label">5. Confirmación</span>
            </div>
          </div>

          {/* STEP 1: Resumen */}
          {checkoutStep === 1 && (
            <div>
              <h4 className="checkout-section-title">Resumen de Productos</h4>
              <div className="checkout-cart-list">
                {cart.map((item, i) => (
                  <div key={i} className="checkout-cart-item">
                    <div className="checkout-cart-item-left">
                      <img src={item.product.images[0]} alt={item.product.name} className="checkout-cart-item-img" />
                      <div className="checkout-cart-item-info">
                        <div className="checkout-cart-item-name">{item.product.name}</div>
                        <div className="checkout-cart-item-meta">Color: {item.selectedColor} • Cant: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="checkout-cart-item-price">
                      Bs. {(item.product.price * item.quantity).toLocaleString('es-BO')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-subtotal">
                <span className="checkout-subtotal-label">Subtotal:</span>
                <span className="checkout-subtotal-value">
                  Bs. {cartTotal.toLocaleString('es-BO')}
                </span>
              </div>

              <div className="checkout-actions">
                <button className="btn btn-primary btn-lg btn-full-mobile" onClick={handleNextStep}>
                  <span>Continuar a Datos del Cliente</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Datos del Cliente */}
          {checkoutStep === 2 && (
            <div>
              <h4 className="checkout-section-title">Datos Personales & Facturación en Bolivia</h4>
              <div className="checkout-form-grid">
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

              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={handlePrevStep}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg btn-full-mobile" onClick={handleNextStep}>
                  <span>Continuar a Dirección</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dirección & Envío */}
          {checkoutStep === 3 && (
            <div>
              <h4 className="checkout-section-title">Método y Dirección de Entrega en Bolivia</h4>

              <div className="checkout-delivery-options">
                <div 
                  className={`checkout-delivery-option ${formData.deliveryType === 'home' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'home' }))}
                >
                  <div className="checkout-delivery-option-header">
                    <Truck size={18} color="var(--color-celeste)" />
                    <span className="checkout-delivery-option-title">Envío a Domicilio con Armado</span>
                  </div>
                  <p className="checkout-delivery-option-desc">Personal especializado entrega y arma el mueble en tu sala.</p>
                </div>

                <div 
                  className={`checkout-delivery-option ${formData.deliveryType === 'showroom' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'showroom' }))}
                >
                  <div className="checkout-delivery-option-header">
                    <Building size={18} color="var(--color-celeste)" />
                    <span className="checkout-delivery-option-title">Retiro en Showroom Oficial</span>
                  </div>
                  <p className="checkout-delivery-option-desc">Retira sin costo en Equipetrol, Calacoto o Cochabamba.</p>
                </div>
              </div>

              {formData.deliveryType === 'home' ? (
                <div className="checkout-form-grid">
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

              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={handlePrevStep}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg btn-full-mobile" onClick={handleNextStep}>
                  <span>Continuar a Pago</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Métodos de Pago */}
          {checkoutStep === 4 && (
            <div>
              <h4 className="checkout-section-title">Selecciona tu Método de Pago</h4>

              <div className="checkout-payment-list">
                {/* QR Simple */}
                <label className={`checkout-payment-option ${formData.paymentMethod === 'qr' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="qr" checked={formData.paymentMethod === 'qr'} onChange={handleInputChange} />
                  <QrCode size={24} color="var(--color-celeste)" className="checkout-payment-icon" />
                  <div className="checkout-payment-info">
                    <div className="checkout-payment-title">QR Simple Interbancario (Recomendado)</div>
                    <div className="checkout-payment-desc">Compatible con BCP, BNB, Banco Mercantil, GanaMóvil y cualquier app bancaria.</div>
                  </div>
                </label>

                {/* Tarjeta */}
                <label className={`checkout-payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} />
                  <CreditCard size={24} color="var(--color-azul-oscuro)" className="checkout-payment-icon" />
                  <div className="checkout-payment-info">
                    <div className="checkout-payment-title">Tarjeta de Débito / Crédito</div>
                    <div className="checkout-payment-desc">Visa o Mastercard. Procesamiento seguro encriptado TLS 256 bits.</div>
                  </div>
                </label>

                {/* Tigo Money */}
                <label className={`checkout-payment-option ${formData.paymentMethod === 'tigo' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="tigo" checked={formData.paymentMethod === 'tigo'} onChange={handleInputChange} />
                  <Smartphone size={24} color="#00377B" className="checkout-payment-icon" />
                  <div className="checkout-payment-info">
                    <div className="checkout-payment-title">Tigo Money</div>
                    <div className="checkout-payment-desc">Paga directo desde tu billetera móvil Tigo Money.</div>
                  </div>
                </label>

                {/* Transferencia */}
                <label className={`checkout-payment-option ${formData.paymentMethod === 'transfer' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleInputChange} />
                  <Building size={24} color="var(--text-secondary)" className="checkout-payment-icon" />
                  <div className="checkout-payment-info">
                    <div className="checkout-payment-title">Transferencia Bancaria Directa</div>
                    <div className="checkout-payment-desc">Te proporcionamos nuestras cuentas corrientes en BCP o BNB.</div>
                  </div>
                </label>
              </div>

              {/* QR Preview if QR is selected */}
              {formData.paymentMethod === 'qr' && (
                <div className="checkout-qr-box">
                  <div className="checkout-qr-title">
                    Código QR Simple Oficial PRICOM
                  </div>
                  <div className="checkout-qr-image-container">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PRICOM-${formData.department}-${totalAmount}-BS-${Date.now()}`}
                      alt="QR Simple" 
                      className="checkout-qr-image"
                    />
                  </div>
                  <div className="checkout-qr-amount">
                    Escanea desde tu banco por <strong>Bs. {totalAmount.toLocaleString('es-BO')}</strong>.
                  </div>
                  <div className="checkout-qr-note">
                    El pago será verificado automáticamente por nuestro sistema.
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {formData.paymentMethod === 'transfer' && (
                <div className="checkout-info-box">
                  <div className="checkout-info-title" style={{ color: 'var(--color-azul-oscuro)' }}>
                    Datos para Transferencia Bancaria
                  </div>
                  <div className="checkout-info-content">
                    <div><strong>Banco BCP:</strong> Cuenta Corriente N° 123456789</div>
                    <div><strong>CCI:</strong> 005123456789012345</div>
                    <div><strong>Titular:</strong> PRICOM Bolivia S.R.L.</div>
                    <div><strong>NIT:</strong> 123456789</div>
                  </div>
                  <div className="checkout-info-note">
                    Envía el comprobante de pago a WhatsApp para confirmar tu pedido.
                  </div>
                </div>
              )}

              {/* Tigo Money Info */}
              {formData.paymentMethod === 'tigo' && (
                <div className="checkout-info-box">
                  <div className="checkout-info-title" style={{ color: '#00377B' }}>
                    Pago con Tigo Money
                  </div>
                  <div className="checkout-info-content">
                    <div><strong>Número de cuenta:</strong> 76740940</div>
                    <div><strong>Nombre:</strong> PRICOM Bolivia</div>
                  </div>
                  <div className="checkout-info-note">
                    Realiza la transferencia desde tu app Tigo Money y envía el comprobante.
                  </div>
                </div>
              )}

              {/* Final Totals Summary */}
              <div className="checkout-totals-box">
                <div className="checkout-totals-row">
                  <span>Subtotal:</span>
                  <span>Bs. {cartTotal.toLocaleString('es-BO')}</span>
                </div>
                <div className="checkout-totals-row">
                  <span>Envío y Armado:</span>
                  <span>{shippingCost === 0 ? '¡Gratis!' : `Bs. ${shippingCost.toLocaleString('es-BO')}`}</span>
                </div>
                <div className="checkout-totals-row checkout-totals-total">
                  <span>Total Final:</span>
                  <span className="checkout-totals-total-value">Bs. {totalAmount.toLocaleString('es-BO')}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={handlePrevStep} disabled={isProcessing}>
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>
                <button className="btn btn-primary btn-lg btn-full-mobile" onClick={handleFinalizeOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <Check size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Confirmación de Pedido */}
          {checkoutStep === 5 && orderConfirmed && (
            <div className="checkout-confirmation">
              <CheckCircle2 size={64} color="var(--color-success)" className="checkout-confirmation-icon" />
              <h3 className="checkout-confirmation-title">
                ¡Gracias por tu compra, {orderConfirmed.customer.name}!
              </h3>
              <p className="checkout-confirmation-text">
                Tu pedido <strong>{orderConfirmed.id}</strong> ha sido registrado. Te hemos enviado un correo a <strong>{orderConfirmed.customer.email}</strong> y nuestro equipo coordinará contigo la entrega.
              </p>

              {/* Order Receipt Box */}
              <div className="checkout-receipt">
                <div className="checkout-receipt-header">
                  <div className="checkout-receipt-col">
                    <span className="checkout-receipt-label">CÓDIGO DE PEDIDO:</span>
                    <div className="checkout-receipt-value">{orderConfirmed.id}</div>
                  </div>
                  <div className="checkout-receipt-col">
                    <span className="checkout-receipt-label">FECHA:</span>
                    <div className="checkout-receipt-value">{orderConfirmed.date}</div>
                  </div>
                  <div className="checkout-receipt-col">
                    <span className="checkout-receipt-label">TOTAL:</span>
                    <div className="checkout-receipt-value checkout-receipt-total">Bs. {orderConfirmed.total.toLocaleString('es-BO')}</div>
                  </div>
                </div>

                <div className="checkout-receipt-details">
                  <div><strong>Destino:</strong> {orderConfirmed.customer.address}, {orderConfirmed.customer.zone}, {orderConfirmed.customer.city} ({orderConfirmed.customer.department})</div>
                  <div><strong>Factura a nombre de:</strong> {orderConfirmed.customer.name} (NIT/CI: {orderConfirmed.customer.nit})</div>
                  <div><strong>Método de Pago:</strong> {orderConfirmed.customer.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="checkout-actions checkout-actions-center">
                <button className="btn btn-whatsapp btn-lg" onClick={handleSendOrderToWhatsApp}>
                  <MessageCircle size={18} />
                  <span>Enviar a WhatsApp</span>
                </button>

                <button className="btn btn-primary btn-lg" onClick={handleCloseCheckout}>
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
