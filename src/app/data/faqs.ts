export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Cual es el pedido minimo?',
    answer: 'Trabajamos desde 10 unidades. Si necesitas mas volumen, ajustamos precio y tiempos de entrega.',
  },
  {
    id: 'faq-2',
    question: 'En cuanto tiempo recibo la propuesta?',
    answer: 'Normalmente en minutos para una pre-cotizacion y en menos de 24 horas para la propuesta completa.',
  },
  {
    id: 'faq-3',
    question: 'Puedo pedir muestra antes de producir?',
    answer: 'Si. Podemos coordinar muestra fisica o validacion digital del arte antes de lanzar produccion.',
  },
  {
    id: 'faq-4',
    question: 'Que tecnicas de impresion manejan?',
    answer: 'Usamos serigrafia, DTF y otras tecnicas segun el tejido, cantidad y acabado que necesitas.',
  },
  {
    id: 'faq-5',
    question: 'Hacen envios a toda Espana?',
    answer: 'Si, enviamos a toda Espana con seguimiento y tiempos acordados desde la aprobacion final.',
  },
  {
    id: 'faq-6',
    question: 'Incluyen diseno en el servicio?',
    answer: 'Si, el soporte de diseno esta incluido en planes seleccionados y se define en tu propuesta.',
  },
];
