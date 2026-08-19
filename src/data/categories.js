// ==========================================================================
// PRICOM CATEGORIES & NAVIGATION STRUCTURE
// ==========================================================================

export const CATEGORIES = [
  {
    id: "sofas",
    name: "Sofás",
    slug: "sofas",
    tagline: "Diseño ergonómico y confort supremo",
    count: 6,
    image: "/images/SEALY-SANTACRUZ-SEAFOAM/1.jpg",
    subcategories: ["Sofás 3 Cuerpos", "Sofás Modulares", "Sofás de Acento", "Sofás en L"]
  },
  {
    id: "sofas-cama",
    name: "Sofás Cama",
    slug: "sofas-cama",
    tagline: "El descanso de una cama Sealy en tu sala",
    count: 8,
    image: "/images/SEALY-MONTEREY-PIPER BLUE/1.jpg",
    subcategories: ["Sofás Cama Queen", "Sofás Cama Matrimoniales", "Apertura Click-Clack", "Convertibles Seccionales"]
  },
  {
    id: "sillones",
    name: "Sillones",
    slug: "sillones",
    tagline: "Elegancia individual y lectura perfecta",
    count: 4,
    image: "/images/SEALY-GAMEDAY-RG A4-175/1.jpg",
    subcategories: ["Sillones de Lectura", "Sillones Giratorios", "Poltronas de Acento", "Bergères"]
  },
  {
    id: "reclinables",
    name: "Recliners",
    slug: "reclinables",
    tagline: "Posición gravedad cero para descanso total",
    count: 5,
    image: "/images/SEALY-GAMEDAY-RA A17-114/1.jpg",
    subcategories: ["Reclinables Manuales", "Reclinables Motorizados", "Sillones Cine en Casa", "Reclinables con Masaje"]
  },
  {
    id: "juegos-sala",
    name: "Juegos de Sala",
    slug: "juegos-de-sala",
    tagline: "Conjuntos completos y seccionales modulares",
    count: 4,
    image: "/images/SEALY-KLEIN-SCM/1.jpg",
    subcategories: ["Seccionales en L", "Juegos 3+2+1", "Salas Modulares", "Salas Contemporáneas"]
  },
  {
    id: "mesas",
    name: "Mesas",
    slug: "mesas",
    tagline: "Mesas de comedor, centro y laterales",
    count: 6,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    subcategories: ["Mesas de Comedor", "Mesas de Centro", "Mesas Laterales", "Consolas de Entrada"]
  },
  {
    id: "sillas",
    name: "Sillas",
    slug: "sillas",
    tagline: "Sillas de comedor y banquetas modernas",
    count: 5,
    image: "https://images.unsplash.com/photo-1580481077195-c99276d337d1?auto=format&fit=crop&w=800&q=80",
    subcategories: ["Sillas de Comedor", "Sillas Tapizadas", "Banquetas de Bar", "Sillas de Escritorio"]
  },
  {
    id: "decoracion",
    name: "Decoración",
    slug: "decoracion",
    tagline: "Lámparas, alfombras y accesorios de autor",
    count: 9,
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
    subcategories: ["Lámparas de Pie y Techo", "Alfombras Artesanales", "Jarrones y Cerámica", "Cuadros y Espejos", "Cojines y Mantas"]
  }
];

export const BRANDS = [
  { id: "sealy", name: "Sealy", logo: "/iconos/logo sealy.png", description: "Líder mundial en tecnología de descanso y muebles ortopédicos.", count: 15 },
  { id: "pricom-living", name: "Pricom Living", logo: "/iconos/logo pricom.png", description: "Colecciones exclusivas diseñadas para espacios latinoamericanos.", count: 8 },
  { id: "nordic-studio", name: "Nordic Studio", logo: null, description: "Minimalismo escandinavo con maderas nobles y líneas puras.", count: 5 },
  { id: "casa-atelier", name: "Casa Atelier", logo: null, description: "Artesanía y textiles naturales con identidad boliviana contemporánea.", count: 6 },
  { id: "decoluxe", name: "DecoLuxe", logo: null, description: "Iluminación de diseño y acentos metálicos de alta gama.", count: 4 }
];

export const NAVIGATION_LINKS = [
  { label: "Inicio", path: "#inicio" },
  { label: "Muebles", path: "#catalogo", hasMegaMenu: true },
  { label: "Sofás", path: "#catalogo", filter: { category: "Sofás" } },
  { label: "Sofás Cama", path: "#catalogo", filter: { category: "Sofás Cama" } },
  { label: "Sillones", path: "#catalogo", filter: { category: "Sillones" } },
  { label: "Recliners", path: "#catalogo", filter: { category: "Reclinables" } },
  { label: "Juegos de Sala", path: "#catalogo", filter: { category: "Juegos de Sala" } },
  { label: "Mesas & Comedor", path: "#catalogo", filter: { category: "Mesas" } },
  { label: "Decoración", path: "#catalogo", filter: { category: "Decoración" } },
  { label: "Ofertas", path: "#ofertas", isHighlight: true },
  { label: "Inspírate", path: "#inspirate" },
  { label: "Contacto", path: "#contacto" }
];
