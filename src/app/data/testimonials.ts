import { brandConfig } from '@/config/brand';

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
    customerName: 'Marina Gómez',
    companyName: 'Brasa Norte',
    role: 'Gerente de operaciones',
    testimonialText:
      'Pedimos uniformes para todo el equipo —120 camisetas con 3 tallas distintas— y la calidad superó nuestras expectativas. El proceso fue rápido y sin sorpresas.',
  },
  {
    id: 't-02',
    customerName: 'Javier Ruiz',
    companyName: 'Nexo Logistics',
    role: 'Director comercial',
    testimonialText:
      `Necesitábamos 200 camisetas para una campaña corporativa con plazo de 8 días. ${brandConfig.displayName} entregó a tiempo, con acabado excelente y soporte constante.`,
  },
  {
    id: 't-03',
    customerName: 'Lucía Herrera',
    companyName: 'Studio 88',
    role: 'Fundadora',
    testimonialText:
      'La propuesta llegó en minutos, ajustes de diseño rápidos y el resultado final fue impecable para nuestro lanzamiento. Repetiremos sin duda.',
  },
  {
    id: 't-04',
    customerName: 'Carlos Mendoza',
    companyName: 'Grupo Vértice',
    role: 'Responsable de RRHH',
    testimonialText:
      'Llevamos 3 pedidos con ellos para distintos departamentos. El precio por volumen es muy competitivo y la atención personalizada marca la diferencia.',
  },
  {
    id: 't-05',
    customerName: 'Sofía Ramos',
    companyName: 'TasteLab',
    role: 'CEO',
    testimonialText:
      'Necesitaba camisetas para un evento en 10 días. Validación del diseño en 2 horas, entrega en 9 días. Exactamente lo que necesitaba, cuando lo necesitaba.',
  },
  {
    id: 't-06',
    customerName: 'Andrés Villar',
    companyName: 'Constructora Ibérica',
    role: 'Jefe de compras',
    testimonialText:
      'Pedimos polos técnicos con bordado para todo el personal de obra. La calidad es muy buena para el precio y el proceso de aprobación fue muy cómodo.',
  },
];
