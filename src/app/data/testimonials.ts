export interface Testimonial {
  id: string;
  customerName: string;
  companyName: string;
  testimonialText: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't-01',
    customerName: 'Marina Gomez',
    companyName: 'Brasa Norte',
    role: 'Gerente de operaciones',
    testimonialText:
      'Pedimos uniformes para todo el equipo y la calidad supero nuestras expectativas. El proceso fue rapido y claro de principio a fin.',
  },
  {
    id: 't-02',
    customerName: 'Javier Ruiz',
    companyName: 'Nexo Logistics',
    role: 'Director comercial',
    testimonialText:
      'Necesitabamos camisetas para una campana corporativa y Camiart entrego a tiempo, con excelente acabado y soporte constante.',
  },
  {
    id: 't-03',
    customerName: 'Lucia Herrera',
    companyName: 'Studio 88',
    role: 'Fundadora',
    testimonialText:
      'La experiencia fue premium: propuesta en minutos, ajustes rapidos de diseno y resultado final impecable para nuestro lanzamiento.',
  },
];
