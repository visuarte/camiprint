export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  timeframe: string;
}

export const processSteps: ProcessStep[] = [
  {
    stepNumber: 1,
    title: 'Cuéntanos tu idea',
    description:
      'Comparte el tipo de camiseta, cantidad estimada y estilo que quieres para tu negocio.',
    icon: '📝',
    timeframe: '5 min',
  },
  {
    stepNumber: 2,
    title: 'Diseño y propuesta',
    description:
      'Nuestro equipo prepara un diseño preliminar y una cotización ajustada a tus necesidades.',
    icon: '🎨',
    timeframe: '24 h',
  },
  {
    stepNumber: 3,
    title: 'Producción profesional',
    description:
      'Fabricamos tus camisetas con materiales de calidad y controlando cada detalle de impresión.',
    icon: '🏭',
    timeframe: '5-7 días',
  },
  {
    stepNumber: 4,
    title: 'Entrega en tu empresa',
    description:
      'Recibes tu pedido listo para usar, con seguimiento de envío y soporte postventa.',
    icon: '🚚',
    timeframe: '48-72 h',
  },
];
