import Link from 'next/link';

interface TrustIndicator {
  id: string;
  icon: string;
  label: string;
}

const trustIndicators: TrustIndicator[] = [
  { id: 'delivery', icon: '📦', label: 'Entrega en 7-10 días' },
  { id: 'quantity', icon: '📊', label: 'Desde 50 unidades' },
  { id: 'design', icon: '🎨', label: 'Diseño gratuito' },
];

const Hero = () => {
  return (
    <section
      id="inicio"
      className="scroll-mt-20 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 py-16 md:py-24 px-4 md:px-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Camisetas personalizadas para tu negocio
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
          Ropa laboral, camisetas publicitarias y uniformes de empresa con la más alta calidad. Presupuesto sin compromiso en 24 horas.
        </p>

        {/* CTAs Container */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16">
          {/* Primary CTA */}
          <Link
            href="#ofertas"
            className="inline-block px-8 py-3 md:py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-base md:text-lg"
          >
            Ver Ofertas
          </Link>

          {/* Secondary CTA */}
          <Link
            href="#contacto"
            className="inline-block px-8 py-3 md:py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all border border-white/40 hover:border-white/60 text-base md:text-lg"
          >
            Solicitar Cotización
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 pt-8 md:pt-12 border-t border-white/20">
          {trustIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className="flex flex-col items-center gap-2 py-4"
            >
              <span
                className="text-3xl md:text-4xl"
                role="img"
                aria-label={indicator.label}
              >
                {indicator.icon}
              </span>
              <p className="text-white font-medium text-sm md:text-base">
                {indicator.label}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Info */}
        <p className="text-xs md:text-sm text-blue-200 mt-8 md:mt-12">
          ✓ Empresa verificada • Más de 500 clientes satisfechos • 100% de garantía de satisfacción
        </p>
      </div>
    </section>
  );
};

export default Hero;
