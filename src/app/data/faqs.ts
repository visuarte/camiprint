export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cuál es el pedido mínimo?',
    answer: 'Trabajamos desde 10 unidades. No hay límite máximo: ajustamos precio, técnica y plazo según el volumen de tu pedido.',
  },
  {
    id: 'faq-2',
    question: '¿En cuánto tiempo recibo la propuesta?',
    answer: 'En minutos recibes una pre-cotización orientativa. La propuesta completa con diseño técnico y coste final llega en menos de 24 horas hábiles.',
  },
  {
    id: 'faq-3',
    question: '¿Puedo pedir una muestra antes de producir?',
    answer: 'Sí. Ofrecemos validación digital del arte final gratuita y, en pedidos de 50+ unidades, podemos coordinar una muestra física antes de lanzar la producción.',
  },
  {
    id: 'faq-4',
    question: '¿Qué técnicas de impresión utilizáis?',
    answer: 'Trabajamos con serigrafía (ideal para tiradas grandes y colores sólidos), DTF (perfecto para diseños complejos o multicolor) y bordado. Recomendamos la técnica más adecuada según tu diseño y cantidad.',
  },
  {
    id: 'faq-5',
    question: '¿Realizáis envíos a toda España?',
    answer: 'Sí, enviamos a toda la península, Baleares y Canarias con número de seguimiento. El transporte está incluido en todos nuestros packs.',
  },
  {
    id: 'faq-6',
    question: '¿Incluís diseño y soporte gráfico?',
    answer: 'El soporte de arte final está incluido en todos los packs. Nuestro equipo adapta tu logo a los requisitos de impresión sin coste adicional.',
  },
  {
    id: 'faq-7',
    question: '¿Qué pasa si hay un error en el pedido?',
    answer: 'Garantizamos reimpresión gratuita si el error es nuestro. Revisamos el arte contigo antes de producir para evitar cualquier incidencia.',
  },
  {
    id: 'faq-8',
    question: '¿Puedo mezclar tallas y colores en el mismo pedido?',
    answer: 'Sí, puedes combinar tallas (XS a 4XL) y hasta 2 colores de prenda en el mismo pedido sin sobrecoste, siempre que el diseño sea el mismo.',
  },
  {
    id: 'faq-9',
    question: '¿Emitís factura? ¿Trabajáis con pedidos de compra corporativos?',
    answer: 'Sí, emitimos factura con IVA desglosado. Aceptamos órdenes de compra y pago a 30 días para clientes con cuenta corporativa activa.',
  },
];
