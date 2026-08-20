// ==========================================================================
// PRICOM CATEGORIES & NAVIGATION STRUCTURE
// ==========================================================================

export const CATEGORIES = [
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
    id: "reclinables",
    name: "Reclinables",
    slug: "reclinables",
    tagline: "Posición gravedad cero para descanso total",
    count: 5,
    image: "/images/SEALY-GAMEDAY-RA A17-114/1.jpg",
    subcategories: ["Reclinables Manuales", "Reclinables Motorizados", "Sillones Cine en Casa", "Reclinables con Masaje"]
  },
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
  { label: "Sofás Cama", path: "#catalogo", filter: { category: "Sofás Cama" } },
  { label: "Reclinables", path: "#catalogo", filter: { category: "Reclinables" } },
  { label: "Ofertas", path: "#ofertas", isHighlight: true },
  { label: "Inspírate", path: "#inspirate" },
  { label: "Trabaja con Nosotros", path: "#promotores" },
  { label: "Contacto", path: "#contacto" }
];
