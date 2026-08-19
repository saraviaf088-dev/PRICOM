// ==========================================================================
// SHOWROOMS, CITIES & BOLIVIA SHIPPING DETAILS
// ==========================================================================

export const SHOWROOMS = [
  {
    id: "scz-equipetrol",
    city: "Santa Cruz de la Sierra",
    name: "Showroom Principal Equipetrol",
    address: "Av. San Martín esq. Calle 5 Este, Equipetrol Norte",
    phone: "+591 75012345",
    whatsapp: "59175012345",
    hours: "Lunes a Sábado: 09:00 - 20:00 | Domingo: 10:00 - 18:00",
    hasDelivery: "Entrega Inmediata (Mismo día o 24 hrs)"
  },
  {
    id: "lpz-calacoto",
    city: "La Paz",
    name: "Showroom Calacoto & San Miguel",
    address: "Av. Ballivián esq. Calle 18 de Calacoto",
    phone: "+591 76098765",
    whatsapp: "59176098765",
    hours: "Lunes a Sábado: 09:30 - 19:30",
    hasDelivery: "Entrega en 24 a 48 hrs con armado especializado"
  },
  {
    id: "cbb-america",
    city: "Cochabamba",
    name: "Showroom Av. América",
    address: "Av. América Oeste N° 850 casi Av. Melchor Pérez",
    phone: "+591 77054321",
    whatsapp: "59177054321",
    hours: "Lunes a Sábado: 09:00 - 19:30",
    hasDelivery: "Entrega en 24 a 48 hrs con armado especializado"
  }
];

export const BOLIVIA_DEPARTMENTS = [
  { id: "scz", name: "Santa Cruz", shippingFee: 0, time: "24 hrs (Envío Gratis)", cities: ["Santa Cruz de la Sierra", "Montero", "Warnes", "Cotoca", "La Guardia"] },
  { id: "lpz", name: "La Paz", shippingFee: 0, time: "24-48 hrs (Envío Gratis en compras > Bs. 3000)", cities: ["La Paz (Zona Sur / Centro)", "El Alto", "Achumani", "Sopocachi", "Miraflores"] },
  { id: "cbb", name: "Cochabamba", shippingFee: 0, time: "24-48 hrs (Envío Gratis)", cities: ["Cochabamba", "Quillacollo", "Sacaba", "Tiquipaya"] },
  { id: "tja", name: "Tarija", shippingFee: 150, time: "48-72 hrs", cities: ["Tarija Capital", "Yacuiba", "Bermejo"] },
  { id: "suc", name: "Chuquisaca / Sucre", shippingFee: 150, time: "48-72 hrs", cities: ["Sucre Capital", "Monteagudo"] },
  { id: "oru", name: "Oruro", shippingFee: 120, time: "48 hrs", cities: ["Oruro Capital", "Challapata"] },
  { id: "pot", name: "Potosí", shippingFee: 150, time: "48-72 hrs", cities: ["Potosí Capital", "Villazón", "Uyuni"] },
  { id: "ben", name: "Beni", shippingFee: 200, time: "72-96 hrs", cities: ["Trinidad", "Riberalta", "Guayaramerín"] },
  { id: "pan", name: "Pando", shippingFee: 250, time: "96 hrs", cities: ["Cobija"] }
];

export const FAQS = [
  {
    question: "¿Qué garantía tienen los muebles y sofás Sealy?",
    answer: "Todos los sofás, sofás cama y reclinables Sealy cuentan con 5 años de garantía oficial en estructura de madera tratada y mecanismos, y 2 años en espumas y tapicería. PRICOM es distribuidor autorizado oficial en Bolivia."
  },
  {
    question: "¿Cómo funciona el envío y armado en mi ciudad?",
    answer: "En Santa Cruz, La Paz y Cochabamba contamos con equipo propio de entrega de guante blanco y armado gratuito en el ambiente que desees. Para otros departamentos enviamos a través de transporte asegurado de alta seguridad."
  },
  {
    question: "¿Cuáles son los métodos de pago disponibles?",
    answer: "Aceptamos QR Simple Interbancario (Banco Fassil, BCP, BNB, Banco Mercantil, etc.), transferencias bancarias, tarjetas de débito/crédito Visa/Mastercard en bolivianos y dólares, Tigo Money, y pago contra entrega en Santa Cruz."
  },
  {
    question: "¿Puedo ver y probar los muebles antes de comprar?",
    answer: "¡Por supuesto! Te invitamos a visitar nuestros amplios showrooms en Santa Cruz (Equipetrol), La Paz (Calacoto) y Cochabamba (Av. América). También puedes agendar una videollamada personalizada por WhatsApp con uno de nuestros asesores para ver detalles en vivo."
  }
];
