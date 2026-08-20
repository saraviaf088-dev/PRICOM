import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Truck, Receipt, FileText, Lock, X } from 'lucide-react';

export default function LegalModal() {
  const { activeModal, setActiveModal, legalTab, setLegalTab } = useApp();
  const [tab, setTab] = useState(legalTab || 'garantia');

  if (activeModal !== 'legal') return null;

  const currentTab = legalTab || tab;
  const handleSelectTab = (t) => {
    setTab(t);
    if (setLegalTab) setLegalTab(t);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true" aria-label="Información legal y políticas">
      <div className="modal-container" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header" style={{ backgroundColor: 'var(--color-azul-oscuro)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="var(--color-celeste)" />
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Información Legal & Políticas PRICOM</h3>
          </div>
          <button onClick={() => setActiveModal(null)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          {[
            { id: 'garantia', label: 'Garantía 5 Años', icon: ShieldCheck },
            { id: 'envios', label: 'Envíos y Armado', icon: Truck },
            { id: 'facturacion', label: 'Facturación NIT', icon: Receipt },
            { id: 'terminos', label: 'Términos de Uso', icon: FileText },
            { id: 'privacidad', label: 'Privacidad', icon: Lock },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTab(t.id)}
              style={{
                flex: '1 1 140px',
                padding: '0.85rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: currentTab === t.id ? 'var(--color-celeste)' : 'var(--text-secondary)',
                borderBottom: currentTab === t.id ? '2px solid var(--color-celeste)' : '2px solid transparent',
                backgroundColor: currentTab === t.id ? 'var(--bg-surface)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto', lineHeight: '1.7', color: 'var(--text-primary)' }}>
          {currentTab === 'garantia' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-azul-oscuro)' }}>Garantía Oficial Sealy 5 Años</h3>
              <p>PRICOM Bolivia S.R.L. es el distribuidor oficial autorizado de productos Sealy Furniture en el Estado Plurinacional de Bolivia.</p>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Cobertura de la Garantía</h4>
              <ul>
                <li><strong>Estructura Interna:</strong> 5 Años de garantía limitada contra defectos de fábrica en esqueletos de madera curada y mecanismos metálicos de reclinamiento/conversión.</li>
                <li><strong>Acolchado y Espumas:</strong> 3 Años contra deformaciones mayores al 15% del volumen original en espumas de alta resiliencia Posturepedic®.</li>
                <li><strong>Tapicería y Costuras:</strong> 2 Años contra fallas en costuras y cierres bajo condiciones normales de uso residencial.</li>
              </ul>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Procedimiento de Reclamo</h4>
              <p>Para activar tu garantía, presenta tu factura de compra o certificado entregado al momento de la instalación comunicándote con nuestro centro de atención por WhatsApp al +591 76740940 o al correo <strong>servicio@pricom.bo</strong>.</p>
            </div>
          )}

          {currentTab === 'envios' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-azul-oscuro)' }}>Envíos y Servicio de Armado Gratuito</h3>
              <p>Ofrecemos entregas programadas con personal capacitado propio y servicio de armado sin costo adicional en los tres ejes del país.</p>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Tiempos de Entrega por Departamento</h4>
              <ul>
                <li><strong>Santa Cruz (Zona Metropolitana):</strong> Entrega y armado dentro de las 24 a 48 horas hábiles.</li>
                <li><strong>La Paz y El Alto:</strong> Entrega y armado en 48 a 72 horas hábiles.</li>
                <li><strong>Cochabamba:</strong> Entrega y armado en 48 a 72 horas hábiles.</li>
                <li><strong>Resto de Bolivia (Sucre, Tarija, Oruro, Potosí, Trinidad, Cobija):</strong> Envíos coordinados vía transporte especializado autorizado (3 a 5 días hábiles).</li>
              </ul>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Condiciones de Entrega</h4>
              <p>El cliente debe garantizar que las vías de acceso (escaleras, ascensores, puertas) tengan las dimensiones necesarias para el ingreso del mueble embalado.</p>
            </div>
          )}

          {currentTab === 'facturacion' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-azul-oscuro)' }}>Facturación Electrónica con NIT / CI</h3>
              <p>Todas las compras realizadas en PRICOM Bolivia S.R.L. se emiten con Factura Electrónica en Línea autorizada por el Servicio de Impuestos Nacionales (SIN).</p>
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem' }}>Datos Requeridos para la Factura</h4>
              <p>Durante el proceso de Checkout, asegúrate de proveer correctamente:</p>
              <ul>
                <li>Nombre o Razón Social exacta.</li>
                <li>Número de NIT o Cédula de Identidad (CI) con su correspondiente complemento si aplica.</li>
                <li>Correo electrónico válido donde recibirás el documento en formato XML y PDF (Representación Gráfica).</li>
              </ul>
            </div>
          )}

          {currentTab === 'terminos' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-azul-oscuro)' }}>Términos y Condiciones de Uso</h3>
              <p>Al acceder y realizar transacciones en pricom.bo, el usuario acepta los siguientes términos de servicio:</p>
              <ul>
                <li><strong>Precios y Disponibilidad:</strong> Todos los precios expresados en la plataforma están en Bolivianos (BOB) e incluyen el Impuesto al Valor Agregado (IVA).</li>
                <li><strong>Confirmación de Pedidos:</strong> Las órdenes quedan sujetas a verificación de disponibilidad de stock y validación de pago por parte de nuestro departamento de crédito.</li>
                <li><strong>Cambios y Devoluciones:</strong> Se aceptan cambios dentro de los 7 días posteriores a la recepción siempre que el producto se encuentre sin uso y en su embalaje original.</li>
              </ul>
            </div>
          )}

          {currentTab === 'privacidad' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-azul-oscuro)' }}>Políticas de Privacidad y Protección de Datos</h3>
              <p>PRICOM Bolivia respeta la confidencialidad de la información personal de sus clientes.</p>
              <ul>
                <li>Los datos de contacto (nombre, teléfono, dirección, NIT) se utilizan exclusivamente para el procesamiento de entregas, facturación y servicio postventa.</li>
                <li>No compartimos ni comercializamos bases de datos con terceros.</li>
                <li>Puedes solicitar la eliminación o actualización de tus datos personales enviando un correo a <strong>contacto@pricom.bo</strong>.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
