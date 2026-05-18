const displayName = 'Camiart';
const seoTitle = `${displayName} - Camisetas Personalizadas para Empresas`;

export const brandConfig = {
  displayName,
  companyExample: `${displayName} SL`,
  siteUrl: 'https://camiprint.com',
  supportEmail: 'hola@camiprint.com',
  phoneDisplay: '+34 900 111 222',
  phoneHref: 'tel:+34900111222',
  postalAddress: 'Av. de la Industria 18, Madrid',
  assets: {
    heroModelSrc: '/models/camiseta-camiprint.glb',
  },
  seo: {
    defaultTitle: seoTitle,
    description:
      `${displayName} crea camisetas personalizadas para empresas, restaurantes y eventos. Diseño gratuito, producción profesional y entrega rápida con ofertas por volumen.`,
    ogImageAlt: seoTitle,
  },
  copy: {
    heroModelAlt: `Modelo 3D de camiseta ${displayName}`,
    testimonialsIntro: `Casos reales de empresas que confiaron en ${displayName} para su ropa laboral y campanas de marca.`,
  },
  socialLinks: {
    instagram: 'https://www.instagram.com/camiprint',
    facebook: 'https://www.facebook.com/camiprint',
    linkedin: 'https://www.linkedin.com/company/camiprint',
  },
} as const;