import React, { useState } from 'react';
import { 
  Users, DollarSign, TrendingUp, CheckCircle, 
  Send, Phone, MapPin, User, ArrowRight, Star, Shield
} from 'lucide-react';
import { BOLIVIA_DEPARTMENTS } from '../../data/showrooms';
import { useApp } from '../../context/AppContext';

export default function PromoterSection() {
  const { submitPromoterApplication, showToast } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.city || !formData.phone) return;
    setSubmitting(true);
    try {
      await submitPromoterApplication(formData.fullName, formData.city, formData.phone);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ fullName: '', city: '', phone: '' });
    } catch (err) {
      showToast('Error', 'No se pudo enviar la solicitud. Intenta de nuevo.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: '15% de Comisión',
      desc: 'Gana un 15% por cada venta realizada de nuestros productos de alta gama.'
    },
    {
      icon: TrendingUp,
      title: 'Crecimiento Constante',
      desc: 'Acceso a nuevas colecciones y promociones exclusivas para vender más.'
    },
    {
      icon: Shield,
      title: 'Productos Premium',
      desc: 'Representa marcas líderes mundiales como Sealy y Nordic Studio.'
    },
    {
      icon: Star,
      title: 'Soporte Completo',
      desc: 'Capacitación, material de venta y apoyo constante del equipo PRICOM.'
    }
  ];

  return (
    <section id="promotores" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <span className="section-tag">Únete a Nuestro Equipo</span>
          <h2 className="section-title">TRABAJA CON NOSOTOS</h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Forma parte del equipo de promotores PRICOM. Vende muebles de primera calidad y gana comisiones atractivas con cada venta.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="promoter-benefits-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '3rem' 
        }}>
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all var(--transition-normal)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-celeste-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={22} color="var(--color-celeste)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {benefit.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Commission Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, #051063 0%, #009eff 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem',
          color: 'var(--color-white)',
          textAlign: 'center',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.9 }} />
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.75rem' }}>
              Gana un <span style={{ color: 'var(--color-celeste-light)' }}>15% de Comisión</span> por Cada Venta
            </h3>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
              Nuestros promotores exitosos ganan entre Bs. 2.000 y Bs. 8.000 mensuales. 
              Tú pones el esfuerzo, nosotros te damos las herramientas y los mejores productos del mercado.
            </p>
          </div>
        </div>

        {/* How It Works + Form */}
        <div className="promoter-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* How it works */}
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              ¿Cómo Funciona?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { step: '1', text: 'Completa el formulario con tus datos personales.' },
                { step: '2', text: 'Nuestro equipo te contactará para una entrevista.' },
                { step: '3', text: 'Recibe capacitación sobre nuestros productos y precios.' },
                { step: '4', text: 'Comienza a vender y gana un 15% de comisión por cada venta.' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-celeste)',
                    color: 'var(--color-white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0', lineHeight: '1.5' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Solicita tu Entrevista
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Completa el formulario y nos pondremos en contacto contigo.
            </p>

            {submitted ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
              }}>
                <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  ¡Solicitud Enviada!
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Nos contactaremos contigo pronto para agendar tu entrevista.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Nombre Completo
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Ej: María López García"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Ciudad
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {BOLIVIA_DEPARTMENTS.map(dept => (
                        <optgroup key={dept.id} label={dept.name}>
                          {dept.cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Número de Celular
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Ej: 76543210"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', opacity: submitting ? 0.7 : 1 }}
                >
                  <Send size={16} className={submitting ? 'spin' : ''} />
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
